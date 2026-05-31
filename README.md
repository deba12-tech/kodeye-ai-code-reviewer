# Kodeye

Kodeye is an AI-assisted code review and issue tracking MVP with a React/Vite frontend and FastAPI backend. It supports email/password authentication, OAuth route wiring for Google and GitHub, code scanning, persisted reviews/issues, backend-driven dashboard/history/bug tracker views, GitHub repository file import, GitHub issue creation, account management, PDF export from review reports, and local SQLite or production PostgreSQL-style configuration.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Axios, jsPDF
- Backend: FastAPI, SQLAlchemy, Alembic, Pydantic, JWT auth, pytest
- Database: SQLite for local development, PostgreSQL-ready via `DATABASE_URL`

## Environment

Backend environment files live in `backend/`. Start from `backend/.env.example` and fill real secrets before production use.

Required local values:

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

Frontend:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Local Setup

Backend:

```powershell
cd backend
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\alembic.exe upgrade head
.\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```

Frontend:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

Open `http://127.0.0.1:5173`.

## Safe Local Database Reset

Do not delete `backend/kodeye.db` by hand if it may contain useful local data. To reset local development safely, this script moves the existing SQLite database into `backend/db_backups/` and runs migrations:

```powershell
cd backend
.\scripts\reset_dev_db.ps1
```

## API Overview

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/google/login`
- `GET /api/v1/auth/github/login`
- `GET /api/v1/dashboard/stats`
- `POST /api/v1/reviews/analyze`
- `GET /api/v1/reviews`
- `GET /api/v1/reviews/{review_id}`
- `DELETE /api/v1/reviews/{review_id}`
- `GET /api/v1/issues`
- `GET /api/v1/issues/{issue_id}`
- `PATCH /api/v1/issues/{issue_id}`
- `DELETE /api/v1/issues/{issue_id}`
- `POST /api/v1/github/connect`
- `GET /api/v1/github/me`
- `GET /api/v1/github/repos`
- `GET /api/v1/github/repos/{owner}/{repo}/files`
- `GET /api/v1/github/repos/{owner}/{repo}/file`
- `POST /api/v1/github/repos/{owner}/{repo}/scan-file`
- `POST /api/v1/github/create-issue`
- `DELETE /api/v1/github/disconnect`
- `GET /api/v1/users`

Paginated list endpoints support `page`, `limit`, `search`, `sort_by`, and `sort_order`.

## How To Use

1. Start backend and frontend.
2. Sign up or log in from `/auth`.
3. Go to `/new-review`.
4. Paste code, choose a language, and run the scan, or click Import from GitHub and import a repository file into the editor.
5. The backend saves the review and detected issues for the logged-in user.
6. View the report under `/reviews/:id`.
7. Dashboard, History, and Bug Tracker load backend data from `/api/v1/dashboard/stats`, `/api/v1/reviews`, and `/api/v1/issues`.
8. Update issue status in Bug Tracker; it persists with `PATCH /api/v1/issues/:id`.
9. Export the report PDF from the review report page.
10. Open Settings to manage profile, password, sessions, OAuth, and GitHub token connection.

## OAuth Setup

Create Google and GitHub OAuth apps and set callback URLs to:

- Google: `http://localhost:8000/api/v1/auth/google/callback`
- GitHub: `http://localhost:8000/api/v1/auth/github/callback`

Set the provider client IDs/secrets only in backend environment variables. The frontend only redirects to backend OAuth login routes and stores Kodeye-issued app tokens.

## GitHub Connection, File Import, And Issue Creation

Kodeye supports GitHub connection through a personal access token in Settings. Tokens are encrypted before storage, decrypted only inside backend GitHub service calls, and never returned to the frontend.

Required GitHub token scopes:

- Public repositories only: `public_repo`
- Private repositories: `repo`
- Creating GitHub issues: issue write access for the selected repository

Connect GitHub:

1. Create a GitHub token with repository content read access and issue permissions if you want issue creation.
2. Open Settings > GitHub Integration.
3. Paste the token and save it.

Import files from GitHub:

1. Open New Review.
2. Click Import from GitHub.
3. Select a repository.
4. Use the default branch or type another branch name.
5. Browse folders.
6. Import a supported file.
7. The file content fills the existing editor, language is auto-selected, project name is set to the repo name, and the imported path appears above the editor.
8. Click Analyze Code to scan through the normal `/api/v1/reviews/analyze` backend flow.

Optional direct scan:

- In the file browser, click Scan on an importable file to call `/api/v1/github/repos/{owner}/{repo}/scan-file`.
- The backend imports the file, runs the scanner, saves the review and issues, and returns a `review_id`.

Supported import file types:

`.js`, `.jsx`, `.ts`, `.tsx`, `.py`, `.java`, `.cpp`, `.c`, `.cs`, `.go`, `.rs`, `.php`, `.rb`

Import limitations:

- Files larger than 300KB are rejected.
- Binary files are rejected.
- Unsupported files are not importable.
- GitHub API errors are returned as clean app errors for invalid tokens, missing scopes/rate limits, and missing repos/files.

Create GitHub issues from Kodeye issues:

1. Open Bug Tracker.
2. Select an issue.
3. Choose Create GitHub Issue.
4. Kodeye creates the issue in GitHub and stores the GitHub issue URL.

Generate a production `TOKEN_ENCRYPTION_KEY` with:

```powershell
cd backend
.\venv\Scripts\python.exe -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

## Email Setup

Development:

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

Missing provider settings raise clear configuration errors.

## Deployment Notes

- Set `ENVIRONMENT=production`.
- Set `DEBUG=false`.
- Use PostgreSQL in `DATABASE_URL`.
- Set a strong `JWT_SECRET_KEY` with at least 32 random bytes.
- Set `TOKEN_ENCRYPTION_KEY`.
- Restrict `CORS_ORIGINS`; do not use `*`.
- Configure real OAuth callback URLs and provider secrets.
- Run `alembic upgrade head` before starting the backend.

## Validation Commands

Backend tests:

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

Migrations:

```powershell
cd backend
.\venv\Scripts\alembic.exe upgrade head
```

## Known Limitations

- Production email delivery requires SMTP or provider keys.
- Production OAuth requires real Google/GitHub app credentials.
- The bundled JWT secret in local `.env` is development-only and should be replaced before any deployment.
- The compact Bug Tracker GitHub action currently uses the first repo returned by GitHub; the backend supports explicit `repo`, so a richer repo picker can be added without backend changes.
- GitHub file import supports single text source files up to 300KB; it does not scan whole repositories or dependency graphs.
