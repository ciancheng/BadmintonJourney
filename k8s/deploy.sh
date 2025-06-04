#!/bin/bash

# 羽球之旅 - Kubernetes 部署脚本
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
NAMESPACE="badminton-journey"
VERSION="1.0.0"
KUBECONFIG=${KUBECONFIG:-~/.kube/config}

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
    echo "羽球之旅 Kubernetes 部署脚本"
    echo ""
    echo "使用方法:"
    echo "  $0 [选项] [命令]"
    echo ""
    echo "命令:"
    echo "  deploy       部署应用到K8s集群"
    echo "  delete       删除应用从K8s集群"
    echo "  status       查看应用状态"
    echo "  logs         查看应用日志"
    echo "  scale        扩缩容应用"
    echo "  update       滚动更新应用"
    echo ""
    echo "选项:"
    echo "  -h, --help        显示帮助信息"
    echo "  -n, --namespace   指定命名空间 (默认: $NAMESPACE)"
    echo "  -v, --version     显示版本信息"
    echo "  --dry-run         仅显示要执行的命令"
    echo "  --wait            等待部署完成"
    echo ""
    echo "示例:"
    echo "  $0 deploy         部署应用"
    echo "  $0 status         查看状态"
    echo "  $0 scale backend 3   扩容后端到3个副本"
    echo "  $0 logs backend      查看后端日志"
}

# 检查kubectl是否安装
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl未安装，请先安装kubectl"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        print_error "无法连接到Kubernetes集群，请检查kubeconfig配置"
        exit 1
    fi
}

# 检查必要的工具
check_requirements() {
    print_step "检查部署环境..."
    check_kubectl
    
    # 检查命名空间是否存在
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        print_warning "命名空间 $NAMESPACE 不存在，将自动创建"
    fi
    
    # 检查Ingress Controller
    if ! kubectl get ingressclass nginx &> /dev/null; then
        print_warning "未找到nginx ingress class，请确保安装了Nginx Ingress Controller"
    fi
    
    print_message "环境检查完成"
}

# 部署应用
deploy_app() {
    print_step "开始部署羽球之旅应用到Kubernetes..."
    
    # 应用YAML文件的顺序很重要
    local files=(
        "namespace.yaml"
        "configmap.yaml"
        "secrets.yaml"
        "pvc.yaml"
        "mysql.yaml"
        "redis.yaml"
        "backend.yaml"
        "frontend.yaml"
        "hpa.yaml"
        "ingress.yaml"
    )
    
    for file in "${files[@]}"; do
        if [[ -f "$file" ]]; then
            print_message "应用 $file..."
            if [[ "$DRY_RUN" == "true" ]]; then
                echo "kubectl apply -f $file"
            else
                kubectl apply -f "$file"
            fi
        else
            print_warning "文件 $file 不存在，跳过"
        fi
    done
    
    if [[ "$WAIT_FOR_READY" == "true" ]] && [[ "$DRY_RUN" != "true" ]]; then
        print_step "等待应用就绪..."
        wait_for_ready
    fi
    
    print_message "部署完成！"
    show_access_info
}

# 等待应用就绪
wait_for_ready() {
    print_message "等待MySQL就绪..."
    kubectl wait --for=condition=Ready pod -l app.kubernetes.io/component=database -n $NAMESPACE --timeout=300s
    
    print_message "等待Redis就绪..."
    kubectl wait --for=condition=Ready pod -l app.kubernetes.io/component=cache -n $NAMESPACE --timeout=120s
    
    print_message "等待后端服务就绪..."
    kubectl wait --for=condition=Ready pod -l app.kubernetes.io/component=backend -n $NAMESPACE --timeout=300s
    
    print_message "等待前端服务就绪..."
    kubectl wait --for=condition=Ready pod -l app.kubernetes.io/component=frontend -n $NAMESPACE --timeout=120s
    
    print_message "所有服务已就绪！"
}

