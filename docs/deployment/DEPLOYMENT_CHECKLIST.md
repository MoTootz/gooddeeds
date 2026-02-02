# Docker Deployment Checklist

## Pre-Deployment

### ✅ Code Preparation
- [ ] All code committed to git
- [ ] No uncommitted changes
- [ ] Tests passing (`npm test`)
- [ ] Build successful locally (`npm run build`)
- [ ] No sensitive data in code

### ✅ Environment Configuration
- [ ] Created `.env.docker.local` from `.env.docker`
- [ ] Set strong `DB_PASSWORD`
- [ ] Generated new `NEXTAUTH_SECRET`
- [ ] Generated new `JWT_SECRET`
- [ ] Set correct `NEXTAUTH_URL`
- [ ] Verified all required variables set
- [ ] `.env.docker.local` NOT committed to git

### ✅ Docker Installation
- [ ] Docker installed and running
- [ ] Docker version: `docker --version` (20.10+)
- [ ] Docker Compose: `docker-compose --version` (1.29+)
- [ ] Can run: `docker ps` (no permission errors)

### ✅ Database Preparation
- [ ] PostgreSQL credentials configured
- [ ] Database name set
- [ ] Backup existing database (if migrating)
- [ ] Migration files reviewed
- [ ] Prisma schema up to date

## Deployment

### ✅ Build Phase
```bash
# 1. Clean build
docker-compose build --no-cache

# 2. Verify images created
docker images | grep gooddeeds
```
- [ ] Build succeeds without errors
- [ ] Images created: gooddeeds-app, postgres
- [ ] Image sizes reasonable

### ✅ Start Services
```bash
# 1. Start services
docker-compose up -d

# 2. Wait 10 seconds for database startup
sleep 10

# 3. Check service status
docker-compose ps
```
- [ ] All services show status `Up`
- [ ] No services in `Exit` or `Restarting` state
- [ ] Health status shows `(healthy)` when ready

### ✅ Database Initialization
```bash
# 1. Run migrations
docker-compose exec app npx prisma migrate deploy

# 2. Verify schema
docker-compose exec app npx prisma db seed
```
- [ ] Migrations run without errors
- [ ] No migration conflicts
- [ ] Database tables created
- [ ] Seed data inserted (if applicable)

### ✅ Application Verification
```bash
# 1. Check logs for errors
docker-compose logs app

# 2. Test health endpoint
curl http://localhost:3000

# 3. Test API endpoint
curl http://localhost:3000/api/posts
```
- [ ] No error messages in logs
- [ ] Application responds to HTTP requests
- [ ] API endpoints return data
- [ ] Database connectivity confirmed

### ✅ Security Verification
```bash
# 1. Verify non-root user
docker-compose exec app whoami
# Should output: nextjs

# 2. Check environment secrets
docker-compose exec app env | grep SECRET
# Should show encrypted/hashed values

# 3. Verify database isolation
docker-compose exec app curl postgres:5432
# Should fail (can't connect from inside container)
```
- [ ] App running as non-root user
- [ ] Secrets are set (not empty)
- [ ] Database not directly accessible from app

## Post-Deployment

### ✅ Monitoring Setup
```bash
# 1. Enable log monitoring
docker-compose logs -f app &

# 2. Monitor resources
docker stats

# 3. Check container health
watch -n 5 'docker-compose ps'
```
- [ ] Logs being captured
- [ ] Memory usage < 1GB
- [ ] CPU usage reasonable
- [ ] Health checks passing

### ✅ Backup Configuration
```bash
# 1. Create backup directory
mkdir -p backups

# 2. Initial backup
docker-compose exec postgres pg_dump -U gooddeeds_user gooddeeds > backups/initial-backup.sql

# 3. Set up automated backups
# (Add to crontab or task scheduler)
```
- [ ] Backup script created
- [ ] Initial backup successful
- [ ] Backup storage verified
- [ ] Restore procedure tested

### ✅ Documentation
- [ ] Deployment steps documented
- [ ] Emergency contacts listed
- [ ] Rollback procedure documented
- [ ] Team notified of deployment

### ✅ Performance Baseline
```bash
# Record baseline metrics
docker stats --no-stream

# Record startup time
time docker-compose up -d

# Record migration time
time docker-compose exec app npx prisma migrate deploy
```
- [ ] Startup time: _____ seconds
- [ ] Migration time: _____ seconds
- [ ] Memory usage: _____ MB
- [ ] CPU usage: _____%

## Ongoing Maintenance

### Daily
- [ ] Check `docker-compose ps` (all healthy)
- [ ] Review error logs: `docker-compose logs --since 24h app`
- [ ] Monitor disk usage: `docker system df`

### Weekly
- [ ] Review resource usage trends
- [ ] Check for updates: `docker-compose pull`
- [ ] Test backup and restore

### Monthly
- [ ] Update base images
  ```bash
  docker-compose pull
  docker-compose up -d
  ```
- [ ] Review and rotate secrets
- [ ] Test disaster recovery
- [ ] Review and optimize resource limits

### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Capacity planning
- [ ] Dependencies update

## Rollback Procedure

If deployment has critical issues:

### Immediate (< 5 minutes)
```bash
# 1. Stop new version
docker-compose stop app

# 2. Start previous version
git checkout previous-tag
docker-compose build
docker-compose up -d app
```
- [ ] Previous version running
- [ ] Services accessible
- [ ] Data integrity verified

### If Database Corrupted
```bash
# 1. Stop application
docker-compose stop app

# 2. Restore backup
docker-compose exec postgres psql -U gooddeeds_user gooddeeds < backups/pre-deployment-backup.sql

# 3. Start application
docker-compose start app
```
- [ ] Database restored from backup
- [ ] Application verified
- [ ] Data consistency checked

## Health Checks

### Application Health
```bash
# Should return 200 OK
curl -i http://localhost:3000

# API health
curl -i http://localhost:3000/api/posts
```

### Database Health
```bash
# Should return "healthy"
docker-compose ps postgres

# Direct test
docker-compose exec postgres pg_isready -U gooddeeds_user
```

### Network Health
```bash
# Verify connectivity
docker-compose exec app ping postgres
# Should work

# Check DNS
docker-compose exec app nslookup postgres
# Should resolve
```

## Issue Resolution Matrix

| Symptom | Check | Fix |
|---------|-------|-----|
| App won't start | `docker-compose logs app` | Check environment variables |
| DB connection fails | `docker-compose ps postgres` | Wait for health check, verify credentials |
| Slow performance | `docker stats` | Increase resource limits |
| Out of disk | `docker system df` | Clean up images/volumes |
| Port conflict | `lsof -i :3000` | Change port in docker-compose.yml |

## Emergency Contacts

- **DevOps Lead**: [Name] ([Email])
- **Database Admin**: [Name] ([Email])
- **On-Call Support**: [Phone] or [Slack Channel]

## Important Files

- Docker Compose: `docker-compose.yml`
- Environment: `.env.docker.local` (not in repo)
- Backups: `./backups/`
- Logs: Available via `docker-compose logs`
- Configuration: `./DOCKER_GUIDE.md`

## Sign-Off

- [ ] Deployment successful
- [ ] All checks passed
- [ ] Team notified
- [ ] Monitoring enabled
- [ ] Backup verified

**Deployed by**: ________________
**Date**: ________________
**Version**: ________________
**Notes**: 
```
_________________________________
_________________________________
_________________________________
```

---

**Keep this checklist for each deployment!**
