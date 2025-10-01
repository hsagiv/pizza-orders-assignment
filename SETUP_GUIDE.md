# 🍕 Pizza Order Management System - Complete Setup Guide

## 📋 Overview

This guide will walk you through setting up the complete Pizza Order Management System from scratch. The system includes:

- **Backend**: Node.js/TypeScript API with PostgreSQL database
- **Frontend**: React/TypeScript application with Material-UI
- **Database**: PostgreSQL with 300 sample orders
- **Real-time**: WebSocket support for live updates
- **Docker**: Complete containerization support

---

## 🚀 Quick Start (Recommended)

### Prerequisites

Before starting, ensure you have:
- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Docker** and **Docker Compose** (for database)
- **Git** (to clone the repository)

### Step 1: Clone and Setup

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd tictuk

# Setup environment files
make setup
# OR manually:
# cp server/env.development server/.env
# cp client/env.development client/.env
```

### Step 2: Start Database with Docker

```bash
# Start PostgreSQL database
docker-compose up database -d

# Wait for database to be ready (about 30 seconds)
# Check if database is running:
docker-compose ps
```

### Step 3: Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 4: Setup Database

```bash
# Go to server directory
cd ../server

# Seed the database with 300 sample orders
npm run seed
```

### Step 5: Start the Application

**Option A: Start Backend and Frontend Separately**

```bash
# Terminal 1 - Start Backend
cd server
npm run dev

# Terminal 2 - Start Frontend
cd client
npm run dev
```

**Option B: Use Docker Compose (Full Stack)**

```bash
# From project root
docker-compose up
```

### Step 6: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Orders API**: http://localhost:3001/api/orders

---

## 🔧 Detailed Setup Instructions

### Environment Configuration

The system uses environment variables for configuration. The setup script creates these files:

- `server/.env` - Backend configuration
- `client/.env` - Frontend configuration

**Important Environment Variables:**

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pizza_orders
DB_USER=pizza_user
DB_PASSWORD=pizza_password

# Server Configuration
SERVER_PORT=3001
SERVER_HOST=localhost
NODE_ENV=development

# Frontend Configuration
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_WS_URL=http://localhost:3001
```

### Database Setup

The system uses PostgreSQL with the following features:

1. **Automatic Schema Creation**: Database schema is created automatically
2. **Sample Data**: 300 realistic pizza orders with subitems
3. **Geographic Data**: Orders distributed across NYC area
4. **Status Tracking**: Orders with various statuses (Received, Preparing, Ready, En-Route, Delivered)

**Database Schema:**
- `orders` table: Main order information
- `sub_items` table: Individual items within orders
- **Indexes**: Optimized for performance
- **Triggers**: Automatic timestamp updates

### Backend Features

- **RESTful API**: Complete CRUD operations for orders
- **Real-time Updates**: WebSocket support for live order updates
- **Rate Limiting**: API protection against abuse
- **Health Checks**: System monitoring endpoints
- **Error Handling**: Comprehensive error management
- **Logging**: Request and performance logging

### Frontend Features

- **React Application**: Modern React with TypeScript
- **Material-UI**: Professional UI components
- **Redux Store**: State management for orders and settings
- **Real-time Updates**: WebSocket integration
- **Responsive Design**: Works on desktop and mobile
- **RTL Support**: Right-to-left language support

---

## 🐳 Docker Setup (Alternative)

### Full Docker Setup

```bash
# Start all services with Docker
docker-compose up

# Or start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Services

- **database**: PostgreSQL 15 with persistent data
- **redis**: Redis for caching and session storage
- **backend**: Node.js API server
- **frontend**: React application served by Nginx
- **nginx**: Reverse proxy (optional)

### Docker Commands

```bash
# Build all images
docker-compose build

# Start specific service
docker-compose up database

# View service status
docker-compose ps

# View logs for specific service
docker-compose logs backend

# Clean up (remove containers and volumes)
docker-compose down -v
```

---

## 🧪 Testing the System

### 1. Health Check

```bash
# Test backend health
curl http://localhost:3001/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45,
  "environment": "development",
  "version": "1.0.0"
}
```

### 2. API Testing

```bash
# Get all orders
curl http://localhost:3001/api/orders

# Get orders by status
curl http://localhost:3001/api/orders/status/Received

# Get order statistics
curl http://localhost:3001/api/orders/statistics
```

### 3. Frontend Testing

1. Open http://localhost:3000
2. You should see the pizza order management interface
3. Orders should load automatically
4. Try changing order status
5. Test sorting and filtering

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

**Problem**: Backend can't connect to database
**Solution**:
```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart database

