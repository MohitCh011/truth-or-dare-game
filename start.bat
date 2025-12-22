
@echo off
echo ========================================
echo   Truth or Dare Game - Starting...
echo ========================================
echo.
echo Installing dependencies if needed...
call npm install
call npm run install:all
echo.
echo ========================================
echo   Starting Client and Server
echo ========================================
echo.
echo Server will run on: http://localhost:3000
echo Client will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.
call npm run dev
