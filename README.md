# ExamShield — Online Examination & Proctoring Platform

A full-stack starter project using React, Node.js/Express, PostgreSQL, and browser camera/microphone APIs (WebRTC-compatible media capture).

## Features included
- Dashboard with exam overview and analytics cards
- Question bank API and sample questions
- Timed exam interface with countdown and automatic submission
- Automatic evaluation for multiple-choice questions
- Results history and score analytics
- Camera preview for proctoring consent/demo
- Proctoring event logging API (camera status, tab changes, fullscreen exits)
- PostgreSQL schema and seed data
- Basic API validation and centralized error handling

## Important limitations
This is a **working starter/demo**, not a production-secure exam system. Camera access is user-consented browser media capture; it does not prove identity or reliably detect cheating. Do not secretly record students. Before real deployment, add proper authentication, authorization, audit trails, secure session handling, privacy notices/consent, retention controls, rate limits, and security review. Never store camera recordings without a clear lawful basis and explicit consent.

## Requirements
- Node.js 20+
- PostgreSQL 15+
- npm
- VS Code

## Project structure
```text
online-exam-proctoring-platform/
├── client/                 # React + Vite frontend
├── server/                 # Express API
├── database/
│   ├── schema.sql
│   └── seed.sql
├── .gitignore
├── .env.example
└── README.md
```

## 1. Create the database
Open PostgreSQL / pgAdmin and create a database named `examshield`.

Then run `database/schema.sql` followed by `database/seed.sql` in that database.

## 2. Configure the server
Open a terminal in the project root:
```bash
cd server
npm install
```
Copy `../.env.example` to `server/.env` and update the PostgreSQL username/password/database values.
```bash
npm run dev
```
API runs at `http://localhost:5000`.

## 3. Run the frontend
Open a **second terminal** in the project root:
```bash
cd client
npm install
npm run dev
```
Open the local URL printed by Vite, normally `http://localhost:5173`.

## Demo flow
1. Open Dashboard.
2. Click **Start demo exam**.
3. Answer the multiple-choice questions and submit, or let the timer end.
4. View the result and analytics.
5. Allow camera access to test the camera preview. The demo does not save video.

## API endpoints
- `GET /api/health`
- `GET /api/exams`
- `GET /api/exams/:id`
- `GET /api/questions?examId=1`
- `POST /api/attempts/submit`
- `GET /api/results`
- `POST /api/proctoring/events`

## Push to GitHub from VS Code
1. Extract this ZIP.
2. Open the extracted `online-exam-proctoring-platform` folder in VS Code.
3. In VS Code, open **Terminal → New Terminal**.
4. Run:
   ```bash
   git init
   git add .
   git commit -m "Initial ExamShield project"
   ```
5. Create a **new empty repository** on GitHub. Do not add a README there if you already have this README.
6. Copy the repository URL and run:
   ```bash
   git branch -M main
   git remote add origin YOUR_GITHUB_REPOSITORY_URL
   git push -u origin main
   ```
7. If Git asks for identity:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "YOUR_GITHUB_EMAIL"
   ```
Never commit `.env`, passwords, API keys, or real student data.

## Next steps for production
- Add JWT/session authentication and role-based access (admin, examiner, student).
- Store exam attempts transactionally and prevent duplicate submissions.
- Add server-side exam start/end enforcement and question randomization.
- Add WebRTC signaling only if live remote invigilation is genuinely needed.
- Add automated tests, migrations, deployment, monitoring, and privacy/security review.
