#!/bin/bash

# Script: test-bitrix-webhook.sh
# Description: Tests Bitrix24 webhook configuration and permissions
# Usage: ./scripts/test-bitrix-webhook.sh
# Requirements: .env file with BITRIX24_WEBHOOK, curl, python3 (optional)

set -e  # Exit on error

echo "🔍 Testing Bitrix24 Webhook Configuration"
echo "========================================="
echo ""

# Load environment variables from .env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "❌ Error: .env file not found"
  echo "   Please create .env file with BITRIX24_WEBHOOK"
  exit 1
fi

# Check if BITRIX24_WEBHOOK is set
if [ -z "$BITRIX24_WEBHOOK" ]; then
    echo "❌ Error: BITRIX24_WEBHOOK not found in .env file"
    echo ""
    echo "To set up Bitrix24 integration:"
    echo "1. Open your Bitrix24 portal"
    echo "2. Go to: Applications → Developers → Inbound webhook"
    echo "3. Create new webhook with CRM permissions"
    echo "4. Copy the webhook URL"
    echo "5. Add to .env file:"
    echo "   BITRIX24_WEBHOOK=https://your-domain.bitrix24.ru/rest/1/xxx/"
    echo ""
    echo "See BITRIX24_INTEGRATION.md for detailed instructions"
    exit 1
fi

echo "🔗 Webhook URL: ${BITRIX24_WEBHOOK:0:50}..."
echo ""

# Test 1: Check webhook accessibility
echo "📡 Test 1: Checking webhook accessibility..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${BITRIX24_WEBHOOK}profile.json")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ Webhook not accessible (HTTP $HTTP_CODE)"
    echo ""
    echo "Possible issues:"
    echo "   - Incorrect webhook URL"
    echo "   - Webhook was deleted"
    echo "   - Network connectivity issues"
    exit 1
fi

echo "✅ Webhook is accessible"
echo ""

# Test 2: Check authentication
echo "📡 Test 2: Checking authentication..."

if echo "$BODY" | grep -q '"error"'; then
    ERROR=$(echo "$BODY" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    
    echo "❌ Authentication failed: $ERROR"
    echo ""
    
    if [ "$ERROR" = "insufficient_scope" ]; then
        echo "💡 Problem: Webhook lacks required permissions"
        echo ""
        echo "Solution:"
        echo "1. Open Bitrix24 webhook settings"
        echo "2. Enable 'CRM' permissions"
        echo "3. Save and copy the new webhook URL"
        echo "4. Update BITRIX24_WEBHOOK in .env"
        echo "5. Restart bot: ./scripts/restart-bot.sh"
    elif [ "$ERROR" = "401" ] || [ "$ERROR" = "unauthorized" ]; then
        echo "💡 Problem: Invalid webhook token"
        echo ""
        echo "Solution:"
        echo "1. Create new webhook in Bitrix24"
        echo "2. Update BITRIX24_WEBHOOK in .env"
        echo "3. Restart bot: ./scripts/restart-bot.sh"
    fi
    
    exit 1
fi

echo "✅ Authentication successful"
echo ""

# Test 3: Check CRM access
echo "📡 Test 3: Checking CRM permissions..."
CRM_RESPONSE=$(curl -s "${BITRIX24_WEBHOOK}crm.lead.list.json?select[]=ID&filter[%3E=ID]=1")

if echo "$CRM_RESPONSE" | grep -q '"error"'; then
    ERROR_DESC=$(echo "$CRM_RESPONSE" | grep -o '"error_description":"[^"]*"' | cut -d'"' -f4)
    
    echo "❌ CRM access denied: $ERROR_DESC"
    echo ""
    echo "💡 Problem: Webhook needs CRM permissions"
    echo ""
    echo "Solution:"
    echo "1. Open Bitrix24: Applications → Developers → Inbound webhook"
    echo "2. Edit your webhook"
    echo "3. Enable 'CRM' permissions"
    echo "4. Save and update .env with new webhook URL if changed"
    exit 1
fi

echo "✅ CRM access granted"
echo ""

# Test 4: Display webhook info
echo "📊 Webhook Information:"
echo ""

if command -v python3 &> /dev/null; then
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo "$BODY"
fi

echo ""

# Final summary
echo "✅ All tests passed!"
echo ""
echo "📋 Summary:"
echo "   ✓ Webhook is accessible"
echo "   ✓ Authentication works"
echo "   ✓ CRM permissions granted"
echo ""
echo "🎉 Your Bitrix24 integration is ready!"
echo ""
echo "🧪 Test in Telegram:"
echo "   1. Send /contact to your bot"
echo "   2. Fill in the contact form"
echo "   3. Check Bitrix24 CRM for new lead"
echo ""
echo "💡 Tips:"
echo "   - Leads appear in CRM → Leads section"
echo "   - Check lead source for 'Telegram Bot'"
echo "   - View bot logs in Vercel dashboard"
