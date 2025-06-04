# 羽球之旅 Kubernetes 部署指南

本指南详细介绍如何在Kubernetes集群上部署羽球之旅应用。

## 📋 目录

- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [详细部署步骤](#详细部署步骤)
- [配置说明](#配置说明)
- [存储配置](#存储配置)
- [网络配置](#网络配置)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)
- [高级配置](#高级配置)

## 🔧 系统要求

### Kubernetes集群要求
- Kubernetes 1.20+
- kubectl 客户端工具
- 至少3个工作节点（推荐）
- 总计至少8GB内存，4核CPU

### 存储要求
- 支持ReadWriteOnce的存储类（数据库、缓存）
- 支持ReadWriteMany的存储类（文件上传、日志）
- 至少135GB可用存储空间

### 网络要求
- Nginx Ingress Controller（推荐）
- DNS解析或负载均衡器
- 可选：cert-manager（自动HTTPS证书）

## 🚀 快速开始

### 方法一：使用all-in-one文件（推荐初学者）

```bash
# 1. 构建镜像（请先确保Docker镜像已构建）
./build-images.sh

# 2. 快速部署
kubectl apply -f k8s/all-in-one.yaml

# 3. 等待就绪
kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=badminton-journey -n badminton-journey --timeout=300s

# 4. 配置本地访问（可选）
echo "127.0.0.1 badminton.local" | sudo tee -a /etc/hosts

# 5. 访问应用
# 前端: http://badminton.local
# 后端: http://badminton.local/api
```

### 方法二：使用部署脚本（推荐）

```bash
# 1. 给脚本添加执行权限
chmod +x k8s/deploy.sh

# 2. 部署应用并等待就绪
cd k8s && ./deploy.sh deploy --wait

# 3. 查看状态
./deploy.sh status

# 4. 查看访问信息
./deploy.sh deploy  # 会显示访问信息
```

## 📝 详细部署步骤

### 1. 准备工作

```bash
# 确认kubectl连接正常
kubectl cluster-info

# 检查存储类
kubectl get storageclass

# 检查Ingress Controller
kubectl get ingressclass
```

### 2. 构建和推送镜像

```bash
# 本地构建镜像
./build-images.sh

# 如果使用私有镜像仓库，需要推送镜像
# ./build-images.sh --registry your-registry.com --push

# 更新部署文件中的镜像地址（如果使用远程镜像）
# sed -i 's|badminton-journey-backend:1.0.0|your-registry.com/badminton-journey-backend:1.0.0|g' k8s/*.yaml
```

### 3. 配置部署参数

```bash
# 编辑配置文件（根据需要）
vim k8s/configmap.yaml
vim k8s/secrets.yaml
vim k8s/pvc.yaml
```

### 4. 按顺序部署服务

```bash
cd k8s

# 1. 基础设施
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f pvc.yaml

# 2. 数据服务
kubectl apply -f mysql.yaml
kubectl apply -f redis.yaml

# 等待数据服务就绪
kubectl wait --for=condition=Ready pod -l app.kubernetes.io/component=database -n badminton-journey --timeout=300s
kubectl wait --for=condition=Ready pod -l app.kubernetes.io/component=cache -n badminton-journey --timeout=120s

# 3. 应用服务
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml

# 等待应用服务就绪
kubectl wait --for=condition=Ready pod -l app.kubernetes.io/component=backend -n badminton-journey --timeout=300s
kubectl wait --for=condition=Ready pod -l app.kubernetes.io/component=frontend -n badminton-journey --timeout=120s

# 4. 网络和扩展
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

### 5. 验证部署

```bash
# 查看所有资源状态
kubectl get all -n badminton-journey

# 查看Pod详细状态
kubectl get pods -n badminton-journey -o wide

# 查看服务端点
kubectl get endpoints -n badminton-journey

# 查看Ingress状态
kubectl get ingress -n badminton-journey
```

## ⚙️ 配置说明

### ConfigMap配置

主要配置项在 `k8s/configmap.yaml`：

```yaml
data:
  # 数据库配置
  DB_HOST: "mysql-service"
  DB_PORT: "3306"
  DB_NAME: "badminton_journey"
  
  # 应用配置
  SPRING_PROFILES_ACTIVE: "k8s"
  JAVA_OPTS: "-Xmx1024m -Xms512m -XX:+UseG1GC"
  LOG_LEVEL: "INFO"
  
  # 文件上传配置
  MAX_FILE_SIZE: "1024MB"
  UPLOAD_DIR: "/app/uploads"
  
  # CORS配置
  ALLOWED_ORIGINS: "https://your-domain.com"
```

### Secret配置

敏感信息在 `k8s/secrets.yaml`：

```bash
# 查看当前Secret
kubectl get secret badminton-secrets -n badminton-journey -o yaml

# 更新数据库密码
kubectl create secret generic badminton-secrets \
  --from-literal=DB_USER=badminton \
  --from-literal=DB_PASSWORD=new-password \
  --from-literal=DB_ROOT_PASSWORD=new-root-password \
  --from-literal=JWT_SECRET=your-jwt-secret \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 资源限制配置

各组件的资源配置：

| 组件 | CPU请求 | 内存请求 | CPU限制 | 内存限制 | 副本数 |
|------|---------|----------|---------|----------|--------|
| MySQL | 250m | 512Mi | 500m | 1Gi | 1 |
| Redis | 100m | 128Mi | 200m | 256Mi | 1 |
| Backend | 500m | 1Gi | 1000m | 2Gi | 2 |
| Frontend | 100m | 128Mi | 200m | 256Mi | 2 |

## 💾 存储配置

### 存储类要求

```bash
# 查看可用的存储类
kubectl get storageclass

# 示例存储类配置
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs  # 根据云提供商调整
parameters:
  type: gp3
  fsType: ext4
reclaimPolicy: Retain
allowVolumeExpansion: true
```

### PVC配置

| PVC名称 | 访问模式 | 存储大小 | 用途 |
|---------|----------|----------|------|
| mysql-pvc | ReadWriteOnce | 20Gi | MySQL数据 |
| redis-pvc | ReadWriteOnce | 5Gi | Redis数据 |
| uploads-pvc | ReadWriteMany | 100Gi | 用户上传文件 |
| logs-pvc | ReadWriteMany | 10Gi | 应用日志 |

### 备份和恢复

```bash
# 备份MySQL数据
kubectl exec -n badminton-journey deployment/mysql -- \
  mysqldump -u root -p$MYSQL_ROOT_PASSWORD badminton_journey > backup-$(date +%Y%m%d).sql

# 备份上传文件
kubectl exec -n badminton-journey deployment/backend -- \
  tar -czf /tmp/uploads-backup.tar.gz /app/uploads
kubectl cp badminton-journey/backend-pod:/tmp/uploads-backup.tar.gz ./uploads-backup.tar.gz

# 恢复数据
kubectl exec -i -n badminton-journey deployment/mysql -- \
  mysql -u root -p$MYSQL_ROOT_PASSWORD badminton_journey < backup-20231201.sql
```

## 🌐 网络配置

### Ingress配置

支持两种访问模式：

#### 1. 本地开发模式
```yaml
# 域名: badminton.local
# 前端: http://badminton.local
# 后端: http://badminton.local/api
```

#### 2. 生产环境模式
```yaml
# 主域名: badminton-journey.com (前端)
# API域名: api.badminton-journey.com (后端)
```

### 域名配置

```bash
# 本地测试（添加到 /etc/hosts）
echo "127.0.0.1 badminton.local" >> /etc/hosts

# 生产环境（配置DNS记录）
# badminton-journey.com -> LoadBalancer IP
# api.badminton-journey.com -> LoadBalancer IP
```

### SSL/TLS配置

```bash
# 安装cert-manager（如果没有）
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# 创建ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

## 📊 监控和维护

### 基本监控命令

```bash
# 查看Pod状态
kubectl get pods -n badminton-journey -w

# 查看资源使用
kubectl top pods -n badminton-journey
kubectl top nodes

# 查看事件
kubectl get events -n badminton-journey --sort-by='.lastTimestamp'

# 查看日志
kubectl logs -f deployment/backend -n badminton-journey
kubectl logs -f deployment/frontend -n badminton-journey
```

### 健康检查

```bash
# 检查健康状态
kubectl get pods -n badminton-journey -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.phase}{"\n"}{end}'

# 访问健康检查端点
kubectl port-forward -n badminton-journey svc/backend-service 8080:8080
curl http://localhost:8080/api/actuator/health
```

### 自动扩缩容

HPA（水平Pod自动伸缩器）配置：

```bash
# 查看HPA状态
kubectl get hpa -n badminton-journey

# 手动扩缩容
kubectl scale deployment backend -n badminton-journey --replicas=5
kubectl scale deployment frontend -n badminton-journey --replicas=3

# 查看扩缩容历史
kubectl describe hpa backend-hpa -n badminton-journey
```

### 滚动更新

```bash
# 更新后端镜像
kubectl set image deployment/backend backend=badminton-journey-backend:v2.0.0 -n badminton-journey

# 查看更新状态
kubectl rollout status deployment/backend -n badminton-journey

# 回滚更新
kubectl rollout undo deployment/backend -n badminton-journey

# 查看更新历史
kubectl rollout history deployment/backend -n badminton-journey
```

## 🔍 故障排除

### 常见问题

#### 1. Pod无法启动

```bash
# 查看Pod详细信息
kubectl describe pod <pod-name> -n badminton-journey

# 查看Pod日志
kubectl logs <pod-name> -n badminton-journey --previous

# 常见原因：
# - 镜像拉取失败
# - 资源不足
# - 配置错误
# - 存储卷挂载失败
```

#### 2. 服务连接问题

```bash
# 测试服务连通性
kubectl exec -it deployment/backend -n badminton-journey -- curl mysql-service:3306
kubectl exec -it deployment/backend -n badminton-journey -- curl redis-service:6379

# 检查Service端点
kubectl get endpoints -n badminton-journey

# 检查网络策略
kubectl get networkpolicy -n badminton-journey
```

#### 3. 存储问题

```bash
# 查看PVC状态
kubectl get pvc -n badminton-journey

# 查看PV详细信息
kubectl describe pv

# 检查存储类
kubectl get storageclass
kubectl describe storageclass <storage-class-name>
```

#### 4. Ingress访问问题

```bash
# 查看Ingress状态
kubectl describe ingress -n badminton-journey

# 检查Ingress Controller
kubectl get pods -n ingress-nginx

# 测试服务直接访问
kubectl port-forward -n badminton-journey svc/frontend-service 8080:80
```

### 日志收集

```bash
# 收集所有组件日志
mkdir -p badminton-logs

# Backend日志
kubectl logs deployment/backend -n badminton-journey > badminton-logs/backend.log

# Frontend日志
kubectl logs deployment/frontend -n badminton-journey > badminton-logs/frontend.log

# MySQL日志
kubectl logs deployment/mysql -n badminton-journey > badminton-logs/mysql.log

# Redis日志
kubectl logs deployment/redis -n badminton-journey > badminton-logs/redis.log

# 系统事件
kubectl get events -n badminton-journey > badminton-logs/events.log
```

### 性能调优

```bash
# 调整JVM参数
kubectl patch deployment backend -n badminton-journey -p '
{
  "spec": {
    "template": {
      "spec": {
        "containers": [
          {
            "name": "backend",
            "env": [
              {
                "name": "JAVA_OPTS",
                "value": "-Xmx2048m -Xms1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
              }
            ]
          }
        ]
      }
    }
  }
}'

# 调整数据库连接池
kubectl patch configmap badminton-app-config -n badminton-journey -p '
{
  "data": {
    "DB_MAX_CONNECTIONS": "20",
    "DB_MIN_IDLE": "5"
  }
}'
```

## 🚀 高级配置

### 生产环境安全配置

```bash
# 1. 网络策略
kubectl apply -f k8s/networkpolicy.yaml

# 2. Pod安全策略
kubectl apply -f - <<EOF
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: badminton-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
EOF

# 3. 资源配额
kubectl apply -f k8s/namespace.yaml  # 包含ResourceQuota
```

### 多环境部署

```bash
# 开发环境
kubectl apply -f k8s/ --namespace=badminton-dev

# 测试环境
kubectl apply -f k8s/ --namespace=badminton-test

# 生产环境
kubectl apply -f k8s/ --namespace=badminton-prod
```

### 持续集成/部署

```yaml
# .github/workflows/k8s-deploy.yml
name: Deploy to Kubernetes
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build and push images
      run: |
        ./build-images.sh --registry ${{ secrets.REGISTRY }} --push
    
    - name: Deploy to K8s
      run: |
        echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        cd k8s && ./deploy.sh deploy --wait
```

## 📞 技术支持

### 常用命令参考

```bash
# 部署脚本命令
cd k8s
./deploy.sh deploy          # 部署应用
./deploy.sh status          # 查看状态
./deploy.sh logs backend    # 查看后端日志
./deploy.sh scale backend 3 # 扩容后端
./deploy.sh update backend badminton-journey-backend:v2.0.0  # 更新版本
./deploy.sh delete          # 删除应用

# 原生kubectl命令
kubectl get all -n badminton-journey
kubectl describe pod <pod-name> -n badminton-journey
kubectl logs -f deployment/backend -n badminton-journey
kubectl exec -it deployment/backend -n badminton-journey -- bash
kubectl port-forward -n badminton-journey svc/backend-service 8080:8080
```

### 联系支持

如需帮助，请：
1. 查看Pod和事件日志定位问题
2. 参考本文档的故障排除部分
3. 收集相关日志信息
4. 提交Issue到项目仓库

---

## 📄 附录

### 架构图

```
┌─────────────────┐    ┌─────────────────┐
│   Ingress       │    │   Frontend      │
│   Controller    │───▶│   (Nginx)       │
│                 │    │   Port: 80      │
└─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Backend       │
                       │   (Spring Boot) │
                       │   Port: 8080    │
                       └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
            ┌──────────┐ ┌──────────┐ ┌──────────┐
            │  MySQL   │ │  Redis   │ │   PVC    │
            │ Port:3306│ │ Port:6379│ │ Storage  │
            └──────────┘ └──────────┘ └──────────┘
```

### 文件结构

```
k8s/
├── namespace.yaml          # 命名空间和资源配额
├── configmap.yaml         # 应用配置
├── secrets.yaml           # 密钥配置
├── pvc.yaml              # 持久化卷声明
├── mysql.yaml            # MySQL数据库
├── redis.yaml            # Redis缓存
├── backend.yaml          # 后端服务
├── frontend.yaml         # 前端服务
├── ingress.yaml          # 路由配置
├── hpa.yaml              # 自动扩缩容
├── all-in-one.yaml       # 完整部署文件
└── deploy.sh             # 部署脚本
```

---
*羽球之旅团队 © 2023* 