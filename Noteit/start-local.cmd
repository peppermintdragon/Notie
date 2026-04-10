@echo off
cd /d "%~dp0"
echo Starting Noteit on http://localhost:4173
call npm.cmd run dev
