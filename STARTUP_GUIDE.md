# 🚀 NeuroVidya - Startup Guide

## Quick Start (Everything Running)

### 1. Start Backend Server
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
**Backend will run on:** `http://localhost:8000`

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
**Frontend will run on:** `http://localhost:5173` (or next available port)

### 3. Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## ⚠️ IMPORTANT - API Endpoint Configuration

**Chat Endpoint:** Frontend calls `/api/assistant/chat` (NOT `/api/chat`)
- File: `frontend/src/components/assistant/ChatInterface.tsx`
- Line: `api: '/api/assistant/chat'`

If you change the backend route, update this file to match!

## ⚙️ Configuration Files

### Frontend Environment Variables
Make sure these are set correctly:

**File:** `frontend/.env.local`
```env
# Backend API URL - MUST be port 8000!
VITE_API_BASE_URL=http://localhost:8000/api

# AI API Keys
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

### Backend Environment Variables
**File:** `backend/.env`
```env
DATABASE_URL=your_database_url
MONGODB_URI=your_mongo_uri
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

---

## 🔧 Port Configuration

| Service | Port | Notes |
|---------|------|-------|
| Frontend (Vite) | 5173 | Auto-increments if occupied |
| Backend (FastAPI) | 8000 | Fixed - update .env.local if changed |
| MongoDB | 27017 | Default MongoDB port |

**IMPORTANT:** If you change the backend port, you must also update `frontend/.env.local` to match!

---

## 📋 Common Issues & Solutions

### ❌ "Failed to fetch" or "ERR_CONNECTION_REFUSED"
**Cause:** Frontend is pointing to wrong backend port
**Fix:** Check `frontend/.env.local` has correct `VITE_API_BASE_URL`

### ❌ "Could not import module 'main'"
**Cause:** Wrong uvicorn command
**Fix:** Use `python -m uvicorn app.main:app` (not `main:app`)

### ❌ Port already in use
**Fix:**
- Windows: `netstat -ano | findstr :PORT` then `taskkill /PID <pid> /F`
- Or just let Vite auto-increment to next port

---

## 🛑 Stopping All Servers

### Windows
```bash
taskkill /F /IM node.exe
taskkill /F /IM python.exe
```

### Or kill specific ports:
```bash
netstat -ano | findstr :5173
netstat -ano | findstr :8000
taskkill /PID <pid> /F
```

---

## 📁 Project Structure

```
NeuroVidya MIni Project/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── api/             # API routes
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic
│   │   └── schemas/         # Pydantic schemas
│   └── .env                 # Backend environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   └── design-system/   # Dyslexia-friendly UI
│   ├── .env                 # Environment template
│   ├── .env.local           # ⭐ ACTUAL environment variables (gitignored)
│   └── vite.config.ts       # Vite config (proxy to :8000)
│
└── STARTUP_GUIDE.md         # THIS FILE
```

---

## ✅ Startup Checklist

Before running the project, verify:

- [ ] MongoDB is running (if using local MongoDB)
- [ ] Backend `.env` has correct DATABASE_URL and API keys
- [ ] Frontend `.env.local` has `VITE_API_BASE_URL=http://localhost:8000/api`
- [ ] All dependencies installed (`npm install` in frontend, `pip install` in backend)
- [ ] Python virtual environment activated (if using venv)

---

## 🎯 Features Enabled

- ✅ Dyslexia-friendly reading interface
- ✅ OCR text extraction from images
- ✅ AI-powered reading coach
- ✅ Progress tracking
- ✅ Customizable font settings
- ✅ Reading comprehension tools
- ✅ User authentication
- ✅ Dark/Light theme support

---

Last Updated: 2025-03-23
