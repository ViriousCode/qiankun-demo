#!/bin/bash
set -e
echo "=== 主框架部署脚本 ==="
# 设置变量
REMOTE_USER="azura"
REMOTE_IP="192.168.1.88"
# 将两者组合成完整的连接目标
REMOTE_HOST="$REMOTE_USER@$REMOTE_IP"
# 检查并配置免密登录
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 "$REMOTE_HOST" "exit" &>/dev/null; then
    SSH_KEY_PATH="$HOME/.ssh/id_ed25519"  # 默认的 ed25519 私钥路径
    # 如果免密登录未配置，生成 ed25519 密钥对并上传公钥
    [ ! -f "$SSH_KEY_PATH" ] && ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -N "" &>/dev/null
    ssh-copy-id -i "$SSH_KEY_PATH.pub" "$REMOTE_HOST" &>/dev/null || { echo "公钥复制失败"; exit 1; }
fi

# 检查本地文件是否存在
echo "检查本地文件..."
LOCAL_FILES=("azura-framework.amd64.tar.gz" "nginx.conf" "docker-compose.yml")
for file in "${LOCAL_FILES[@]}"; do
    [ ! -f "$file" ] && { echo "❌ 错误: 文件不存在: $file"; exit 1; }
    echo "✅ 找到文件: $file"
done

# 上传文件
REMOTE_PATH="/home/azura/data/app/framework"
echo "上传文件到 $REMOTE_HOST:$REMOTE_PATH"
for file in "${LOCAL_FILES[@]}"; do
    scp "$file" "$REMOTE_HOST:$REMOTE_PATH" && echo "✅ $file 上传成功" || { echo "❌ $file 上传失败"; exit 1; }
done

# 远程执行 Docker 操作
echo "开始远程执行 Docker 操作..."
ssh "$REMOTE_HOST" << 'EOF'
    cd /home/azura/data/app/framework
    # 检查文件是否存在
    [ ! -f "azura-framework.amd64.tar.gz" ] && { echo "❌ 错误: azura-framework.amd64.tar.gz 文件不存在"; exit 1; }
    [ ! -f "docker-compose.yml" ] && { echo "❌ 错误: docker-compose.yml 文件不存在"; exit 1; }
    [ ! -f "nginx.conf" ] && { echo "❌ 错误: nginx.conf 文件不存在"; exit 1; }

    # 加载 Docker 镜像
    echo "加载 Docker 镜像..."
    docker load -i azura-framework.amd64.tar.gz && echo "✅ Docker 镜像加载成功" || { echo "❌ Docker 镜像加载失败"; exit 1; }

    # 停止现有容器并启动新容器
    echo "管理 Docker 容器..."
    docker compose down || true
    docker compose up -d --build&& echo "✅ Docker 容器启动成功" || { echo "❌ Docker 容器启动失败"; exit 1; }
EOF

echo "🎉 部署完成！应用已成功部署到 $REMOTE_HOST"
