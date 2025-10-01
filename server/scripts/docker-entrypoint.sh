#!/bin/sh
# Docker entrypoint script for backend service

set -e

# Function to handle shutdown signals
shutdown() {
    echo "🛑 Received shutdown signal, gracefully shutting down..."
    # Kill the main process
    kill -TERM "$child" 2>/dev/null
    # Wait for the process to exit
    wait "$child"
    echo "✅ Graceful shutdown completed"
    exit 0
}

# Set up signal handlers
trap shutdown SIGTERM SIGINT

# Function to wait for database
wait_for_database() {
    echo "⏳ Waiting for database to be ready..."
    
    # Extract database connection details from environment
    DB_HOST=${DB_HOST:-database}
    DB_PORT=${DB_PORT:-5432}
    DB_NAME=${DB_NAME:-pizza_orders}
    DB_USER=${DB_USER:-pizza_user}
    
    # Wait for database to be ready
    until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; do
        echo "⏳ Database is not ready yet, waiting..."
        sleep 2
    done
    
    echo "✅ Database is ready!"
}

# Function to run database migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    
    # Check if we need to run migrations
    if [ "$RUN_MIGRATIONS" = "true" ]; then
        echo "🔄 Running database setup..."
        npm run setup-db || echo "⚠️  Database setup failed, continuing..."
    fi
}

# Function to seed database
seed_database() {
    echo "🌱 Seeding database..."
    
    # Check if we need to seed the database
    if [ "$SEED_DATABASE" = "true" ]; then
        echo "🌱 Running database seed..."
        npm run seed || echo "⚠️  Database seeding failed, continuing..."
    fi
}

# Main execution
main() {
    echo "🚀 Starting Pizza Order Management System Backend..."
    
    # Wait for database if needed
    if [ "$WAIT_FOR_DB" = "true" ]; then
        wait_for_database
    fi
    
    # Run migrations if needed
    run_migrations
    
    # Seed database if needed
    seed_database
    
    echo "✅ Backend service is ready!"
    
    # Start the main application
    exec "$@" &
    child=$!
    
    # Wait for the main process
    wait "$child"
}

# Run main function with all arguments
main "$@"
