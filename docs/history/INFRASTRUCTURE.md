# Infrastructure Setup Guide

## 🚀 Quick Start

```bash
# Run automated setup
./scripts/setup.sh

# Generate strong JWT secret
npm run security:generate-secret

# Test health check
npm run health:check

# Run backup
npm run backup
```

## 📋 What's Been Implemented

### ✅ Security
- [x] Security headers (X-Frame-Options, CSP, etc.)
- [x] Rate limiting on upload endpoint
- [x] File extension validation
- [x] JWT secret strength validation
- [x] Responsible disclosure policy (SECURITY.md)
- [x] security.txt for vulnerability reporting
- [x] Automated security audits (GitHub Actions)

### ✅ Monitoring
- [x] Health check endpoint (`/api/health`)
- [x] Metrics endpoint (`/api/metrics`)
- [x] Structured logging (`src/lib/logger.ts`)
- [x] Performance measurement utilities

### ✅ Reliability
- [x] Automated backup script
- [x] Cache layer implementation
- [x] Error tracking integration (Sentry-ready)
- [x] Graceful error handling

### ✅ DevOps
- [x] CI/CD pipeline (GitHub Actions)
- [x] Security scanning workflow
- [x] Build automation
- [x] Secret generation tools

## 🔧 Configuration

### Environment Variables

Required in `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."

# Security (generate with: npm run security:generate-secret)
JWT_SECRET="your-64-char-secret-here"
ADMIN_PASSWORD="your-secure-password"

# Optional
SESSION_MAX_AGE="86400"
RATE_LIMIT_MAX="5"
RATE_LIMIT_WINDOW_MS="60000"
```

### GitHub Secrets

Add these to your repository secrets:

- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_PASSWORD`

## 📊 Monitoring Setup

### 1. UptimeRobot (Free)

1. Sign up at https://uptimerobot.com
2. Add HTTP(s) monitor:
   - URL: `https://douglasmitchell.info/api/health`
   - Interval: 5 minutes
3. Configure alerts to your email

### 2. Sentry (Optional)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add `SENTRY_DSN` to environment variables.

## 🔄 Automated Backups

### Setup Cron Job

```bash
crontab -e
```

Add this line:

```cron
0 2 * * * cd /path/to/project && npm run backup >> logs/backup.log 2>&1
```

This runs daily at 2 AM.

### Manual Backup

```bash
npm run backup
```

Backups are stored in `backups/` directory:
- `db-YYYY-MM-DD.sql` - Database backup
- `uploads-YYYY-MM-DD.tar.gz` - Uploaded files

Old backups (>30 days) are automatically cleaned.

## 🔒 Security Maintenance

### Rotate Secrets (Every 90 Days)

```bash
# 1. Generate new secret
npm run security:generate-secret

# 2. Update .env.local with new JWT_SECRET

# 3. Restart application (all users will need to log in again)
```

### Run Security Audit

```bash
npm run security:audit
```

### Check for Vulnerabilities

GitHub Actions runs security scans automatically on:
- Every push to main
- Every pull request
- Weekly on Sundays

## 📈 Performance Monitoring

### Check Metrics

```bash
npm run metrics
```

Returns:
- Database counts
- System uptime
- Memory usage
- Node version

### Cache Usage

The cache layer is automatically used in API routes. Clear cache:

```typescript
import { clearCache } from '@/lib/cache';

// Clear all cache
clearCache();

// Clear specific pattern
clearCache('gallery');
```

## 🚨 Incident Response

### Site Down

1. Check health endpoint: `curl https://douglasmitchell.info/api/health`
2. Check logs: `tail -f logs/server.log`
3. Check database: Neon dashboard
4. Restart: `npm start`

### Database Issues

1. Check connection: `npm run health:check`
2. Restore from backup:
   ```bash
   psql $DATABASE_URL < backups/db-YYYY-MM-DD.sql
   ```

### Lost Files

1. Restore from backup:
   ```bash
   tar -xzf backups/uploads-YYYY-MM-DD.tar.gz
   ```

## 📝 Logs

Logs are stored in `logs/` directory:
- `dev.log` - Development server logs
- `server.log` - Production server logs
- `backup.log` - Backup operation logs

## 🎯 Next Steps

### Immediate (Do Today)
- [ ] Run `./scripts/setup.sh`
- [ ] Set up UptimeRobot monitoring
- [ ] Configure cron job for backups
- [ ] Test backup and restore

### This Week
- [ ] Set up Sentry for error tracking
- [ ] Configure GitHub secrets
- [ ] Test CI/CD pipeline
- [ ] Review security audit findings

### This Month
- [ ] Add CDN for static assets
- [ ] Implement Redis for caching
- [ ] Add comprehensive tests
- [ ] Set up staging environment

## 📚 Documentation

- `docs/history/SECURITY_AUDIT.md` - Complete security assessment
- `docs/history/HONEST_ANSWERS.md` - Current state analysis
- `docs/history/SOLUTIONS.md` - Detailed implementation guides
- `SECURITY.md` - Vulnerability disclosure policy
- `AGENTS.md` - Project overview for AI agents

## 🆘 Support

For security issues: DouglasMitchell@ReliantAI.org

For general issues: Open a GitHub issue

## ✅ Health Check

Verify everything is working:

```bash
# 1. Health check
npm run health:check

# 2. Metrics
npm run metrics

# 3. Security audit
npm run security:audit

# 4. Backup
npm run backup
```

All should succeed without errors.
