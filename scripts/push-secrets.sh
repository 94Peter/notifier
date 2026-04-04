#!/bin/bash
# 1. 向 Infisical 請求金鑰列表 (以給定的 /Notifier 為路徑)
# 2. 為每個金鑰執行 wrangler secret put
SECRETS_PATH="/Notifier"

echo "🔍 Fetching SECRETS from Infisical (Environment: Production, Path: $SECRETS_PATH)..."

infisical export --path $SECRETS_PATH --format dotenv -e prod | grep -v '^#' | while read line; do
  if [ ! -z "$line" ]; then
    key=$(echo $line | cut -d '=' -f 1)
    value=$(echo $line | cut -d '=' -f 2-)
    # 移除頭尾可能存在的雙引號 (Infisical export 有時會帶引號)
    value=$(echo "$value" | sed 's/^"//;s/"$//')
    
    echo "🔒 Updating secret: $key..."
    echo "$value" | wrangler secret put "$key"
  fi
done

echo "✅ All secrets synced successfully!"
