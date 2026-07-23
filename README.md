# CampusFlow

A full-stack student registration & management system.

- **Backend:** Node.js + Express, JWT auth, JSON file datastore (no native DB deps to install)
- **Frontend:** React + Vite, React Router

## Features

- Student registration & login
- Student profile
- Attendance tracking (read-only for students, editable by admin)
- Marks / grades (read-only for students, editable by admin)
- Course catalog with self-enrollment
- Announcements
- Admin panel: manage students, mark attendance, enter marks

## Project structure

```
campusflow/
  backend/     Express API (port 5000)
  frontend/    React app (port 5173, proxies /api to backend)
```

## Getting started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API runs at `http://localhost:5000`. On first run it creates `backend/data/db.json`
and seeds it with:

- An admin account: **admin@campusflow.edu / admin123**
- A course catalog (6 sample courses)
- A few sample announcements

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Register a new student account, or log in as admin
with the credentials above to reach the Admin Panel.

## Notes

- Passwords are hashed with bcrypt. JWTs are used for session auth (7 day expiry).
- The JSON datastore (`backend/data/db.json`) is fine for development and demos.
  For production, swap `backend/src/db.js` for a real database (Postgres, MongoDB, etc.) —
  the rest of the app only calls `load()` / `save()`, so the swap is isolated to that file.
- Change `JWT_SECRET` in `backend/.env` before deploying anywhere real.
