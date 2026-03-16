@echo off
setlocal

set "PS_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if not exist "%PS_EXE%" set "PS_EXE=powershell"

"%PS_EXE%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\launch-filetrx.ps1"
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
  echo.
  echo filetrx failed to start. See:
  echo %~dp0launch-filetrx.log
  echo.
  pause
)

exit /b %EXIT_CODE%