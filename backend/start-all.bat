@echo off
cd /d %~dp0

echo [1/3] Installing Whisper (Python 3.11)...
py -3.11 -m pip install -U openai-whisper

echo [2/3] Installing ffmpeg...
choco install ffmpeg -y

echo [3/3] Starting Node.js server...
npm run dev

pause