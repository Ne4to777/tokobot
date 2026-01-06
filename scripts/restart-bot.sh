#!/bin/bash

# Script: restart-bot.sh
# Description: Restarts the local development bot process
# Usage: ./scripts/restart-bot.sh
# Requirements: Node.js, npm, running bot process
# Note: This is for LOCAL DEVELOPMENT only, not for production

set -e  # Exit on error

echo "🔄 Restarting Local Development Bot"
echo "===================================="
echo ""

# Get the script's directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "📂 Project directory: $PROJECT_ROOT"
echo ""

# Step 1: Stop running bot processes
echo "🛑 Stopping bot process..."

# Find and kill processes matching our bot
PIDS=$(pgrep -f "tsx.*webhook" || true)

if [ -n "$PIDS" ]; then
    echo "   Found process(es): $PIDS"
    pkill -f "tsx.*webhook" || true
    echo "   ✅ Stopped"
else
    echo "   ℹ️  No running bot process found"
fi

echo ""
sleep 2

# Step 2: Check if .env exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   Bot may fail to start without environment variables"
    echo ""
fi

# Step 3: Start bot
echo "🚀 Starting bot in development mode..."
echo ""

cd "$PROJECT_ROOT"

# Start bot in background
npm run dev > /dev/null 2>&1 &
BOT_PID=$!

echo "   Bot process started (PID: $BOT_PID)"
echo ""

# Wait a moment for bot to initialize
sleep 3

# Step 4: Check if bot is running
if ps -p $BOT_PID > /dev/null; then
    echo "✅ Bot restarted successfully!"
    echo ""
    echo "📊 Status:"
    echo "   Process ID: $BOT_PID"
    echo "   Mode: Development (polling)"
    echo "   Logs: Check terminal output"
    echo ""
    echo "🧪 Test the bot:"
    echo "   1. Open Telegram"
    echo "   2. Find your bot"
    echo "   3. Send: /start"
    echo "   4. Send: /idea"
    echo "   5. Send: /contact"
    echo ""
    echo "🛑 To stop: pkill -f 'tsx.*webhook'"
    echo "📋 View logs: tail -f nohup.out"
else
    echo "❌ Failed to start bot"
    echo ""
    echo "Troubleshooting:"
    echo "   1. Check .env file exists and has BOT_TOKEN"
    echo "   2. Run manually: npm run dev"
    echo "   3. Check for error messages"
    exit 1
fi
