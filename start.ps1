# start.ps1
Write-Host "Starting Future Founder Twin - Local Development Setup" -ForegroundColor Cyan

# Start Backend in a new window
Write-Host "Launching Backend (FastAPI on Port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; if (Test-Path .venv\Scripts\activate.ps1) { .\.venv\Scripts\activate.ps1 }; python main.py"

# Start Frontend in a new window
Write-Host "Launching Frontend (Next.js on Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Done! Two new windows should have opened." -ForegroundColor Yellow
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
