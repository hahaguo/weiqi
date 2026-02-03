# GitHub Actions 工作流配置指南

本项目包含三个 GitHub Actions 工作流，实现自动化的 CI/CD 流程。

## 📋 工作流说明

### 1. CI Tests (ci.yml)
**触发条件：** 推送到 main/develop 分支，或创建 PR

**功能：**
- ✅ 多 Node.js 版本测试（18.x, 20.x）
- ✅ 依赖安装和缓存
- ✅ 代码检查（ESLint）
- ✅ 单元测试
- ✅ 构建验证
- ✅ Docker 镜像构建测试
- ✅ Docker 容器运行测试

### 2. Docker Build and Push (docker-build.yml)
**触发条件：** 推送到 main/develop 分支，创建标签，或创建 PR

**功能：**
- 🐳 多平台构建（amd64, arm64）
- 🐳 推送到 GitHub Container Registry (ghcr.io)
- 🐳 推送到 Docker Hub
- 🔒 Trivy 安全扫描
- 📦 智能标签管理
- 💾 构建缓存优化

**镜像标签策略：**
- `main` 分支 → `latest` 标签
- `develop` 分支 → `develop` 标签
- `v1.2.3` 标签 → `1.2.3`, `1.2`, `1`, `v1.2.3`
- 提交 SHA → `main-abc1234`

### 3. Deploy to Production (docker-deploy.yml)
**触发条件：** 创建版本标签（v*.*.*）或手动触发

**功能：**
- 🚀 SSH 远程部署
- 🔄 自动拉取代码和镜像
- ⚡ 零停机更新
- ✅ 健康检查
- 🧹 自动清理旧镜像
- 📢 Slack 通知（可选）

## 🔧 配置步骤

### 1. 配置 Docker Hub（可选）

如果要推送到 Docker Hub，需要配置 Secrets：

1. 进入仓库 **Settings** → **Secrets and variables** → **Actions**
2. 添加以下 Secrets：
   - `DOCKERHUB_USERNAME`: Docker Hub 用户名
   - `DOCKERHUB_TOKEN`: Docker Hub 访问令牌

创建 Docker Hub Token：
```bash
# 登录 https://hub.docker.com/settings/security
# 创建 New Access Token
# 复制 Token 并添加到 GitHub Secrets
```

### 2. 配置生产部署（可选）

如果需要自动部署到服务器，添加以下 Secrets：

| Secret 名称 | 说明 | 必需 |
|------------|------|------|
| `SERVER_HOST` | 服务器 IP 或域名 | ✅ |
| `SERVER_USER` | SSH 用户名 | ✅ |
| `SERVER_SSH_KEY` | SSH 私钥 | ✅ |
| `SERVER_PORT` | SSH 端口（默认 22） | ❌ |
| `DEPLOY_PATH` | 部署路径（默认 /opt/weiqi） | ❌ |
| `SLACK_WEBHOOK` | Slack Webhook URL | ❌ |

生成 SSH 密钥：
```bash
# 在本地生成 SSH 密钥对
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/github_actions.pub user@server

# 将私钥内容添加到 GitHub Secrets
cat ~/.ssh/github_actions
```

### 3. 配置环境变量（可选）

在 **Settings** → **Environments** 中创建环境：
- `production`
- `staging`

为每个环境设置：
- `DEPLOYMENT_URL`: 部署后的访问地址

## 🚀 使用方式

### 自动触发

**推送代码到 main 分支：**
```bash
git add .
git commit -m "feat: 添加新功能"
git push origin main
```
→ 触发 CI 测试 + Docker 构建推送

**创建版本标签：**
```bash
git tag v1.0.0
git push origin v1.0.0
```
→ 触发 CI 测试 + Docker 构建推送 + 生产部署

**创建 Pull Request：**
→ 触发 CI 测试 + Docker 构建测试（不推送）

### 手动触发

进入 **Actions** 标签页：
1. 选择 **Deploy to Production** 工作流
2. 点击 **Run workflow**
3. 选择环境（production/staging）
4. 点击 **Run workflow** 确认

