#!/bin/bash

# Set Telegram webhook for Vercel deployment
# Usage: ./scripts/set-webhook-vercel.sh

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check if BOT_TOKEN is set
if [ -z "$BOT_TOKEN" ]; then
  echo "❌ Error: BOT_TOKEN not set"
  echo "Set it in .env file or export BOT_TOKEN=your_token"
  exit 1
fi

VERCEL_URL="https://tokobot-five.vercel.app"
WEBHOOK_URL="$VERCEL_URL/api/webhook"

echo "🔧 Setting Telegram webhook..."
echo "📍 URL: $WEBHOOK_URL"
echo ""

RESPONSE=$(curl -s -X POST \
  "https://api.telegram.org/bot$BOT_TOKEN/setWebhook?url=$WEBHOOK_URL")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Check webhook info
echo ""
echo "📊 Current webhook info:"
curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo" | jq '.'

