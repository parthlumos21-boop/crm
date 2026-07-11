@echo off
set "COMPASS=%LOCALAPPDATA%\MongoDBCompass\MongoDBCompass.exe"
set "CRM_URI=mongodb://127.0.0.1:27017/crm"

if not exist "%COMPASS%" (
  echo MongoDB Compass was not found at:
  echo %COMPASS%
  exit /b 1
)

echo MongoDB Compass CRM URI:
echo %CRM_URI%
start "" "%COMPASS%"
