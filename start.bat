@echo off
echo Starting ExcelExtractor Application...
echo.

echo Starting MongoDB...
start cmd /k "mkdir mongodb-data 2>nul & mongod --dbpath ./mongodb-data"

timeout /t 3 /nobreak > nul

echo Starting Backend Server...
start cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start cmd /k "cd ExcelExtractor && npm run dev"

echo.
echo All services started! 
echo - MongoDB: Running on default port
echo - Backend: http://localhost:5000
echo - Frontend: Will open automatically (usually http://localhost:5173 or 5174)
echo.
echo Press any key to close this window...
pause > nul