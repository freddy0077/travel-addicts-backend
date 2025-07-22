# Travel Addicts Backend - Docker Setup

This guide will help you set up the Travel Addicts backend using Docker and Docker Compose.

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

### 1. Clone and Setup

```bash
# Navigate to the backend directory
cd travel-addicts-backend

# Copy environment template
cp .env.docker .env.local

# Edit .env.local with your actual values
nano .env.local
```

### 2. Start Services

```bash
# Start all services (production mode)
docker-compose up -d

# Or start with logs visible
docker-compose up

# Start only database for development
docker-compose up postgres redis -d
```

### 3. Run Migrations and Seed Data

```bash
# Run database migrations
docker-compose run --rm migrate

# Or manually run migrations
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

## 📋 Services Overview

### Core Services

| Service | Port | Description |
|---------|------|-------------|
| **backend** | 4000 | GraphQL API Server |
| **postgres** | 5432 | PostgreSQL Database |
| **redis** | 6379 | Redis Cache |

### Optional Services

| Service | Port | Description |
|---------|------|-------------|
| **prisma-studio** | 5555 | Database Management UI |
| **migrate** | - | One-time migration runner |

## 🛠️ Development Workflow

### Local Development with Docker

```bash
# Start database services only
docker-compose up postgres redis -d

# Run backend locally for development
npm run dev

# Access Prisma Studio
docker-compose --profile tools up prisma-studio -d
```

### Production Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Scale backend instances
docker-compose up -d --scale backend=3
```

## 🔧 Configuration

### Environment Variables

Update `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://travel_user:password@postgres:5432/travel_addicts"

# AWS S3 (Required for file uploads)
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_S3_BUCKET="your-bucket-name"

# Paystack (Required for payments)
PAYSTACK_SECRET_KEY="sk_test_your_key"
PAYSTACK_PUBLIC_KEY="pk_test_your_key"

# JWT Security
JWT_SECRET="your_super_secure_secret"
```

### Database Configuration

The PostgreSQL service is configured with:
- **Database**: `travel_addicts`
- **User**: `travel_user`
- **Password**: `travel_secure_password_2024`
- **Port**: `5432`

### Redis Configuration

Redis is available at:
- **Host**: `redis`
- **Port**: `6379`
- **URL**: `redis://redis:6379`

## 📊 Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# View health check logs
docker-compose logs backend | grep health
```

## 🗄️ Database Management

### Prisma Commands

```bash
# Generate Prisma client
docker-compose exec backend npx prisma generate

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npx prisma db seed

# Reset database
docker-compose exec backend npx prisma migrate reset

# Open Prisma Studio
docker-compose --profile tools up prisma-studio -d
```

### Database Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U travel_user travel_addicts > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U travel_user travel_addicts < backup.sql
```

## 🔍 Debugging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Connect to Containers

```bash
# Backend container
docker-compose exec backend sh

# Database container
docker-compose exec postgres psql -U travel_user travel_addicts

# Redis container
docker-compose exec redis redis-cli
```

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml
2. **Permission issues**: Check file ownership and Docker permissions
3. **Database connection**: Verify DATABASE_URL and postgres health
4. **Memory issues**: Increase Docker memory limits

## 🚀 Production Deployment

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml travel-addicts
```

### Kubernetes

```bash
# Generate Kubernetes manifests
docker-compose config > k8s-manifests.yml

# Apply to cluster
kubectl apply -f k8s-manifests.yml
```

## 📈 Monitoring

### Service Status

```bash
# Check all services
docker-compose ps

# Service health
curl http://localhost:4000/graphql

# Database status
docker-compose exec postgres pg_isready -U travel_user
```

### Performance Monitoring

- GraphQL Playground: `http://localhost:4000/graphql`
- Prisma Studio: `http://localhost:5555`
- Redis CLI: `docker-compose exec redis redis-cli monitor`

## 🔒 Security

### Production Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secrets
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS in production
- [ ] Set up proper firewall rules
- [ ] Regular security updates
- [ ] Monitor access logs

### Environment Security

```bash
# Use Docker secrets in production
echo "your_secret" | docker secret create jwt_secret -

# Reference in compose file
secrets:
  - jwt_secret
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [GraphQL Yoga Documentation](https://the-guild.dev/graphql/yoga-server)

## 🆘 Support

For issues and questions:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Check service health: `docker-compose ps`
4. Review this documentation
5. Contact the development team
