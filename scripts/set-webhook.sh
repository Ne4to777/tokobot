#!/bin/bash

# Script to set Telegram webhook for Vercel deployment

echo "🤖 Telegram Bot Webhook Setup"
echo "=============================="
echo ""

# Check if BOT_TOKEN is provided
if [ -z "$1" ]; then
    echo "❌ Error: BOT_TOKEN not provided"
    echo ""
    echo "Usage: ./scripts/set-webhook.sh <BOT_TOKEN> <VERCEL_URL>"
    echo ""
    echo "Example:"
    echo "  ./scripts/set-webhook.sh 123456:ABC-DEF your-project.vercel.app"
    exit 1
fi

# Check if VERCEL_URL is provided
if [ -z "$2" ]; then
    echo "❌ Error: VERCEL_URL not provided"
    echo ""
    echo "Usage: ./scripts/set-webhook.sh <BOT_TOKEN> <VERCEL_URL>"
    echo ""
    echo "Example:"
    echo "  ./scripts/set-webhook.sh 123456:ABC-DEF your-project.vercel.app"
    exit 1
fi

BOT_TOKEN=$1
VERCEL_URL=$2

# Remove https:// if present
VERCEL_URL=${VERCEL_URL#https://}
VERCEL_URL=${VERCEL_URL#http://}

WEBHOOK_URL="https://${VERCEL_URL}/api/webhook"

echo "Setting webhook to: $WEBHOOK_URL"
echo ""

# Set the webhook
RESPONSE=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}")

# Check if successful
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook set successfully!"
    echo ""
    echo "Webhook info:"
    curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | python3 -m json.tool
else
    echo "❌ Failed to set webhook"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | python3 -m json.tool
    exit 1
fi

