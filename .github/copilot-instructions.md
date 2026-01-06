# GitHub Copilot Instructions for Tokobot

## Project Context

This is a Telegram bot built with TypeScript that generates AI-first business ideas and integrates with Bitrix24 CRM. The bot is deployed as a serverless function on Vercel.

## Code Generation Guidelines

### TypeScript Standards
- Always use explicit types, never `any` unless absolutely necessary
- Use interfaces for object shapes, types for unions/intersections
- Add JSDoc comments for all exported functions
- Enable strict mode checks

### Architecture Patterns
- Serverless-first: Functions should be stateless
- Error handling: Always wrap external API calls in try-catch
- Graceful degradation: Provide fallbacks for external services
- Environment-driven configuration: Use env vars for all configs

### File Naming & Organization
```
api/          - Vercel serverless endpoints
lib/          - Shared utilities (ai.ts, bitrix24.ts)
scripts/      - Helper bash scripts
.github/      - CI/CD workflows and templates
```

### Import Conventions
```typescript
// External dependencies first
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

// Local imports with .js extension (ESM requirement)
import { generateIdea } from "../lib/ai.js";
import { createLead } from "../lib/bitrix24.js";
```

### Common Code Patterns

#### Telegram Command Handler
```typescript
bot.command("commandname", async (ctx) => {
  try {
    // Validate input
    const input = ctx.message.text.split(" ").slice(1).join(" ");
    
    // Process logic
    const result = await processCommand(input);
    
    // Send response
    await ctx.reply(result);
  } catch (error) {
    console.error(`Error in /commandname:`, error);
    await ctx.reply("Sorry, something went wrong. Please try again.");
  }
});
```

#### External API Call
```typescript
async function callExternalAPI<T>(
  url: string,
  options: RequestInit
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error("API call failed:", error);
    return null;
  }
}
```

#### Environment Variable Loading
```typescript
import dotenv from "dotenv";
dotenv.config();

const REQUIRED_ENV = process.env.REQUIRED_VAR;
if (!REQUIRED_ENV) {
  throw new Error("REQUIRED_VAR must be set");
}

const OPTIONAL_ENV = process.env.OPTIONAL_VAR;
// Provide fallback or handle absence gracefully
```

### Response Formats

For user-facing messages:
- Use emojis sparingly but effectively (🤖, 💡, ✅, ❌)
- Keep responses concise and actionable
- Provide clear next steps or alternatives on errors
- Use markdown formatting for readability

### Security Considerations

1. **Never log sensitive data**
```typescript
// ❌ Bad
console.log(`Token: ${process.env.BOT_TOKEN}`);

// ✅ Good
console.log("Bot initialized successfully");
```

2. **Validate user input**
```typescript
// ✅ Good
const topic = input.toLowerCase().trim();
const validTopics = ["sales", "marketing", "hr", "product", "support", "finance"];
if (topic && !validTopics.includes(topic)) {
  return "Invalid topic. Choose from: sales, marketing, hr, product, support, finance";
}
```

3. **Sanitize data before external calls**
```typescript
// ✅ Good
const sanitizedName = userInput.replace(/[<>]/g, "").trim();
```

### Testing Approach

When generating test code:
- Focus on edge cases and error scenarios
- Mock external API calls
- Test both success and failure paths
- Use descriptive test names

### Documentation Requirements

When adding new features:
1. Update relevant README sections
2. Add JSDoc comments to functions
3. Update CHANGELOG.md
4. Add examples to code comments
5. Update env.example if new env vars added

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

Examples:
- `feat(ai): add support for GPT-4 provider`
- `fix(bitrix24): handle 401 authentication errors`
- `docs(readme): update deployment instructions`

### Error Messages

User-facing errors should be:
- Friendly and non-technical
- Actionable (what can they do?)
- Consistent in tone

```typescript
// ❌ Bad
await ctx.reply("Error: null pointer exception in handler");

// ✅ Good
await ctx.reply("Sorry, I couldn't process that. Please try again or use /help for available commands.");
```

### Performance Considerations

- Minimize cold start time (keep dependencies light)
- Use async/await for all I/O operations
- Implement timeouts for external API calls
- Cache responses when appropriate (with TTL)

### Specific to This Project

#### AI Idea Generation
- All ideas must be "AI-first" (AI is the core product, not a feature)
- Maintain consistency in idea format
- Provide both AI-generated and local fallback options

#### Bitrix24 Integration
- Always check if webhook is configured before CRM calls
- Handle rate limits gracefully
- Log CRM operations for debugging

#### Vercel Deployment
- Export default async function for serverless endpoints
- Handle both webhook (production) and polling (development) modes
- Keep function execution time under 10 seconds

### Common Gotchas

1. **ESM imports require .js extension** for local files
2. **dotenv.config()** must be called in each entry point
3. **Webhook URL** changes with each deployment (update Telegram)
4. **Environment variables** are separate for dev/preview/production in Vercel

### Useful Commands

```bash
# Type checking
npm run typecheck

# Format code
npm run format

# Check formatting
npm run format:check

# Development
npm run dev
```

## AI Assistant Tips

When suggesting code:
1. Match the existing code style
2. Include proper error handling
3. Add TypeScript types
4. Update documentation if needed
5. Consider serverless constraints (stateless, fast)
6. Test suggestions before providing them

When fixing bugs:
1. Identify root cause
2. Suggest minimal change
3. Consider edge cases
4. Update tests if applicable

When adding features:
1. Check if similar patterns exist
2. Follow existing architecture
3. Consider performance impact
4. Update all relevant documentation

---

**Goal**: Maintain high code quality, consistency, and developer experience while building a reliable serverless Telegram bot.

