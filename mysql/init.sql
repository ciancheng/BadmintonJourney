-- 羽球之旅数据库初始化脚本
-- 创建数据库和配置字符集

CREATE DATABASE IF NOT EXISTS badminton_journey 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE badminton_journey;

-- 创建用户（如果不存在）
CREATE USER IF NOT EXISTS 'badminton'@'%' IDENTIFIED BY 'badminton123';

-- 授权
GRANT ALL PRIVILEGES ON badminton_journey.* TO 'badminton'@'%';
GRANT ALL PRIVILEGES ON badminton_journey.* TO 'badminton'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 设置时区
SET GLOBAL time_zone = '+8:00';

-- 显示初始化信息
SELECT 'BadmintonJourney database initialized successfully!' as message; 