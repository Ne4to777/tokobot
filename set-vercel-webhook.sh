#!/bin/bash

# Скрипт для установки webhook на Vercel URL

echo "🔗 Установка Telegram webhook для Vercel"
echo ""

BOT_TOKEN="8454256011:AAEDt99hCo8fPhMRjjRH1qja2B912XpEGCQ"

# Замените на ваш реальный Vercel URL!
read -p "Введите ваш Vercel URL (например: tokobot-xxx.vercel.app): " VERCEL_URL

# Удаляем https:// если есть
VERCEL_URL=${VERCEL_URL#https://}
VERCEL_URL=${VERCEL_URL#http://}

WEBHOOK_URL="https://${VERCEL_URL}/api/webhook"

echo ""
echo "Устанавливаем webhook: $WEBHOOK_URL"
echo ""

# Устанавливаем webhook
RESPONSE=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}")

if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook установлен успешно!"
    echo ""
    echo "Проверяем статус:"
    curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | python3 -m json.tool
    echo ""
    echo "🎉 Готово! Протестируйте бота в Telegram:"
    echo "   /start"
    echo "   /idea"
    echo "   /contact"
else
    echo "❌ Ошибка при установке webhook"
    echo "$RESPONSE" | python3 -m json.tool
fi

