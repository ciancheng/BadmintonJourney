#!/bin/bash

# 羽球之旅 - Docker镜像构建脚本
# Author: BadmintonJourney Team
# Version: 1.0.0

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
PROJECT_NAME="badminton-journey"
VERSION="1.0.0"
REGISTRY=""  # 留空使用本地镜像，设置为镜像仓库地址如 registry.example.com

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 显示帮助信息
show_help() {
    echo "羽球之旅 Docker镜像构建脚本"
    echo ""
    echo "使用方法:"
    echo "  $0 [选项] [环境]"
    echo ""
    echo "环境:"
    echo "  dev      开发环境 (默认，使用H2数据库)"
    echo "  prod     生产环境 (使用MySQL数据库)"
    echo ""
    echo "选项:"
    echo "  -h, --help        显示帮助信息"
    echo "  -v, --version     显示版本信息"
    echo "  --no-cache        不使用缓存构建"
    echo "  --push            构建后推送到镜像仓库"
    echo "  --registry URL    设置镜像仓库地址"
    echo "  --tag TAG         设置镜像标签 (默认: $VERSION)"
    echo ""
    echo "示例:"
    echo "  $0                构建开发环境镜像"
    echo "  $0 prod           构建生产环境镜像"
    echo "  $0 --no-cache     不使用缓存构建"
    echo "  $0 --push prod    构建生产环境镜像并推送"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "无法连接到Docker守护进程，请确保Docker正在运行"
        exit 1
    fi
}

# 检查Docker Compose是否安装
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_warning "docker-compose未安装，将使用 docker compose 命令"
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
}

# 创建必要的目录
create_directories() {
    print_step "创建必要的目录..."
    mkdir -p data logs uploads
    chmod 755 data logs uploads
}

# 构建后端镜像
build_backend() {
    print_step "构建后端镜像..."
    
    cd backend
    
    # 检查是否需要先构建jar文件
    if [[ ! -f target/badminton-journey-backend-*.jar ]] || [[ "$USE_MULTI_STAGE" == "true" ]]; then
        print_message "使用多阶段构建..."
        docker build $BUILD_ARGS -f Dockerfile.multi-stage -t ${REGISTRY}${PROJECT_NAME}-backend:${TAG} .
    else
        print_message "使用预构建的jar文件..."
        docker build $BUILD_ARGS -f Dockerfile -t ${REGISTRY}${PROJECT_NAME}-backend:${TAG} .
    fi
    
    cd ..
    print_message "后端镜像构建完成: ${REGISTRY}${PROJECT_NAME}-backend:${TAG}"
}

# 构建前端镜像
build_frontend() {
    print_step "构建前端镜像..."
    
    cd frontend
    docker build $BUILD_ARGS -t ${REGISTRY}${PROJECT_NAME}-frontend:${TAG} .
    cd ..
    
    print_message "前端镜像构建完成: ${REGISTRY}${PROJECT_NAME}-frontend:${TAG}"
}

# 推送镜像到仓库
push_images() {
    if [[ "$PUSH_IMAGES" == "true" ]] && [[ -n "$REGISTRY" ]]; then
        print_step "推送镜像到仓库..."
        docker push ${REGISTRY}${PROJECT_NAME}-backend:${TAG}
        docker push ${REGISTRY}${PROJECT_NAME}-frontend:${TAG}
        print_message "镜像推送完成"
    fi
}

# 清理旧镜像
cleanup_images() {
    print_step "清理悬空镜像..."
    docker image prune -f
    print_message "清理完成"
}

# 显示构建信息
show_build_info() {
    print_message "构建信息:"
    echo "  项目名称: $PROJECT_NAME"
    echo "  环境: $ENVIRONMENT"
    echo "  版本: $TAG"
    echo "  镜像仓库: ${REGISTRY:-本地}"
    echo "  后端镜像: ${REGISTRY}${PROJECT_NAME}-backend:${TAG}"
    echo "  前端镜像: ${REGISTRY}${PROJECT_NAME}-frontend:${TAG}"
    echo ""
}

# 生成启动脚本
generate_start_script() {
    print_step "生成启动脚本..."
    
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    else
        COMPOSE_FILE="docker-compose.yml"
    fi
    
    cat > start-docker.sh << EOF
#!/bin/bash
# 羽球之旅 Docker 启动脚本
# 环境: $ENVIRONMENT

set -e

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "\${GREEN}启动羽球之旅应用...\${NC}"
echo "环境: $ENVIRONMENT"
echo "配置文件: $COMPOSE_FILE"
echo ""

# 创建必要的目录
mkdir -p data logs uploads
chmod 755 data logs uploads

# 启动服务
$DOCKER_COMPOSE -f $COMPOSE_FILE up -d

echo ""
echo -e "\${GREEN}启动完成！\${NC}"
echo "前端地址: http://localhost"
echo "后端地址: http://localhost:8080"
echo ""
echo "查看日志: $DOCKER_COMPOSE -f $COMPOSE_FILE logs -f"
echo "停止服务: $DOCKER_COMPOSE -f $COMPOSE_FILE down"
EOF

    chmod +x start-docker.sh
    print_message "启动脚本已生成: start-docker.sh"
}

# 主函数
main() {
    # 默认值
    ENVIRONMENT="dev"
    TAG="$VERSION"
    BUILD_ARGS=""
    PUSH_IMAGES="false"
    USE_MULTI_STAGE="true"
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--version)
                echo "$PROJECT_NAME 构建脚本 v$VERSION"
                exit 0
                ;;
            --no-cache)
                BUILD_ARGS="$BUILD_ARGS --no-cache"
                shift
                ;;
            --push)
                PUSH_IMAGES="true"
                shift
                ;;
            --registry)
                REGISTRY="$2/"
                shift 2
                ;;
            --tag)
                TAG="$2"
                shift 2
                ;;
            dev|prod)
                ENVIRONMENT="$1"
                shift
                ;;
            *)
                print_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查环境
    print_step "检查构建环境..."
    check_docker
    check_docker_compose
    
    # 显示构建信息
    show_build_info
    
    # 创建目录
    create_directories
    
    # 构建镜像
    print_step "开始构建镜像..."
    echo "=========================================="
    
    build_backend
    build_frontend
    
    echo "=========================================="
    print_message "所有镜像构建完成！"
    
    # 推送镜像
    push_images
    
    # 生成启动脚本
    generate_start_script
    
    # 清理
    cleanup_images
    
    # 完成提示
    echo ""
    print_message "构建流程完成！"
    print_message "使用 './start-docker.sh' 启动应用"
    
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        print_warning "生产环境需要配置环境变量，请参考 .env.example"
    fi
}

# 执行主函数
main "$@" 