#!/bin/bash

# Скрипт для тестирования Bitrix24 webhook

echo "🔍 Тестирование Bitrix24 webhook..."
echo ""

# Читаем webhook из .env
WEBHOOK=$(grep BITRIX24_WEBHOOK .env | cut -d '=' -f2)

if [ -z "$WEBHOOK" ]; then
    echo "❌ BITRIX24_WEBHOOK не найден в .env"
    exit 1
fi

echo "Webhook URL: $WEBHOOK"
echo ""

# Тестируем доступ к API
echo "📡 Проверяем доступ..."
RESPONSE=$(curl -s "${WEBHOOK}crm.lead.list.json?select[]=ID&filter[ID]=1")

echo "Ответ от Bitrix24:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Проверяем на ошибки
if echo "$RESPONSE" | grep -q '"error"'; then
    echo "❌ Ошибка доступа!"
    echo ""
    if echo "$RESPONSE" | grep -q "insufficient_scope"; then
        echo "💡 Проблема: Недостаточно прав у webhook"
        echo ""
        echo "Решение:"
        echo "1. Откройте Bitrix24: https://b24-uxyfor.bitrix24.ru"
        echo "2. Приложения → Разработчикам → Входящий вебхук"
        echo "3. Создайте новый webhook с правами 'crm'"
        echo "4. Обновите .env файл с новым URL"
        echo "5. Запустите: ./restart-bot.sh"
    elif echo "$RESPONSE" | grep -q "401"; then
        echo "💡 Проблема: Неверный токен авторизации"
        echo ""
        echo "Решение:"
        echo "1. Проверьте правильность webhook URL в .env"
        echo "2. Возможно webhook был удален - создайте новый"
    fi
else
    echo "✅ Webhook работает корректно!"
    echo "✅ Доступ к CRM есть!"
    echo ""
    echo "Можете тестировать бота командой /contact"
fi

