@echo off
setlocal
cd /d "%~dp0"
node tools\build-employee-dashboard.mjs
if errorlevel 1 (
  echo.
  echo ダッシュボードを更新できませんでした。
  pause
  exit /b 1
)
start "" "%~dp0employee-dashboard\index.html"
endlocal
