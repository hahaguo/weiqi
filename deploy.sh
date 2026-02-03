# 生产环境部署脚本
#!/bin/bash

set -e

echo "🚀 开始部署围棋教学游戏..."

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安装，请先安装 Docker Compose${NC}"
    exit 1
fi

echo -e "${BLUE}📦 构建 Docker 镜像...${NC}"
docker-compose build

echo -e "${BLUE}🛑 停止旧容器...${NC}"
docker-compose down

echo -e "${BLUE}🚀 启动新容器...${NC}"
docker-compose up -d

echo -e "${BLUE}⏳ 等待服务启动...${NC}"
sleep 5

# 检查容器是否运行
if docker ps | grep -q weiqi-teaching-game; then
    echo -e "${GREEN}✅ 部署成功！${NC}"
    echo -e "${GREEN}🌐 访问地址: http://localhost:8080${NC}"
    echo -e "${BLUE}📊 查看日志: docker-compose logs -f${NC}"
    echo -e "${BLUE}🔍 健康检查: curl http://localhost:8080/health${NC}"
else
    echo -e "${RED}❌ 部署失败，请查看日志${NC}"
    docker-compose logs
    exit 1
fi
