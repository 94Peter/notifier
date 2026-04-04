#!/bin/bash
# 1. 向 Infisical 請求金鑰列表 (以給定的 /Notifier 為路徑)
# 2. 為每個金鑰執行 wrangler secret put
SECRETS_PATH="/Notifier"

echo "🚀 Starting secrets sync from Infisical ($SECRETS_PATH) to Cloudflare Workers..."

infisical export --path $SECRETS_PATH --format dotenv | grep -v '^#' | while read line; do
  if [ ! -z "$line" ]; then
    key=$(echo $line | cut -d '=' -f 1)
    value=$(echo $line | cut -d '=' -f 2-)
    echo "🔒 Updating secret: $key..."
    echo "$value" | wrangler secret put "$key"
  fi
done

echo "✅ All secrets synced successfully!"
