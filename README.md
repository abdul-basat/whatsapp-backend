# WhatsApp Backend Service

A secure, scalable backend service for WhatsApp integration using WPPConnect, Node.js, and Docker.

## Features

- � Secure WebSocket connections with WPPConnect
- 🔄 Real-time QR code generation and session management
- 🚀 Containerized with Docker for easy deployment
- 🔄 Automatic SSL certificate management with Let's Encrypt
- � Redis-based session storage and caching
- 🔒 JWT-based authentication
- 🔄 WebSocket support for real-time updates

## Prerequisites

- Docker 20.10+ and Docker Compose 1.29+
- A domain name (for production)
- Ports 80 and 443 open on your server

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/whatsapp-backend.git
   cd whatsapp-backend
   ```

2. Copy the example environment file and update with your settings:
   ```bash
   cp .env.example .env
   nano .env  # Edit with your configuration
   ```

3. Make the deployment script executable:
   ```bash
   chmod +x deploy.sh
   ```

4. Deploy the application:
   ```bash
   ./deploy.sh
   ```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|:--------:|:-------:|
| `NODE_ENV` | Application environment | No | `production` |
| `PORT` | API server port | No | `3000` |
| `BASE_URL` | Base URL of your API | Yes | - |
| `DOMAINS` | Comma-separated list of domains for SSL | Yes (prod) | - |
| `EMAIL` | Email for Let's Encrypt | Yes (prod) | - |
| `WPPCONNECT_SECRET` | Secret key for WPPConnect | Yes | - |
| `WPPCONNECT_TOKEN` | Authentication token for WPPConnect | Yes | - |
| `REDIS_PASSWORD` | Password for Redis | Yes | - |
| `FIREBASE_SERVICE_ACCOUNT` | Base64-encoded Firebase service account | Yes | - |
| `CORS_ORIGINS` | Allowed CORS origins | Yes | - |

## Development

For local development, create a `.env` file with:

```env
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
DOMAINS=localhost
EMAIL=dev@example.com
```

Then start the services:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Invalidate session

### WhatsApp

- `GET /api/whatsapp/qr` - Get QR code for WhatsApp Web
- `POST /api/whatsapp/connect` - Start WhatsApp connection
- `POST /api/whatsapp/disconnect` - Disconnect WhatsApp
- `GET /api/whatsapp/status` - Get connection status
- `POST /api/whatsapp/send` - Send message

## Monitoring

View logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

Health check:
```
GET /health
```

## Security

- All API endpoints require authentication via JWT
- Rate limiting is enabled
- CORS is configured to only allow specified origins
- All traffic is encrypted with TLS 1.2/1.3

## Troubleshooting

### QR Code Not Showing
1. Check the browser console for errors
2. Verify the WebSocket connection in the Network tab
3. Check the backend logs for WPPConnect errors

### SSL Certificate Issues
1. Ensure port 80 is open for Let's Encrypt validation
2. Verify your domain's DNS records point to the server
3. Check the certbot logs for errors

## License

MIT License - See [LICENSE](LICENSE) for more information.
