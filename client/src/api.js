const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  health: () => request("/health"),
  exams: () => request("/exams"),
  exam: (id) => request(`/exams/${id}`),
  questions: (examId) => request(`/questions?examId=${examId}`),
  submit: (payload) => request("/attempts/submit", { method: "POST", body: JSON.stringify(payload) }),
  results: () => request("/results"),
  logEvent: (payload) => request("/proctoring/events", { method: "POST", body: JSON.stringify(payload) })
};
