@echo off
chcp 65001 >nul
echo ============================================
echo   VoyagerStar Blog System
echo ============================================
echo.
echo 正在检查Node.js是否已安装...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到Node.js
    echo 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js已安装
echo.
echo 正在检查依赖是否已安装...
if not exist node_modules (
    echo 正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✓ 依赖安装完成
) else (
    echo ✓ 依赖已存在
)
echo.
echo ============================================
echo   启动服务器...
echo ============================================
echo.
echo 服务器地址: http://localhost:3000
echo API地址: http://localhost:3000/api
echo.
echo 按 Ctrl+C 停止服务器
echo.
call npm start