## 📦 镜像拉取

### GitHub Container Registry（推荐）
```bash
# 拉取最新版本
docker pull ghcr.io/hahaguo/weiqi:latest

# 拉取特定版本
docker pull ghcr.io/hahaguo/weiqi:v1.0.0

# 运行容器
docker run -d -p 8080:80 ghcr.io/hahaguo/weiqi:latest
```

### Docker Hub
```bash
# 拉取最新版本
docker pull <your-dockerhub-username>/weiqi-teaching-game:latest

# 运行容器
docker run -d -p 8080:80 <your-dockerhub-username>/weiqi-teaching-game:latest
```

## 🔍 查看工作流状态

### GitHub 界面
- **Actions** 标签页查看所有工作流运行记录
- 每个工作流显示详细日志和步骤状态
- 失败时会发送邮件通知

### 徽章（可选）

在 README.md 中添加：
```markdown
[![CI Tests](https://github.com/hahaguo/weiqi/actions/workflows/ci.yml/badge.svg)](https://github.com/hahaguo/weiqi/actions/workflows/ci.yml)
[![Docker Build](https://github.com/hahaguo/weiqi/actions/workflows/docker-build.yml/badge.svg)](https://github.com/hahaguo/weiqi/actions/workflows/docker-build.yml)
```

## 🛠️ 工作流优化

### 构建缓存
- ✅ GitHub Actions 缓存（`cache-from/cache-to: type=gha`）
- ✅ npm 依赖缓存（`actions/setup-node@v4` 的 `cache: 'npm'`）

### 多平台构建
- ✅ 同时构建 amd64 和 arm64 镜像
- ✅ 支持 Intel/AMD 和 ARM（M1/M2）芯片

### 安全扫描
- ✅ Trivy 漏洞扫描
- ✅ 扫描结果上传到 GitHub Security

## 🔒 安全最佳实践

1. **使用 GitHub Token**
   - GITHUB_TOKEN 自动提供，无需手动配置
   - 权限范围限制在当前仓库

2. **SSH 密钥管理**
   - 使用专用的 SSH 密钥对
   - 在服务器上限制密钥权限

3. **Secrets 保护**
   - 所有敏感信息存储在 Secrets 中
   - Secrets 不会出现在日志中

4. **镜像扫描**
   - 每次构建自动扫描漏洞
   - 发现高危漏洞会在 Security 标签页显示

## 📊 工作流示例

### 完整发布流程
```bash
# 1. 开发新功能
git checkout -b feature/new-feature
# ... 开发代码 ...
git add .
git commit -m "feat: 实现新功能"
git push origin feature/new-feature

# 2. 创建 PR（触发 CI 测试）
# GitHub 网页创建 PR

# 3. PR 合并到 main（触发 CI + Docker 构建）
# GitHub 网页合并 PR

# 4. 创建版本标签（触发生产部署）
git checkout main
git pull
git tag v1.0.0
git push origin v1.0.0

# 5. 自动部署到生产环境
# 查看 Actions 标签页确认部署状态
```

## 🐛 故障排查

### 构建失败
```bash
# 本地复现构建过程
docker build -t test .

# 查看详细日志
docker build --progress=plain -t test .
```

### 部署失败
```bash
# SSH 连接测试
ssh -i ~/.ssh/github_actions user@server

# 手动拉取镜像
docker pull ghcr.io/hahaguo/weiqi:latest

# 查看服务器日志
docker-compose logs -f
```

### 权限问题
- 确保 GITHUB_TOKEN 有 `packages: write` 权限
- 确保 SSH 密钥有服务器访问权限
- 确保 Docker Hub Token 有推送权限

## 📞 技术支持

遇到问题？
- 查看 **Actions** 标签页的详细日志
- 检查 **Security** 标签页的漏洞扫描结果
- 查看服务器上的 Docker 日志：`docker-compose logs`

---

**工作流版本：** 1.0.0
**最后更新：** 2026-02-03
