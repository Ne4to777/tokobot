# 📁 Project Structure

Complete overview of the Tokobot repository structure and file purposes.

## 🏗️ Directory Layout

```
tokobot/
├── .github/                    # GitHub configuration
│   ├── workflows/             # GitHub Actions CI/CD
│   │   ├── ci.yml            # Main CI pipeline
│   │   ├── codeql.yml        # Security scanning
│   │   ├── dependency-review.yml  # Dependency checking
│   │   ├── deploy-preview.yml     # Preview deployments
│   │   └── lint.yml          # Code quality checks
│   ├── ISSUE_TEMPLATE/       # Issue templates
│   │   ├── bug_report.md     # Bug report template
│   │   ├── feature_request.md # Feature request template
│   │   └── config.yml        # Template configuration
│   ├── AI_DEVELOPMENT_GUIDE.md # Guide for AI assistants
│   ├── CODEOWNERS            # Code review assignments
│   ├── copilot-instructions.md # GitHub Copilot rules
│   ├── dependabot.yml        # Auto dependency updates
│   ├── labels.yml            # GitHub labels config
│   ├── PULL_REQUEST_TEMPLATE.md # PR template
│   └── SECURITY.md           # Security policy
│
├── .vscode/                   # VSCode workspace config
│   ├── extensions.json       # Recommended extensions
│   └── settings.json         # Editor settings
│
├── api/                       # Vercel serverless functions
│   └── webhook.ts            # Main bot webhook handler
│
├── lib/                       # Shared business logic
│   ├── ai.ts                 # AI idea generation service
│   └── bitrix24.ts           # Bitrix24 CRM integration
│
├── scripts/                   # Helper scripts
│   ├── check-webhook.sh      # Check webhook status
│   ├── restart-bot.sh        # Restart bot process
│   ├── set-vercel-webhook.sh # Set webhook for Vercel
│   ├── set-webhook.sh        # Set webhook for production
│   ├── test-bitrix-webhook.sh # Test Bitrix24 connection
│   └── README.md             # Scripts documentation
│
├── .editorconfig             # Editor configuration
├── .gitmessage               # Git commit template
├── .gitignore                # Git ignore rules
├── .prettierignore           # Prettier ignore rules
├── .prettierrc               # Prettier configuration
├── .vercelignore             # Vercel ignore rules
│
├── ARCHITECTURE.md           # System architecture docs
├── BITRIX24_INTEGRATION.md   # Bitrix24 setup guide
├── CHANGELOG.md              # Version history
├── CODE_OF_CONDUCT.md        # Community guidelines
├── CONTRIBUTING.md           # Contribution guide
├── DEVELOPMENT.md            # Development workflow
├── env.example               # Environment variables template
├── LICENSE                   # MIT License
├── package.json              # Node.js dependencies
├── PROJECT_STRUCTURE.md      # This file
├── QUICKSTART.md             # 5-minute setup guide
├── README.md                 # Main documentation
├── SECURITY.md               # Security policy
├── tsconfig.json             # TypeScript configuration
└── vercel.json               # Vercel deployment config
```

## 📝 File Purposes

### Core Application Files

#### `api/webhook.ts`

**Purpose**: Main entry point for the Telegram bot  
**Key responsibilities**:

- Handles incoming Telegram webhooks
- Routes commands to appropriate handlers
- Manages bot instance and middleware
- Exports serverless function for Vercel

#### `lib/ai.ts`

**Purpose**: AI-powered idea generation  
**Key responsibilities**:

- Integrates with HuggingFace Inference API
- Provides local fallback with 50+ pre-made ideas
- Category-specific idea generation (sales, marketing, etc.)
- Error handling and retries

#### `lib/bitrix24.ts`

**Purpose**: Bitrix24 CRM integration  
**Key responsibilities**:

- Lead creation and management
- Contact data handling
- Task creation
- API error handling

### Configuration Files

#### `.editorconfig`

Ensures consistent coding style across different editors (indentation, line endings, etc.)

#### `.prettierrc` & `.prettierignore`

Code formatting rules and exclusions for Prettier

#### `tsconfig.json`

TypeScript compiler configuration:

- Target: ES2022
- Module: NodeNext (ESM)
- Strict mode enabled

#### `vercel.json`

Vercel deployment configuration:

- Serverless function routing
- Build settings

#### `package.json`

Project metadata and dependencies:

- Scripts for development and testing
- Dependencies (telegraf, dotenv, etc.)
- DevDependencies (TypeScript, tsx, prettier)

### Documentation Files

#### `README.md` 🎯

**Primary documentation** - Start here!

- Project overview
- Quick start guide
- Deployment instructions
- Available commands

#### `QUICKSTART.md` 🚀

**5-minute setup** - For impatient developers

