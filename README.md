# 🍕 Pizza Order Management System

A comprehensive real-time pizza order management system built with modern web technologies, featuring real-time updates, interactive maps, and multi-language support.

## 🚀 Technologies Used

### Frontend
- **React 18.2.0** - Modern UI library with hooks and functional components
- **TypeScript 5.2.2** - Type-safe JavaScript with strict configuration
- **Redux Toolkit 2.0.1** - State management with RTK Query and async thunks
- **Material-UI 5.15.0** - React component library for consistent UI
- **Vite 5.0.8** - Fast build tool and development server
- **React Leaflet 4.2.1** - Interactive maps with OpenStreetMap
- **Socket.io Client 4.7.4** - Real-time WebSocket communication
- **Jest 29.7.0** - Unit testing framework
- **ESLint & Prettier** - Code quality and formatting

### Backend
- **Node.js 18+** - JavaScript runtime environment
- **Express.js 4.18.2** - Web application framework
- **TypeScript 5.3.2** - Type-safe server-side development
- **TypeORM 0.3.17** - Object-Relational Mapping for database operations
- **PostgreSQL 15** - Primary relational database
- **Redis 7** - In-memory data store for caching
- **Socket.io 4.7.4** - WebSocket server for real-time communication
- **Jest & Supertest** - API testing framework
- **Helmet & CORS** - Security middleware

### DevOps & Infrastructure
- **Docker & Docker Compose** - Containerization and orchestration
- **Nginx** - Reverse proxy and load balancer
- **PostgreSQL** - Production database
- **Redis** - Caching and session storage

## 📋 Features

### Core Functionality
- ✅ **Real-time Order Management** - Live updates via WebSocket
- ✅ **Order Status Tracking** - Pending, In Progress, Ready, Delivered, Cancelled
- ✅ **Interactive Order List** - Sortable, filterable, paginated
- ✅ **Status Updates** - Real-time status changes with instant UI updates
- ✅ **Order Details** - Complete order information with sub-items
- ✅ **Location Tracking** - GPS coordinates for delivery management

### Advanced Features
- 🗺️ **Interactive Map** - Visual order location display with Leaflet
- 🌍 **Multi-language Support** - RTL support for Hebrew/Arabic
- 📱 **Responsive Design** - Mobile-first responsive layout
- 🔄 **Auto-refresh** - Configurable polling intervals
- 🎨 **Status Color Coding** - Visual status indicators
- 📊 **Pagination** - Configurable items per page (1-4)
- 🔍 **Search & Filter** - Advanced order filtering
- ⚡ **Performance Optimized** - React.memo, useMemo, lazy loading


## 🏗️ Project Structure

