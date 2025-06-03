#!/bin/bash

# 前端服务启动脚本

echo "========================================="
echo "     羽球之旅 - 前端服务启动"
echo "========================================="
echo ""

# 检查Node.js环境
echo "检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未检测到Node.js环境"
    echo "请先安装Node.js 14或更高版本"
    echo "下载地址: https://nodejs.org/"
    echo "或使用包管理器: brew install node (macOS)"
    exit 1
fi

node_version=$(node -v)
echo "✅ Node.js版本: $node_version"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未检测到npm"
    exit 1
fi

npm_version=$(npm -v)
echo "✅ npm版本: $npm_version"

# 检查端口占用
echo ""
echo "检查端口占用..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  警告：端口3000已被占用"
    echo "是否要终止占用进程？(y/n)"
    read -r answer
    if [ "$answer" = "y" ]; then
        kill -9 $(lsof -Pi :3000 -sTCP:LISTEN -t)
        echo "已终止占用进程"
    else
        echo "请手动处理端口占用问题后重试"
        exit 1
    fi
fi

# 检查依赖
echo ""
echo "检查项目依赖..."
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    echo "📦 安装项目依赖..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        echo "尝试清理缓存后重试..."
        npm cache clean --force
        rm -rf node_modules package-lock.json
        npm install
        
        if [ $? -ne 0 ]; then
            echo "❌ 依赖安装仍然失败，请检查网络连接或package.json"
            exit 1
        fi
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

# 检查后端服务
echo ""
echo "检查后端服务..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api | grep -q "200\|404"; then
    echo "✅ 后端服务运行中"
else
    echo "⚠️  警告：后端服务未运行"
    echo "请先在backend目录运行 ./start.sh 启动后端服务"
    echo ""
    echo "是否继续启动前端？(y/n)"
    read -r answer
    if [ "$answer" != "y" ]; then
        exit 1
    fi
fi

# 启动服务
echo ""
echo "========================================="
echo "启动React开发服务器..."
echo "========================================="
echo ""
echo "前端地址: http://localhost:3000"
echo "后端API: http://localhost:8080/api"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 设置环境变量并启动
export REACT_APP_API_BASE_URL=http://localhost:8080/api
npm start 