# Architecture Documentation

## System Overview

Tokobot is a serverless Telegram bot that generates AI-first business ideas and integrates with Bitrix24 CRM.

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Telegram  │◄───────►│    Vercel    │◄───────►│ Hugging Face│
│    Users    │         │  (Serverless)│         │     API     │
└─────────────┘         └──────┬───────┘         └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  Bitrix24    │
                        │     CRM      │
                        └──────────────┘
```

## Components

### 1. Telegram Bot (`api/webhook.ts`)

**Responsibility**: Handle incoming webhook requests from Telegram

**Key Functions**:

- Receive and parse Telegram updates
- Route commands to appropriate handlers
- Send responses back to users
- Handle errors gracefully

**Commands**:

- `/start` - Bot introduction
- `/idea [category]` - Generate business ideas
- `/contact` - Collect user information for CRM
- `/help` - Show available commands

**Flow**:

```
Telegram → Vercel Webhook → Command Handler → Response → Telegram
```

### 2. AI Service (`lib/ai.ts`)

**Responsibility**: Generate business ideas using AI or fallback to local database

**Key Functions**:

- `generateIdea(topic?)` - Main idea generation function
- `generateWithHuggingFace()` - AI-powered generation
- `generateLocalIdea()` - Fallback to local ideas

**Decision Flow**:

```
generateIdea()
    │
    ├─ HF Token exists?
    │   ├─ Yes → Try Hugging Face API
    │   │   ├─ Success → Return AI idea
    │   │   └─ Fail → Fallback to local
    │   └─ No → Use local ideas
    │
    └─ Local Generation
        ├─ Topic provided?
        │   ├─ Yes → Filter by topic
        │   └─ No → Random from all
        └─ Return random idea
```

**Data Structure**:

```typescript
// Base ideas pool: 50+ general AI-first ideas
const ideas: string[] = [...]

// Topic-specific ideas
const topicIdeas: Record<Topic, string[]> = {
  sales: [...],
  marketing: [...],
  hr: [...],
  product: [...],
  support: [...],
  finance: [...]
}
```

### 3. Bitrix24 Service (`lib/bitrix24.ts`)

**Responsibility**: Integrate with Bitrix24 CRM via REST API

**Key Functions**:

- `createLead(data)` - Create new lead in CRM
- `updateLead(id, data)` - Update existing lead
- `addLeadComment(id, comment)` - Add comment to lead
- `getLead(id)` - Fetch lead details
- `createTask(data)` - Create task for lead

**API Flow**:

```
Bot Command
    │
    ├─ Collect user data (name, phone, email)
    │
    ├─ Create lead via Bitrix24 API
    │   └─ POST /crm.lead.add
    │
    ├─ Add comment with chat context
    │   └─ POST /crm.lead.comment.add
    │
    └─ Notify user of success/failure
```

**Authentication**:

- Uses incoming webhook URL with embedded token
- Format: `https://{domain}.bitrix24.ru/rest/{user_id}/{webhook_token}/`
- No additional auth required

## Data Flow

### Idea Generation Flow

```
User sends "/idea sales"
    │
    ▼
Webhook receives update
    │
    ▼
Parse command & extract topic
    │
    ▼
Call generateIdea("sales")
    │
    ├─ Check if HF token exists
    │   │
    │   ├─ Yes → Try Hugging Face
    │   │   ├─ Build prompt: "Generate idea for sales..."
    │   │   ├─ Call API
    │   │   ├─ Success → Return AI response
    │   │   └─ Fail → Fallback
    │   │
    │   └─ No → Use local
    │
    ▼
Return random idea from topicIdeas.sales
    │
    ▼
Send to user in Telegram
```

### Lead Creation Flow

```
User sends "/contact"
    │
    ▼
Bot asks for name
    │
    ▼
User provides name
    │
    ▼
Bot asks for phone
    │
    ▼
User provides phone
    │
    ▼
Bot asks for email (optional)
    │
    ▼
Create lead in Bitrix24
    ├─ Name: from user
    ├─ Phone: from user
    ├─ Email: from user (if provided)
    ├─ Source: "Telegram Bot"
    ├─ Comment: User ID, Username, Chat link
    │
    ▼
Return lead ID
    │
    ▼
Notify user of success
```

## Environment Configuration

### Required

- `BOT_TOKEN` - Telegram bot token from @BotFather

### Optional

