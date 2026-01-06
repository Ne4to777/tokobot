#!/bin/bash

# Script: set-vercel-webhook.sh
# Description: Automatically detects Vercel URL and sets Telegram webhook
# Usage: ./scripts/set-vercel-webhook.sh
# Requirements: .env file with BOT_TOKEN, Vercel CLI, curl, python3

set -e  # Exit on error

echo "🚀 Vercel Webhook Setup (Auto-detect)"
echo "====================================="
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

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI not found"
    echo ""
    echo "Install it with:"
    echo "  npm install -g vercel"
    echo ""
    echo "Or use the manual script:"
    echo "  ./scripts/set-webhook.sh <YOUR_VERCEL_URL>"
    exit 1
fi

echo "🔍 Detecting Vercel project URL..."

# Get Vercel project info
VERCEL_URL=$(vercel inspect --json 2>/dev/null | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)

# If auto-detect fails, ask user for URL
if [ -z "$VERCEL_URL" ]; then
    echo "⚠️  Could not auto-detect Vercel URL"
    echo ""
    read -p "Enter your Vercel URL (e.g., your-project.vercel.app): " VERCEL_URL
    
    if [ -z "$VERCEL_URL" ]; then
        echo "❌ Error: No URL provided"
        exit 1
    fi
fi

# Remove https:// or http:// if present
VERCEL_URL=${VERCEL_URL#https://}
VERCEL_URL=${VERCEL_URL#http://}

# Construct webhook URL
WEBHOOK_URL="https://${VERCEL_URL}/api/webhook"

echo ""
echo "🔗 Setting webhook to: $WEBHOOK_URL"
echo ""

# Set the webhook using Telegram Bot API
RESPONSE=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}")

# Check if successful
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook set successfully!"
    echo ""
    echo "📊 Webhook info:"
    echo ""
    
    # Show webhook info (formatted if python3 available)
    if command -v python3 &> /dev/null; then
        curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | python3 -m json.tool
    else
        curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
    fi
    
    echo ""
    echo "🎉 Done! Test your bot in Telegram:"
    echo "   /start   - Welcome message"
    echo "   /idea    - Random AI business idea"
    echo "   /contact - Lead generation form"
else
    echo "❌ Failed to set webhook"
    echo ""
    echo "Response from Telegram API:"
    
    # Show error response (formatted if python3 available)
    if command -v python3 &> /dev/null; then
        echo "$RESPONSE" | python3 -m json.tool
    else
        echo "$RESPONSE"
    fi
    
    exit 1
fi
