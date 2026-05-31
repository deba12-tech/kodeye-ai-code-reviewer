# 👁️ Kodeye

> Your AI-powered eye for cleaner, safer, and more accountable code.

Kodeye is a full-stack code review and bug tracking MVP built for developers who want fast, structured, and security-focused feedback on their code.

It brings code scanning, persistent review reports, issue tracking, GitHub file import, GitHub issue creation, authentication, dashboard analytics, and PDF report export into one polished developer workflow.

## 🚀 What Kodeye Does

Kodeye turns a simple code review flow into a tracked, accountable review pipeline:

```text
Paste code / Import GitHub file
→ Scan code
→ Get structured review
→ Track issues
→ Export PDF
→ Create GitHub issue
```

## ✨ Key Features

### 🔍 AI-Assisted Code Review

Scan source code for security risks, logic issues, code smells, and maintainability concerns with structured developer-focused feedback.

### 🧠 Backend-Driven Reports

Reviews are processed through the FastAPI backend, saved to the database, and surfaced as persistent reports instead of throwaway UI state.

### 📊 Developer Dashboard

Track review activity, project health, detected issues, and recent scan history from a clean backend-powered dashboard.

### 🐞 Bug Tracker

Turn review findings into manageable issues with severity, status, category, project filtering, and persistent updates.

### 🧾 PDF Export

Export review reports as shareable PDFs using the frontend report generator.

### 🔐 Authentication

Email/password authentication, JWT access tokens, refresh flow support, session management, and OAuth route wiring for Google and GitHub.

### 🐙 GitHub Integration

Connect GitHub, fetch repositories, create GitHub issues from Kodeye findings, and keep review work closer to the codebase.

### 🗂️ GitHub File Import

Browse repository files, import supported source files into the review editor, and scan them through the standard Kodeye review flow.

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic |
| Auth | JWT, Refresh Tokens, OAuth-ready flow |
| Database | SQLite local, PostgreSQL/Supabase-ready |
| Testing | Pytest, Coverage |
| Reports | jsPDF |
| Integration | GitHub API |

## 🧩 Architecture

```text
Kodeye
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/
│   ├── app/
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
└── database/
    └── SQLite locally, PostgreSQL/Supabase-ready via DATABASE_URL
```

## 📸 Screenshots

Add screenshots here before publishing the repository.

![Landing Page](./screenshots/landing.png)
![Dashboard](./screenshots/dashboard.png)
![Review Result](./screenshots/review-result.png)
![Bug Tracker](./screenshots/bug-tracker.png)
![GitHub Import](./screenshots/github-import.png)

## ⚙️ Local Setup

Backend:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\venv\Scripts\alembic.exe upgrade head
.\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```

Frontend:

```powershell
cd frontend
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

Open:

```text
http://127.0.0.1:5173
```

## 🔑 Environment Variables

Never commit real `.env` files. Start from the provided examples and replace secrets before production use.

Backend values live in `backend/.env`:

```env
DATABASE_URL=sqlite:///./kodeye.db
JWT_SECRET_KEY=replace-with-at-least-32-random-bytes
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:5173
ENVIRONMENT=development
EMAIL_BACKEND=console
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@kodeye.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:8000/api/v1/auth/github/callback
TOKEN_ENCRYPTION_KEY=
```

Frontend values live in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Email can run locally through console output:

```env
EMAIL_BACKEND=console
```

SMTP:

```env
EMAIL_BACKEND=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM_EMAIL=noreply@example.com
```

SendGrid:

```env
EMAIL_BACKEND=sendgrid
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=noreply@example.com
```

Generate a production `TOKEN_ENCRYPTION_KEY`:

```powershell
cd backend
.\venv\Scripts\python.exe -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

## 🧪 Run Tests

Backend:

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest tests/ -v
.\venv\Scripts\python.exe -m pytest tests/ --cov=app --cov-report=term-missing
```

Frontend:

```powershell
cd frontend
npx.cmd tsc --noEmit
npm.cmd run build
```

## 🧠 How to Use Kodeye

1. Start the backend and frontend.
2. Register or log in from `/auth`.
3. Open the Dashboard.
4. Go to New Review.
5. Paste code or import a GitHub file.
6. Run the scanner.
7. View the structured review report.
8. Track detected issues in Bug Tracker.
9. Export the report as a PDF.
10. Create a GitHub issue from a tracked Kodeye issue.

Dashboard, History, and Bug Tracker load backend data from `/api/v1/dashboard/stats`, `/api/v1/reviews`, and `/api/v1/issues`.

## 🐙 GitHub Integration

