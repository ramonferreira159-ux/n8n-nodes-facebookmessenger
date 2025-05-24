@echo off
echo Linking Facebook Messenger node to local n8n installation...

REM Check if n8n is installed globally
where n8n >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo n8n is not installed globally. Please install n8n first.
    exit /b 1
)

REM Get the n8n custom nodes directory
for /f "tokens=*" %%a in ('n8n --help ^| findstr "custom"') do (
    set "line=%%a"
    echo Found: !line!
)

REM Create a symbolic link to the node
npm link

REM Navigate to the n8n custom nodes directory and link the node
cd %APPDATA%\npm\node_modules\n8n
npm link n8n-nodes-facebookmessenger

echo Facebook Messenger node linked successfully!
echo Please restart n8n to see the node in the UI.