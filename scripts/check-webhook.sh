#!/bin/bash

# Script: check-webhook.sh
# Description: Checks the current Telegram webhook status and configuration
# Usage: ./scripts/check-webhook.sh
# Requirements: .env file with BOT_TOKEN, curl, python3 (optional)

set -e  # Exit on error

echo "🔍 Checking Telegram Bot Webhook Status"
echo "======================================="
echo ""

# Load environment variables from .env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "❌ Error: .env file not found"
  echo "   Please create .env file with BOT_TOKEN"
  exit 1
fi

# Check if BOT_TOKEN is set
if [ -z "$BOT_TOKEN" ]; then
    echo "❌ Error: BOT_TOKEN not found in .env file"
    echo ""
    echo "Add BOT_TOKEN to your .env file:"
    echo "  BOT_TOKEN=your_bot_token_here"
    exit 1
fi

echo "📡 Fetching webhook info from Telegram..."
echo ""

# Fetch webhook info
RESPONSE=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo")

# Display formatted response if python3 available, otherwise raw
if command -v python3 &> /dev/null; then
    echo "$RESPONSE" | python3 -m json.tool
else
    echo "$RESPONSE"
fi

echo ""

# Parse and show human-readable status
if echo "$RESPONSE" | grep -q '"url":""'; then
    echo "⚠️  Status: No webhook set (bot in polling mode or not configured)"
elif echo "$RESPONSE" | grep -q '"url":"http'; then
    WEBHOOK_URL=$(echo "$RESPONSE" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    PENDING_COUNT=$(echo "$RESPONSE" | grep -o '"pending_update_count":[0-9]*' | cut -d':' -f2)
    
    echo "✅ Status: Webhook is configured"
    echo "📍 URL: $WEBHOOK_URL"
    echo "📬 Pending updates: ${PENDING_COUNT:-0}"
    
    # Check for errors
    if echo "$RESPONSE" | grep -q '"last_error_message"'; then
        echo ""
        echo "⚠️  Last error detected:"
        ERROR_MSG=$(echo "$RESPONSE" | grep -o '"last_error_message":"[^"]*"' | cut -d'"' -f4)
        echo "   $ERROR_MSG"
        echo ""
        echo "💡 Tip: Check your Vercel logs and ensure the webhook URL is accessible"
    fi
else
    echo "⚠️  Status: Unknown response format"
fi

echo ""
echo "💡 Quick Actions:"
echo "   Set webhook:   ./scripts/set-webhook.sh <VERCEL_URL>"
echo "   Test bot:      Send /start to your bot in Telegram"
echo "   View logs:     vercel logs --follow"
