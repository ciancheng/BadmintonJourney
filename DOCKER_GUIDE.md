# 羽球之旅 Docker 部署指南

本指南介绍如何使用Docker容器化部署羽球之旅应用。

## 📋 目录

- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [自定义配置](#自定义配置)
- [故障排除](#故障排除)
- [维护操作](#维护操作)

## 🔧 系统要求

- Docker 20.10+
- Docker Compose 2.0+
- 可用内存：最少2GB，推荐4GB+
- 可用磁盘：最少5GB

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd BadmintonJourney
```

### 2. 构建镜像
```bash
# 给构建脚本添加执行权限
chmod +x build-images.sh

# 构建开发环境镜像
./build-images.sh

# 或构建生产环境镜像
./build-images.sh prod
```

### 3. 启动应用
```bash
# 使用生成的启动脚本
./start-docker.sh

# 或手动启动
docker-compose up -d
```

### 4. 访问应用
- 前端：http://localhost
- 后端API：http://localhost:8080
- H2控制台（开发环境）：http://localhost:8080/h2-console

## 🛠 开发环境部署

开发环境使用H2内存数据库，适合快速开发和测试。

### 构建和启动
```bash
# 构建开发环境镜像
./build-images.sh dev

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 服务配置
- **后端**：端口8080，使用H2数据库
- **前端**：端口80，Nginx代理
- **数据存储**：./data目录
- **文件上传**：./uploads目录

## 🏭 生产环境部署

生产环境使用MySQL数据库，具有更好的性能和可靠性。

### 1. 环境配置
```bash
# 复制环境变量配置文件
cp docker.env.example .env

# 编辑配置文件，修改数据库密码等敏感信息
vim .env
```

### 2. 构建和启动
```bash
# 构建生产环境镜像
./build-images.sh prod

# 启动服务（使用生产环境配置）
docker-compose -f docker-compose.prod.yml up -d

# 查看启动状态
docker-compose -f docker-compose.prod.yml ps
```

### 3. 初始化数据库
数据库会自动初始化，您也可以手动连接检查：
```bash
# 连接MySQL
docker exec -it badminton-mysql mysql -u badminton -p badminton_journey
```

## ⚙️ 自定义配置

### 构建选项
```bash
# 不使用缓存构建
./build-images.sh --no-cache

# 自定义镜像标签
./build-images.sh --tag v2.0.0

# 推送到镜像仓库
./build-images.sh --registry registry.example.com --push prod
```

### 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DB_ROOT_PASSWORD` | MySQL root密码 | BadmintonJourney2023! |
| `DB_USER` | 数据库用户名 | badminton |
| `DB_PASSWORD` | 数据库密码 | badminton123 |
| `JWT_SECRET` | JWT密钥 | 自动生成 |
| `ALLOWED_ORIGINS` | 允许的跨域来源 | http://localhost |

### 端口映射
```yaml
# 开发环境
ports:
  - "80:80"     # 前端
  - "8080:8080" # 后端

# 生产环境额外端口
ports:
  - "443:443"   # HTTPS
  - "3306:3306" # MySQL
  - "6379:6379" # Redis
```

## 🔍 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 查看端口占用
lsof -i :80
lsof -i :8080

# 停止相关服务
docker-compose down
```

#### 2. 数据库连接失败
```bash
# 检查MySQL容器状态
docker-compose logs mysql

# 重启数据库服务
docker-compose restart mysql
```

#### 3. 镜像构建失败
```bash
# 清理Docker缓存
docker system prune -f

# 重新构建（不使用缓存）
./build-images.sh --no-cache
```

#### 4. 文件上传失败
```bash
# 检查uploads目录权限
ls -la uploads/
chmod 755 uploads/

# 检查磁盘空间
df -h
```

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend

# 实时查看日志
docker-compose logs -f --tail=100
```

### 性能监控
```bash
# 查看容器资源使用
docker stats

# 查看容器详细信息
docker-compose ps
docker inspect badminton-backend
```

## 🛠 维护操作

### 备份数据
```bash
# 备份H2数据库（开发环境）
cp -r data/ backup/data-$(date +%Y%m%d)

# 备份MySQL数据库（生产环境）
docker exec badminton-mysql mysqldump -u badminton -p badminton_journey > backup/db-$(date +%Y%m%d).sql

# 备份上传文件
tar -czf backup/uploads-$(date +%Y%m%d).tar.gz uploads/
```

### 更新应用
```bash
# 拉取最新代码
git pull

# 重新构建镜像
./build-images.sh prod

# 滚动更新
docker-compose -f docker-compose.prod.yml up -d
```

### 清理资源
```bash
# 清理未使用的镜像
docker image prune -f

# 清理未使用的容器
docker container prune -f

# 清理未使用的卷
docker volume prune -f

# 完全清理（谨慎使用）
docker system prune -a -f
```

### 扩展服务
```bash
# 增加后端副本数量
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# 使用负载均衡器（需要额外配置）
# 可以配置Nginx作为负载均衡器
```

## 📝 最佳实践

1. **安全**：
   - 定期更新密码和JWT密钥
   - 使用HTTPS（生产环境）
   - 限制数据库访问权限

2. **性能**：
   - 定期清理日志文件
   - 监控磁盘使用情况
   - 配置适当的JVM内存设置

3. **备份**：
   - 定期备份数据库和文件
   - 测试恢复流程
   - 使用版本控制管理配置

4. **监控**：
   - 设置健康检查
   - 监控服务状态
   - 配置日志收集

## 📞 支持

如有问题，请：
1. 查看日志文件定位问题
2. 检查本文档的故障排除部分
3. 提交Issue到项目仓库

---
*羽球之旅团队 © 2023* 