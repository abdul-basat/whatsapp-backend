# WhatsApp SaaS Backend

Multi-tenant backend service for managing WhatsApp Web sessions via WPPConnect. Built with Node.js, Express, and Docker.

## Features

- 🔐 Per-user WhatsApp session isolation
- 🔄 Supports WPPConnect (primary) and Baileys (legacy) drivers
- 🚀 Containerized with Docker for easy deployment
- 🔄 WebSocket and REST API support
- 📱 QR code-based authentication

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Redis (for session storage and rate limiting)

### Redis Installation & Troubleshooting (DigitalOcean/Ubuntu)

If you are running the backend on a DigitalOcean droplet or Ubuntu server and encounter Redis connection errors (e.g., `ECONNREFUSED 127.0.0.1:6379`), follow these steps:

1. **Install Redis:**
   ```bash
   sudo apt update
   sudo apt install redis-server
   ```
2. **Start Redis:**
   ```bash
   sudo systemctl start redis-server
   ```
3. **Enable Redis on boot:**
   ```bash
   sudo systemctl enable redis-server
   ```
4. **Check Redis status:**
   ```bash
   sudo systemctl status redis-server
   ```
   You should see `active (running)`.

#### Fixing Docker Repository Issues (if needed)
If you see errors about the Docker repository (e.g., `$Release` or missing Release file), edit the Docker repo source file:

```bash
sudo nano /etc/apt/sources.list.d/archive_uri-https_download_docker_com_linux_ubuntu-noble.list
```
Replace its contents with:
```
deb [arch=amd64] https://download.docker.com/linux/ubuntu noble stable
```
Then run:
```bash
sudo apt update
```

> **Note:** These are server/OS-level fixes and do not require any code changes or GitHub updates.

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your configuration:
   ```env
   # Server
   PORT=4000
   NODE_ENV=production
   
   # WPPConnect
   WPPCONNECT_URL=http://wppconnect:21465
   WPPCONNECT_TOKEN=your-secure-token
   
   # Redis
   REDIS_HOST=redis
   REDIS_PORT=6379
   REDIS_PASSWORD=your-redis-password
   
   # CORS (comma-separated origins)
   CORS_ORIGINS=https://your-frontend.com,http://localhost:5173
   ```

## Running with Docker

```bash
docker compose up -d
```

## API Endpoints

### Authentication
- `POST /auth/connect` - Start a new WhatsApp session
- `POST /auth/disconnect` - Terminate a session
- `GET /auth/status?userId=<uid>` - Check session status
- `GET /auth/qr?userId=<uid>` - Get QR code for pairing

### Messaging
- `POST /message/send` - Send WhatsApp messages
  ```json
  {
    "userId": "user123",
    "numbers": ["+1234567890"],
    "message": "Hello!"
  }
  ```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

## Deployment

### DigitalOcean Droplet
1. Clone repository to `/opt/whatsapp-saas`
2. Set up environment variables in `.env`
3. Start services:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

### Required Volumes
- `./sessions` - Stores WhatsApp session data
- `redis_data` - Redis data files
- `./certs` - SSL certificates (if using Let's Encrypt)

## Troubleshooting

1. **Session not persisting**
   - Ensure `./sessions` directory is writable by Docker
   - Check storage space on the host machine

2. **QR code not generating**
   - Verify WPPConnect container logs: `docker compose logs wppconnect`
   - Check if ports are properly exposed

3. **Redis connection issues**
   - Verify `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD` in `.env`
   - Check if Redis is running: `docker compose ps redis` or `sudo systemctl status redis-server`
   - If you see `ECONNREFUSED 127.0.0.1:6379` or similar, ensure Redis is installed and running as described above.

## Security

- 🔒 Always use HTTPS in production
- 🔑 Rotate `WPPCONNECT_TOKEN` and `REDIS_PASSWORD` regularly
- 🔄 Keep Docker images updated
- 🔍 Monitor logs for suspicious activity

## License

MIT
