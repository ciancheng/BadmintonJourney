# 羽球之旅 - 快速启动指南

## 🚀 快速启动

### 1. 启动后端服务
```bash
cd backend
./start.sh
```

### 2. 启动前端服务（新开一个终端）
```bash
cd frontend
./start.sh
```

### 3. 访问应用
- 前端界面：http://localhost:3000
- 后端API：http://localhost:8080/api
- H2数据库控制台：http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:file:./data/badminton`
  - 用户名: `sa`
  - 密码: （留空）

## 📦 打包部署

### 打包后端
```bash
cd backend
./build.sh
```
生成的JAR文件在 `backend/target/` 目录下

### 打包前端
```bash
cd frontend
./build.sh
```
生成的静态文件在 `frontend/build/` 目录下

## 🛠 脚本说明

### 后端脚本
- `backend/start.sh` - 开发环境启动脚本
  - 自动检查Java和Maven环境
  - 检查端口占用
  - 编译并启动Spring Boot应用

- `backend/build.sh` - 生产环境打包脚本
  - 运行单元测试
  - 生成可部署的JAR文件

### 前端脚本
- `frontend/start.sh` - 开发环境启动脚本
  - 自动检查Node.js环境
  - 自动安装依赖
  - 检查后端服务状态
  - 启动React开发服务器

- `frontend/build.sh` - 生产环境打包脚本
  - 生成优化后的生产版本
  - 提供多种部署方案说明

## 🔧 常见问题

### 1. Maven未安装
```bash
# macOS
brew install maven

# Ubuntu/Debian
sudo apt install maven

# 或从官网下载
https://maven.apache.org/download.cgi
```

### 2. Node.js未安装
```bash
# macOS
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 或从官网下载
https://nodejs.org/
```

### 3. 端口被占用
脚本会自动检测并提示是否终止占用进程，或手动处理：
```bash
# 查看端口占用
lsof -i :8080  # 后端
lsof -i :3000  # 前端

# 终止进程
kill -9 <PID>
```

### 4. 修改API地址（生产环境）
```bash
# 构建时指定API地址
cd frontend
REACT_APP_API_BASE_URL=https://api.yourdomain.com ./build.sh
```

## 📝 开发提示

1. **热重载**：前端和后端都支持热重载，修改代码后会自动刷新
2. **数据持久化**：H2数据库文件保存在 `backend/data/` 目录
3. **文件上传**：上传的文件保存在 `backend/uploads/` 目录
4. **日志文件**：日志保存在 `backend/logs/` 目录

## 🎯 下一步

1. 查看完整文档：[README.md](README.md)
2. 了解API接口：访问 http://localhost:8080/swagger-ui.html （需要配置Swagger）
3. 开始开发：查看源代码，根据需求进行修改 