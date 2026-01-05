#!/bin/bash

# Script to check Telegram webhook status

echo "🔍 Checking Telegram Bot Webhook Status"
echo "======================================="
echo ""

# Check if BOT_TOKEN is provided
if [ -z "$1" ]; then
    echo "❌ Error: BOT_TOKEN not provided"
    echo ""
    echo "Usage: ./scripts/check-webhook.sh <BOT_TOKEN>"
    echo ""
    echo "Example:"
    echo "  ./scripts/check-webhook.sh 123456:ABC-DEF"
    exit 1
fi

BOT_TOKEN=$1

echo "Fetching webhook info..."
echo ""

curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | python3 -m json.tool

