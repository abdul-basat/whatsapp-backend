#!/bin/bash
set -e

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found. Please create one from .env.example"
  exit 1
fi

# Create necessary directories
mkdir -p certbot/www certbot/conf nginx/conf.d logs sessions

# Set proper permissions
chmod -R 755 certbot nginx logs sessions

# Generate self-signed certificates for development
if [ "$NODE_ENV" != "production" ]; then
  echo "Generating self-signed SSL certificate for development..."
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout certbot/conf/privkey.pem \
    -out certbot/conf/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Development/CN=localhost"
    
  # Create a dummy fullchain.pem
  cat certbot/conf/cert.pem > certbot/conf/fullchain.pem
  
  # Set development domains
  export DOMAINS=localhost
  export EMAIL=dev@example.com
  export CERTBOT_FLAGS="--staging --test-cert"
  
  # Update Nginx config for development
  sed -i 's/listen 443 ssl http2;/listen 443 ssl http2;\n    ssl_certificate \/etc\/letsencrypt\/live\/localhost\/fullchain.pem;\n    ssl_certificate_key \/etc\/letsencrypt\/live\/localhost\/privkey.pem;/' nginx/conf.d/app.conf
else
  echo "Production mode - using Let's Encrypt certificates"
  
  # Check if DOMAINS is set for production
  if [ -z "$DOMAINS" ]; then
    echo "Error: DOMAINS environment variable is required for production"
    exit 1
  fi
  
  if [ -z "$EMAIL" ]; then
    echo "Error: EMAIL environment variable is required for Let's Encrypt"
    exit 1
  fi
  
  # Update Nginx config with production domains
  sed -i "s/api.yourdomain.com/$DOMAINS/g" nginx/conf.d/app.conf
fi

# Build and start the containers
echo "Building and starting Docker containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d

echo "Waiting for services to start..."
sleep 10

# Check if services are running
if [ "$(docker ps -q -f name=saas-nginx)" ] && \
   [ "$(docker ps -q -f name=saas-api)" ] && \
   [ "$(docker ps -q -f name=saas-wppconnect)" ] && \
   [ "$(docker ps -q -f name=saas-redis)" ]; then
  echo ""
  echo "==============================================="
  echo "🚀 WhatsApp Backend is up and running!"
  echo ""
  echo "API URL: https://${DOMAINS%% *}"
  echo "WPPConnect: https://${DOMAINS%% *}/wppconnect"
  echo ""
  echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
  echo "To stop services: docker-compose -f docker-compose.prod.yml down"
  echo "==============================================="
else
  echo ""
  echo "⚠️  Some services failed to start. Checking logs..."
  echo ""
  docker-compose -f docker-compose.prod.yml logs --tail=50
  exit 1
fi
