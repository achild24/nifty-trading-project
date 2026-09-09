# Nifty 50 Paper Trading App - Production Ready

A full-stack paper trading platform for Nifty 50 stocks with real-time price simulation, secure authentication, and portfolio tracking.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Frontend (React 18)                       │
│  ├─ Authentication (Login/Register)                              │
│  ├─ Trading Interface with Live Charts                           │
│  ├─ Portfolio Management                                         │
│  └─ Account and Portfolio Statistics                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ API Calls (JWT Auth)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                Backend (Express.js + Node.js)                    │
│  ├─ Authentication Routes (JWT, bcrypt)                          │
│  ├─ Trading API (Buy/Sell Orders)                                │
│  ├─ Portfolio Management                                         │
│  ├─ Input Validation & Error Handling                            │
│  └─ Real-time Price Simulation                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Database
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB Database                              │
│  ├─ User Accounts (credentials, portfolio, stats)                │
│  ├─ Trade History (buy/sell records)                             │
│  ├─ Stock Prices (real-time updates)                             │
│  └─ Portfolio and Trade Data                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Features

✅ **Secure Authentication**
- JWT-based authentication
- Bcrypt password hashing
- Persistent sessions with token refresh

✅ **Trading System**
- 15 Nifty 50 stocks with real-time price simulation
- Buy/Sell orders with balance validation
- Automatic portfolio tracking
- Average price calculation

✅ **Portfolio Management**
- Real-time P&L calculation
- Position tracking
- Trade history
- Performance metrics

✅ **Data Persistence**
- MongoDB for reliable data storage
- No data loss on browser refresh
- Multi-user support with isolated accounts

✅ **Production Ready**
- Docker containerization
- Environment-based configuration
- Error handling & logging
- Input validation
- CORS & security headers

## Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Recharts (charting)
- Lucide React (icons)
- Context API (state management)

**Backend:**
- Express.js
- MongoDB (with Mongoose)
- JWT (authentication)
- bcryptjs (password hashing)
- express-validator (input validation)

**DevOps:**
- Docker & Docker Compose
- Node.js 18 Alpine
- MongoDB 7

## Project Structure

```
nifty-trading-app/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/            # Database & constants
│   │   ├── models/            # Mongoose schemas
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth & validation
│   │   ├── utils/             # Helper functions
│   │   └── server.js          # Entry point
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── src/                        # React Frontend
│   ├── components/
│   │   ├── Auth/              # Login/Register
│   │   ├── Trade/             # Trading interface
│   │   ├── Portfolio/         # Portfolio view
│   │   └── Header.js          # Main header
│   ├── context/               # AuthContext
│   ├── hooks/                 # useAuth custom hook
│   ├── services/              # API client
│   ├── App.js                 # Main component
│   └── index.js               # React entry point
│
├── public/                     # Static files
├── docker-compose.yml         # Multi-container setup
├── Dockerfile                 # Frontend container
├── .env.local                 # Frontend config
├── .env.example               # Environment template
└── DEPLOYMENT.md              # Deployment guide
```

## Quick Start

### 1. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd nifty-trading-app

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure Environment

```bash
# Frontend
cp .env.local .env.local
# REACT_APP_API_URL is already set to http://localhost:5000/api

# Backend
cp backend/.env.example backend/.env
# Update with your MongoDB URI
```

### 3. Start MongoDB

```bash
# Using Docker
docker run -d \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -p 27017:27017 \
  mongo:7
```

### 4. Start Services

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm start
```

Visit http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Trading
- `GET /api/trade/stocks` - Get all stocks with current prices
- `POST /api/trade/buy` - Buy stock
- `POST /api/trade/sell` - Sell stock
- `GET /api/trade/portfolio` - Get user's portfolio

## Database Models

### User Schema
```javascript
{
  username: String,          // Unique
  email: String,             // Unique
  password: String,          // Hashed
  balance: Number,           // Available cash
  portfolio: [              // Holdings
    { symbol, name, quantity, avgPrice }
  ],
  totalPnL: Number,         // Realized profit/loss
  rewardPoints: Number,     // Earned rewards
  trades: Number,           // Total trades made
  winningTrades: Number,    // Profitable trades
  createdAt: Date,
  updatedAt: Date
}
```

### Trade Schema
```javascript
{
  userId: ObjectId,         // User who made trade
  symbol: String,           // Stock symbol
  type: 'buy' | 'sell',    // Trade type
  quantity: Number,         // Shares traded
  price: Number,            // Execution price
  totalAmount: Number,      // Quantity × Price
  pnl: Number,              // P&L (for sells)
  timestamp: Date
}
```

## Input Validation

- **Username**: 3-30 characters
- **Email**: Valid email format
- **Password**: Minimum 6 characters
- **Quantity**: Positive integer
- **Trade Type**: 'buy' or 'sell'

## Error Handling

All errors return structured JSON responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": []  // Array of field-specific errors
}
```

## Security Features

✅ JWT-based authentication with expiration
✅ Bcrypt password hashing (10 salt rounds)
✅ CORS configuration
✅ Input validation on all endpoints
✅ Secure HTTP-only cookies
✅ Protected routes with middleware
✅ SQL injection prevention via Mongoose
✅ XSS protection

## Performance

- Real-time price updates every 3 seconds
- Lazy loading of components
- Efficient database queries with indexing
- Optimized bundle size
- Responsive design for mobile/tablet

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

## Deployment

### Docker Compose (Recommended)

```bash
docker-compose up -d
```

Services start automatically:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Heroku deployment
- AWS EC2 setup
- DigitalOcean App Platform
- Azure Container Instances
- SSL/TLS configuration
- Monitoring & logging
- Backup strategies

## Environment Variables

**Backend (backend/.env)**
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/nifty-trading
JWT_SECRET=your_secure_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**
```
REACT_APP_API_URL=http://localhost:5000/api
```

## License

MIT License - See LICENSE file

## Support

For issues and questions:
- Open GitHub Issues
- Check DEPLOYMENT.md for troubleshooting
- Review API documentation in backend

## Roadmap

- [ ] Real market data integration
- [ ] Advanced charting (technical indicators)
- [ ] Mobile app (React Native)
- [ ] Two-factor authentication
- [ ] Trade journal & analytics
- [ ] Social features (follow traders)
- [ ] Automated trading strategies
- [ ] WebSocket for real-time updates
- [ ] Admin dashboard
- [ ] Email notifications
