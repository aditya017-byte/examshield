import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pool } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.get("/api/exams", async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.title, e.description, e.duration_minutes,
        COUNT(q.id)::int AS question_count
       FROM exams e LEFT JOIN questions q ON q.exam_id = e.id
       WHERE e.is_published = TRUE
       GROUP BY e.id ORDER BY e.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

app.get("/api/exams/:id", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, title, description, duration_minutes FROM exams WHERE id = $1 AND is_published = TRUE",
      [Number(req.params.id)]
    );
    if (!result.rowCount) return res.status(404).json({ error: "Exam not found" });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

app.get("/api/questions", async (req, res, next) => {
  try {
    const examId = Number(req.query.examId);
    if (!Number.isInteger(examId) || examId < 1) {
      return res.status(400).json({ error: "A valid examId is required" });
    }
    // Correct answers are deliberately excluded from this endpoint.
    const result = await pool.query(
      "SELECT id, exam_id, prompt, options, points FROM questions WHERE exam_id = $1 ORDER BY id",
      [examId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

app.post("/api/attempts/submit", async (req, res, next) => {
  const { examId, studentName, answers } = req.body ?? {};
  if (!Number.isInteger(Number(examId)) || Number(examId) < 1 ||
      typeof studentName !== "string" || !studentName.trim() || studentName.length > 120 ||
      !answers || typeof answers !== "object" || Array.isArray(answers)) {
    return res.status(400).json({ error: "Valid examId, studentName, and answers are required" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const exam = await client.query(
      "SELECT id FROM exams WHERE id = $1 AND is_published = TRUE", [Number(examId)]
    );
    if (!exam.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Exam not found" });
    }
    const qs = await client.query(
      "SELECT id, correct_option, points FROM questions WHERE exam_id = $1", [Number(examId)]
    );
    let score = 0;
    const maxScore = qs.rows.reduce((sum, q) => sum + q.points, 0);
    for (const q of qs.rows) {
      const submitted = Number(answers[q.id]);
      if (Number.isInteger(submitted) && submitted === q.correct_option) score += q.points;
    }
    const inserted = await client.query(
      `INSERT INTO attempts (exam_id, student_name, score, max_score, answers)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING id, exam_id, student_name, score, max_score, submitted_at`,
      [Number(examId), studentName.trim(), score, maxScore, JSON.stringify(answers)]
    );
    await client.query("COMMIT");
    res.status(201).json({ ...inserted.rows[0], percentage: maxScore ? Math.round(score / maxScore * 100) : 0 });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

app.get("/api/results", async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.student_name, a.score, a.max_score, a.submitted_at,
        e.title AS exam_title,
        CASE WHEN a.max_score = 0 THEN 0 ELSE ROUND(a.score::numeric / a.max_score * 100) END::int AS percentage
       FROM attempts a JOIN exams e ON e.id = a.exam_id
       ORDER BY a.submitted_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

app.post("/api/proctoring/events", async (req, res, next) => {
  try {
    const { attemptId = null, eventType, details = {} } = req.body ?? {};
    const allowed = new Set(["camera_started", "camera_stopped", "tab_hidden", "fullscreen_exit", "exam_warning"]);
    if (!allowed.has(eventType)) return res.status(400).json({ error: "Unsupported eventType" });
    if (attemptId !== null && (!Number.isInteger(Number(attemptId)) || Number(attemptId) < 1)) {
      return res.status(400).json({ error: "Invalid attemptId" });
    }
    const result = await pool.query(
      "INSERT INTO proctoring_events (attempt_id, event_type, details) VALUES ($1, $2, $3::jsonb) RETURNING id, created_at",
      [attemptId, eventType, JSON.stringify(details)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => console.log(`ExamShield API running on http://localhost:${port}`));
