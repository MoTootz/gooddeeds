# 🐳 Docker Setup for GoodDeeds

The GoodDeeds application is fully containerized with Docker and Docker Compose, making it easy to deploy across any environment.

## 📋 What's Included

- **Dockerfile** - Production-optimized multi-stage build
- **Dockerfile.dev** - Development image with hot reload
- **docker-compose.yml** - Main orchestration file
- **docker-compose.dev.yml** - Development overrides
- **docker-compose.prod.yml** - Production overrides
- **init-docker.sh / init-docker.bat** - Quick setup scripts
- **.dockerignore** - Excludes unnecessary files
- **.env.docker** - Docker environment template

## 🚀 Quick Start

### Windows (PowerShell)
```powershell
# Copy environment template
Copy-Item .env.docker .env.docker.local

# Run initialization script
.\init-docker.bat
```

### Linux/Mac
```bash
# Copy environment template
cp .env.docker .env.docker.local

# Make script executable
chmod +x init-docker.sh

# Run initialization script
./init-docker.sh
```

### Manual Setup
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Wait 10 seconds for database
sleep 10

# Run migrations
docker-compose exec app npx prisma migrate deploy

# View status
docker-compose ps
```

## 🔧 Configuration

### Environment Variables
Edit `.env.docker.local` before starting:

```env
# Database
DB_USER=gooddeeds_user
DB_PASSWORD=your_secure_password
DB_NAME=gooddeeds

# Security (Change these!)
NEXTAUTH_SECRET=your-secret-here
JWT_SECRET=your-jwt-secret-here

# Application
NODE_ENV=production
NEXTAUTH_URL=http://localhost:3000
```

For production, generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📚 Usage

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Access Services
```bash
# Web application
http://localhost:3000

# Database (development only - exposed in dev mode)
postgresql://gooddeeds_user:password@localhost:5432/gooddeeds

# Connect to database CLI
docker-compose exec postgres psql -U gooddeeds_user -d gooddeeds
```

### Manage Services
```bash
# Stop all services
docker-compose stop

# Start all services
docker-compose start

# Restart services
docker-compose restart

# Stop and remove containers/volumes
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build
```

### Database Commands
```bash
# View migrations
docker-compose exec app npx prisma migrate status

# Create new migration
docker-compose exec app npx prisma migrate dev --name migration_name

# View database with Studio
docker-compose exec app npx prisma studio

# Backup database
docker-compose exec postgres pg_dump -U gooddeeds_user gooddeeds > backup.sql

# Restore database
docker-compose exec postgres psql -U gooddeeds_user gooddeeds < backup.sql
```

## 🌍 Deployment Environments

### Development
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```
- Code hot-reload enabled
- Database exposed on port 5432
- Debug logging active

### Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
- Optimized builds
- Resource limits enforced
- Log rotation configured
- Health checks enabled

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│     Docker Container Network            │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────────┐  ┌──────────────┐  │
│  │   gooddeeds-   │  │ gooddeeds-db │  │
│  │      app       │──│ (PostgreSQL) │  │
│  │   (Next.js)    │  │              │  │
│  └────────────────┘  └──────────────┘  │
│       Port 3000        Port 5432        │
│                       (internal only)   │
│                                         │
└─────────────────────────────────────────┘
         ↓
    Port 3000 (public)
```

## 🔒 Security

### Features
- ✅ Non-root user execution
- ✅ Signal handling with dumb-init
- ✅ Health checks on all services
- ✅ Alpine Linux (minimal attack surface)
- ✅ Database runs in isolated network
- ✅ Secrets via environment variables

### Best Practices
1. **Change Default Secrets**: Update `NEXTAUTH_SECRET` and `JWT_SECRET`
2. **Strong DB Password**: Use a complex password for `DB_PASSWORD`
3. **Network Isolation**: Database not exposed by default (dev only)
4. **Regular Updates**: Keep base images updated

```bash
# Update images
docker-compose pull
docker-compose up -d
```

## 📈 Performance

### Image Sizes
- Node.js 18-Alpine: ~150MB
- Final app image: ~400MB (optimized)
- PostgreSQL 15-Alpine: ~250MB

### Optimization
- Multi-stage builds exclude dev dependencies
- Alpine Linux base reduces overhead
- Layer caching for faster rebuilds
- Health checks prevent cascading failures

## 🛠️ Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app

# View container state
docker-compose ps

# Inspect image
docker-compose exec app sh
```

### Database connection error
```bash
# Verify PostgreSQL is running
docker-compose logs postgres

# Test connection
docker-compose exec app node -e "
  const { Pool } = require('pg');
  const pool = new Pool();
  pool.query('SELECT 1', (err, res) => {
    console.log(err || 'Connected!');
    process.exit();
  });
"
```

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Change port in docker-compose.yml
# ports:
#   - "3001:3000"
```

### Out of memory/disk
```bash
# Clean unused resources
docker system prune -a --volumes

# Check usage
docker system df
```

## 📝 Dockerfile Explanation

### Production Build
```dockerfile
# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/.next ./.next
USER nextjs
CMD ["npm", "run", "start"]
```

**Benefits**:
- Smaller final image (excludes dev dependencies)
- Faster builds with layer caching
- Non-root user for security
- Only copies necessary files

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Docker
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: registry/gooddeeds:${{ github.sha }}
```

### Docker Hub / Registry
```bash
# Login to registry
docker login

# Tag image
docker tag gooddeeds-app:latest myusername/gooddeeds:latest

# Push image
docker push myusername/gooddeeds:latest
```

## 📚 Further Reading

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Detailed guide

## 💡 Tips

1. **Faster Builds**: Add `.dockerignore` entries to exclude unnecessary files
2. **Local Development**: Use `docker-compose.dev.yml` for hot reload
3. **Database Backup**: Regularly backup PostgreSQL data
4. **Health Checks**: Monitor `docker-compose ps` output
5. **Logs**: Check logs when debugging: `docker-compose logs -f`

---

**Need Help?** Check [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) for detailed documentation.
