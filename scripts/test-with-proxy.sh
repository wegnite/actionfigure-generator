#!/bin/bash

# Google OAuth 代理连通性测试脚本
# 使用方法: ./scripts/test-with-proxy.sh proxy.company.com:8080

if [ -z "$1" ]; then
    echo "使用方法: $0 <proxy:port>"
    echo "示例: $0 proxy.company.com:8080"
    exit 1
fi

PROXY=$1

echo "🔧 使用代理测试 Google OAuth 连通性"
echo "代理服务器: $PROXY"
echo "================================"

# 测试 Google OAuth 端点
endpoints=(
    "https://accounts.google.com/o/oauth2/v2/auth"
    "https://oauth2.googleapis.com/token"
    "https://openidconnect.googleapis.com/v1/userinfo"
)

for endpoint in "${endpoints[@]}"; do
    echo "测试: $endpoint"
    
    # 使用 curl 测试代理连接
    if curl --proxy "$PROXY" --connect-timeout 10 --max-time 15 -s -I "$endpoint" > /dev/null 2>&1; then
        echo "✅ 成功连接"
    else
        echo "❌ 连接失败"
    fi
    echo ""
done

echo "💡 如果测试成功，请将代理配置添加到 .env.local："
echo "HTTP_PROXY=http://$PROXY"
echo "HTTPS_PROXY=http://$PROXY"