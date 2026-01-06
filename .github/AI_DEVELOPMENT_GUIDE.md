# AI Agent Development Guide

This guide is specifically designed for AI coding assistants (like GitHub Copilot, Cursor, ChatGPT, etc.) working on this repository.

## 🎯 Repository Context

**Project**: Tokobot - AI-First Business Idea Generator Telegram Bot  
**Language**: TypeScript (strict mode)  
**Runtime**: Node.js >= 18.x  
**Framework**: Telegraf (Telegram bot framework)  
**Deployment**: Vercel (serverless functions)  
**Module System**: ESM (type: "module")

## 📁 Key Files & Their Purpose

```
api/webhook.ts       → Main entry point, handles all Telegram webhooks
lib/ai.ts           → AI idea generation with HuggingFace + local fallback
lib/bitrix24.ts     → Bitrix24 CRM integration for lead management
scripts/            → Helper scripts for webhook setup and testing
```

## 🧠 Important Patterns to Follow

### 1. Import Statements (CRITICAL)
**Always use `.js` extension for local imports** (required for ESM):

```typescript
// ✅ CORRECT
import { generateIdea } from "../lib/ai.js";
import { createLead } from "../lib/bitrix24.js";

// ❌ WRONG
import { generateIdea } from "../lib/ai";
import { createLead } from "../lib/bitrix24";
```

### 2. TypeScript Types
- **Always use explicit types**, avoid `any`
- Prefer interfaces over types for object shapes
- Add JSDoc comments for public functions

```typescript
// ✅ CORRECT
interface LeadData {
  name: string;
  phone: string;
  email?: string;
}

/**
 * Creates a lead in Bitrix24 CRM
 * @param data Lead information
 * @returns Lead ID
 */
export async function createLead(data: LeadData): Promise<number> {
  // ...
}

// ❌ WRONG
export async function createLead(data: any) {
  // ...
}
```

### 3. Error Handling
**Always wrap API calls in try-catch with fallbacks**:

```typescript
// ✅ CORRECT
bot.command("idea", async (ctx) => {
  try {
    const idea = await generateIdea();
    await ctx.reply(idea);
  } catch (error) {
    console.error("Error generating idea:", error);
    await ctx.reply("Sorry, I couldn't generate an idea right now.");
  }
});

// ❌ WRONG (no error handling)
bot.command("idea", async (ctx) => {
  const idea = await generateIdea();
  await ctx.reply(idea);
});
```

### 4. Environment Variables
**Always check for required env vars and provide helpful errors**:

```typescript
// ✅ CORRECT
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN must be provided! Set it in .env file.");
}

// ❌ WRONG (no validation)
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN); // Will crash with unclear error
```

### 5. Vercel Serverless Function Pattern
The webhook handler must be an async function that takes `req` and `res`:

```typescript
// ✅ CORRECT
export default async (req: any, res: any) => {
  if (req.method === "POST") {
    await bot.handleUpdate(req.body);
    res.status(200).json({ ok: true });
  } else {
    res.status(200).json({ status: "Bot is running" });
  }
};
```

## 🔄 Common Tasks

### Adding a New Bot Command
1. Add handler in `api/webhook.ts`
2. Follow error handling pattern
3. Update `/help` command text
4. Add tests (when test suite exists)
5. Update README.md

### Adding a New AI Model
1. Update `lib/ai.ts`
2. Keep local fallback intact
3. Test with various inputs
4. Document model choice in code comments

### Adding a New Bitrix24 Feature
1. Add function to `lib/bitrix24.ts`
2. Add TypeScript interfaces for API responses
3. Handle 401/403 errors gracefully
4. Update `BITRIX24_INTEGRATION.md`

### Making Configuration Changes
1. Update `env.example` with new variables
2. Update README deployment section
3. Update Vercel environment variables documentation

## 🐛 Common Pitfalls to Avoid

### ❌ DON'T: Forget `.js` extension in imports
```typescript
import { generateIdea } from "../lib/ai"; // WILL FAIL IN PRODUCTION
```

### ❌ DON'T: Use `require()` or CommonJS syntax
```typescript
const { Telegraf } = require("telegraf"); // WRONG - use import
```

### ❌ DON'T: Hardcode secrets
```typescript
const BOT_TOKEN = "123456:ABC-DEF..."; // NEVER do this
```

### ❌ DON'T: Forget to load environment variables
```typescript
// api/webhook.ts needs this at the top:
import dotenv from "dotenv";
dotenv.config();
```

### ❌ DON'T: Use long-running processes in Vercel
Vercel has a 10-second timeout (free tier). Keep operations quick.

## ✅ Best Practices Checklist

When making changes, ensure:

- [ ] TypeScript types are explicit and correct
- [ ] All imports use `.js` extension for local files
- [ ] Error handling is comprehensive with user-friendly messages
- [ ] Environment variables are validated
- [ ] JSDoc comments added for public functions
- [ ] No secrets in code
- [ ] Code follows existing patterns
- [ ] README/docs updated if adding features
- [ ] Conventional commit message format used

## 🧪 Testing Your Changes

### Local Testing
```bash
npm run dev  # Test with polling mode
```

### Type Checking
```bash
npm run typecheck  # Must pass before committing
```

### Format Checking
```bash
npm run format:check  # Check formatting
npm run format       # Auto-fix formatting
```

## 📝 Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```
feat(ai): add GPT-4 support as alternative model
fix(bitrix24): handle 401 errors gracefully
docs(readme): update deployment instructions
refactor(webhook): improve error handling
```

## 🔍 Debugging Tips

### Bot not responding?
1. Check Vercel logs: `vercel logs`
2. Verify webhook: `./scripts/check-webhook.sh`
3. Check environment variables in Vercel dashboard

### TypeScript errors?
1. Run `npm run typecheck` to see all errors
2. Check for missing `.js` extensions in imports
3. Verify tsconfig.json hasn't been modified

### Bitrix24 integration failing?
1. Run `./scripts/test-bitrix-webhook.sh`
2. Check webhook permissions in Bitrix24
3. Verify BITRIX24_WEBHOOK format is correct

## 🤝 Working with Human Developers

When collaborating:
1. Always explain **why** you're making changes, not just what
2. Point out potential issues or edge cases
3. Suggest improvements to existing patterns
4. Ask for clarification on ambiguous requirements
5. Highlight any breaking changes

## 📚 Key Documentation Files

Before making changes, review:
- `README.md` - Project overview and setup
- `DEVELOPMENT.md` - Development workflow
- `ARCHITECTURE.md` - System architecture
- `CONTRIBUTING.md` - Contribution guidelines
- `.cursorrules` - Project-specific rules (in repo root)

## 🚀 Deployment Considerations

Remember that this bot runs as **serverless functions** on Vercel:
- No persistent state between invocations
- 10-second timeout on free tier
- Cold starts possible
- Environment variables must be set in Vercel dashboard
- Webhook mode only (no polling) in production

## 💡 Pro Tips

1. **Check existing code first** - Don't reinvent patterns
2. **Test locally before suggesting** - Use `npm run dev`
3. **Be cautious with dependencies** - Keep bundle size small
4. **Consider Russian users** - Some APIs may be blocked
5. **Think serverless** - No long-running processes

---

**This guide is maintained by the community. Feel free to suggest improvements!**

Last updated: 2026-01-07

