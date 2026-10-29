@echo off
title Phone Ladder - On-Device AI Recommender
cd /d "%~dp0"
echo ==============================================================
echo   Starting Phone Ladder AI Server...
echo ==============================================================
echo.
echo Opening browser to http://127.0.0.1:8000 ...
start http://127.0.0.1:8000
echo.
echo Server is running! Do not close this terminal window.
echo Press Ctrl+C to stop the server.
echo.
python run.py
pause