- `HUGGINGFACE_TOKEN` - Hugging Face API token for AI generation
- `BITRIX24_WEBHOOK` - Bitrix24 webhook URL for CRM integration
- `NODE_ENV` - Environment (development/production)

## Deployment Architecture

### Development (Local)

```
Local Machine
    │
    ├─ npm run dev (tsx watch)
    │
    ├─ Bot uses polling mode
    │   └─ Continuously polls Telegram API
    │
    └─ dotenv loads .env file
```

### Production (Vercel)

```
Vercel Serverless
    │
    ├─ Single function: api/webhook.ts
    │
    ├─ Triggered by HTTP POST from Telegram
    │   └─ Webhook URL: https://{project}.vercel.app/api/webhook
    │
    ├─ Environment variables from Vercel dashboard
    │
    └─ Auto-scales on demand
        ├─ Cold start: ~500ms
        └─ Warm: ~50ms
```

## Error Handling Strategy

### Levels

1. **User-facing errors** - Show friendly message
2. **Log errors** - Console.error with context
3. **Fallback mechanisms** - Graceful degradation

### Examples

```typescript
// API failure → Fallback
try {
  return await callHuggingFace();
} catch (error) {
  console.error("HF API failed, using local:", error);
  return generateLocalIdea();
}

// CRM failure → Notify but continue
try {
  await createLead(data);
} catch (error) {
  console.error("Bitrix24 error:", error);
  await ctx.reply("Could not create lead, but your request is saved.");
}

// Critical failure → Generic error
catch (error) {
  console.error("Critical error:", error);
  await ctx.reply("Something went wrong. Please try again.");
}
```

## Security Considerations

### Secrets Management

- All tokens/keys in environment variables
- Never commit `.env` files
- Vercel encrypts env vars at rest

### Input Validation

- Validate command parameters
- Sanitize user input before CRM
- Rate limiting via Telegram's built-in mechanisms

### API Security

- Webhook URL is secret (not in docs)
- Vercel HTTPS by default
- Bitrix24 webhook has limited scope

## Performance Optimization

### Strategies

1. **Lazy loading** - Only load dependencies when needed
2. **Caching** - Cache Hugging Face responses (future)
3. **Async operations** - All I/O is non-blocking
4. **Minimal dependencies** - Keep bundle size small

### Metrics

- Cold start: ~500ms
- Warm response: ~50-100ms
- API calls: 1-2 seconds (external dependency)

## Future Architecture Considerations

### Scaling

- Vercel auto-scales to demand
- No database = stateless design
- Consider Redis for session state (if needed)

### Features to Add

- Unit tests with Jest
- E2E tests with Playwright
- Monitoring with Sentry
- Analytics with Mixpanel
- Database for lead history

### Potential Improvements

- Multi-language support
- Custom AI model fine-tuning
- Advanced lead scoring
- Automated follow-ups
- Dashboard for analytics

## File Dependencies

```
api/webhook.ts
    ├─ import telegraf
    ├─ import lib/ai.ts
    │   └─ import dotenv
    └─ import lib/bitrix24.ts
        └─ import dotenv

lib/ai.ts
    └─ (no internal dependencies)

lib/bitrix24.ts
    └─ (no internal dependencies)
```

## API Contracts

### Telegram → Bot

```typescript
interface Update {
  message?: {
    text: string;
    from: User;
    chat: Chat;
  };
}
```

### Bot → Hugging Face

```typescript
interface HFRequest {
  inputs: string;
  parameters?: {
    max_length?: number;
    temperature?: number;
  };
}
```

### Bot → Bitrix24

```typescript
interface LeadCreateRequest {
  fields: {
    TITLE: string;
    NAME?: string;
    PHONE?: { VALUE: string; VALUE_TYPE: string }[];
    EMAIL?: { VALUE: string; VALUE_TYPE: string }[];
    SOURCE_ID?: string;
    COMMENTS?: string;
  };
}
```

## Monitoring & Debugging

### Logs

- Vercel dashboard: All console.log/error output
- Telegram API: Use getWebhookInfo for webhook status
- Bitrix24: Check CRM for lead creation success

### Common Issues

1. **Bot not responding** → Check webhook URL
2. **AI not working** → Verify HF token & quota
3. **CRM integration failing** → Check webhook permissions
4. **Slow responses** → Check cold start times

## Resources

- [Telegraf Documentation](https://telegraf.js.org/)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Hugging Face Inference API](https://huggingface.co/docs/api-inference/)
- [Bitrix24 REST API](https://dev.1c-bitrix.ru/rest_help/)
