#!/bin/bash

# Тест Yandex SpeechKit API напрямую
# Проверяет, работает ли API с вашими ключами

set -e

echo "🔍 Тестирование Yandex SpeechKit API..."
echo ""

# Загружаем переменные из .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Проверяем наличие ключей
if [ -z "$YANDEX_API_KEY" ]; then
    echo "❌ YANDEX_API_KEY не установлен"
    exit 1
fi

if [ -z "$YANDEX_FOLDER_ID" ]; then
    echo "❌ YANDEX_FOLDER_ID не установлен"
    exit 1
fi

echo "✅ YANDEX_API_KEY: ${YANDEX_API_KEY:0:10}..."
echo "✅ YANDEX_FOLDER_ID: $YANDEX_FOLDER_ID"
echo ""

# Проверяем права через YandexGPT (должно работать)
echo "📝 Тест 1: Проверка YandexGPT API (должно работать)..."
response=$(curl -s -X POST \
  "https://llm.api.cloud.yandex.net/foundationModels/v1/completion" \
  -H "Authorization: Api-Key $YANDEX_API_KEY" \
  -H "x-folder-id: $YANDEX_FOLDER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "modelUri": "gpt://'$YANDEX_FOLDER_ID'/yandexgpt-lite",
    "completionOptions": {"stream": false, "maxTokens": "10"},
    "messages": [{"role": "user", "text": "test"}]
  }')

if echo "$response" | grep -q "result"; then
    echo "✅ YandexGPT работает - API ключ валидный"
else
    echo "❌ YandexGPT не работает:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    exit 1
fi
echo ""

# Проверяем SpeechKit
echo "🎤 Тест 2: Проверка SpeechKit API..."
echo ""
echo "⚠️  Для теста SpeechKit нужен реальный аудиофайл в формате OGG."
echo "Попробуем отправить пустой запрос, чтобы увидеть ошибку:"
echo ""

# Создаем минимальный OGG файл (пустой, но валидный заголовок)
echo -n "OggS" > /tmp/test.ogg

response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
  "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?lang=ru-RU&folderId=$YANDEX_FOLDER_ID&format=oggopus" \
  -H "Authorization: Api-Key $YANDEX_API_KEY" \
  --data-binary "@/tmp/test.ogg")

http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d':' -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "HTTP Status: $http_code"
echo "Response:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo ""

if [ "$http_code" = "401" ]; then
    echo "❌ Ошибка 401: Permission Denied"
    echo ""
    echo "🔧 Решение:"
    echo "1. Откройте https://console.cloud.yandex.ru/"
    echo "2. Перейдите в 'Сервисные аккаунты'"
    echo "3. Найдите аккаунт с вашим API ключом"
    echo "4. Добавьте роль: ai.speechkit-stt.user"
    echo "5. (Опционально) Пересоздайте API ключ"
    echo ""
    echo "Текущие роли можно проверить командой:"
    echo "yc iam service-account list-access-bindings <service-account-id>"
    exit 1
elif [ "$http_code" = "400" ]; then
    echo "✅ SpeechKit доступен (ошибка 400 = плохой аудиофайл, но API работает)"
    echo ""
    echo "🎉 Права настроены правильно!"
    echo "Проблема была в формате запроса, сейчас исправлена."
elif [ "$http_code" = "200" ]; then
    echo "✅ SpeechKit работает полностью!"
else
    echo "⚠️  Неожиданный код ответа: $http_code"
fi

# Очистка
rm -f /tmp/test.ogg

echo ""
echo "✅ Тестирование завершено"