Kodeye supports GitHub connection through a personal access token in Settings. Tokens are encrypted before storage, decrypted only inside backend GitHub service calls, and never returned to the frontend.

With GitHub connected, Kodeye can:

- Fetch repositories.
- Browse repository files.
- Import supported source files.
- Scan imported files.
- Create GitHub issues from Kodeye findings.

Required GitHub token scopes:

- Public repositories only: `public_repo`
- Private repositories: `repo`
- Creating GitHub issues: issue write access for the selected repository

Supported import file types:

```text
.js .jsx .ts .tsx .py .java .cpp .c .cs .go .rs .php .rb
```

Import limits:

- Files larger than 300KB are rejected.
- Binary files are rejected.
- Unsupported files are not importable.
- GitHub file import scans single source files only, not full repositories or dependency graphs.
- GitHub API errors are returned as clean app errors for invalid tokens, missing scopes, rate limits, and missing repos/files.

## 🔐 OAuth Setup

Create Google and GitHub OAuth apps and set callback URLs to:

Google:

```text
http://localhost:8000/api/v1/auth/google/callback
```

GitHub:

```text
http://localhost:8000/api/v1/auth/github/callback
```

Set provider client IDs and secrets only in backend environment variables. The frontend redirects to backend OAuth login routes and stores Kodeye-issued app tokens.

## 📦 API Overview

Health:

- `GET /api/v1/health`

Auth:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/google/login`
- `GET /api/v1/auth/github/login`

Dashboard:

- `GET /api/v1/dashboard/stats`

Reviews:

- `POST /api/v1/reviews/analyze`
- `GET /api/v1/reviews`
- `GET /api/v1/reviews/{review_id}`
- `DELETE /api/v1/reviews/{review_id}`

Issues:

- `GET /api/v1/issues`
- `GET /api/v1/issues/{issue_id}`
- `PATCH /api/v1/issues/{issue_id}`
- `DELETE /api/v1/issues/{issue_id}`

GitHub:

- `POST /api/v1/github/connect`
- `GET /api/v1/github/me`
- `GET /api/v1/github/repos`
- `GET /api/v1/github/repos/{owner}/{repo}/files`
- `GET /api/v1/github/repos/{owner}/{repo}/file`
- `POST /api/v1/github/repos/{owner}/{repo}/scan-file`
- `POST /api/v1/github/create-issue`
- `DELETE /api/v1/github/disconnect`

Users:

- `GET /api/v1/users`

Paginated list endpoints support `page`, `limit`, `search`, `sort_by`, and `sort_order`.

## 🗄️ Move to Supabase/PostgreSQL

Set `DATABASE_URL` to a PostgreSQL-compatible connection string:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

Then run migrations:

```powershell
cd backend
.\venv\Scripts\alembic.exe upgrade head
```

## 🧯 Safe Local Database Reset

Do not delete `backend/kodeye.db` by hand if it may contain useful local data. To reset local development safely, this script moves the existing SQLite database into `backend/db_backups/` and runs migrations:

```powershell
cd backend
.\scripts\reset_dev_db.ps1
```

## 🚀 Deployment Notes

Before any production-style deployment:

- Use PostgreSQL through `DATABASE_URL`.
- Set `DEBUG=false`.
- Set `ENVIRONMENT=production`.
- Use a strong `JWT_SECRET_KEY` with at least 32 random bytes.
- Set `TOKEN_ENCRYPTION_KEY`.
- Configure real Google and GitHub OAuth apps.
- Configure production email through SMTP or SendGrid.
- Restrict `CORS_ORIGINS`; do not use `*`.
- Run `alembic upgrade head` before starting the backend.

## ⚠️ Known Limitations

- The scanner is currently rule-based/static, not a full semantic AI engine yet.
- GitHub file import supports single-file scanning only.
- Whole-repository scanning is not implemented yet.
- Production email delivery requires SMTP or provider keys.
- Production OAuth requires real Google/GitHub app credentials.
- The compact Bug Tracker GitHub action currently uses the first repo returned by GitHub.
- Token storage and session handling should be hardened before any real public launch.

## 🗺️ Roadmap

- [ ] Supabase/PostgreSQL staging database
- [ ] Staging deployment
- [ ] httpOnly cookie refresh token flow
- [ ] Full repository scanning
- [ ] Pull request review mode
- [ ] Team workspaces
- [ ] AI-assisted fix suggestions
- [ ] Sentry monitoring
- [ ] GitHub Actions CI/CD
- [ ] Public launch hardening

## 👨‍💻 Built By

**Debangan Roy**  
B.Tech CSE Student · Frontend Developer · AI Builder · Video Editor

## ⭐ Closing Line

Clean code deserves a sharper eye.
