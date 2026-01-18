@echo off
echo Stopping ExcelExtractor Application...
echo.

echo Stopping Node.js processes...
taskkill /IM node.exe /F > nul 2>&1

echo Stopping MongoDB processes...
taskkill /IM mongod.exe /F > nul 2>&1

echo.
echo All services stopped!
echo.
pause