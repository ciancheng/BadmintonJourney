# 羽球之旅 (Badminton Journey)

一个用于记录羽毛球比赛历程的全栈Web应用，支持记录比赛、对战和每局详情，帮助羽毛球爱好者追踪和分析自己的比赛表现。

## 功能特性

### 用户管理
- 用户注册（支持用户名/密码注册）
- 用户登录（JWT认证）
- 安全的会话管理

### 比赛管理
- 创建、查看、编辑和删除比赛记录
- 记录比赛基本信息：
  - 比赛名称、时间、城市、场地
  - 比赛结果（从小组未出线到冠军的多个级别）
  - 比赛照片上传
  - 教练评语和个人总结

### 对战管理
- 在每个比赛中添加多场对战
- 记录对战信息：
  - 比赛类型（小组赛、淘汰赛1-5）
  - 对手信息（姓名、城市）
  - 比赛比分和结果（胜/负）
  - 教练评语和个人总结

### 每局管理
- 记录每场对战的具体局数
- 记录每局信息：
  - 局数和比分
  - 比赛视频上传
  - 教练评语和个人总结

## 技术栈

### 后端
- Java 11
- Spring Boot 2.7.14
- Spring Security + JWT
- Spring Data JPA
- H2 Database（可轻松切换到MySQL）
- Maven

### 前端
- React 18
- Material-UI (MUI) 5
- React Router 6
- React Hook Form
- Axios
- Day.js

## 项目结构

```
badminton-journey/
├── backend/                    # 后端Spring Boot项目
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/badmintonjourney/
│   │   │   │   ├── config/     # 配置类
│   │   │   │   ├── controller/ # REST控制器
│   │   │   │   ├── dto/        # 数据传输对象
│   │   │   │   ├── entity/     # JPA实体
│   │   │   │   ├── repository/ # 数据访问层
│   │   │   │   ├── security/   # 安全相关
│   │   │   │   └── service/    # 业务逻辑层
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   └── pom.xml
├── frontend/                   # 前端React项目
│   ├── public/
│   ├── src/
│   │   ├── components/         # 可复用组件
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API服务
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 安装与运行

### 前置要求
- Java 11 或更高版本
- Node.js 14 或更高版本
- Maven 3.6 或更高版本

### 后端启动

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖并启动：
```bash
mvn clean install
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 前端启动

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm start
```

前端应用将在 http://localhost:3000 启动

## 使用说明

1. **注册账号**：首次使用需要注册一个新账号
2. **登录系统**：使用注册的账号登录
3. **添加比赛**：点击主页右下角的"+"按钮添加新比赛
4. **查看比赛详情**：点击比赛卡片查看详情，可以：
   - 编辑比赛信息
   - 上传比赛照片
   - 添加对战记录
5. **管理对战**：在比赛详情页添加和管理对战记录
6. **记录每局**：点击对战进入详情页，记录每局比赛情况和上传视频

## API端点

### 认证相关
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录

### 比赛相关
- GET `/api/competitions` - 获取比赛列表
- POST `/api/competitions` - 创建比赛
- GET `/api/competitions/{id}` - 获取比赛详情
- PUT `/api/competitions/{id}` - 更新比赛
- DELETE `/api/competitions/{id}` - 删除比赛
- POST `/api/competitions/{id}/photos` - 上传照片

### 对战相关
- GET `/api/matches/competition/{competitionId}` - 获取比赛的对战列表
- POST `/api/matches` - 创建对战
- GET `/api/matches/{id}` - 获取对战详情
- PUT `/api/matches/{id}` - 更新对战
- DELETE `/api/matches/{id}` - 删除对战

### 每局相关
- GET `/api/games/match/{matchId}` - 获取对战的每局列表
- POST `/api/games` - 创建局
- GET `/api/games/{id}` - 获取局详情
- PUT `/api/games/{id}` - 更新局
- DELETE `/api/games/{id}` - 删除局
- POST `/api/games/{id}/video` - 上传视频

## 配置说明

### 数据库配置
默认使用H2嵌入式数据库，数据存储在 `./data/badminton.mv.db`。如需切换到MySQL：

1. 修改 `backend/src/main/resources/application.yml`：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/badminton_journey
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: your_username
    password: your_password
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL5InnoDBDialect
```

2. 在 `pom.xml` 中确保已包含MySQL依赖

### 文件存储
- 照片存储在 `./uploads/photos/`
- 视频存储在 `./uploads/videos/`
- 支持的图片格式：jpg, jpeg, png, gif
- 支持的视频格式：mp4, avi, mov

## 移动端适配

应用已完全适配移动设备，提供良好的触屏体验和响应式布局。

## 安全性

- 使用JWT进行身份认证
- 密码使用BCrypt加密存储
- 所有API端点都需要认证（除了登录和注册）
- 用户只能访问和修改自己的数据

## 后续优化建议

1. 添加数据统计功能（胜率、比分分析等）
2. 支持批量上传照片和视频
3. 添加社交功能（分享比赛记录）
4. 优化大文件上传（断点续传）
5. 添加数据导出功能
6. 集成云存储服务（如阿里云OSS）

## License

MIT