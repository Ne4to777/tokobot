# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in Tokobot, please send an email to the maintainers via GitHub Issues (mark as security-sensitive) or create a security advisory.

Please include the following information:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## What to Expect

- We will acknowledge your report within 48 hours
- We will provide a detailed response within 7 days
- We will work with you to understand and validate the issue
- We will release a fix as soon as possible (depending on complexity)
- We will credit you in the release notes (unless you prefer to remain anonymous)

## Security Best Practices for Users

When deploying Tokobot:

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use Vercel's environment variable encryption
   - Rotate tokens regularly

2. **Bot Token**
   - Keep your bot token secret
   - Never share it in public channels
   - Regenerate if compromised

3. **Bitrix24 Webhook**
   - Use incoming webhooks with minimal permissions
   - Regularly audit webhook access logs
   - Delete unused webhooks

4. **Hugging Face Token**
   - Use read-only tokens
   - Monitor API usage for anomalies
   - Revoke tokens if suspicious activity detected

5. **Deployment**
   - Enable Vercel's deployment protection in production
   - Use environment-specific configurations
   - Monitor function logs for suspicious activity

6. **Dependencies**
   - Keep dependencies up to date
   - Use `npm audit` to check for vulnerabilities
   - Review dependency changes before updating

## Known Security Considerations

### Telegram Bot Token
The bot token provides full access to your bot. If compromised:
1. Revoke the token via @BotFather
2. Generate a new token
3. Update the token in Vercel environment variables
4. Redeploy the application

### Webhook URL
The webhook URL should be kept secret. If exposed:
1. Deploy a new version (generates new URL)
2. Update the webhook with Telegram
3. Monitor logs for unauthorized requests

### User Input
All user input is sanitized before:
- Sending to external APIs
- Storing in Bitrix24
- Logging to console

### Rate Limiting
The bot relies on Telegram's built-in rate limiting. For additional protection:
- Monitor Vercel function invocations
- Set up alerts for unusual activity
- Consider implementing custom rate limiting for specific commands

## Security Updates

Security updates will be released as PATCH versions (e.g., 1.0.x → 1.0.y) and announced via:
- GitHub Security Advisories
- Release notes
- CHANGELOG.md

Subscribe to repository notifications to stay informed.

## Disclosure Policy

- Security issues will be disclosed after a fix is released
- We follow responsible disclosure practices
- Critical vulnerabilities will be patched within 7 days
- Non-critical issues will be patched in the next regular release

## Contact

For security concerns, create a private security advisory on GitHub or contact maintainers through GitHub Issues (mark as security-related).

---

Thank you for helping keep Tokobot and its users safe! 🔒

