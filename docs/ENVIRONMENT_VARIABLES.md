# Environment Variables Configuration

This document describes all environment variables used by Tokobot.

## Required Variables

### `BOT_TOKEN`

**Required**: Yes  
**Description**: Telegram bot token from [@BotFather](https://t.me/BotFather)  
**Format**: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`  
**Where to get**:

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` command
3. Follow instructions
4. Copy the token

**Local setup** (`.env`):

```bash
BOT_TOKEN=your_bot_token_here
```

**Vercel setup**:

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add `BOT_TOKEN` with your token value
3. Select all environments (Production, Preview, Development)
4. Click "Save"

---

## Optional Variables

### `BITRIX24_WEBHOOK`

**Required**: No  
**Description**: Bitrix24 webhook URL for CRM integration  
**Format**: `https://your-domain.bitrix24.ru/rest/1/webhook_code/`  
**Where to get**:

1. Log in to your Bitrix24 account
2. Go to Settings → Developer resources → Webhooks
3. Create "Incoming webhook"
4. Grant permissions: `crm` (read + write)
5. Copy the webhook URL

**Features enabled**:

- `/contact` command will create leads in Bitrix24
- Automatic contact information sync

**Local setup** (`.env`):

```bash
BITRIX24_WEBHOOK=https://your-domain.bitrix24.ru/rest/1/abc123/
```

**Vercel setup**: Same as BOT_TOKEN

---

### `HUGGINGFACE_TOKEN`

**Required**: No  
**Description**: Hugging Face API token for AI-powered idea generation  
**Format**: `hf_...` (starts with `hf_`)  
**Where to get**:

1. Sign up at [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens
3. Create new token with "read" permission
4. Copy the token

**Features enabled**:

- AI-powered idea generation using Mistral-7B model
- Smarter, more contextual business ideas
- Falls back to local database if API fails

**Local setup** (`.env`):

```bash
HUGGINGFACE_TOKEN=hf_YourTokenHere
```

**Vercel setup**: Same as BOT_TOKEN

---

### `DASHBOARD_TOKEN`

**Required**: No  
**Description**: Bearer token for dashboard API authentication  
**Format**: Any secure random string  
**Where to get**: Generate your own secure token

**Features enabled**:

- Protected access to `/api/dashboard` endpoint
- View analytics and statistics
- Without this token, dashboard is open to everyone

**Generate token**:

```bash
# Using OpenSSL
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Local setup** (`.env`):

```bash
DASHBOARD_TOKEN=your_secure_random_token_here
```

**Vercel setup**: Same as BOT_TOKEN

**Usage**:

```bash
# Access dashboard with token
curl -H "Authorization: Bearer your_token" \
  "https://tokobot-five.vercel.app/api/dashboard?action=system-stats"
```

---

### `ENVIRONMENT`

**Required**: No  
**Description**: Runtime environment  
**Format**: `development` | `production`  
**Default**: `production`

**Local setup** (`.env`):

```bash
ENVIRONMENT=development
```

**Vercel setup**: Automatically set to `production` in Vercel

**Behavior**:

- `development`: Bot runs in polling mode (long-polling)
- `production`: Bot runs in webhook mode (Vercel serverless)

---

## Complete Example

### Local Development (`.env`)

```bash
# Required
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Optional - Bitrix24 CRM
BITRIX24_WEBHOOK=https://your-domain.bitrix24.ru/rest/1/abc123/

# Optional - AI generation
HUGGINGFACE_TOKEN=hf_YourTokenHere

# Optional - Dashboard security
DASHBOARD_TOKEN=your_secure_random_token_here

# Environment
ENVIRONMENT=development
```

### Production (Vercel)

Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable            | Value              | Environments                     |
| ------------------- | ------------------ | -------------------------------- |
| `BOT_TOKEN`         | `123456789:ABC...` | Production, Preview, Development |
| `BITRIX24_WEBHOOK`  | `https://...`      | Production, Preview              |
| `HUGGINGFACE_TOKEN` | `hf_...`           | Production, Preview              |
| `DASHBOARD_TOKEN`   | `secure_token`     | Production                       |

---

## Security Best Practices

1. **Never commit `.env` file**
   - Already in `.gitignore`
   - Contains sensitive credentials

2. **Rotate tokens regularly**
   - Change BOT_TOKEN if compromised
   - Regenerate DASHBOARD_TOKEN periodically

3. **Use different tokens for development and production**
   - Create separate Telegram bot for testing
   - Use different Bitrix24 webhook

4. **Limit webhook permissions**
   - Only grant necessary CRM permissions
   - Don't give admin access

5. **Protect dashboard endpoint**
   - Always set DASHBOARD_TOKEN in production
   - Use strong, random token (32+ characters)

---

## Troubleshooting

### Bot not responding

**Check**: `BOT_TOKEN` is set correctly

```bash
# Test locally
npm run dev

# Check Vercel logs
vercel logs
```

### Bitrix24 integration not working

**Check**:

1. `BITRIX24_WEBHOOK` is set
2. Webhook has `crm` permissions
3. Webhook URL is correct (ends with `/`)

**Test**:

```bash
curl "${BITRIX24_WEBHOOK}crm.lead.list.json"
```

### AI ideas not generating

**Check**:

1. `HUGGINGFACE_TOKEN` is set (optional)
2. Token is valid
3. Check logs for API errors

**Note**: Bot will fall back to local database if API fails

### Dashboard shows unauthorized

**Check**:

1. `DASHBOARD_TOKEN` is set in Vercel
2. Using correct Authorization header
3. Token matches exactly

---

## Related Documentation

- [Deployment Guide](./DEPLOYMENT_EXPLAINED.md)
- [Bitrix24 Integration](./BITRIX24_INTEGRATION.md)
- [Development Guide](./DEVELOPMENT.md)
- [Main README](../README.md)
