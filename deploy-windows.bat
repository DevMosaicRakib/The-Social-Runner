@echo off
REM The Social Runner - Windows Deployment Script
REM Run this as Administrator

echo Starting The Social Runner Windows deployment...
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Right-click on this file and select "Run as administrator"
    pause
    exit /b 1
)

REM Set deployment directory
set DEPLOY_DIR=C:\SocialRunner
echo Creating deployment directory: %DEPLOY_DIR%
if not exist "%DEPLOY_DIR%" mkdir "%DEPLOY_DIR%"

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please download and install Node.js from https://nodejs.org/
    echo Make sure to select "Add to PATH" during installation
    pause
    exit /b 1
) else (
    echo Node.js is installed
    node --version
)

REM Check if PostgreSQL is installed
echo Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorLevel% neq 0 (
    echo WARNING: PostgreSQL may not be installed or not in PATH
    echo Please install PostgreSQL from https://www.postgresql.org/download/windows/
    echo You can continue and install PostgreSQL later
)

echo.
echo Installing global Node.js packages...
npm install -g pm2 typescript tsx drizzle-kit

REM Copy files to deployment directory
echo.
echo Copying application files to %DEPLOY_DIR%...
if exist "%~dp0client" (
    xcopy /E /I /Y "%~dp0client" "%DEPLOY_DIR%\client"
)
if exist "%~dp0server" (
    xcopy /E /I /Y "%~dp0server" "%DEPLOY_DIR%\server"
)
if exist "%~dp0shared" (
    xcopy /E /I /Y "%~dp0shared" "%DEPLOY_DIR%\shared"
)
if exist "%~dp0package.json" (
    copy /Y "%~dp0package.json" "%DEPLOY_DIR%\"
)
if exist "%~dp0package-lock.json" (
    copy /Y "%~dp0package-lock.json" "%DEPLOY_DIR%\"
)
if exist "%~dp0tsconfig.json" (
    copy /Y "%~dp0tsconfig.json" "%DEPLOY_DIR%\"
)
if exist "%~dp0vite.config.ts" (
    copy /Y "%~dp0vite.config.ts" "%DEPLOY_DIR%\"
)
if exist "%~dp0drizzle.config.ts" (
    copy /Y "%~dp0drizzle.config.ts" "%DEPLOY_DIR%\"
)
if exist "%~dp0tailwind.config.ts" (
    copy /Y "%~dp0tailwind.config.ts" "%DEPLOY_DIR%\"
)
if exist "%~dp0postcss.config.js" (
    copy /Y "%~dp0postcss.config.js" "%DEPLOY_DIR%\"
)
if exist "%~dp0components.json" (
    copy /Y "%~dp0components.json" "%DEPLOY_DIR%\"
)

REM Change to deployment directory
cd /d "%DEPLOY_DIR%"

REM Create environment file if it doesn't exist
if not exist ".env" (
    echo Creating environment file...
    (
        echo NODE_ENV=production
        echo PORT=5000
        echo.
        echo # Database Configuration
        echo DATABASE_URL=postgresql://runner_user:SocialRunner2025!@localhost:5432/social_runner
        echo PGHOST=localhost
        echo PGPORT=5432
        echo PGDATABASE=social_runner
        echo PGUSER=runner_user
        echo PGPASSWORD=SocialRunner2025!
        echo.
        echo # Session Secret ^(generate a random string^)
        echo SESSION_SECRET=your_random_32_character_string_here
        echo.
        echo # OAuth Configuration - REPLACE WITH YOUR ACTUAL VALUES
        echo GOOGLE_CLIENT_ID=your_google_client_id_here
        echo GOOGLE_CLIENT_SECRET=your_google_client_secret_here
        echo STRAVA_CLIENT_ID=your_strava_client_id_here
        echo STRAVA_CLIENT_SECRET=your_strava_client_secret_here
        echo.
        echo # Application URLs
        echo REPLIT_DOMAINS=localhost,127.0.0.1,www.thesocialrunner.com.au,thesocialrunner.com.au
        echo ISSUER_URL=https://replit.com/oidc
        echo REPL_ID=your_repl_id_here
        echo.
        echo # Optional: Email Configuration
        echo SENDGRID_API_KEY=your_sendgrid_api_key_here
    ) > .env
    echo Environment file created: %DEPLOY_DIR%\.env
)

