# 🍕 Pizza Order Management System

A comprehensive fullstack application for managing pizza restaurant orders with real-time updates, built with modern technologies and best practices.

## 🚀 Quick Start with Docker

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Git** (to clone the repository)

### 1. Clone and Start
```bash
# Clone the repository
git clone <repository-url>
cd tictuk

# Start all services with Docker
docker compose up -d

# Wait for services to be ready (about 30 seconds)
docker compose ps
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/health
- **Orders API**: http://localhost:3001/api/orders
- **Database**: localhost:5432 (PostgreSQL)
- **Redis**: localhost:6379

## 🎯 Features

### ✅ **Core Requirements (All Implemented)**
- **Order Management**: Complete CRUD operations for pizza orders
- **300 Sample Orders**: Database pre-seeded with realistic data
- **Real-time Updates**: WebSocket integration for live order updates
- **Order Status Tracking**: 5 statuses (Received → Preparing → Ready → En-Route → Delivered)
- **Geographic Location**: Latitude/longitude support for delivery tracking
- **SubItems Management**: Pizza, drinks, salads, desserts, appetizers
- **Sorting & Filtering**: Multiple sort options and filters
- **Configurable Display**: 1-4 orders per page setting
- **Data Persistence**: Redux state management with persistence

### 🌟 **Bonus Features (All Implemented)**
- **🗺️ Interactive Map View**: Geographic visualization of orders
- **🌍 RTL Language Support**: Hebrew and Arabic language support
- **📱 Responsive Design**: Mobile-friendly interface
- **🎨 Modern UI**: Material-UI with professional design
- **⚡ Real-time Updates**: Live order status changes
- **🔧 Configuration Management**: Environment-based settings

## 🏗️ Technical Architecture

### **Backend (Node.js + TypeScript)**
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Real-time**: WebSocket support
- **Security**: Rate limiting, CORS, Helmet
- **Performance**: Connection pooling, caching
- **API**: RESTful endpoints with comprehensive error handling

### **Frontend (React + TypeScript)**
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **Real-time**: WebSocket client integration
- **Responsive**: Mobile-first design

### **Database & Infrastructure**
- **Database**: PostgreSQL with optimized schema
- **Caching**: Redis for performance
- **Containerization**: Docker with multi-stage builds
- **Development**: Hot reloading and debugging support

## 📁 Project Structure

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
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml     # Docker configuration
├── Makefile              # Build automation
└── README.md
```

## 🐳 Docker Setup

### **Single Command Setup**
```bash
# Start everything
docker compose up -d

# View logs
docker compose logs -f

# Stop everything
docker compose down
```

### **Individual Services**
```bash
# Start only database
docker compose up database redis -d

# Start backend
docker compose up backend -d

# Start frontend
docker compose up frontend -d
```

### **Development Mode**
```bash
# Development with hot reloading
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## 🛠️ Local Development

### **Prerequisites**
- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **PostgreSQL** (or use Docker for database)

### **Setup Steps**

1. **Environment Configuration:**
   ```bash
   # Copy environment files
   cp server/env.development server/.env
   cp client/env.development client/.env
   ```

2. **Install Dependencies:**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. **Database Setup:**
   ```bash
   # Start database (Docker)
   docker compose up database -d
   
   # Or use local PostgreSQL
   # Create database: pizza_orders
   # User: pizza_user, Password: pizza_password
   ```

4. **Start Development:**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

## 🔧 Configuration

### **Environment Variables**
All configuration is managed through environment files:

- `server/.env` - Backend configuration
- `client/.env` - Frontend configuration

### **Key Settings**
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pizza_orders
DB_USER=pizza_user
DB_PASSWORD=pizza_password

# Server
PORT=3001
NODE_ENV=development

# Frontend
REACT_APP_API_BASE_URL=http://localhost:3001
```

## 📊 API Endpoints

### **Orders API**
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### **Health & Monitoring**
- `GET /health` - Health check
- `GET /api/orders/statistics` - Order statistics

## 🌍 Internationalization

### **Supported Languages**
- **English** (en) - Default
- **Hebrew** (he) - RTL support
- **Arabic** (ar) - RTL support

### **RTL Features**
- Automatic text direction switching
- RTL-optimized layouts
- Right-to-left navigation
- Proper text alignment

## 🗺️ Map View Features

### **Interactive Map**
- Geographic visualization of orders
- Color-coded status indicators
- Click-to-select functionality
- Responsive map controls
- Order clustering and grouping

### **Map Controls**
- Zoom and pan functionality
- Status legend
- Order tooltips
- Geographic bounds calculation

## 🚀 Production Deployment

### **Docker Production Build**
```bash
# Build production images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Deploy production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### **Environment Setup**
```bash
# Production environment
NODE_ENV=production
DB_HOST=your-db-host
DB_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
```

## 🧪 Testing

### **Run Tests**
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### **Health Checks**
```bash
# Check API health
curl http://localhost:3001/health

# Check database connection
curl http://localhost:3001/api/orders
```

## 📈 Performance

### **Optimizations**
- Database indexing for fast queries
- Connection pooling
- Redis caching
- Optimized Docker images
- Code splitting and lazy loading
- Material-UI tree shaking

### **Monitoring**
- Request logging
- Performance metrics
- Error tracking
- Health checks

## 🔒 Security

### **Implemented Security Features**
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention
- XSS protection

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues, please open an issue in the repository.

---

**Built with ❤️ using modern web technologies**