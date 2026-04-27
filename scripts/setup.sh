#!/bin/bash

echo "🚀 Setting up production infrastructure..."
echo ""

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backups
mkdir -p logs
mkdir -p public/uploads/{images,gallery,journal,general}
touch public/uploads/{images,gallery,journal,general}/.gitkeep

# Check environment variables
echo ""
echo "🔍 Checking environment variables..."

if [ -z "$JWT_SECRET" ]; then
  echo "⚠️  JWT_SECRET not set. Generate one with: bun run secret:generate"
fi

if [ -z "$ADMIN_PASSWORD" ]; then
  echo "⚠️  ADMIN_PASSWORD not set"
fi

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set"
fi

# Run security audit
echo ""
echo "🔒 Running dependency audit..."
bun audit --audit-level=moderate || echo "⚠️  Security vulnerabilities found"

# Test database connection
echo ""
echo "🗄️  Testing database connection..."
bun run admin:check 2>/dev/null && echo "✅ Database connected" || echo "⚠️  Database connection failed (ensure DATABASE_URL is set)"

# Set up cron job for backups
echo ""
echo "⏰ Setting up automated backups..."
echo "Add this to your crontab (crontab -e):"
echo "0 2 * * * cd $(pwd) && bun run backup >> logs/backup.log 2>&1"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up monitoring at https://uptimerobot.com"
echo "2. Configure GitHub secrets for CI/CD"
echo "3. Set up cron job for daily backups"
echo "4. Review .env.example for required variables"
