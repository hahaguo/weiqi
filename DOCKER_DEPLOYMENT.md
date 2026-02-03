# Docker 部署指南

## 📦 文件说明

- **Dockerfile** - 多阶段构建配置，生成优化的生产镜像
- **.dockerignore** - 忽略不必要的文件，减小镜像体积
- **nginx.conf** - Nginx 配置，包含性能优化和安全设置
- **docker-compose.yml** - Docker Compose 配置，简化部署流程

## 🚀 快速开始

### 方式一：使用 Docker Compose（推荐）

```bash
# 构建并启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

访问地址：http://localhost:8080

### 方式二：使用 Docker 命令

```bash
# 构建镜像
docker build -t weiqi-teaching-game:latest .

# 运行容器
docker run -d \
  --name weiqi-game \
  -p 8080:80 \
  --restart unless-stopped \
  weiqi-teaching-game:latest

# 查看容器状态
docker ps

# 查看日志
docker logs -f weiqi-game

# 停止容器
docker stop weiqi-game

# 删除容器
docker rm weiqi-game
```

## 🏗️ 镜像构建详解

### 多阶段构建优势

1. **构建阶段**（node:18-alpine）
   - 安装依赖
   - 编译打包代码
   - 生成生产版本

2. **运行阶段**（nginx:1.25-alpine）
   - 只包含静态文件
   - 使用 Nginx 提供服务
   - 镜像体积小（约 25MB）

### 构建参数

```bash
# 指定构建平台（适用于 M1/M2 Mac）
docker build --platform linux/amd64 -t weiqi-teaching-game:latest .

# 使用构建缓存
docker build --cache-from weiqi-teaching-game:latest -t weiqi-teaching-game:latest .

# 不使用缓存
docker build --no-cache -t weiqi-teaching-game:latest .
```

## ⚙️ Nginx 配置特性

### 性能优化
- ✅ Gzip 压缩（文本文件、JS、CSS）
- ✅ 静态资源缓存（1年）
- ✅ HTML 文件禁用缓存
- ✅ 访问日志优化

### 安全加固
- ✅ X-Frame-Options（防止点击劫持）
- ✅ X-Content-Type-Options（防止 MIME 嗅探）
- ✅ X-XSS-Protection（XSS 防护）
- ✅ Referrer-Policy（引用策略）
- ✅ 禁止访问隐藏文件

### SPA 支持
- ✅ 所有路由请求返回 index.html
- ✅ 支持前端路由

### 健康检查
- ✅ `/health` 端点用于监控
- ✅ Docker 内置健康检查

## 🌐 生产环境部署

### 1. 使用自定义端口

```yaml
# docker-compose.yml
services:
  weiqi-game:
    ports:
      - "80:80"  # 或其他端口
```

### 2. 反向代理配置（Nginx/Caddy）

**Nginx 反向代理示例：**

```nginx
server {
    listen 80;
    server_name weiqi.example.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. HTTPS 配置（Let's Encrypt）

```bash
# 使用 Certbot 获取证书
certbot --nginx -d weiqi.example.com
```

### 4. 环境变量配置

```yaml
# docker-compose.yml
environment:
  - NODE_ENV=production
  - API_URL=https://api.example.com
```

## 📊 监控和日志

### 查看容器日志

```bash
# 实时日志
docker-compose logs -f weiqi-game

# 最近 100 行日志
docker logs --tail 100 weiqi-game

# 带时间戳的日志
docker logs -t weiqi-game
```

### 健康检查

```bash
# 检查容器健康状态
docker inspect --format='{{.State.Health.Status}}' weiqi-game

# 访问健康检查端点
curl http://localhost:8080/health
```

### 资源监控

```bash
# 查看容器资源使用
docker stats weiqi-game

# 查看容器详细信息
docker inspect weiqi-game
```

## 🔧 维护和更新

### 更新应用

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建并部署
docker-compose up -d --build

# 3. 清理旧镜像
docker image prune -f
```

### 备份和恢复

```bash
# 导出镜像
docker save weiqi-teaching-game:latest | gzip > weiqi-game-backup.tar.gz

# 导入镜像
docker load < weiqi-game-backup.tar.gz
```

### 清理资源

```bash
# 停止并删除容器
docker-compose down

# 删除所有未使用的镜像
docker image prune -a

# 清理所有未使用的资源
docker system prune -a --volumes
```

## 🐛 故障排查

### 容器无法启动

```bash
# 查看容器日志
docker logs weiqi-game

# 查看容器详细信息
docker inspect weiqi-game

# 进入容器调试
docker exec -it weiqi-game sh
```

### 端口被占用

```bash
# 查看端口占用
lsof -i :8080

# 使用其他端口
docker run -p 8081:80 weiqi-teaching-game:latest
```

### 构建失败

```bash
# 清理构建缓存
docker builder prune

# 重新构建（不使用缓存）
docker build --no-cache -t weiqi-teaching-game:latest .
```

## 📈 性能优化建议

### 1. 启用 HTTP/2

在反向代理层启用 HTTP/2：

```nginx
server {
    listen 443 ssl http2;
    # ...
}
```

### 2. CDN 加速

将静态资源部署到 CDN：
- 图片、字体文件
- JS、CSS 文件

### 3. 资源限制

限制容器资源使用：

```yaml
# docker-compose.yml
services:
  weiqi-game:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
```

## 📝 最佳实践

1. ✅ 使用多阶段构建减小镜像体积
2. ✅ 使用 .dockerignore 排除不必要的文件
3. ✅ 设置健康检查确保服务可用性
4. ✅ 使用 Alpine 基础镜像减小体积
5. ✅ 配置自动重启策略
6. ✅ 定期更新基础镜像和依赖
7. ✅ 使用 Docker Compose 简化部署
8. ✅ 配置日志轮转防止磁盘占满

## 🔒 安全建议

1. 🔐 不在镜像中包含敏感信息
2. 🔐 使用非 root 用户运行容器
3. 🔐 定期更新镜像和依赖
4. 🔐 限制容器权限
5. 🔐 使用 HTTPS
6. 🔐 配置防火墙规则

## 📞 技术支持

遇到问题？
- 查看日志：`docker logs weiqi-game`
- 检查健康状态：`docker ps`
- 访问健康端点：http://localhost:8080/health

---

**镜像信息：**
- 基础镜像：nginx:1.25-alpine
- 最终大小：约 25MB
- 支持平台：linux/amd64, linux/arm64
