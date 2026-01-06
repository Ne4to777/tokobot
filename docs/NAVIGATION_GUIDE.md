# 🧭 Navigation Guide

**Quick reference for finding what you need in this repository.**

## 🚀 I want to...

### Get Started

| Goal                                  | Go to                                             |
| ------------------------------------- | ------------------------------------------------- |
| **Run the bot in 5 minutes**          | [QUICKSTART.md](QUICKSTART.md)                    |
| **Understand what this project does** | [README.md](../README.md)                         |
| **See example bot commands**          | [README.md](../README.md#-доступные-команды-бота) |
| **Deploy to production**              | [README.md](../README.md#-деплой-на-vercel)       |

### Development

| Goal                               | Go to                                        |
| ---------------------------------- | -------------------------------------------- |
| **Set up development environment** | [DEVELOPMENT.md](DEVELOPMENT.md)             |
| **Understand project structure**   | [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) |
| **Learn code conventions**         | [DEVELOPMENT.md](DEVELOPMENT.md#code-style)  |
| **Debug issues**                   | [DEVELOPMENT.md](DEVELOPMENT.md#-debugging)  |
| **Run tests**                      | [DEVELOPMENT.md](DEVELOPMENT.md#-testing)    |

### Contributing

| Goal                         | Go to                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Contribute code**          | [CONTRIBUTING.md](../CONTRIBUTING.md)                                                                 |
| **Report a bug**             | [Issue: Bug Report](https://github.com/nybble777/tokobot/issues/new?template=bug_report.md)           |
| **Request a feature**        | [Issue: Feature Request](https://github.com/nybble777/tokobot/issues/new?template=feature_request.md) |
| **Understand commit format** | [CONTRIBUTING.md](../CONTRIBUTING.md#commit-guidelines)                                               |
| **Create a pull request**    | [PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md)                                       |

### Integrations

| Goal                             | Go to                                              |
| -------------------------------- | -------------------------------------------------- |
| **Set up Bitrix24 CRM**          | [BITRIX24_INTEGRATION.md](BITRIX24_INTEGRATION.md) |
| **Configure AI model**           | [lib/ai.ts](../lib/ai.ts)                          |
| **Change Telegram bot settings** | [api/webhook.ts](../api/webhook.ts)                |
| **Add new bot command**          | [api/webhook.ts](../api/webhook.ts)                |

### Architecture & Design

| Goal                               | Go to                                        |
| ---------------------------------- | -------------------------------------------- |
| **Understand system architecture** | [ARCHITECTURE.md](ARCHITECTURE.md)           |
| **See data flow diagrams**         | [ARCHITECTURE.md](ARCHITECTURE.md)           |
| **Learn about technology choices** | [ARCHITECTURE.md](ARCHITECTURE.md)           |
| **Navigate codebase**              | [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) |

### Reference

| Goal                      | Go to                                      |
| ------------------------- | ------------------------------------------ |
| **See version history**   | [CHANGELOG.md](../CHANGELOG.md)            |
| **Check license**         | [LICENSE](../LICENSE)                      |
| **Read security policy**  | [SECURITY.md](../.github/SECURITY.md)      |
| **View repository setup** | [REPOSITORY_SETUP.md](REPOSITORY_SETUP.md) |

### AI Agents & Bots

| Goal                            | Go to                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| **Guide for AI assistants**     | [AI_DEVELOPMENT_GUIDE.md](../.github/AI_DEVELOPMENT_GUIDE.md)                               |
| **GitHub Copilot instructions** | [copilot-instructions.md](../.github/copilot-instructions.md)                               |
| **Common patterns to follow**   | [AI_DEVELOPMENT_GUIDE.md](../.github/AI_DEVELOPMENT_GUIDE.md#-important-patterns-to-follow) |
| **Pitfalls to avoid**           | [AI_DEVELOPMENT_GUIDE.md](../.github/AI_DEVELOPMENT_GUIDE.md#-common-pitfalls-to-avoid)     |

## 📂 Quick File Reference

### 🔥 Most Important Files

```
../README.md           ← Start here! Project overview
QUICKSTART.md          ← 5-minute setup (in docs/)
../api/webhook.ts      ← Main bot logic
../lib/ai.ts          ← AI idea generation
../.env                ← Your secrets (create from env.example)
```

### 📚 Documentation (by purpose)

**Learning**

- `QUICKSTART.md` - Fastest way to get running
- `../README.md` - Comprehensive overview
- `DEVELOPMENT.md` - Development practices

**Contributing**

- `../CONTRIBUTING.md` - How to contribute
- `../.github/CODE_OF_CONDUCT.md` - Community rules
- `../.github/PULL_REQUEST_TEMPLATE.md` - PR format

**Technical**

- `ARCHITECTURE.md` - System design
- `PROJECT_STRUCTURE.md` - File organization
- `BITRIX24_INTEGRATION.md` - CRM setup

**Reference**

- `../CHANGELOG.md` - Version history
- `../.github/SECURITY.md` - Security policy
- `../LICENSE` - Legal terms

### ⚙️ Configuration Files

```
../package.json        ← Dependencies & scripts
../tsconfig.json      ← TypeScript config
../vercel.json        ← Deployment config
../.editorconfig      ← Editor settings
../.prettierrc        ← Code formatting
../.gitignore         ← Git exclusions
```

### 🤖 Automation

```
../.github/workflows/        ← CI/CD pipelines
../.github/dependabot.yml   ← Auto updates
../.github/CODEOWNERS       ← Code review
../.github/labels.yml       ← Issue labels
```

## 🎯 By Role

### 👨‍💻 New Developer

Read in this order:

1. [README.md](../README.md) - What is this?
2. [QUICKSTART.md](QUICKSTART.md) - Get it running
3. [DEVELOPMENT.md](DEVELOPMENT.md) - Development workflow
4. [CONTRIBUTING.md](../CONTRIBUTING.md) - How to contribute

### 🏗️ Architect / Tech Lead

Focus on:

1. [ARCHITECTURE.md](ARCHITECTURE.md) - System design
2. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Code organization
3. [REPOSITORY_SETUP.md](REPOSITORY_SETUP.md) - Infrastructure
4. [SECURITY.md](../.github/SECURITY.md) - Security considerations

### 🤖 AI Agent / Copilot

Essential reading:

1. [AI_DEVELOPMENT_GUIDE.md](../.github/AI_DEVELOPMENT_GUIDE.md) - Your guide
2. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Where things are
3. [DEVELOPMENT.md](DEVELOPMENT.md) - Patterns to follow

### 📝 Documentation Writer

Key files:

1. [README.md](../README.md) - Main docs
2. [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guide
3. [DEVELOPMENT.md](DEVELOPMENT.md) - Dev guide
4. All `*.md` files in docs/

### 🔒 Security Reviewer

Check:

1. [SECURITY.md](../.github/SECURITY.md) - Security policy
2. [.github/workflows/codeql.yml](../.github/workflows/codeql.yml) - Security scanning
3. [.github/workflows/dependency-review.yml](../.github/workflows/dependency-review.yml) - Dep checks
4. [.github/dependabot.yml](../.github/dependabot.yml) - Auto updates

## 🔍 By Task

### Adding a Feature

```
1. Read: ../CONTRIBUTING.md
2. Create issue: Feature Request template
3. Code: ../api/webhook.ts or ../lib/*.ts
4. Test: npm run dev
5. Commit: Conventional format
6. PR: ../.github/PULL_REQUEST_TEMPLATE.md
```

### Fixing a Bug

```
1. Reproduce: npm run dev
2. Debug: DEVELOPMENT.md#debugging
3. Fix: relevant .ts file
4. Test: npm run typecheck
5. PR: ../.github/PULL_REQUEST_TEMPLATE.md
```

### Updating Documentation

```
1. Find: This guide → relevant .md file in docs/
2. Edit: Follow existing format
3. Commit: docs: descriptive message
4. PR: Small docs PRs welcome!
```

## 📞 Still Lost?

### Can't find something?

1. **Search**: Use GitHub's search in this repo
2. **Check**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for file list
3. **Ask**: Create an issue with your question

### Need help?

- 🐛 **Bug**: [Report it](https://github.com/nybble777/tokobot/issues/new?template=bug_report.md)
- 💡 **Feature**: [Request it](https://github.com/nybble777/tokobot/issues/new?template=feature_request.md)
- 💬 **Question**: [Create issue](https://github.com/nybble777/tokobot/issues/new)

## 🎓 Learning Path

### Beginner (Just getting started)

```
1. ../README.md - Overview
2. QUICKSTART.md - Get running
3. Try bot commands in Telegram
4. Make small edit in ../api/webhook.ts
5. See your change work!
```

### Intermediate (Ready to contribute)

```
1. DEVELOPMENT.md - Dev practices
2. ../CONTRIBUTING.md - Contribution flow
3. PROJECT_STRUCTURE.md - Code organization
4. Pick "good first issue" and contribute
```

### Advanced (Deep understanding)

```
1. ARCHITECTURE.md - System design
2. Read all source code
3. Understand Vercel serverless
4. Review GitHub Actions workflows (../.github/workflows/)
5. Help review PRs
```

---

**Last Updated**: 2026-01-07  
**Need to update this guide?** Edit [NAVIGATION_GUIDE.md](NAVIGATION_GUIDE.md)

**Pro tip**: Bookmark this page for quick reference! 🔖