# 显示访问信息
show_access_info() {
    print_message "应用访问信息:"
    
    # 获取Ingress信息
    local ingress_ip=$(kubectl get ingress badminton-ingress-local -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    
    if [[ -n "$ingress_ip" ]]; then
        echo "  前端访问地址: http://$ingress_ip"
        echo "  后端API地址: http://$ingress_ip/api"
    else
        echo "  本地访问（需要配置hosts）:"
        echo "    127.0.0.1 badminton.local"
        echo "  前端访问地址: http://badminton.local"
        echo "  后端API地址: http://badminton.local/api"
    fi
    
    echo ""
    echo "  监控地址:"
    echo "    kubectl port-forward -n $NAMESPACE svc/backend-service 8080:8080"
    echo "    访问: http://localhost:8080/api/actuator/health"
    echo ""
    echo "  数据库访问:"
    echo "    kubectl port-forward -n $NAMESPACE svc/mysql-service 3306:3306"
    echo "    连接: mysql -h 127.0.0.1 -P 3306 -u badminton -p"
}

# 删除应用
delete_app() {
    print_step "删除羽球之旅应用..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "kubectl delete namespace $NAMESPACE"
        return
    fi
    
    read -p "确定要删除应用吗？这将删除所有数据！(y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        print_message "操作已取消"
        return
    fi
    
    kubectl delete namespace $NAMESPACE
    print_message "应用已删除"
}

# 查看应用状态
show_status() {
    print_step "查看应用状态..."
    
    echo "======================================"
    echo "命名空间状态:"
    kubectl get namespace $NAMESPACE 2>/dev/null || echo "命名空间不存在"
    
    echo ""
    echo "======================================"
    echo "Pod状态:"
    kubectl get pods -n $NAMESPACE -o wide
    
    echo ""
    echo "======================================"
    echo "服务状态:"
    kubectl get services -n $NAMESPACE
    
    echo ""
    echo "======================================"
    echo "Ingress状态:"
    kubectl get ingress -n $NAMESPACE
    
    echo ""
    echo "======================================"
    echo "PVC状态:"
    kubectl get pvc -n $NAMESPACE
    
    echo ""
    echo "======================================"
    echo "HPA状态:"
    kubectl get hpa -n $NAMESPACE
}

# 查看日志
show_logs() {
    local component=${1:-backend}
    local lines=${2:-100}
    
    print_step "查看 $component 日志 (最近 $lines 行)..."
    
    kubectl logs -n $NAMESPACE -l app.kubernetes.io/component=$component --tail=$lines -f
}

# 扩缩容
scale_app() {
    local component=${1:-backend}
    local replicas=${2:-2}
    
    print_step "扩缩容 $component 到 $replicas 个副本..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "kubectl scale deployment $component -n $NAMESPACE --replicas=$replicas"
        return
    fi
    
    kubectl scale deployment $component -n $NAMESPACE --replicas=$replicas
    print_message "扩缩容完成"
}

# 滚动更新
update_app() {
    local component=${1:-backend}
    local image=${2:-}
    
    if [[ -z "$image" ]]; then
        print_error "请指定镜像名称"
        print_message "示例: $0 update backend badminton-journey-backend:v2.0.0"
        exit 1
    fi
    
    print_step "更新 $component 到镜像 $image..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "kubectl set image deployment/$component -n $NAMESPACE $component=$image"
        return
    fi
    
    kubectl set image deployment/$component -n $NAMESPACE $component=$image
    
    print_message "正在滚动更新..."
    kubectl rollout status deployment/$component -n $NAMESPACE
    print_message "更新完成"
}

# 主函数
main() {
    # 默认值
    COMMAND=""
    DRY_RUN="false"
    WAIT_FOR_READY="false"
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--version)
                echo "$PROJECT_NAME 部署脚本 v$VERSION"
                exit 0
                ;;
            -n|--namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN="true"
                shift
                ;;
            --wait)
                WAIT_FOR_READY="true"
                shift
                ;;
            deploy|delete|status|logs|scale|update)
                COMMAND="$1"
                shift
                break
                ;;
            *)
                print_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    if [[ -z "$COMMAND" ]]; then
        print_error "请指定命令"
        show_help
        exit 1
    fi
    
    # 检查环境
    check_requirements
    
    # 执行命令
    case $COMMAND in
        deploy)
            deploy_app
            ;;
        delete)
            delete_app
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$@"
            ;;
        scale)
            scale_app "$@"
            ;;
        update)
            update_app "$@"
            ;;
        *)
            print_error "未知命令: $COMMAND"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@" 