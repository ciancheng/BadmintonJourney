#!/bin/bash

# 前端打包脚本

echo "========================================="
echo "     羽球之旅 - 前端打包"
echo "========================================="
echo ""

# 检查Node.js环境
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "❌ 错误：未检测到Node.js/npm环境"
    echo "请先安装Node.js后再运行此脚本"
    exit 1
fi

# 检查并安装依赖
echo "检查项目依赖..."
if [ ! -d "node_modules" ]; then
    echo "安装项目依赖..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

# 清理旧的构建文件
echo ""
echo "清理旧的构建文件..."
rm -rf build

# 设置生产环境API地址
echo ""
echo "当前构建配置:"
echo "  API地址: ${REACT_APP_API_BASE_URL:-http://localhost:8080/api}"
echo ""
echo "如需修改API地址，请设置环境变量 REACT_APP_API_BASE_URL"
echo "例如: REACT_APP_API_BASE_URL=https://api.badminton.com ./build.sh"
echo ""

# 构建应用
echo "构建生产版本..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 计算构建大小
build_size=$(du -sh build | cut -f1)

# 显示构建结果
echo ""
echo "========================================="
echo "✅ 构建成功!"
echo "========================================="
echo ""
echo "构建文件夹: ./build"
echo "构建大小: $build_size"
echo ""
echo "部署说明:"
echo "1. 使用静态服务器部署:"
echo "   npx serve -s build -l 3000"
echo ""
echo "2. 使用nginx部署:"
echo "   将build文件夹内容复制到nginx的html目录"
echo ""
echo "3. 使用Docker部署:"
echo "   docker build -t badminton-frontend ."
echo "   docker run -p 80:80 badminton-frontend"
echo "" 