# Check database logs
docker-compose logs database
```

#### 2. Port Already in Use

**Problem**: Port 3000 or 3001 already in use
**Solution**:
```bash
# Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### 3. Environment File Issues

**Problem**: Missing .env files
**Solution**:
```bash
# Recreate environment files
make setup

# Or manually:
cp server/env.development server/.env
cp client/env.development client/.env
```

#### 4. Dependencies Issues

**Problem**: npm install fails
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

#### 5. TypeScript Compilation Errors

**Problem**: Build fails with TypeScript errors
**Solution**:
```bash
# Check TypeScript version
npx tsc --version

# Clean and rebuild
npm run build
```

### Logs and Debugging

#### Backend Logs
```bash
# View backend logs
cd server
npm run dev

# Or with Docker
docker-compose logs backend
```

#### Frontend Logs
```bash
# View frontend logs
cd client
npm run dev

# Or with Docker
docker-compose logs frontend
```

#### Database Logs
```bash
# View database logs
docker-compose logs database
```

---

## 📊 System Architecture

### Technology Stack

**Backend:**
- Node.js 18+ with TypeScript
- Express.js for REST API
- TypeORM for database operations
- PostgreSQL for data storage
- Socket.io for WebSocket support
- Redis for caching

**Frontend:**
- React 18 with TypeScript
- Material-UI for components
- Redux Toolkit for state management
- Vite for build tooling
- Axios for API calls

**Database:**
- PostgreSQL 15
- UUID primary keys
- Proper indexing for performance
- Foreign key relationships
- Automatic timestamps

### File Structure

```
tictuk/
├── server/                 # Backend application
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # API controllers
│   │   ├── database/      # Database setup and seeding
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # TypeORM entities
│   │   ├── repositories/  # Data access layer
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── websocket/     # WebSocket handlers
│   ├── package.json
│   └── Dockerfile
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/         # Redux store
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml     # Docker configuration
├── Makefile              # Build automation
└── README.md
```

---

## 🎯 Features Overview

### Order Management
- ✅ Create, read, update, delete orders
- ✅ Order status tracking (Received → Preparing → Ready → En-Route → Delivered)
- ✅ Geographic location support (latitude/longitude)
- ✅ Sub-items management (pizza, drinks, salads, etc.)
- ✅ Real-time status updates

### User Interface
- ✅ Modern, responsive design
- ✅ Material-UI components
- ✅ Dark/light theme support
- ✅ RTL language support
- ✅ Mobile-friendly interface

### Performance
- ✅ Database indexing for fast queries
- ✅ Connection pooling
- ✅ Rate limiting
- ✅ Caching with Redis
- ✅ Optimized Docker images

### Development
- ✅ TypeScript for type safety
- ✅ ESLint and Prettier for code quality
- ✅ Hot reloading for development
- ✅ Comprehensive error handling
- ✅ Health check endpoints

---

## 🚀 Production Deployment

### Environment Variables for Production

```bash
# Database (Production)
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=pizza_orders_prod
DB_USER=pizza_user_prod
DB_PASSWORD=secure-password

# Server (Production)
NODE_ENV=production
SERVER_PORT=3001
SERVER_HOST=0.0.0.0

# Security
JWT_SECRET=your-jwt-secret
BCRYPT_ROUNDS=12
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### SSL/HTTPS Setup

1. Place SSL certificates in `nginx/ssl/`
2. Update `nginx/nginx.prod.conf` with certificate paths
3. Use `docker-compose.prod.yml` for HTTPS configuration

---

## 📞 Support

If you encounter any issues:

1. **Check the logs** for error messages
2. **Verify environment variables** are set correctly
3. **Ensure all services are running** (database, backend, frontend)
4. **Check port availability** (3000, 3001, 5432)
5. **Review the troubleshooting section** above

### Quick Health Check

```bash
# Check all services
curl http://localhost:3001/health
curl http://localhost:3000
docker-compose ps
```

---

## 🎉 Success!

Once everything is running, you should see:

- ✅ **Frontend**: Beautiful pizza order management interface at http://localhost:3000
- ✅ **Backend**: API responding at http://localhost:3001
- ✅ **Database**: 300 sample orders loaded and ready
- ✅ **Real-time**: WebSocket connections working
- ✅ **Health**: All services reporting healthy status

**Enjoy your Pizza Order Management System! 🍕**
