import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, Award, BookOpen, Camera, CheckCircle2,
  ChevronRight, Clock3, GraduationCap, LayoutDashboard, ShieldCheck,
  VideoOff, XCircle
} from "lucide-react";
import { api } from "./api.js";

const demoExam = {
  id: 1,
  title: "Computer Science Fundamentals",
  description: "A short demo exam covering core programming concepts.",
  duration_minutes: 10,
  question_count: 5
};

function App() {
  const [page, setPage] = useState("dashboard");
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [health, setHealth] = useState("checking");
  const [error, setError] = useState("");
  const [latestResult, setLatestResult] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      const [examData, resultData, healthData] = await Promise.all([
        api.exams(), api.results(), api.health()
      ]);
      setExams(examData.length ? examData : [demoExam]);
      setResults(resultData);
      setHealth(healthData.status === "ok" ? "connected" : "offline");
      setError("");
    } catch (e) {
      setExams([demoExam]);
      setHealth("offline");
      setError("API/database is not connected. Start PostgreSQL and the server to save attempts. The interface remains available for preview.");
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const openExam = () => { setError(""); setPage("exam"); };
  const onSubmitted = (result) => {
    setLatestResult(result);
    setPage("result");
    loadDashboard();
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><ShieldCheck size={23} /></div><div><strong>ExamShield</strong><span>ASSESSMENT SUITE</span></div></div>
        <div className="workspace-label">WORKSPACE</div>
        <button className={`nav-item ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}><LayoutDashboard size={18}/> Dashboard</button>
        <button className={`nav-item ${page === "dashboard" ? "" : ""}`} onClick={() => setPage("dashboard")}><BookOpen size={18}/> Exams & question bank</button>
        <button className="nav-item" onClick={() => setPage("results")}><Activity size={18}/> Results analytics</button>
        <div className="sidebar-bottom"><div className="secure-icon"><ShieldCheck size={18}/></div><strong>Secure by design</strong><p>Demo environment. Real deployments require authentication and a security review.</p><span className="version">EXAMSHIELD · V1.0</span></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <ChevronRight size={14}/> <span>{page === "exam" ? "Live assessment" : page === "result" ? "Exam result" : page === "results" ? "Analytics" : "Overview"}</span></div>
          <div className="topbar-right"><span className={`api-status ${health}`}><i/> API {health === "connected" ? "Connected" : health === "checking" ? "Checking" : "Offline"}</span><div className="avatar">AD</div></div>
        </header>

        {error && page === "dashboard" && <div className="notice"><span>{error}</span><button onClick={() => setError("")}><XCircle size={16}/></button></div>}

        {page === "dashboard" && <Dashboard exams={exams} results={results} onStart={openExam} onResults={() => setPage("results")} />}
        {page === "exam" && <ExamView onBack={() => setPage("dashboard")} onSubmitted={onSubmitted} />}
        {page === "result" && <ResultView result={latestResult} onHome={() => setPage("dashboard")} onResults={() => setPage("results")} />}
        {page === "results" && <ResultsView results={results} onBack={() => setPage("dashboard")} />}
      </main>
    </div>
  );
}

function Dashboard({ exams, results, onStart, onResults }) {
  const totalAttempts = results.length;
  const average = totalAttempts ? Math.round(results.reduce((s, r) => s + Number(r.percentage || 0), 0) / totalAttempts) : 0;
  return <div className="content">
    <div className="welcome-row"><div><div className="eyebrow">THURSDAY, OCTOBER 15, 2026</div><h1>Assessment overview</h1><p className="subheading">Manage exams, monitor performance, and keep assessments moving.</p></div><button className="primary-btn" onClick={onStart}><span>＋</span> Start demo exam <ArrowRight size={16}/></button></div>
    <section className="stat-grid">
      <Stat icon={<BookOpen/>} label="Published exams" value={String(exams.length)} note="Available to take" tone="blue"/>
      <Stat icon={<GraduationCap/>} label="Total attempts" value={String(totalAttempts)} note="Submitted assessments" tone="purple"/>
      <Stat icon={<Award/>} label="Average score" value={`${average}%`} note="Across recorded results" tone="green"/>
      <Stat icon={<Activity/>} label="Proctoring events" value="—" note="Review via API/database" tone="orange"/>
    </section>
    <div className="section-heading"><div><h2>Available assessments</h2><p>Choose an exam to begin a timed attempt.</p></div><span className="count-pill">{exams.length} exam{exams.length === 1 ? "" : "s"}</span></div>
    <section className="exam-grid">{exams.map((exam, i) => <article className="exam-card" key={exam.id}><div className="exam-card-top"><div className="exam-icon"><BookOpen size={20}/></div><span className="published"><i/> Published</span></div><h3>{exam.title}</h3><p>{exam.description || "Online assessment"}</p><div className="exam-meta"><span><Clock3 size={15}/>{exam.duration_minutes} min</span><span><BookOpen size={15}/>{exam.question_count ?? "—"} questions</span></div><button className="card-action" onClick={onStart}>Start assessment <ArrowRight size={16}/></button></article>)}
      <article className="add-card"><div className="add-circle">+</div><h3>Build your question bank</h3><p>Add more questions and create new assessments from the API.</p><span className="coming-soon">API READY TO EXTEND</span></article>
    </section>
    <div className="bottom-grid"><section className="panel"><div className="panel-heading"><div><h2>Recent attempts</h2><p>Latest submitted exam results</p></div><button className="text-btn" onClick={onResults}>View all <ArrowRight size={15}/></button></div>{results.length ? <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>ASSESSMENT</th><th>SCORE</th><th>STATUS</th></tr></thead><tbody>{results.slice(0,4).map(r => <tr key={r.id}><td><span className="student-cell"><span className="mini-avatar">{r.student_name.slice(0,1).toUpperCase()}</span>{r.student_name}</span></td><td>{r.exam_title}</td><td><strong>{r.percentage}%</strong></td><td><span className="status-complete">Completed</span></td></tr>)}</tbody></table></div> : <div className="empty-state"><div className="empty-icon"><Activity size={22}/></div><strong>No attempts yet</strong><span>Submit the demo exam to populate your results.</span></div>}</section>
      <section className="panel proctor-panel"><div className="panel-heading"><div><h2>Proctoring status</h2><p>Browser permission and event tracking</p></div><div className="proctor-badge"><ShieldCheck size={16}/></div></div><div className="proctor-status-row"><span className="status-dot green-dot"/><div><strong>Camera preview</strong><p>Consent-based browser access</p></div><span className="status-label">Available</span></div><div className="proctor-status-row"><span className="status-dot blue-dot"/><div><strong>Event logging</strong><p>Tab visibility and fullscreen events</p></div><span className="status-label">Enabled</span></div><div className="privacy-note"><ShieldCheck size={16}/><span>This demo does not record or upload video.</span></div></section></div>
  </div>;
}

function Stat({ icon, label, value, note, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}

function ExamView({ onBack, onSubmitted }) {
  const [exam, setExam] = useState(demoExam);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState("");
  const [seconds, setSeconds] = useState(demoExam.duration_minutes * 60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cameraState, setCameraState] = useState("off");
  const [cameraError, setCameraError] = useState("");
  const [warning, setWarning] = useState("");
  const [events, setEvents] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const submittedRef = useRef(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const examData = await api.exam(1);
        const qs = await api.questions(1);
        if (active) {
          setExam(examData);
          setQuestions(qs);
          setSeconds(examData.duration_minutes * 60);
        }
      } catch {
        if (active) setQuestions([
          { id: 1, prompt: "Which data structure follows FIFO order?", options: ["Stack", "Queue", "Tree", "Graph"], points: 1 },
          { id: 2, prompt: "Which SQL command retrieves rows from a table?", options: ["PUSH", "SELECT", "INSERT ONLY", "COMPILE"], points: 1 },
          { id: 3, prompt: "Which HTTP status code usually means success?", options: ["200", "404", "500", "301"], points: 1 },
          { id: 4, prompt: "Which keyword declares a constant in modern JavaScript?", options: ["varies", "constant", "const", "fixed"], points: 1 },
          { id: 5, prompt: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Utility", "Core Program Upload", "Central Print Unit"], points: 1 }
        ]);
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const logEvent = useCallback((eventType, details = {}) => {
    setEvents(prev => [...prev, { eventType, time: new Date().toLocaleTimeString() }]);
    api.logEvent({ eventType, details }).catch(() => {});
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && !submittedRef.current) {
        setWarning("Tab switch detected. This event is logged in the demo.");
        logEvent("tab_hidden", { visibilityState: document.visibilityState });
      }
    };
    const onFullscreen = () => {
      if (!document.fullscreenElement && !submittedRef.current) {
        setWarning("Fullscreen exited. This event is logged in the demo.");
        logEvent("fullscreen_exit");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [logEvent]);

  useEffect(() => {
    if (submittedRef.current || loading) return;
    const timer = setInterval(() => setSeconds(s => {
      if (s <= 1) { clearInterval(timer); submitExam(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
  }, []);

  async function startCamera() {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access requires localhost or HTTPS and a supported browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraState("on");
      logEvent("camera_started", { videoOnly: true });
    } catch {
      setCameraState("off");
      setCameraError("Camera permission denied or camera unavailable. You can continue this demo without camera access.");
    }
  }

  function stopCamera() {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState("off");
    logEvent("camera_stopped");
  }

  async function submitExam(auto = false) {
    if (submittedRef.current || submitting) return;
    submittedRef.current = true;
    setSubmitting(true);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    const payload = { examId: Number(exam.id || 1), studentName: name.trim() || "Demo Student", answers };
    try {
      const result = await api.submit(payload);
      onSubmitted({ ...result, autoSubmitted: auto, elapsedSeconds: Math.max(0, Math.floor((Date.now() - startedAt.current) / 1000)) });
    } catch {
      // Offline fallback keeps the UI demonstrable; server-side scoring is used when connected.
      const fallbackQuestions = questions.length ? questions : [];
      const key = { 1: 1, 2: 1, 3: 0, 4: 2, 5: 0 };
      const score = fallbackQuestions.reduce((sum, q, i) => sum + (Number(answers[q.id]) === key[q.id] ? (q.points || 1) : 0), 0);
      const max = fallbackQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
      onSubmitted({ id: `DEMO-${Date.now()}`, student_name: payload.studentName, exam_title: exam.title, score, max_score: max, percentage: max ? Math.round(score / max * 100) : 0, autoSubmitted: auto, offline: true, elapsedSeconds: Math.max(0, Math.floor((Date.now() - startedAt.current) / 1000)) });
    } finally { setSubmitting(false); }
  }

  const answered = Object.keys(answers).length;
  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return <div className="content exam-content">
    <button className="back-btn" onClick={onBack}><ArrowLeft size={16}/> Back to dashboard</button>
    <div className="exam-title-row"><div><div className="eyebrow">LIVE ASSESSMENT · DEMO MODE</div><h1>{exam.title}</h1><p className="subheading">Read each question carefully. Your answers are evaluated when you submit.</p></div><div className={`timer-box ${seconds < 60 ? "urgent" : ""}`}><Clock3 size={20}/><div><small>TIME REMAINING</small><strong>{fmt}</strong></div></div></div>
    <div className="exam-layout"><section className="question-column">
      <div className="candidate-card"><label htmlFor="studentName">Candidate name</label><input id="studentName" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" maxLength={120}/><span>{answered} of {questions.length} answered</span></div>
      {loading ? <div className="panel loading-panel">Loading exam questions…</div> : questions.map((q, index) => <article className="question-card" key={q.id}><div className="question-number">QUESTION {String(index + 1).padStart(2, "0")} <span>{q.points || 1} point</span></div><h3>{q.prompt}</h3><div className="options-list">{q.options.map((option, i) => <label className={`option ${Number(answers[q.id]) === i ? "selected" : ""}`} key={i}><input type="radio" name={`question-${q.id}`} checked={Number(answers[q.id]) === i} onChange={() => setAnswers(prev => ({ ...prev, [q.id]: i }))}/><span className="option-letter">{String.fromCharCode(65 + i)}</span><span>{option}</span></label>)}</div></article>)}
      {warning && <div className="warning-box"><Activity size={17}/><span>{warning}</span><button onClick={() => setWarning("")}><XCircle size={15}/></button></div>}
      <div className="submit-row"><span>{answered} answer{answered === 1 ? "" : "s"} selected</span><button className="primary-btn" disabled={loading || submitting} onClick={() => submitExam(false)}>{submitting ? "Submitting…" : "Submit exam"} <ArrowRight size={16}/></button></div>
    </section><aside className="proctor-column"><section className="panel camera-panel"><div className="panel-heading"><div><h2>Proctoring preview</h2><p>Camera access is optional in this demo</p></div><Camera size={19}/></div><div className={`camera-preview ${cameraState === "on" ? "camera-on" : ""}`}>{cameraState === "on" ? <video ref={videoRef} autoPlay muted playsInline/> : <div className="camera-placeholder"><VideoOff size={30}/><span>Camera is off</span></div>}<span className={`camera-live ${cameraState === "on" ? "live" : ""}`}><i/>{cameraState === "on" ? "LIVE PREVIEW" : "NOT ACTIVE"}</span></div>{cameraError && <p className="camera-error">{cameraError}</p>}{cameraState === "on" ? <button className="secondary-btn full-btn" onClick={stopCamera}>Stop camera</button> : <button className="secondary-btn full-btn" onClick={startCamera}>Enable camera preview</button>}<div className="privacy-note"><ShieldCheck size={15}/><span>Video stays in your browser and is not uploaded.</span></div></section>
      <section className="panel integrity-panel"><div className="panel-heading"><div><h2>Session integrity</h2><p>Local browser signals</p></div><ShieldCheck size={18}/></div><div className="integrity-row"><CheckCircle2 size={16}/><span>Question order loaded</span></div><div className="integrity-row"><CheckCircle2 size={16}/><span>Timer active</span></div><div className="integrity-row"><Activity size={16}/><span>{events.length} event{events.length === 1 ? "" : "s"} recorded</span></div><p className="small-disclaimer">Browser events are signals, not proof of misconduct.</p></section></aside></div>
  </div>;
}

function ResultView({ result, onHome, onResults }) {
  const score = Number(result?.score || 0), max = Number(result?.max_score || 0), percent = Number(result?.percentage || 0);
  return <div className="content result-page"><div className="eyebrow">ASSESSMENT COMPLETE</div><h1>Exam result</h1><p className="subheading">Your answers have been evaluated{result?.offline ? " locally for this demo" : " by the server"}.</p><section className="result-card"><div className="result-check"><CheckCircle2 size={30}/></div><h2>{result?.autoSubmitted ? "Time expired — exam submitted" : "Exam submitted successfully"}</h2><p>{result?.student_name || "Demo Student"} · {result?.exam_title || "Computer Science Fundamentals"}</p><div className="score-ring" style={{ "--score": `${percent}%` }}><div><strong>{percent}%</strong><span>FINAL SCORE</span></div></div><div className="result-stats"><div><span>Points earned</span><strong>{score} / {max}</strong></div><div><span>Result status</span><strong className={percent >= 60 ? "pass" : "review"}>{percent >= 60 ? "Passed" : "Needs review"}</strong></div><div><span>Submission</span><strong>{result?.autoSubmitted ? "Automatic" : "Manual"}</strong></div></div>{result?.offline && <div className="notice inline-notice">API is offline. This result was calculated locally and was not saved to PostgreSQL.</div>}<div className="result-actions"><button className="secondary-btn" onClick={onHome}><ArrowLeft size={16}/> Dashboard</button><button className="primary-btn" onClick={onResults}>View analytics <ArrowRight size={16}/></button></div></section></div>;
}

function ResultsView({ results, onBack }) {
  const avg = results.length ? Math.round(results.reduce((s, r) => s + Number(r.percentage || 0), 0) / results.length) : 0;
  return <div className="content"><button className="back-btn" onClick={onBack}><ArrowLeft size={16}/> Back to dashboard</button><div className="welcome-row"><div><div className="eyebrow">PERFORMANCE INSIGHTS</div><h1>Results analytics</h1><p className="subheading">A summary of recorded assessment attempts.</p></div></div><div className="stat-grid"><Stat icon={<GraduationCap/>} label="Attempts" value={String(results.length)} note="Recorded in database" tone="blue"/><Stat icon={<Award/>} label="Average score" value={`${avg}%`} note="Across all attempts" tone="green"/><Stat icon={<CheckCircle2/>} label="Pass rate" value={`${results.length ? Math.round(results.filter(r => Number(r.percentage) >= 60).length / results.length * 100) : 0}%`} note="Threshold: 60%" tone="purple"/><Stat icon={<Activity/>} label="Needs review" value={String(results.filter(r => Number(r.percentage) < 60).length)} note="Scores below 60%" tone="orange"/></div><section className="panel analytics-table"><div className="panel-heading"><div><h2>All submitted results</h2><p>Latest 100 attempts</p></div></div>{results.length ? <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>ASSESSMENT</th><th>SCORE</th><th>DATE</th><th>STATUS</th></tr></thead><tbody>{results.map(r => <tr key={r.id}><td>{r.student_name}</td><td>{r.exam_title}</td><td><strong>{r.score}/{r.max_score} ({r.percentage}%)</strong></td><td>{new Date(r.submitted_at).toLocaleString()}</td><td><span className={Number(r.percentage) >= 60 ? "status-complete" : "status-review"}>{Number(r.percentage) >= 60 ? "Passed" : "Review"}</span></td></tr>)}</tbody></table></div> : <div className="empty-state"><div className="empty-icon"><Activity size={22}/></div><strong>No analytics data yet</strong><span>Connect the database and submit an exam to record a result.</span></div>}</section></div>;
}

export default App;
