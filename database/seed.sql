INSERT INTO exams (title, description, duration_minutes, is_published)
SELECT 'Computer Science Fundamentals', 'A short demo exam covering core programming concepts.', 10, TRUE
WHERE NOT EXISTS (SELECT 1 FROM exams WHERE title = 'Computer Science Fundamentals');

INSERT INTO questions (exam_id, prompt, options, correct_option, points)
SELECT e.id, q.prompt, q.options::jsonb, q.correct_option, q.points
FROM exams e
CROSS JOIN (VALUES
  ('Which data structure follows FIFO order?', '["Stack","Queue","Tree","Graph"]', 1, 1),
  ('Which SQL command retrieves rows from a table?', '["PUSH","SELECT","INSERT ONLY","COMPILE"]', 1, 1),
  ('Which HTTP status code usually means success?', '["200","404","500","301"]', 0, 1),
  ('Which keyword declares a constant in modern JavaScript?', '["varies","constant","const","fixed"]', 2, 1),
  ('What does CPU stand for?', '["Central Processing Unit","Computer Personal Utility","Core Program Upload","Central Print Unit"]', 0, 1)
) AS q(prompt, options, correct_option, points)
WHERE e.title = 'Computer Science Fundamentals'
AND NOT EXISTS (
  SELECT 1 FROM questions existing
  WHERE existing.exam_id = e.id AND existing.prompt = q.prompt
);
