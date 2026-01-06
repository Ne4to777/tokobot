# 🚀 Quick Start Guide

Get Tokobot running on your machine in 5 minutes!

## Prerequisites

- Node.js >= 18.x ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Git ([Download](https://git-scm.com/))
- Telegram account

## Step 1: Get Your Bot Token

1. Open Telegram and find [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Copy the bot token (looks like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

## Step 2: Clone and Install

```bash
# Clone the repository
git clone https://github.com/nybble777/tokobot.git
cd tokobot

# Install dependencies
npm install
```

## Step 3: Configure

```bash
# Copy example environment file
cp env.example .env

# Edit .env file and add your bot token
# Replace YOUR_BOT_TOKEN_HERE with the token from Step 1
echo "BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" >> .env
```

Or manually edit `.env`:
```env
BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

## Step 4: Run!

```bash
npm run dev
```

You should see:
```
Bot is running in polling mode...
```

## Step 5: Test Your Bot

1. Open Telegram
2. Find your bot (search for the username you created)
3. Send `/start` command
4. Try `/idea` to generate an AI business idea!

## 🎉 Success!

Your bot is now running locally! Try these commands:

- `/start` - Welcome message
- `/idea` - Random AI business idea
- `/idea sales` - Sales-focused idea
- `/idea marketing` - Marketing-focused idea
- `/help` - List all commands

## Next Steps

### 🌐 Deploy to Production

Want your bot to run 24/7? Deploy to Vercel (free):

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# Then set webhook (replace URL with your Vercel URL):
curl https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-project.vercel.app/api/webhook
```

See [README.md](../README.md) for detailed deployment instructions.

### 🔗 Add Bitrix24 Integration

Want to collect leads from your bot? See [BITRIX24_INTEGRATION.md](BITRIX24_INTEGRATION.md)

### 🧪 Optional: Add HuggingFace AI

Want better AI-generated ideas?

1. Sign up at [HuggingFace](https://huggingface.co/)
2. Create a token at [Settings → Tokens](https://huggingface.co/settings/tokens)
3. Add to `.env`:
```env
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
```
4. Restart bot

### 💻 Start Developing

Read the development guide:
```bash
cat DEVELOPMENT.md
```

Key commands:
```bash
npm run dev           # Run in development mode
npm run typecheck     # Check TypeScript types
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

## 🐛 Troubleshooting

### "BOT_TOKEN must be provided"
- Make sure `.env` file exists
- Check that `BOT_TOKEN=` line has no spaces
- Restart the bot after changing `.env`

### "Error: 409 Conflict"
- Another instance of your bot is running
- Stop the other instance (or run `pkill -f "tsx watch"`)
- Only one instance can run at a time

### Bot doesn't respond
- Check that bot is running (you should see "Bot is running...")
- Make sure you're messaging the correct bot
- Try `/start` command first

### TypeScript errors
```bash
# Make sure all dependencies are installed
npm install

# Check for type errors
npm run typecheck
```

## 📚 Learn More

- [README.md](../README.md) - Full documentation
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development workflow
- [CONTRIBUTING.md](../CONTRIBUTING.md) - How to contribute
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

## 💬 Get Help

- 📖 [Check existing issues](https://github.com/nybble777/tokobot/issues)
- 🐛 [Report a bug](https://github.com/nybble777/tokobot/issues/new?template=bug_report.md)
- 💡 [Request a feature](https://github.com/nybble777/tokobot/issues/new?template=feature_request.md)

---

**Happy coding! 🤖**

