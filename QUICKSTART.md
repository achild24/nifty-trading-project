# Quick Start Guide

## Option 1: Using Docker Compose (Easiest)

```bash
# Navigate to project root
cd nifty-trading-app

# Start all services
docker-compose up -d

# Access the application
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000/api"
echo "MongoDB: localhost:27017 (credentials: admin/password)"

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**What starts:**
- Frontend React app on port 3000
- Express backend on port 5000
- MongoDB on port 27017
- All services connected and ready to use

---

## Option 2: Local Development

### Prerequisites
- Node.js 18+
- MongoDB installed locally OR Docker

### Step 1: Start MongoDB

**With Docker:**
```bash
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  --name nifty-mongodb \
  mongo:7
```

**Or locally:**
```bash
mongod
```

### Step 2: Start Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and update MONGODB_URI if needed

# Start server (development mode with auto-reload)
npm run dev

# Server will run on http://localhost:5000
```

### Step 3: Start Frontend (New Terminal)

```bash
# From project root
npm install

# Start development server
npm start

# Browser will open http://localhost:3000
```

---

## Step 4: Test the Application

1. **Register/Login**
   - Click "Sign up" or use existing account
   - Create account with email and password

2. **Trade**
   - Select a stock from Nifty 50
   - Enter quantity
   - Click Buy/Sell
   - See real-time price changes

3. **Check Portfolio**
   - Click "Portfolio" tab
   - View your holdings and P&L

---

## Common Commands

### Backend
```bash
cd backend

# Development (with hot reload)
npm run dev

# Production
npm start

# Run tests
npm test
```

### Frontend
```bash
# Development
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend
```

---

## Environment Setup

### Backend (.env)
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://admin:password@localhost:27017/nifty-trading?authSource=admin
JWT_SECRET=dev-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Verify connection string
echo $MONGODB_URI

# Reset connection
docker-compose down
docker-compose up -d
```

### API Connection Error
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Check API URL in frontend
cat .env.local | grep REACT_APP_API_URL
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Database Issues
```bash
# View MongoDB logs
docker-compose logs mongodb

# Connect to MongoDB directly
mongosh mongodb://admin:password@localhost:27017

# Check database
use nifty-trading
db.users.find()
```

---

## Default Test Credentials

After running the app, you can create a new account or test with:
- **Email:** test@example.com
- **Password:** password123
- **Username:** testuser

---

## File Structure

```
nifty-trading-app/
├── backend/              # Express API
│   └── src/
│       ├── server.js
│       ├── config/
│       ├── models/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/
│       └── utils/
├── src/                  # React Frontend
│   ├── components/
│   │   ├── Auth/
│   │   ├── Trade/
│   │   ├── Portfolio/
│   ├── services/
│   ├── context/
│   ├── hooks/
│   └── App.js
├── docker-compose.yml
├── Dockerfile
├── PRODUCTION_README.md
├── DEPLOYMENT.md
└── COMPLETION_SUMMARY.md
```

---

## Next Steps

1. ✅ **Get it running** - Use Option 1 (Docker) or Option 2 (Local)
2. 📝 **Read docs** - Check PRODUCTION_README.md for features
3. 🚀 **Deploy** - Follow DEPLOYMENT.md for production setup
4. 🔧 **Customize** - Modify colors, add features, customize UI
5. 📊 **Monitor** - Set up logging and monitoring

---

## Support

- 📖 **Documentation**: See PRODUCTION_README.md
- 🚀 **Deployment**: See DEPLOYMENT.md  
- 🐛 **Issues**: Check troubleshooting section above
- 📧 **Contact**: Check project README

---

**Ready to trade? Start now with Docker Compose! 🚀**
