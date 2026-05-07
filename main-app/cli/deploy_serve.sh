#!/bin/bash
set -e

echo "=== serve(Node) 部署脚本 ==="

platform=${1-"amd64"}
REMOTE_USER=${REMOTE_USER-"azura"}
REMOTE_IP=${REMOTE_IP-"192.168.1.88"}
REMOTE_HOST="$REMOTE_USER@$REMOTE_IP"
REMOTE_PATH=${REMOTE_PATH-"/home/azura/data/service/framework"}

TAR_FILE="azura-framework-serve.${platform}.tar.gz"

# 检查并配置免密登录
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 "$REMOTE_HOST" "exit" &>/dev/null; then
  SSH_KEY_PATH="$HOME/.ssh/id_ed25519"
  [ ! -f "$SSH_KEY_PATH" ] && ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -N "" &>/dev/null
  ssh-copy-id -i "$SSH_KEY_PATH.pub" "$REMOTE_HOST" &>/dev/null || { echo "公钥复制失败"; exit 1; }
fi

echo "检查本地文件..."
LOCAL_FILES=("$TAR_FILE" "serve/docker-compose.yml")
for file in "${LOCAL_FILES[@]}"; do
  [ ! -f "$file" ] && { echo "❌ 错误: 文件不存在: $file"; exit 1; }
  echo "✅ 找到文件: $file"
done

echo "确保远程目录存在: $REMOTE_HOST:$REMOTE_PATH"
ssh "$REMOTE_HOST" "mkdir -p \"$REMOTE_PATH\""

echo "上传文件到 $REMOTE_HOST:$REMOTE_PATH"
scp "$TAR_FILE" "$REMOTE_HOST:$REMOTE_PATH/" && echo "✅ $TAR_FILE 上传成功" || { echo "❌ $TAR_FILE 上传失败"; exit 1; }
scp "serve/docker-compose.yml" "$REMOTE_HOST:$REMOTE_PATH/docker-compose.yml" && echo "✅ docker-compose.yml 上传成功" || { echo "❌ docker-compose.yml 上传失败"; exit 1; }

echo "开始远程执行 Docker 操作..."
ssh "$REMOTE_HOST" << EOF
  set -e
  cd "$REMOTE_PATH"
  mkdir -p uploads

  # 确保与主框架一致的外部网络存在（仅首次需要）
  docker network inspect azura_services_azura-network >/dev/null 2>&1 || docker network create azura_services_azura-network

  echo "加载 Docker 镜像..."
  docker load -i "$TAR_FILE" && echo "✅ Docker 镜像加载成功" || { echo "❌ Docker 镜像加载失败"; exit 1; }

  echo "管理 Docker 容器..."
  docker compose down || true
  docker compose up -d && echo "✅ Docker 容器启动成功" || { echo "❌ Docker 容器启动失败"; exit 1; }
EOF

echo "🎉 部署完成！serve 已成功部署到 $REMOTE_HOST"

