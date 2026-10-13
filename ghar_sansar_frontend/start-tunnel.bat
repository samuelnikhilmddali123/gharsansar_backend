@echo off
echo Starting Cloudflare Tunnel for Ghar Sansar Frontend (Port 5173)...
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:5173
pause
