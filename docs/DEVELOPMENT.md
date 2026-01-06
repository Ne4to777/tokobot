# Development Guide

Guide for developers working on Tokobot.

## 🛠️ Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn**
- **Git**
- **Telegram Bot Token** (from [@BotFather](https://t.me/BotFather))

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nybble777/tokobot.git
cd tokobot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp env.example .env
```

Edit `.env` and add your tokens:

```env
BOT_TOKEN=your_telegram_bot_token
BITRIX24_WEBHOOK=your_bitrix24_webhook_url  # optional
HUGGINGFACE_TOKEN=your_huggingface_token    # optional
```

### 4. Run locally

```bash
npm run dev
```

The bot will start in polling mode and connect to Telegram.

## 📁 Project Structure

```
tokobot/
├── api/                    # Vercel serverless functions
│   └── webhook.ts         # Main webhook handler
├── lib/                   # Core business logic
│   ├── ai.ts             # AI idea generation
│   └── bitrix24.ts       # Bitrix24 CRM integration
├── scripts/              # Helper scripts
│   ├── set-webhook.sh    # Set Telegram webhook
│   ├── check-webhook.sh  # Check webhook status
│   └── README.md         # Scripts documentation
├── .github/              # GitHub configuration
│   ├── workflows/        # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/   # Issue templates
│   └── CODEOWNERS        # Code ownership
└── docs/                 # Additional documentation
```

## 🏗️ Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## 🧪 Testing

### Type checking

```bash
npx tsc --noEmit
```

### Test webhook locally

```bash
./scripts/test-bitrix-webhook.sh
```

### Test bot commands

Use [@BotFather](https://t.me/BotFather) to create a test bot and test all commands:

- `/start`
- `/idea`
- `/idea sales`
- `/contact`
- `/help`

## 🔄 Development Workflow

### Branch naming

- `feature/` - new features
- `fix/` - bug fixes
- `docs/` - documentation updates
- `refactor/` - code refactoring
- `test/` - test additions/changes

Example: `feature/add-calendar-integration`

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add calendar integration
fix: resolve webhook timeout issue
docs: update README with new commands
refactor: improve AI prompt handling
```

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Run type checks: `npx tsc --noEmit`
4. Commit with conventional commit messages
5. Push and create PR
6. Wait for CI checks to pass
7. Request review from @nybble777
8. Address review comments
9. Merge when approved

## 🐛 Debugging

### Local debugging

The bot runs in polling mode locally, making it easy to debug:

```bash
npm run dev
```

Watch the console for logs.

### Production debugging

Check Vercel logs:

```bash
vercel logs
```

Or in Vercel Dashboard → Project → Logs

### Common issues

**Bot not responding:**
- Check `BOT_TOKEN` is set correctly
- Verify webhook is set: `./scripts/check-webhook.sh`
- Check Vercel deployment status

**TypeScript errors:**
- Run `npx tsc --noEmit` to see all errors
- Check `tsconfig.json` configuration

**Bitrix24 integration failing:**
- Verify webhook has correct permissions (CRM access)
- Test webhook: `./scripts/test-bitrix-webhook.sh`

## 📝 Code Style

### TypeScript

- Use explicit types, avoid `any`
- Prefer interfaces over types for object shapes
- Use async/await over promises
- Add JSDoc comments for public functions

### Naming conventions

- Files: `kebab-case.ts`
- Functions/Variables: `camelCase`
- Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

### Imports

- Use ESM syntax (`import`/`export`)
- Include `.js` extension for local imports (required for ESM)
- Group imports: external packages → local modules

Example:
```typescript
import { Telegraf } from "telegraf";
import { generateIdea } from "../lib/ai.js";
```

## 🔐 Security

- **Never commit secrets** - use `.env` file (in `.gitignore`)
- **Validate user input** - sanitize all user-provided data
- **Use environment variables** for all sensitive data
- **Review dependencies** - check for known vulnerabilities

Run security audit:
```bash
npm audit
```

## 🚢 Deployment

### Vercel

Deployment is automatic on push to `main` branch.

Manual deployment:
```bash
vercel --prod
```

### Environment variables

Set in Vercel Dashboard → Project → Settings → Environment Variables

Required:
- `BOT_TOKEN`

Optional:
- `BITRIX24_WEBHOOK`
- `HUGGINGFACE_TOKEN`

## 📚 Additional Resources

- [Telegraf Documentation](https://telegraf.js.org/)
- [Bitrix24 REST API](https://dev.1c-bitrix.ru/rest_help/)
- [Vercel Documentation](https://vercel.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## 📞 Getting Help

- Create an [issue](https://github.com/nybble777/tokobot/issues)
- Check [existing issues](https://github.com/nybble777/tokobot/issues)
- Read [documentation](./README.md)

---

Happy coding! 🚀

