#!/bin/bash

# 后端打包脚本

echo "========================================="
echo "     羽球之旅 - 后端打包"
echo "========================================="
echo ""

# 检查Maven环境
if ! command -v mvn &> /dev/null; then
    echo "❌ 错误：未检测到Maven环境"
    echo "请先安装Maven后再运行此脚本"
    exit 1
fi

# 清理旧的构建文件
echo "清理旧的构建文件..."
mvn clean

# 运行测试
echo ""
echo "运行单元测试..."
mvn test

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  测试失败！是否继续打包？(y/n)"
    read -r answer
    if [ "$answer" != "y" ]; then
        exit 1
    fi
fi

# 打包应用
echo ""
echo "打包应用..."
mvn package -DskipTests

if [ $? -ne 0 ]; then
    echo "❌ 打包失败"
    exit 1
fi

# 显示打包结果
echo ""
echo "========================================="
echo "✅ 打包成功!"
echo "========================================="
echo ""
echo "JAR文件位置:"
ls -lh target/*.jar | grep -v original
echo ""
echo "运行命令: java -jar target/badminton-journey-backend-1.0.0.jar"
echo ""
echo "可选的运行参数:"
echo "  指定端口: java -jar target/badminton-journey-backend-1.0.0.jar --server.port=8090"
echo "  指定环境: java -jar target/badminton-journey-backend-1.0.0.jar --spring.profiles.active=prod"
echo "" 