- Minimal steps to get bot running
- Troubleshooting quick fixes

#### `DEVELOPMENT.md` 💻

**For contributors** - Deep dive into development

- Development workflow
- Code style guidelines
- Testing procedures
- Debugging tips

#### `CONTRIBUTING.md` 🤝

**Contribution guidelines**

- How to submit PRs
- Commit message format
- Code review process

#### `ARCHITECTURE.md` 🏛️

**System design** - Understanding the architecture

- Component overview
- Data flow diagrams
- Technology choices

#### `BITRIX24_INTEGRATION.md` 🔗

**CRM integration guide**

- Bitrix24 setup instructions
- Webhook configuration
- Lead management workflow

#### `PROJECT_STRUCTURE.md` 📁

**This file** - Repository navigation guide

### GitHub Configuration

#### `.github/workflows/`

**CI/CD pipelines**:

- `ci.yml` - Run tests and type checks on PRs
- `codeql.yml` - Security vulnerability scanning
- `dependency-review.yml` - Check for vulnerable dependencies
- `deploy-preview.yml` - Deploy preview environments
- `lint.yml` - Code quality and formatting checks

#### `.github/ISSUE_TEMPLATE/`

**Issue templates**:

- `bug_report.md` - Standardized bug reports
- `feature_request.md` - Feature request format
- `config.yml` - Template configuration

#### `.github/CODEOWNERS`

Automatically assigns reviewers based on file changes

#### `.github/dependabot.yml`

Automated dependency updates for npm and GitHub Actions

#### `.github/AI_DEVELOPMENT_GUIDE.md`

Special guide for AI coding assistants (Copilot, Cursor, etc.)

### Scripts Directory

Helper bash scripts for common tasks:

#### `check-webhook.sh`

Checks current webhook status and configuration

#### `set-webhook.sh`

Sets Telegram webhook for production deployment

#### `set-vercel-webhook.sh`

Sets webhook for Vercel deployment specifically

#### `test-bitrix-webhook.sh`

Tests Bitrix24 webhook connectivity and permissions

#### `restart-bot.sh`

Stops and restarts local bot instance

## 🔄 Data Flow

```
User (Telegram)
    ↓
Telegram Servers
    ↓
[Webhook] → api/webhook.ts
    ↓
Bot Command Handler
    ↓
┌───────────────┬──────────────┐
│               │              │
lib/ai.ts  lib/bitrix24.ts  Direct Response
    ↓           ↓              ↓
HuggingFace  Bitrix24 API   User
    ↓           ↓
Local Fallback  CRM
    ↓           ↓
    └─────┬─────┘
          ↓
    Response to User
```

## 🎯 Key Patterns

### ESM Imports (IMPORTANT!)

All local imports must use `.js` extension:

```typescript
import { generateIdea } from "../lib/ai.js"; // ✅
import { generateIdea } from "../lib/ai"; // ❌
```

### Environment Variables

Loaded via `dotenv` in development, Vercel env vars in production

### Error Handling

All API calls wrapped in try-catch with user-friendly fallbacks

### TypeScript

Strict mode enabled, explicit types required, no `any` types

## 🔐 Security

Sensitive files (automatically ignored by git):

- `.env` - Local environment variables
- `.vercel/` - Vercel build artifacts
- `node_modules/` - Dependencies

## 📦 Dependencies

### Production

- `telegraf` - Telegram bot framework
- `dotenv` - Environment variable loading
- `@types/node` - Node.js type definitions

### Development

- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution for development
- `prettier` - Code formatting

## 🚀 Deployment

The project is optimized for **Vercel serverless deployment**:

- No persistent state
- Webhook-based (not polling)
- Environment variables via Vercel dashboard
- Automatic deploys on push to main branch

## 📚 For New Contributors

**Start with these files in order**:

1. `README.md` - Understand what the project does
2. `QUICKSTART.md` - Get it running locally
3. `DEVELOPMENT.md` - Learn the development workflow
4. `CONTRIBUTING.md` - Understand contribution process
5. `ARCHITECTURE.md` - Deep dive into system design

**For AI agents**: Read `.github/AI_DEVELOPMENT_GUIDE.md` first!

## 🔍 Finding Things

**Need to...**

- **Add a bot command?** → Edit `api/webhook.ts`
- **Change AI behavior?** → Edit `lib/ai.ts`
- **Modify CRM integration?** → Edit `lib/bitrix24.ts`
- **Update documentation?** → Edit relevant `.md` file
- **Change deployment?** → Edit `vercel.json`
- **Add GitHub Action?** → Create in `.github/workflows/`
- **Configure editor?** → Edit `.editorconfig` or `.vscode/settings.json`

---

**Last updated**: 2026-01-07  
**Maintained by**: Tokobot contributors
