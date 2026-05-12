@echo off
REM NeuroVidya Backend Startup Script

echo Starting NeuroVidya Backend Server...
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Start the server
uvicorn app.main:app --reload --port 8000

pause
