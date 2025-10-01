# Pizza Order Management System

A fullstack application for managing pizza restaurant orders with real-time updates.

## Project Structure

- `server/` - Node.js backend with TypeScript
- `client/` - React frontend with TypeScript
- `docker-compose.yml` - Multi-container setup

## Setup Instructions

### Quick Start

1. **Setup Environment Files:**
   ```bash
   make setup
   ```
   Or manually:
   ```bash
   cp server/env.development server/.env
   cp client/env.development client/.env
   ```

2. **Start Development Environment:**
   ```bash
   make dev
   ```

3. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Manual Setup

1. **Environment Configuration:**
   - Copy `server/env.development` to `server/.env`
   - Copy `client/env.development` to `client/.env`
   - Update values as needed for your environment

2. **Docker Setup:**
   ```bash
   # Development
   docker-compose -f docker-compose.yml -f docker-compose.override.yml up

   # Production
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
   ```

3. **Local Development:**
   ```bash
   # Backend
   cd server
   npm install
   npm run dev

   # Frontend
   cd client
   npm install
   npm run dev
   ```

## Features

- Real-time order management
- Order status tracking
- Sortable order lists
- Responsive design
- Docker support