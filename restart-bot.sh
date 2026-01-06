#!/bin/bash

# Скрипт для перезапуска бота

echo "🛑 Останавливаем бота..."
pkill -f "tsx.*webhook"

sleep 2

echo "🚀 Запускаем бота..."
cd /Users/nybble/projects/tokobot
npm run dev &

sleep 5

echo "✅ Бот перезапущен!"
echo ""
echo "Проверьте работу командой /contact в Telegram"

