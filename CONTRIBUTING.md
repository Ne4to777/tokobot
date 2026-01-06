# Contributing to Tokobot

Thank you for your interest in contributing to Tokobot! 🎉

This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](.github/CODE_OF_CONDUCT.md) before contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- Git
- Telegram account (for bot testing)
- (Optional) Bitrix24 account for CRM integration

### Setup Development Environment

1. **Fork the repository**

   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/tokobot.git
   cd tokobot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file**

   ```bash
   cp env.example .env
   # Edit .env and add your BOT_TOKEN from @BotFather
   ```

4. **Run locally**

   ```bash
   npm run dev
   ```

5. **Test in Telegram**
   - Find your bot in Telegram
   - Send `/start`
   - Verify it responds

## 🔄 Development Process

### 1. Create a Branch

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write code following our [Coding Standards](#coding-standards)
- Test your changes thoroughly
- Add/update documentation as needed
- Add/update tests if applicable

### 3. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat(scope): add new feature"
```

See [Commit Guidelines](#commit-guidelines) for details.

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 💻 Coding Standards

### TypeScript

```typescript
// ✅ Good
async function generateIdea(topic?: string): Promise<string> {
  const result = await fetchFromAPI(topic);
  return result;
}

// ❌ Bad
async function generateIdea(topic) {
  return await fetchFromAPI(topic);
}
```

**Rules:**

- Always use explicit types
- No `any` types (use `unknown` if type is truly unknown)
- Prefer interfaces over types for objects
- Use async/await instead of promises
- Add JSDoc comments for public functions

### File Naming

- Files: `kebab-case.ts`
- Components/Classes: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

### Imports

```typescript
// ✅ Correct - with .js extension for local files
import { generateIdea } from "../lib/ai.js";
import { createLead } from "../lib/bitrix24.js";

// ❌ Wrong - missing extension
import { generateIdea } from "../lib/ai";
```

**Order:**

1. External packages
2. Local modules
3. Types (if separate)

### Error Handling

```typescript
// ✅ Good
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error("Context about what failed:", error);
  return fallbackValue;
}

// ❌ Bad - silent failures
try {
  return await apiCall();
} catch {
  // No logging, no context
}
```

### Code Organization

```typescript
// ✅ Good - clear, documented, typed
/**
 * Generates an AI-first business idea
 * @param topic - Optional topic to focus on
 * @returns Generated business idea
 */
export async function generateIdea(topic?: string): Promise<string> {
  // Implementation
}

// ❌ Bad - no docs, unclear
export async function gen(t) {
  // Implementation
}
```

## 📝 Commit Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Formatting (no code change)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance

### Scope

Optional, indicates what part is affected:

- `bitrix24` - Bitrix24 integration
- `ai` - AI generation
- `bot` - Bot commands/logic
- `api` - API endpoints
- `deps` - Dependencies

### Examples

```bash
# New feature
feat(ai): add GigaChat integration for Russian users

# Bug fix
fix(bitrix24): handle 401 errors gracefully

# Documentation
docs(readme): add deployment instructions

# Refactoring
refactor(webhook): extract command handlers to separate files

# Breaking change
feat(api)!: change webhook response format

BREAKING CHANGE: API now returns {status, data} instead of raw data
```

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (README, etc.)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Tested locally
- [ ] No sensitive data in commits

### PR Title

Follow commit message format:

```
feat(bitrix24): add lead qualification feature
```

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How was this tested?

## Screenshots (if applicable)

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No TypeScript errors
- [ ] Tested locally
```

### Review Process

1. Maintainer will review within 48 hours
2. Address review comments
3. Once approved, maintainer will merge
4. Your contribution will be in the next release!

## 🧪 Testing

### Manual Testing

1. **Start bot locally:**

   ```bash
   npm run dev
   ```

2. **Test all commands:**
   - `/start` - Welcome message
   - `/idea` - Random idea
   - `/idea sales` - Category idea
   - `/contact` - Contact form
   - `/help` - Help message

3. **Test integrations:**
   - If Bitrix24: test lead creation
   - If AI API: test idea generation

### Testing Checklist

- [ ] All commands respond correctly
- [ ] Error messages are user-friendly
- [ ] Bot handles invalid input gracefully
- [ ] Logging shows appropriate information
- [ ] No sensitive data in logs

## 📚 Documentation

### When to Update Docs

Update documentation when you:

- Add new features
- Change existing behavior
- Add new commands
- Add new integrations
- Change configuration

### What to Update

- **README.md** - User-facing features
- **BITRIX24_INTEGRATION.md** - CRM integration details
- **.cursorrules** - For AI agents
- **CHANGELOG.md** - Version changes
- **JSDoc comments** - In code

### Documentation Style

````typescript
/**
 * Brief one-line description
 *
 * More detailed explanation if needed.
 * Can span multiple lines.
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 * @throws Error type and when it's thrown
 *
 * @example
 * ```typescript
 * const idea = await generateIdea("sales");
 * console.log(idea);
 * ```
 */
````

## ❓ Questions?

- **General questions:** Open a [Discussion](https://github.com/nybble777/tokobot/discussions)
- **Bug reports:** Open an [Issue](https://github.com/nybble777/tokobot/issues)
- **Feature requests:** Open an [Issue](https://github.com/nybble777/tokobot/issues) with "enhancement" label

## 🙏 Thank You!

Your contributions make Tokobot better for everyone. We appreciate your time and effort!

Happy coding! 🚀