```
tictuk/
├── 📁 client/                          # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/               # React Components
│   │   │   ├── OrderList.tsx          # Main order display component
│   │   │   ├── OrderItem.tsx          # Individual order component
│   │   │   ├── StatusBadge.tsx        # Status indicator component
│   │   │   ├── SimpleMap.tsx          # Interactive map component
│   │   │   ├── Header.tsx             # Application header
│   │   │   ├── LanguageSelector.tsx   # Language switcher
│   │   │   └── ErrorBoundary.tsx      # Error handling component
│   │   ├── 📁 hooks/                  # Custom React Hooks
│   │   │   └── useWebSocket.ts        # WebSocket connection hook
│   │   ├── 📁 store/                  # Redux Store
│   │   │   ├── 📁 slices/
│   │   │   │   ├── ordersSlice.ts     # Order state management
│   │   │   │   └── settingsSlice.ts   # App settings state
│   │   │   └── store.ts               # Store configuration
│   │   ├── 📁 types/                  # TypeScript Type Definitions
│   │   │   └── websocket.ts           # WebSocket event types
│   │   ├── 📁 utils/                  # Utility Functions
│   │   │   └── formatUtils.ts         # Data formatting utilities
│   │   ├── App.tsx                    # Main application component
│   │   └── main.tsx                   # Application entry point
│   ├── 📁 public/                     # Static assets
│   ├── 📁 scripts/                    # Build and deployment scripts
│   ├── package.json                   # Frontend dependencies
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── vite.config.ts                 # Vite build configuration
│   └── Dockerfile                     # Frontend container definition
│
├── 📁 server/                         # Node.js Backend
│   ├── 📁 src/
│   │   ├── 📁 controllers/             # API Controllers
│   │   │   ├── Order.controller.ts   # Order API endpoints
│   │   │   └── Health.controller.ts   # Health check endpoints
│   │   ├── 📁 services/               # Business Logic
│   │   │   ├── Order.service.ts       # Order business logic
│   │   │   └── WebSocket.service.ts   # WebSocket service
│   │   ├── 📁 websocket/              # WebSocket Implementation
│   │   │   ├── socket.server.ts       # Socket.io server
│   │   │   ├── socket.events.ts       # Event handlers
│   │   │   ├── socket.rooms.ts        # Room management
│   │   │   └── socket.auth.ts         # Authentication
│   │   ├── 📁 database/               # Database Layer
│   │   │   ├── database.service.ts    # Database operations
│   │   │   ├── health.service.ts      # Database health checks
│   │   │   └── 📁 migrations/         # Database migrations
│   │   ├── 📁 models/                 # Data Models
│   │   │   ├── Order.entity.ts        # Order entity definition
│   │   │   └── SubItem.entity.ts     # SubItem entity definition
│   │   ├── 📁 routes/                 # API Routes
│   │   │   ├── orders.routes.ts       # Order API routes
│   │   │   └── health.routes.ts       # Health check routes
│   │   ├── 📁 middleware/             # Express Middleware
│   │   │   ├── error.middleware.ts    # Error handling
│   │   │   ├── logger.middleware.ts   # Request logging
│   │   │   └── rate-limit.middleware.ts # Rate limiting
│   │   ├── 📁 config/                 # Configuration
│   │   │   ├── environment.ts         # Environment variables
│   │   │   ├── typeorm.config.ts     # Database configuration
│   │   │   └── app.config.ts         # Application configuration
│   │   ├── 📁 types/                  # TypeScript Types
│   │   │   ├── Order.ts               # Order type definitions
│   │   │   └── SubItem.ts            # SubItem type definitions
│   │   ├── 📁 utils/                  # Utility Functions
│   │   │   └── config.util.ts        # Configuration utilities
│   │   └── index.ts                   # Server entry point
│   ├── 📁 scripts/                    # Database Scripts
│   │   ├── seed.ts                    # Database seeding
│   │   ├── clear-db.ts               # Database cleanup
│   │   └── setup-db.ts               # Database setup
│   ├── package.json                   # Backend dependencies
│   ├── tsconfig.json                  # TypeScript configuration
│   └── Dockerfile                     # Backend container definition
│
├── 📁 nginx/                          # Nginx Configuration
│   ├── nginx.conf                     # Nginx server configuration
│   └── 📁 ssl/                        # SSL certificates
│
├── docker-compose.yml                 # Docker Compose configuration
├── docker-compose.dev.yml             # Development override
├── docker-compose.prod.yml            # Production configuration
├── Makefile                           # Build automation
└── README.md                          # This documentation
```

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

The easiest way to run the entire application:

#### Production Deployment (Fresh Fork)
```bash
# Clone the repository
git clone https://github.com/hsagiv/pizza-orders-assignment.git
cd tictuk

# Start all services with Docker Compose (production build)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

#### Development Deployment (With Local Changes)
```bash
# Clone the repository
git clone https://github.com/hsagiv/pizza-orders-assignment.git
cd tictuk

# Start all services with Docker Compose (development mode)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Access the application:**
-  **Frontend**: http://localhost:3000
-  **Backend API**: http://localhost:3001


### Option 2: Manual Setup

#### Prerequisites
- Node.js 18+ and npm 8+
- PostgreSQL 15+
- Redis 7+ (optional)

#### Backend Setup

```bash
# Navigate to server directory
   cd server

# Install dependencies
   npm install
   
# Set up environment variables
cp env.example .env
# Edit .env with your database credentials

# Set up database
npm run setup-db

# Seed the database with sample data
npm run seed

# Start development server
   npm run dev
   ```

#### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

## 🛠️ Development Workflow


### Testing

```bash
# Frontend tests
cd client
npm test

# Backend tests
cd server
npm test

# Run all tests
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📊 Adding New Orders via Browser Console

You can add new orders directly through the browser console for testing:

### 1. Open Browser Console
- Press `F12` or right-click → "Inspect" → "Console"

### 2. Add a New Order
```javascript
// Example: Add a new pizza order
fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Margherita Pizza',
    latitude: 40.7128,
    longitude: -74.0060,
    orderTime: new Date().toISOString(),
    status: 'pending',
    subItems: [
      {
        title: 'Extra Cheese',
        amount: 1,
        type: 'topping'
      },
      {
        title: 'Large Size',
        amount: 1,
        type: 'size'
      }
    ]
  })
})
.then(response => response.json())
.then(data => console.log('Order created:', data))
.catch(error => console.error('Error:', error));
```

### 3. Update Order Status
```javascript
// Example: Update order status
fetch('/api/orders/ORDER_ID/status', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'in_progress'
  })
})
.then(response => response.json())
.then(data => console.log('Status updated:', data))
.catch(error => console.error('Error:', error));
```

### 4. Get All Orders
```javascript
// Example: Fetch all orders
fetch('/api/orders')
.then(response => response.json())
.then(data => console.log('Orders:', data))
.catch(error => console.error('Error:', error));
```

## 🏗️ Development Phases

The project was developed in the following phases:

### Phase 1: Project Foundation
1. **Initialize project structure** with client and server directories
2. **Create package.json** for Node.js backend with TypeScript and dependencies
3. **Create package.json** for React frontend with TypeScript and dependencies
4. **Configure TypeScript** for backend with strict settings
5. **Configure TypeScript** for React frontend

### Phase 2: Database Design
6. **Design and create database schema** for orders and subItems tables
7. **Set up database connection configuration** with environment variables
8. **Create Order model** with title, location, orderTime, status, subItems fields
9. **Create SubItem model** with title, amount, type fields
10. **Create seed script** to populate database with 300 sample orders

### Phase 3: Backend API Development
11. **Create configuration file** for data polling time and other settings
12. **Create GET /api/orders endpoint** to fetch all orders
13. **Create PUT /api/orders/:id/status endpoint** to update order status
14. **Set up WebSocket server** for real-time order updates

### Phase 4: Containerization
15. **Create Docker Compose file** with database and application services
16. **Create Dockerfile for backend service**
17. **Create Dockerfile for frontend service**

### Phase 5: Frontend Development
18. **Initialize React app** with TypeScript and essential dependencies
19. **Set up Redux Toolkit** for state management with orders slice
20. **Create OrderList component** to display orders in a table format
21. **Create OrderItem component** for individual order display
22. **Create StatusBadge component** with color coding for order status

### Phase 6: Core Functionality
23. **Implement sort functionality** by order time, status, and location
24. **Add status update functionality** with dropdown selection
25. **Implement WebSocket client** for real-time order updates
26. **Create pagination component** with configurable items per page (1-4)

### Phase 7: Advanced Features
27. **Integrate map component** to show orders by location (bonus)
28. **Add RTL support** for Hebrew/Arabic languages (bonus)
29. **Implement responsive design** for mobile and desktop
30. **Add comprehensive error handling** and loading states

### Phase 8: Testing & Documentation
31. **Write unit tests** for critical components and API endpoints
32. **Create comprehensive README** with setup and Docker instructions


## 📈 Performance Monitoring

The application includes built-in health checks:

- **Backend Health**: http://localhost:3001/health
- **Database Health**: Automatic connection monitoring
- **WebSocket Health**: Connection status monitoring
- **Frontend Health**: Service worker and error boundary monitoring

## 🔒 Security Features

- **CORS Protection** - Configured for specific origins
- **Rate Limiting** - API request throttling
- **Input Validation** - Type-safe request validation
- **SQL Injection Protection** - Parameterized queries
- **XSS Protection** - Content Security Policy
- **Helmet Security** - Security headers middleware


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎉 Enjoy your pizza order management system!** 🍕