REM Install dependencies
echo.
echo Installing application dependencies...
npm install

REM Create PM2 ecosystem file
echo.
echo Creating PM2 configuration...
(
    echo module.exports = {
    echo   apps: [{
    echo     name: 'social-runner',
    echo     script: 'dist/index.js',
    echo     cwd: '%DEPLOY_DIR%',
    echo     instances: 1,
    echo     autorestart: true,
    echo     watch: false,
    echo     max_memory_restart: '1G',
    echo     env: {
    echo       NODE_ENV: 'production',
    echo       PORT: 5000
    echo     },
    echo     error_file: './logs/err.log',
    echo     out_file: './logs/out.log',
    echo     log_file: './logs/combined.log',
    echo     time: true
    echo   }]
    echo };
) > ecosystem.config.js

REM Create logs directory
if not exist "logs" mkdir logs

REM Create start script
echo.
echo Creating start script...
(
    echo @echo off
    echo cd /d "%DEPLOY_DIR%"
    echo echo Building application...
    echo npm run build
    echo echo Starting application with PM2...
    echo pm2 start ecosystem.config.js
    echo pm2 save
    echo echo.
    echo echo Application started successfully!
    echo echo Access your app at: http://localhost:5000
    echo echo.
    echo echo Management commands:
    echo echo   pm2 status           - Check status
    echo echo   pm2 logs social-runner - View logs
    echo echo   pm2 restart social-runner - Restart app
    echo echo   pm2 stop social-runner - Stop app
    echo pause
) > start-app.bat

REM Create stop script
(
    echo @echo off
    echo cd /d "%DEPLOY_DIR%"
    echo pm2 stop social-runner
    echo echo Application stopped
    echo pause
) > stop-app.bat

REM Create restart script
(
    echo @echo off
    echo cd /d "%DEPLOY_DIR%"
    echo echo Restarting application...
    echo npm run build
    echo pm2 restart social-runner
    echo echo Application restarted successfully!
    echo pause
) > restart-app.bat

REM Create update script
(
    echo @echo off
    echo cd /d "%DEPLOY_DIR%"
    echo echo Updating application...
    echo echo.
    echo echo Step 1: Stopping application...
    echo pm2 stop social-runner
    echo.
    echo echo Step 2: Installing new dependencies...
    echo npm install
    echo.
    echo echo Step 3: Building application...
    echo npm run build
    echo.
    echo echo Step 4: Starting application...
    echo pm2 start ecosystem.config.js
    echo.
    echo echo Application updated successfully!
    echo echo Access your app at: http://localhost:5000
    echo pause
) > update-app.bat

echo.
echo ======================================
echo DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ======================================
echo.
echo Files installed to: %DEPLOY_DIR%
echo.
echo IMPORTANT NEXT STEPS:
echo.
echo 1. Install PostgreSQL if not already installed:
echo    https://www.postgresql.org/download/windows/
echo.
echo 2. Set up the database:
echo    - Open pgAdmin
echo    - Create database: social_runner
echo    - Create user: runner_user with password: SocialRunner2025!
echo.
echo 3. Configure OAuth credentials in: %DEPLOY_DIR%\.env
echo    - Get Google OAuth credentials from: https://console.cloud.google.com/
echo    - Get Strava OAuth credentials from: https://developers.strava.com/
echo.
echo 4. Start the application:
echo    - Double-click: %DEPLOY_DIR%\start-app.bat
echo    - Or run: cd %DEPLOY_DIR% && npm run build && pm2 start ecosystem.config.js
echo.
echo 5. Access your application:
echo    http://localhost:5000
echo.
echo MANAGEMENT SCRIPTS CREATED:
echo   %DEPLOY_DIR%\start-app.bat    - Start the application
echo   %DEPLOY_DIR%\stop-app.bat     - Stop the application  
echo   %DEPLOY_DIR%\restart-app.bat  - Restart the application
echo   %DEPLOY_DIR%\update-app.bat   - Update the application
echo.
echo For detailed instructions, see: WINDOWS_DEPLOYMENT_GUIDE.md
echo.
pause