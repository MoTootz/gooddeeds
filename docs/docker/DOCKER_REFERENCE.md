# Docker Configuration Reference

## File Structure

```
gooddeeds/
├── Dockerfile                    # Production build
├── Dockerfile.dev               # Development build
├── docker-compose.yml           # Main orchestration
├── docker-compose.dev.yml       # Dev environment overrides
├── docker-compose.prod.yml      # Prod environment overrides
├── .dockerignore                # Build exclusions
├── .env.docker                  # Environment template
├── .env.docker.local            # Your local config (create this)
│
├── init-docker.sh              # Linux/Mac setup script
├── init-docker.bat             # Windows setup script
│
├── DOCKER_README.md            # Quick reference
├── DOCKER_GUIDE.md             # Comprehensive guide
├── CONTAINERIZATION_COMPLETE.md # This summary
│
└── [other project files...]
```

## Configuration Options

### Environment Variables

| Variable | Default | Purpose | Env |
|----------|---------|---------|-----|
| `DB_USER` | gooddeeds_user | Database user | docker-compose |
| `DB_PASSWORD` | gooddeeds_password | Database password | docker-compose |
| `DB_NAME` | gooddeeds | Database name | docker-compose |
| `DATABASE_URL` | auto-generated | Full connection string | app |
| `NODE_ENV` | production | Runtime environment | app |
| `NEXTAUTH_SECRET` | required | Session encryption | app |
| `JWT_SECRET` | required | JWT signing | app |
| `NEXTAUTH_URL` | http://localhost:3000 | App URL | app |

## Docker Commands Quick Reference

### Basic Operations
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose stop

# Start stopped services
docker-compose start

# Restart services
docker-compose restart

# Remove containers/volumes
docker-compose down -v

# View status
docker-compose ps

# View logs
docker-compose logs -f [service]
```

### Development
```bash
# Use dev overrides
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Access app shell
docker-compose exec app sh

# Access database shell
docker-compose exec postgres psql -U gooddeeds_user -d gooddeeds

# View Prisma Studio
docker-compose exec app npx prisma studio

# Rebuild after code changes
docker-compose up -d --build
```

### Database Operations
```bash
# Check migrations
docker-compose exec app npx prisma migrate status

# Create migration
docker-compose exec app npx prisma migrate dev --name migration_name

# Reset database
docker-compose exec app npx prisma migrate reset

# Backup database
docker-compose exec postgres pg_dump -U gooddeeds_user gooddeeds > backup.sql

# Restore database
docker-compose exec postgres psql -U gooddeeds_user gooddeeds < backup.sql
```

### Production
```bash
# Use prod overrides
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Monitor resources
docker stats

# View disk usage
docker system df

# Clean up unused resources
docker system prune -a --volumes
```

## Port Mappings

| Service | Internal | External | Notes |
|---------|----------|----------|-------|
| Web App | 3000 | 3000 | Always exposed |
| Database | 5432 | 5432 | Dev only (exposed in dev.yml) |

## Volume Mappings

| Volume | Mount Point | Purpose | Persistence |
|--------|------------|---------|-------------|
| `postgres_data` | `/var/lib/postgresql/data` | Database storage | Persistent |
| Current dir | `/app` | Source code (dev only) | Temporary |

## Network Configuration

```
┌─────────────────────────────────────────┐
│ gooddeeds-network (bridge)              │
├─────────────────────────────────────────┤
│                                         │
│ ┌──────────────────┐  ┌──────────────┐ │
│ │   gooddeeds-app  │  │ gooddeeds-db │ │
│ │   (app service)  │  │ (db service) │ │
│ │ 0.0.0.0:3000 <--┼--┼--> postgres  │ │
│ └──────────────────┘  └──────────────┘ │
│                                         │
└─────────────────────────────────────────┘
         ↓
    Host Network
```

**Service Discovery**: Services can communicate using service names:
- App → Database: `postgresql://user:pass@postgres:5432/gooddeeds`
- No need for IP addresses - Docker DNS handles it

## Docker Compose Override Examples

### Custom Port
```yaml
# docker-compose.override.yml
services:
  app:
    ports:
      - "8080:3000"
```

### Additional Volume Mount
```yaml
# docker-compose.override.yml
services:
  app:
    volumes:
      - ./logs:/app/logs
```

