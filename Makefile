# Pizza Order Management System - Docker Management
# This Makefile provides easy commands for Docker operations

.PHONY: help build up down restart logs clean dev prod test

# Default target
help:
	@echo "🍕 Pizza Order Management System - Docker Commands"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-build    - Build development images"
	@echo "  make dev-logs     - Show development logs"
	@echo "  make dev-clean    - Clean development containers"
	@echo ""
	@echo "Production Commands:"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-build   - Build production images"
	@echo "  make prod-logs    - Show production logs"
	@echo "  make prod-clean   - Clean production containers"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-seed      - Seed database with sample data"
	@echo "  make db-reset     - Reset database (WARNING: destroys data)"
	@echo "  make db-backup    - Backup database"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make logs         - Show all logs"
	@echo "  make clean        - Clean all containers and volumes"
	@echo "  make status       - Show container status"
	@echo "  make shell-backend - Open shell in backend container"
	@echo "  make shell-frontend - Open shell in frontend container"

# Development Commands
dev:
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "✅ Development environment started!"
	@echo "📊 Frontend: http://localhost:3000"
	@echo "📊 Backend: http://localhost:3001"
	@echo "📊 Database: localhost:5432"
	@echo "📊 Adminer: http://localhost:8080"

dev-build:
	@echo "🔨 Building development images..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

dev-logs:
	@echo "📋 Showing development logs..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

dev-clean:
	@echo "🧹 Cleaning development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
	docker system prune -f

# Production Commands
prod:
	@echo "🚀 Starting production environment..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "✅ Production environment started!"

prod-build:
	@echo "🔨 Building production images..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

prod-logs:
	@echo "📋 Showing production logs..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

prod-clean:
	@echo "🧹 Cleaning production environment..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down -v
	docker system prune -f

# Database Commands
db-seed:
	@echo "🌱 Seeding database with sample data..."
	docker-compose exec backend npm run seed
	@echo "✅ Database seeded successfully!"

db-reset:
	@echo "⚠️  WARNING: This will destroy all database data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker-compose exec database psql -U pizza_user -d pizza_orders -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	docker-compose exec backend npm run seed
	@echo "✅ Database reset and seeded!"

db-backup:
	@echo "💾 Creating database backup..."
	docker-compose exec database pg_dump -U pizza_user pizza_orders > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Database backup created!"

# Utility Commands
logs:
	@echo "📋 Showing all logs..."
	docker-compose logs -f

clean:
	@echo "🧹 Cleaning all containers and volumes..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "✅ Cleanup completed!"

status:
	@echo "📊 Container Status:"
	docker-compose ps

shell-backend:
	@echo "🐚 Opening shell in backend container..."
	docker-compose exec backend /bin/sh

shell-frontend:
	@echo "🐚 Opening shell in frontend container..."
	docker-compose exec frontend /bin/sh

# Quick start for development
start: dev
	@echo "🎉 Development environment is ready!"

# Quick stop
stop:
	@echo "🛑 Stopping all services..."
	docker-compose down

# Restart services
restart:
	@echo "🔄 Restarting services..."
	docker-compose restart

# Show help
.DEFAULT_GOAL := help
