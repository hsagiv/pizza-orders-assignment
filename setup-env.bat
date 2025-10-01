@echo off
REM Setup script for Pizza Order Management System
REM This script creates the necessary .env files for development

echo 🍕 Setting up Pizza Order Management System environment...

REM Create server .env file
if not exist "server\.env" (
    echo 📝 Creating server\.env from env.development...
    copy "server\env.development" "server\.env"
    echo ✅ Server environment file created
) else (
    echo ⚠️  server\.env already exists, skipping...
)

REM Create client .env file
if not exist "client\.env" (
    echo 📝 Creating client\.env from env.development...
    copy "client\env.development" "client\.env"
    echo ✅ Client environment file created
) else (
    echo ⚠️  client\.env already exists, skipping...
)

echo.
echo 🎉 Environment setup complete!
echo.
echo 📋 Next steps:
echo 1. Review and update the .env files if needed
echo 2. Run 'make dev' to start the development environment
echo 3. Or run 'docker-compose up' to start with Docker
echo.
echo 🔧 Environment files created:
echo    - server\.env (backend configuration)
echo    - client\.env (frontend configuration)
echo.
echo ⚠️  Remember to:
echo    - Change JWT_SECRET in production
echo    - Update database credentials for production
echo    - Set proper CORS origins for production

pause
