#!/bin/bash

# 后端服务启动脚本

echo "========================================="
echo "     羽球之旅 - 后端服务启动"
echo "========================================="
echo ""

# 检查Java环境
echo "检查Java环境..."
if ! command -v java &> /dev/null; then
    echo "❌ 错误：未检测到Java环境"
    echo "请先安装Java 11或更高版本"
    echo "下载地址: https://adoptium.net/"
    exit 1
fi

java_version=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1-2)
echo "✅ Java版本: $java_version"

# 检查Maven环境
echo ""
echo "检查Maven环境..."
if ! command -v mvn &> /dev/null; then
    echo "❌ 错误：未检测到Maven环境"
    echo "请先安装Maven 3.6或更高版本"
    echo "安装命令: brew install maven (macOS)"
    echo "或访问: https://maven.apache.org/download.cgi"
    exit 1
fi

mvn_version=$(mvn -v | head -n 1)
echo "✅ Maven版本: $mvn_version"

# 检查端口占用
echo ""
echo "检查端口占用..."
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  警告：端口8080已被占用"
    echo "是否要终止占用进程？(y/n)"
    read -r answer
    if [ "$answer" = "y" ]; then
        kill -9 $(lsof -Pi :8080 -sTCP:LISTEN -t)
        echo "已终止占用进程"
    else
        echo "请手动处理端口占用问题后重试"
        exit 1
    fi
fi

# 编译项目
echo ""
echo "编译项目..."
mvn clean compile

if [ $? -ne 0 ]; then
    echo "❌ 编译失败，请检查代码"
    exit 1
fi

# 启动服务
echo ""
echo "========================================="
echo "启动Spring Boot服务..."
echo "========================================="
echo ""
echo "服务地址: http://localhost:8080"
echo "API地址: http://localhost:8080/api"
echo "H2控制台: http://localhost:8080/h2-console"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 启动Spring Boot
mvn spring-boot:run 