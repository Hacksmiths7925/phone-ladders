# Phone Ladder - Quick Start Guide

## Server Kaise Start Karein

### Method 1: Double-Click (Sabse Aasan)
1. File Explorer mein jao: `C:\Users\Asus\.gemini\antigravity\scratch\phone-ladder\`
2. **`START_SERVER.bat`** par double-click karo
3. Ek black CMD window khulega — server start hoga
4. Browser automatically `http://127.0.0.1:8000` par khulega
5. App use karo! 🎉

### Method 2: PowerShell
```powershell
cd "C:\Users\Asus\.gemini\antigravity\scratch\phone-ladder"
python run.py
```
Phir browser mein: **http://127.0.0.1:8000**

### Method 3: Command Prompt (CMD)
```cmd
cd C:\Users\Asus\.gemini\antigravity\scratch\phone-ladder
set PYTHONPATH=C:\Users\Asus\.gemini\antigravity\scratch\phone-ladder
python run.py
```

---

## Agar Blank Page Aaye

1. **Server chal raha hai?** — CMD window mein `INFO: Application startup complete.` dikhna chahiye
2. **Browser refresh karo** — F5 dabao
3. **DevTools check karo** — F12 → Console tab → koi red error dekho

## Requirements

```
pip install fastapi uvicorn sqlalchemy
```

---

## App Features

| Feature | Description |
|---------|-------------|
| Dashboard | Phone tiers aur top AI model picks |
| Device Analyzer | Apne phone ki specs enter karo |
| AI Model Explorer | 17 models search/filter karo |
| Model Comparison | Side-by-side RAM/speed compare |
| Benchmark Lab | Real browser benchmark test |
| Smart Recommendations | Personalized model suggestions |
| One-Tap Scan | Browser hardware audit |
| Live Monitor | Real-time performance metrics |
| Offline Mode | Models download aur local chat |
| Community Leaderboard | Verified benchmark scores |
| Storage Manager | Download space management |
| AI Quality Test | Hindi + English evaluation |
| Privacy Center | Data governance aur control |
