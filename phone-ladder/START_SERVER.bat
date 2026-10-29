@echo off
title Phone Ladder - AI Model Recommender
color 0B
echo.
echo  ========================================
echo   PHONE LADDER - Starting Server...
echo  ========================================
echo.
cd /d "%~dp0"
set PYTHONPATH=%~dp0
echo [INFO] Project folder: %~dp0
echo [INFO] Starting FastAPI server on http://127.0.0.1:8000
echo [INFO] Press Ctrl+C to stop the server
echo.
timeout /t 2 /nobreak > nul
start "" "http://127.0.0.1:8000"
python run.py
echo.
echo [INFO] Server stopped. Press any key to exit.
pause > nul
