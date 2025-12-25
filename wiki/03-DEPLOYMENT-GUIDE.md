# Deployment Guide

## 1. Backend (Render.com)
The backend is a Node.js/Express app using Turso (LibSQL) for the database.

### Build Command
```bash
npm install && npm run db:push && npm run build
```
*(Note: We use `db:push` instead of `migrate` to handle schema sync flexibly)*

### Start Command
```bash
npm start
```

### Environment Variables
- `DATABASE_URL`: Turso connection string (`libsql://...`)
- `TURSO_AUTH_TOKEN`: Turso Auth Token
- `JWT_SECRET`: Secret for session tokens
- `CORS_ORIGIN`: Frontend URL (e.g., `https://campus-quiz-frontend.vercel.app`)

---

## 2. Frontend (Vercel)
The frontend is a Vite + React application.

### Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Environment Variables
- `VITE_API_URL`: Backend URL (e.g., `https://campus-quiz-backend.onrender.com`)
- `VITE_MICROSOFT_CLIENT_ID`: Azure AD Client ID
