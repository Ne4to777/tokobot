#!/bin/bash

# Script to get Telegram Chat ID when webhook is active
# This will temporarily delete webhook, get chat_id, then restore it

set -e  # Exit on error

if [ -z "$BOT_TOKEN" ]; then
  echo "❌ Error: BOT_TOKEN not set"
  echo ""
  echo "Usage:"
  echo "  BOT_TOKEN=your_token ./scripts/get-chat-id-no-webhook.sh"
  exit 1
fi

echo "🔧 Getting webhook info..."
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo")
WEBHOOK_URL=$(echo "$WEBHOOK_INFO" | jq -r '.result.url')

if [ "$WEBHOOK_URL" = "null" ] || [ -z "$WEBHOOK_URL" ]; then
  echo "✅ No webhook active, can use getUpdates directly"
  WEBHOOK_URL=""
else
  echo "📍 Current webhook: $WEBHOOK_URL"
  echo "⚠️  Will temporarily delete webhook to get chat_id"
  echo ""
  read -p "Continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 1
  fi

  echo "🗑️  Deleting webhook..."
  curl -s "https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook" > /dev/null
  echo "✅ Webhook deleted"
  sleep 2
fi

echo ""
echo "📱 Getting recent updates..."
echo ""

RESPONSE=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getUpdates")

if ! echo "$RESPONSE" | grep -q '"ok":true'; then
  echo "❌ Error getting updates"
  echo "$RESPONSE" | jq .

  # Restore webhook if it was active
  if [ -n "$WEBHOOK_URL" ]; then
    echo ""
    echo "🔄 Restoring webhook..."
    curl -s "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}" > /dev/null
    echo "✅ Webhook restored"
  fi

  exit 1
fi

echo "✅ Recent chats:"
echo ""
echo "$RESPONSE" | jq -r '.result[] | "\(.message.chat.type) chat: \(.message.chat.id) (\(.message.chat.first_name // .message.chat.title))"' | sort -u

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Restore webhook if it was active
if [ -n "$WEBHOOK_URL" ]; then
  echo "🔄 Restoring webhook to: $WEBHOOK_URL"
  RESTORE_RESPONSE=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}")

  if echo "$RESTORE_RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook restored successfully"
  else
    echo "⚠️  Error restoring webhook:"
    echo "$RESTORE_RESPONSE" | jq .
    echo ""
    echo "To restore manually, run:"
    echo "curl \"https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}\""
  fi
  echo ""
fi

echo "📝 Instructions:"
echo "1. Copy your chat_id from above"
echo "2. Add it to GitHub Secrets as DAILY_IDEAS_CHAT_ID"
echo ""
echo "If you didn't see any chats:"
echo "1. Send a message to your bot in Telegram"
echo "2. Run this script again"

