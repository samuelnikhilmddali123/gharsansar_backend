@echo off
echo Starting Cloudflare Tunnel for Ghar Sansar Backend (Port 5001)...
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:5001
pause
