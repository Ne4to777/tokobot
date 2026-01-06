# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.1] - 2026-01-07

### Changed

- **Documentation reorganization** - Moved all detailed docs to `docs/` folder
  - Created `docs/README.md` as documentation hub
  - Moved 8 documentation files to `docs/`
  - Kept only critical files in root (README, LICENSE, CONTRIBUTING, CHANGELOG)
  - Moved `CODE_OF_CONDUCT.md` and `SECURITY.md` to `.github/`
  - Updated all internal documentation links
  - Cleaner repository structure following best practices

## [1.1.0] - 2026-01-07

### Added

- Repository organization and best practices documentation
- `.editorconfig` for consistent code style across editors
- Prettier configuration for code formatting
- VSCode workspace settings and recommended extensions
- GitHub Actions workflows:
  - CodeQL security scanning
  - Dependency review for PRs
  - Linting and type checking
- CODEOWNERS file for automatic code review assignments
- Dependabot configuration for automatic dependency updates
- DEVELOPMENT.md with comprehensive development guide
- Git commit message template (`.gitmessage`)
- GitHub labels configuration for better issue management
- Improved `.gitignore` with comprehensive exclusions

### Changed

- Enhanced project structure for better maintainability
- Updated documentation for AI-agent friendly development
- Improved npm scripts for code quality checks

## [1.0.0] - 2026-01-06

### Added

- Initial release of Tokobot
- AI-first business idea generation with 50+ local ideas
- Six categories: sales, marketing, hr, product, support, finance
- Integration with Hugging Face Inference API (optional)
- Bitrix24 CRM integration for lead generation
- `/start` command with bot introduction
- `/idea` command for random idea generation
- `/idea <category>` command for category-specific ideas
- `/contact` command for lead collection
- `/help` command with usage instructions
- Telegram webhook support for production deployment
- Vercel serverless deployment configuration
- TypeScript with strict mode and ESM modules
- Local development mode with long-polling
- Production webhook mode for Vercel
- Automatic lead creation in Bitrix24 from contact forms
- Environment variable configuration for tokens and API keys
- Comprehensive documentation (README, BITRIX24_INTEGRATION)
- Helper scripts for webhook management

### Technical Details

- Node.js >= 18.x
- Telegraf 4.15.6 for Telegram Bot API
- TypeScript 5.3+ with strict mode
- ESM module system
- Vercel serverless functions
- dotenv for environment variables
- REST API integration with Bitrix24

### Documentation

- README.md with setup and deployment instructions
- BITRIX24_INTEGRATION.md with CRM integration guide
- env.example with required environment variables
- Helper scripts with inline documentation

---

## Version History

### Version Format

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible new features
- **PATCH** version for backwards-compatible bug fixes

### Change Categories

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Vulnerability fixes

---

## Links

- [Repository](https://github.com/nybble777/tokobot)
- [Issues](https://github.com/nybble777/tokobot/issues)
- [Pull Requests](https://github.com/nybble777/tokobot/pulls)
