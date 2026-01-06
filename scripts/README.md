# Scripts Directory

This directory contains utility scripts for managing and deploying the Tokobot Telegram bot.

## 📋 Available Scripts

### 🔗 Webhook Management

#### `set-webhook.sh`

Sets the Telegram webhook to your deployment URL.

**Usage:**

```bash
./scripts/set-webhook.sh <YOUR_VERCEL_URL>
```

**Example:**

```bash
./scripts/set-webhook.sh https://tokobot.vercel.app
```

**What it does:**

- Configures Telegram to send updates to your Vercel function
- Uses `BOT_TOKEN` from environment (reads from `.env`)
- Appends `/api/webhook` to the URL automatically

**Requirements:**

- `.env` file with `BOT_TOKEN`
- `curl` and `jq` installed

---

#### `set-vercel-webhook.sh`

Specifically designed for Vercel deployments, automatically uses your Vercel project URL.

**Usage:**

```bash
./scripts/set-vercel-webhook.sh
```

**What it does:**

- Detects your Vercel project URL automatically
- Sets webhook to `https://your-project.vercel.app/api/webhook`
- Uses `BOT_TOKEN` from `.env`

**Requirements:**

- `.env` file with `BOT_TOKEN`
- Vercel CLI installed and logged in
- `curl` and `jq` installed

---

#### `check-webhook.sh`

Checks the current webhook status and configuration.

**Usage:**

```bash
./scripts/check-webhook.sh
```

**What it does:**

- Shows current webhook URL
- Displays pending updates count
- Shows last error (if any)
- Indicates if webhook is working

**Output Example:**

```json
{
  "ok": true,
  "result": {
    "url": "https://tokobot.vercel.app/api/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40
  }
}
```

**Requirements:**

- `.env` file with `BOT_TOKEN`
- `curl` and `jq` installed

---

### 🐛 Development & Testing

#### `restart-bot.sh`

Restarts the local bot process (useful for development).

**Usage:**

```bash
./scripts/restart-bot.sh
```

**What it does:**

- Finds running node process with `webhook.ts`
- Kills the process
- Restarts bot with `npm run dev`

**Use case:**

- After changing environment variables
- After code changes that require restart
- When bot becomes unresponsive

**Note:** Only works for local development (not production)

---

#### `test-bitrix-webhook.sh`

Tests the Bitrix24 webhook configuration.

**Usage:**

```bash
./scripts/test-bitrix-webhook.sh
```

**What it does:**

- Sends test request to Bitrix24 API
- Verifies webhook URL is accessible
- Checks authentication and permissions
- Creates a test lead (optional)

**Requirements:**

- `.env` file with `BITRIX24_WEBHOOK`
- `curl` and `jq` installed

---

## 🛠️ Prerequisites

All scripts require:

### 1. Environment Variables

Create a `.env` file in project root:

```env
BOT_TOKEN=your_telegram_bot_token
BITRIX24_WEBHOOK=https://your-domain.bitrix24.ru/rest/1/xxx/
```

### 2. Required Tools

**macOS/Linux:**

```bash
# curl (usually pre-installed)
which curl

# jq (JSON processor)
brew install jq  # macOS
apt install jq   # Ubuntu/Debian
```

**Windows (WSL recommended):**

```bash
# Install jq
sudo apt install jq curl
```

### 3. Make Scripts Executable

```bash
chmod +x scripts/*.sh
```

## 📚 Usage Examples

### Initial Setup

```bash
# 1. Set webhook after first deployment
./scripts/set-webhook.sh https://your-project.vercel.app

# 2. Verify webhook is set correctly
./scripts/check-webhook.sh

# 3. Test Bitrix24 integration (if configured)
./scripts/test-bitrix-webhook.sh
```

### During Development

```bash
# Restart bot after .env changes
./scripts/restart-bot.sh

# Check webhook status
./scripts/check-webhook.sh
```

### After Redeployment

```bash
# Update webhook to new Vercel URL
./scripts/set-vercel-webhook.sh

# Verify it's working
./scripts/check-webhook.sh
```

## 🔍 Troubleshooting

### "BOT_TOKEN not found in .env"

**Problem:** `.env` file missing or doesn't contain `BOT_TOKEN`

**Solution:**

```bash
# Create .env from example
cp env.example .env

# Edit and add your token
nano .env
```

### "curl: command not found"

**Problem:** `curl` not installed

**Solution:**

```bash
# macOS
brew install curl

# Ubuntu/Debian
sudo apt install curl
```

### "jq: command not found"

**Problem:** `jq` JSON processor not installed

**Solution:**

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt install jq

# Or run scripts without jq (output won't be formatted)
```

### "Permission denied"

**Problem:** Scripts not executable

**Solution:**

```bash
chmod +x scripts/*.sh
```

### Webhook not working

**Problem:** Telegram not sending updates

**Solution:**

```bash
# 1. Check current webhook
./scripts/check-webhook.sh

# 2. Look for errors in response
# If "last_error_message" exists, it shows the problem

# 3. Reset webhook
./scripts/set-webhook.sh https://your-correct-url.vercel.app

# 4. Check Vercel logs
vercel logs
```

## 🔒 Security Notes

- Scripts read tokens from `.env` file only
- Never hardcode tokens in scripts
- `.env` is in `.gitignore` - keep it there
- Don't share script output publicly (may contain tokens)

## 🤝 Contributing

When adding new scripts:

1. **Add documentation here** in this README
2. **Add inline comments** in the script itself
3. **Make it executable:** `chmod +x scripts/new-script.sh`
4. **Test thoroughly** before committing
5. **Use environment variables** for sensitive data
6. **Follow naming convention:** `action-target.sh`

## 📝 Script Template

Use this template for new scripts:

```bash
#!/bin/bash

# Script Name: action-target.sh
# Description: What this script does
# Usage: ./scripts/action-target.sh [arguments]
# Requirements: List required tools and env vars

set -e  # Exit on error

# Load environment variables
if [ -f .env ]; then
  source .env
else
  echo "Error: .env file not found"
  exit 1
fi

# Check required variables
if [ -z "$REQUIRED_VAR" ]; then
  echo "Error: REQUIRED_VAR not set in .env"
  exit 1
fi

# Main script logic here
echo "Doing something..."

# Success message
echo "✅ Done!"
```

---

## 📞 Need Help?

- **Documentation:** See main [README.md](../README.md)
- **Issues:** [Report a problem](https://github.com/nybble777/tokobot/issues)
- **Discussions:** [Ask questions](https://github.com/nybble777/tokobot/discussions)
