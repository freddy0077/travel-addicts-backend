#!/bin/bash

# Travel Addicts Backend Docker Management Script
# Usage: ./docker.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Show help
show_help() {
    echo "Travel Addicts Backend Docker Management"
    echo ""
    echo "Usage: ./docker.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev           Start development environment (database only)"
    echo "  dev-full      Start full development environment"
    echo "  prod          Start production environment"
    echo "  stop          Stop all services"
    echo "  restart       Restart all services"
    echo "  logs          Show logs for all services"
    echo "  logs-backend  Show backend logs only"
    echo "  migrate       Run database migrations"
    echo "  seed          Seed database with initial data"
    echo "  reset-db      Reset database (WARNING: destroys all data)"
    echo "  studio        Open Prisma Studio"
    echo "  build         Build Docker images"
    echo "  clean         Clean up Docker resources"
    echo "  status        Show service status"
    echo "  backup        Create database backup"
    echo "  restore       Restore database from backup"
    echo "  setup         Initial setup (copy env files)"
    echo "  health        Check service health"
    echo "  help          Show this help message"
}

# Setup environment files
setup_env() {
    print_status "Setting up environment files..."
    
    if [ ! -f .env.local ]; then
        cp .env.docker .env.local
        print_success "Created .env.local from template"
        print_warning "Please edit .env.local with your actual configuration values"
    else
        print_warning ".env.local already exists, skipping..."
    fi
}

# Start development environment (database only)
start_dev() {
    print_status "Starting development environment (database only)..."
    docker-compose -f docker-compose.dev.yml up postgres redis -d
    print_success "Development database services started"
    print_status "You can now run 'npm run dev' locally"
}

# Start full development environment
start_dev_full() {
    print_status "Starting full development environment..."
    docker-compose -f docker-compose.dev.yml up -d
    print_success "Full development environment started"
}

# Start production environment
start_prod() {
    print_status "Starting production environment..."
    docker-compose up -d
    print_success "Production environment started"
}

# Stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    print_success "All services stopped"
}

# Restart services
restart_services() {
    print_status "Restarting services..."
    stop_services
    sleep 2
    start_prod
}

# Show logs
show_logs() {
    docker-compose logs -f
}

# Show backend logs only
show_backend_logs() {
    docker-compose logs -f backend
}

# Run migrations
run_migrations() {
    print_status "Running database migrations..."
    docker-compose run --rm migrate
    print_success "Database migrations completed"
}

# Seed database
seed_database() {
    print_status "Seeding database..."
    docker-compose exec backend npx prisma db seed
    print_success "Database seeded successfully"
}

# Reset database
reset_database() {
    print_warning "This will destroy all data in the database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Resetting database..."
        docker-compose exec backend npx prisma migrate reset --force
        print_success "Database reset completed"
    else
        print_status "Database reset cancelled"
    fi
}

# Open Prisma Studio
open_studio() {
    print_status "Opening Prisma Studio..."
    docker-compose --profile tools up prisma-studio -d
    print_success "Prisma Studio available at http://localhost:5555"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    docker-compose build
    print_success "Docker images built successfully"
}

# Clean up Docker resources
clean_docker() {
    print_status "Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f
    print_success "Docker cleanup completed"
}

# Show service status
show_status() {
    print_status "Service Status:"
    docker-compose ps
    echo ""
    print_status "Development Service Status:"
    docker-compose -f docker-compose.dev.yml ps
}

# Create database backup
backup_database() {
    print_status "Creating database backup..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose exec postgres pg_dump -U travel_user travel_addicts > "$BACKUP_FILE"
    print_success "Database backup created: $BACKUP_FILE"
}

# Restore database from backup
restore_database() {
    if [ -z "$2" ]; then
        print_error "Please specify backup file: ./docker.sh restore backup_file.sql"
        exit 1
    fi
    
    BACKUP_FILE="$2"
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
    
    print_warning "This will overwrite the current database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restoring database from $BACKUP_FILE..."
        docker-compose exec -T postgres psql -U travel_user travel_addicts < "$BACKUP_FILE"
        print_success "Database restored successfully"
    else
        print_status "Database restore cancelled"
    fi
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Check backend
    if curl -f http://localhost:4000/graphql > /dev/null 2>&1; then
        print_success "Backend API is healthy"
    else
        print_error "Backend API is not responding"
    fi
    
    # Check database
    if docker-compose exec postgres pg_isready -U travel_user > /dev/null 2>&1; then
        print_success "Database is healthy"
    else
        print_error "Database is not responding"
    fi
    
    # Check Redis
    if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is healthy"
    else
        print_error "Redis is not responding"
    fi
}

# Main script logic
main() {
    check_docker
    
    case "$1" in
        "dev")
            start_dev
            ;;
        "dev-full")
            start_dev_full
            ;;
        "prod")
            start_prod
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "logs")
            show_logs
            ;;
        "logs-backend")
            show_backend_logs
            ;;
        "migrate")
            run_migrations
            ;;
        "seed")
            seed_database
            ;;
        "reset-db")
            reset_database
            ;;
        "studio")
            open_studio
            ;;
        "build")
            build_images
            ;;
        "clean")
            clean_docker
            ;;
        "status")
            show_status
            ;;
        "backup")
            backup_database
            ;;
        "restore")
            restore_database "$@"
            ;;
        "setup")
            setup_env
            ;;
        "health")
            check_health
            ;;
        "help"|"")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
