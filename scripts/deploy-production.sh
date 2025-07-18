#!/bin/bash
set -e

# Load environment
source .env

# Update from git
echo "🔄 Updating code from Git..."
git pull origin main

# Build and start services
echo "🚀 Deploying services..."
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# Run database migrations (if any)
echo "💾 Running database migrations..."
docker compose -f docker-compose.prod.yml run --rm api \
  npx sequelize-cli db:migrate

# Restart services to apply changes
echo "🔄 Restarting services..."
docker compose -f docker-compose.prod.yml restart

echo "✅ Deployment complete!"
docker compose -f docker-compose.prod.yml ps
