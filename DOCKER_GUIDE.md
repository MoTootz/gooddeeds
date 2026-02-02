# Docker Deployment Guide for GoodDeeds

This guide explains how to containerize and deploy the GoodDeeds application using Docker and Docker Compose.

## Prerequisites

- **Docker** (version 20.10+)
- **Docker Compose** (version 1.29+)
- Git

## Quick Start

### 1. Clone and Navigate to Project
```bash
cd /path/to/gooddeeds
```

### 2. Configure Environment Variables
```bash
# Copy the Docker environment template
cp .env.docker .env.docker.local

# Edit with your configuration
nano .env.docker.local
```

Key variables to update:
- `DB_PASSWORD` - Set a strong database password
- `NEXTAUTH_SECRET` - Generate a secure random string
- `JWT_SECRET` - Generate a secure random string
- `NEXTAUTH_URL` - Your application URL (http://localhost:3000 for local)

### 3. Build and Start Containers
```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f app
```

The application will be available at **http://localhost:3000**

### 4. Initialize Database
```bash
# Run Prisma migrations in the container
docker-compose exec app npx prisma migrate deploy

# Seed database (if applicable)
docker-compose exec app npm run seed
```

## Docker Compose Services

### PostgreSQL Database
- **Container**: `gooddeeds-db`
- **Port**: 5432 (internal only)
- **Volume**: `postgres_data` (persistent storage)
- **Health Check**: Every 10 seconds

### Next.js Application
- **Container**: `gooddeeds-app`
- **Port**: 3000
- **Environment**: Production
- **Health Check**: HTTP endpoint verification

## Common Docker Compose Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Stop Services
```bash
# Stop without removing
docker-compose stop

# Stop and remove
docker-compose down

# Remove volumes (CAUTION: deletes data)
docker-compose down -v
```

### Restart Services
```bash
docker-compose restart

# Specific service
docker-compose restart app
```

### Execute Commands in Container
```bash
# Access container shell
docker-compose exec app sh

# Run Prisma commands
docker-compose exec app npx prisma studio
docker-compose exec app npx prisma migrate status
docker-compose exec app npx prisma db push
```

### Rebuild Images
```bash
# Rebuild after code changes
docker-compose build

# Build without cache
docker-compose build --no-cache

# Rebuild and restart
docker-compose up -d --build
```

## Production Deployment

### 1. Security Configuration
```bash
# Generate strong secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update in docker-compose.yml or .env file:
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `DB_PASSWORD`

### 2. Database Backup
```bash
# Backup PostgreSQL data
docker-compose exec postgres pg_dump -U gooddeeds_user -d gooddeeds > backup.sql

# Restore from backup
docker-compose exec postgres psql -U gooddeeds_user -d gooddeeds < backup.sql
```

### 3. Environment-Specific Compose Files
```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. Scale Application (with load balancer)
For production with multiple app instances, use a reverse proxy (Nginx/Traefik):

```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app

  app:
    # ... app configuration
    deploy:
      replicas: 3
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs app

# Inspect container
docker-compose exec app ps aux

# Check network connectivity
docker-compose exec app curl postgres:5432
```

### Database Connection Issues
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Test database connection
docker-compose exec postgres psql -U gooddeeds_user -d gooddeeds -c "SELECT 1"

# Check DATABASE_URL environment variable
docker-compose exec app env | grep DATABASE_URL
```

### Out of Memory or Disk Space
```bash
# Clean up unused images and volumes
docker system prune -a --volumes

# Check disk usage
docker system df
```

### Port Already in Use
```bash
# Change port in docker-compose.yml
# ports:
#   - "3001:3000"  # Changed from 3000:3000

docker-compose up -d
```

## Docker Image Details

### Base Image
- Node.js 18 Alpine (lightweight, ~150MB)
- ~80MB final image size (optimized)

### Multi-stage Build
1. **Builder stage**: Installs dependencies, generates Prisma client, builds Next.js
2. **Production stage**: Only copies necessary files, runs as non-root user

### Security Features
- Non-root user (`nextjs:nodejs`)
- Signal handling with dumb-init
- Health checks enabled
- Minimal attack surface (Alpine Linux)

## Monitoring

### Health Status

## Prisma / OpenSSL compatibility

When using Alpine-based images (the Dockerfiles in this repository use Node.js Alpine), Prisma's native query engine requires a compatible OpenSSL library at build and runtime. If you encounter errors such as:

- "PrismaClientInitializationError: Unable to require(... libquery_engine-linux-musl.so.node)"
- "Error loading shared library libssl.so.1.1: No such file or directory"

Take these steps:

1. Ensure OpenSSL is installed in both the builder and production stages of the Dockerfile. Example:

```dockerfile
# in both builder and production stages
RUN apk add --no-cache openssl
```

2. Rebuild images without cache after changing system packages:

```bash
docker-compose build --no-cache
```

3. Re-run migrations and start services:

```bash
docker-compose up -d
docker-compose exec app npx prisma migrate deploy
```

4. If you switch to non-Alpine base images, make sure to install the appropriate libssl package for that distribution or use a Node image compatible with Prisma's engine binaries.

Adding OpenSSL in the Dockerfile resolves the shared library errors and allows Prisma's query engine to load correctly.
```bash
# Check container health
docker-compose ps

# Manual health check
curl http://localhost:3000
```

### Resource Usage
```bash
# Monitor CPU, memory, network
docker stats

# Specific container
docker stats gooddeeds-app
```

### Logs Rotation
Configure in docker-compose.yml:
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Network Configuration

### Internal Network
Services communicate via Docker network `gooddeeds-network`:
- App → Database: `postgresql://gooddeeds_user:password@postgres:5432/gooddeeds`
- External access: Port 3000 only

### External Access
```yaml
ports:
  - "3000:3000"  # Public port:container port
  - "5432:5432"  # Only enable for development!
```

## Performance Optimization

### 1. Reduce Image Size
```dockerfile
# Use alpine variants
FROM node:18-alpine

# Remove unnecessary files
RUN npm ci --only=production
```

### 2. Layer Caching
Arrange Dockerfile commands to maximize cache hits:
```dockerfile
COPY package*.json ./
RUN npm ci
COPY . .
```

### 3. Multi-stage Builds
Separate builder and runtime stages to exclude build tools.

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Docker Build and Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: myregistry/gooddeeds:latest
```

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker)

---

**Last Updated**: February 2, 2026
**Version**: 1.0
