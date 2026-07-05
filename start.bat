@echo off
echo Starting Future Founder Twin - Local Development Setup

echo Launching Backend (FastAPI on Port 8000)...
start "FFT Backend" cmd /k "cd backend && if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) && python main.py"

echo Launching Frontend (Next.js on Port 3000)...
start "FFT Frontend" cmd /k "cd frontend && npm run dev"

echo Done! Two new command prompt windows should have opened.
echo Frontend will be available at: http://localhost:3000
echo You can close this window now.
pause
