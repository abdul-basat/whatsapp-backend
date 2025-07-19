#!/bin/sh
set -e

# Create necessary directories
mkdir -p /var/www/certbot

# Replace environment variables in Nginx config
domain_list="${DOMAINS//, / }"
first_domain=$(echo "$domain_list" | awk '{print $1}')

# If we're not running in a CI environment and DOMAINS is set
if [ -n "$DOMAINS" ] && [ "$CI" != "true" ]; then
  echo "Setting up SSL for domains: $domain_list"
  
  # Create or renew the certificate
  certbot certonly --webroot -w /var/www/certbot \
    --email "${EMAIL}" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    --non-interactive \
    --expand \
    -d "${DOMAINS//, / -d }" \
    $CERTBOT_FLAGS
    
  # Update Nginx configuration with the correct domain
  sed -i "s/api.yourdomain.com/$first_domain/g" /etc/nginx/conf.d/app.conf
  
  # Create a cron job for certificate renewal
  echo "0 0,12 * * * root certbot renew --quiet --deploy-hook 'nginx -s reload'" > /etc/cron.d/certbot-renew
  chmod +x /etc/cron.d/certbot-renew
  
  # Start cron
  crond -b
  
  # Test Nginx configuration
  nginx -t
  
  # Reload Nginx to apply changes
  nginx -s reload || true
fi

# Execute the CMD from the Dockerfile (starts Nginx)
exec "$@"
