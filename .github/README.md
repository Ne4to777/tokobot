# GitHub Configuration

This directory contains all GitHub-specific configuration and automation for the Tokobot project.

## 📁 Contents

### Workflows (`.github/workflows/`)
Automated CI/CD pipelines that run on various events:

- **ci.yml** - Main CI pipeline (runs on PRs and pushes)
- **codeql.yml** - Security scanning with CodeQL
- **dependency-review.yml** - Checks for vulnerable dependencies in PRs
- **deploy-preview.yml** - Creates preview deployments
- **lint.yml** - Code quality checks (TypeScript, Prettier)

### Issue Templates (`.github/ISSUE_TEMPLATE/`)
Standardized formats for issues:

- **bug_report.md** - Report bugs with structured information
- **feature_request.md** - Request new features
- **config.yml** - Template configuration and external links

### Documentation
- **AI_DEVELOPMENT_GUIDE.md** - Guide for AI coding assistants
- **PULL_REQUEST_TEMPLATE.md** - Template for pull requests
- **SECURITY.md** - Security policy (also in root)
- **copilot-instructions.md** - GitHub Copilot instructions

### Configuration Files
- **CODEOWNERS** - Automatic reviewer assignment
- **dependabot.yml** - Automated dependency updates
- **labels.yml** - GitHub label definitions

## 🔄 Workflow Triggers

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| CI | Push, PR | Tests, type checks |
| CodeQL | Schedule, PR | Security scanning |
| Dependency Review | PR | Vulnerable deps |
| Deploy Preview | PR | Preview environments |
| Lint | Push, PR | Code quality |

## 🏷️ Label System

We use a comprehensive label system:

**Types**: `type: bug`, `type: feature`, `type: enhancement`, etc.  
**Priority**: `priority: critical`, `priority: high`, `priority: medium`, `priority: low`  
**Status**: `status: blocked`, `status: in progress`, `status: needs review`  
**Components**: `component: api`, `component: ai`, `component: bitrix24`

See `labels.yml` for complete list.

## 🤖 Automation

### Dependabot
- **Schedule**: Every Monday at 09:00 UTC
- **Scope**: npm packages + GitHub Actions
- **Auto-assigns**: @nybble777
- **Labels**: `dependencies`, `automated`

### Code Owners
Changes to specific files automatically request review from designated owners.

## 🔒 Security

- **CodeQL**: Runs weekly + on every PR
- **Dependency Review**: Blocks PRs with vulnerable dependencies
- **Security Policy**: See SECURITY.md

## 📝 Creating Issues

Use our templates:
1. Go to [Issues](https://github.com/nybble777/tokobot/issues/new/choose)
2. Choose appropriate template
3. Fill in required information
4. Submit

## 🔀 Creating Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push and create PR
5. Fill in PR template
6. Wait for CI checks to pass
7. Request review

## 🛠️ Maintaining Workflows

### Adding a New Workflow
1. Create `.yml` file in `workflows/`
2. Define triggers and jobs
3. Test on a feature branch
4. Document in this README

### Updating Labels
1. Edit `labels.yml`
2. Use [GitHub Label Sync](https://github.com/Financial-Times/github-label-sync) or manual sync

### Modifying Templates
1. Edit template files
2. Test by creating an issue/PR
3. Adjust as needed

## 📚 Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [CodeQL Docs](https://codeql.github.com/docs/)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)

---

**Questions?** Create an issue or see main [README.md](../README.md)

