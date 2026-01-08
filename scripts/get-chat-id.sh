#!/bin/bash

# Script to get your Telegram Chat ID
# Usage: ./scripts/get-chat-id.sh

if [ -z "$BOT_TOKEN" ]; then
  echo "❌ Error: BOT_TOKEN not set"
  echo ""
  echo "Usage:"
  echo "  BOT_TOKEN=your_token ./scripts/get-chat-id.sh"
  echo ""
  echo "Or set it in .env and run:"
  echo "  source .env && ./scripts/get-chat-id.sh"
  exit 1
fi

echo "📱 Getting recent updates from Telegram..."
echo ""

# Get updates from Telegram Bot API
RESPONSE=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getUpdates")

# Check if request was successful
if ! echo "$RESPONSE" | grep -q '"ok":true'; then
  echo "❌ Error getting updates from Telegram"
  echo "$RESPONSE" | jq .
  exit 1
fi

# Extract chat IDs
echo "✅ Recent chats:"
echo ""
echo "$RESPONSE" | jq -r '.result[] | "\(.message.chat.type) chat: \(.message.chat.id) (\(.message.chat.first_name // .message.chat.title))"' | sort -u

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Instructions:"
echo "1. Send any message to your bot in Telegram"
echo "2. Run this script again to see your chat_id"
echo "3. Add chat_id to GitHub Secrets as DAILY_IDEAS_CHAT_ID"
echo ""
echo "For private messages: use your personal chat_id"
echo "For channels/groups: use channel/group chat_id (usually negative number)"