### Environment Variable Override
```yaml
# docker-compose.override.yml
services:
  app:
    environment:
      NODE_ENV: development
      DEBUG: 'nextjs:*'
```

## Health Check Configuration

### App Health Check
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**States**:
- `starting` - Initial 40 seconds
- `healthy` - Endpoint returns 200
- `unhealthy` - Retries exceeded

### Database Health Check
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U gooddeeds_user"]
  interval: 10s
  timeout: 5s
  retries: 5
```

## Dockerfile Build Stages

```dockerfile
# Stage 1: Builder (temporary)
FROM node:18-alpine AS builder
  - Install dependencies
  - Generate Prisma client
  - Build Next.js app
  - Size: ~1.5GB

# Stage 2: Runtime (final image)
FROM node:18-alpine
  - Copy only production files
  - Install production deps
  - Run as non-root user
  - Size: ~400MB (88% smaller!)
```

## Docker Compose Service Dependencies

```yaml
services:
  app:
    depends_on:
      postgres:
        condition: service_healthy
```

**Ensures**:
1. PostgreSQL container starts first
2. App waits for database health check to pass
3. App starts only when database is ready

## Logging Configuration

### Default (Console)
```bash
docker-compose logs -f app
docker-compose logs --tail=100 app
docker-compose logs --follow --timestamps app
```

### Production JSON Logging
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "50m"
    max-file: "10"
    labels: "service=gooddeeds-app"
```

## Resource Limits (Production)

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'              # Max 2 CPU cores
          memory: 1G             # Max 1GB RAM
        reservations:
          cpus: '1'              # Reserve 1 CPU
          memory: 512M           # Reserve 512MB
```

## Security Checklist

- [ ] Change `DB_PASSWORD`
- [ ] Generate new `NEXTAUTH_SECRET`
- [ ] Generate new `JWT_SECRET`
- [ ] Set `NEXTAUTH_URL` to your domain
- [ ] Don't expose database port in production
- [ ] Use environment files (.env.docker.local)
- [ ] Never commit secrets to git
- [ ] Enable HTTPS in production
- [ ] Use strong database passwords
- [ ] Keep base images updated

## Troubleshooting Decision Tree

```
Issue: Container won't start
├─ Check logs: docker-compose logs app
├─ If build failed: docker-compose build --no-cache
└─ If startup failed: docker-compose logs postgres

Issue: Can't connect to database
├─ Check postgres health: docker-compose ps
├─ Check connection string: docker-compose exec app env | grep DATABASE_URL
├─ Test manually: docker-compose exec postgres psql -U gooddeeds_user -d gooddeeds
└─ Check network: docker-compose exec app curl postgres:5432

Issue: Port already in use
├─ Find process: lsof -i :3000
├─ Change in docker-compose.yml: ports: ["8080:3000"]
└─ Restart: docker-compose restart

Issue: Out of space
├─ Check usage: docker system df
├─ Clean images: docker image prune
├─ Clean volumes: docker volume prune
└─ Deep clean: docker system prune -a --volumes
```

## Performance Tips

1. **Faster Builds**
   - Use `.dockerignore` to exclude files
   - Order Dockerfile commands by change frequency
   - Leverage layer caching

2. **Smaller Images**
   - Use Alpine Linux base
   - Multi-stage builds
   - Remove dev dependencies

3. **Faster Runtime**
   - Health checks detect failures early
   - Resource limits prevent runaway processes
   - Network optimization with bridge network

4. **Better Monitoring**
   - Enable health checks
   - Configure log rotation
   - Track resource usage

## Integration Examples

### GitHub Actions
```yaml
- uses: docker/build-push-action@v4
  with:
    context: .
    push: true
    tags: myregistry/gooddeeds:${{ github.sha }}
```

### Docker Hub
```bash
docker tag gooddeeds-app:latest username/gooddeeds:latest
docker push username/gooddeeds:latest
```

### Kubernetes
```yaml
image: gooddeeds:latest
ports:
  - containerPort: 3000
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: url
```

---

**Quick Links**:
- 📖 [DOCKER_README.md](./DOCKER_README.md) - Quick start
- 📚 [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Complete guide
- 🔗 [Docker Documentation](https://docs.docker.com/)
