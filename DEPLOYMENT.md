# Production Deployment Guide

## Vercel Frontend Deployment

This repository contains a React frontend and a separate Express/MongoDB backend. Deploy the React frontend to Vercel, then host the backend on a Node-compatible service such as Render, Railway, Fly.io, or a separate Vercel serverless project.

1. Push the repository to GitHub and import it into Vercel.
2. Keep the Vercel project root at the repository root.
3. In Vercel project settings, add this environment variable:

  ```text
  REACT_APP_API_URL=https://your-backend-domain.example.com/api
  ```

4. Deploy with the existing `vercel.json` configuration.
5. In the backend host, configure:

  ```text
  FRONTEND_URL=https://your-frontend-domain.vercel.app
  MONGODB_URI=your-production-mongodb-connection-string
  JWT_SECRET=your-long-random-production-secret
  JWT_EXPIRE=7d
  PORT=5000
  ```

6. Verify the backend before testing the frontend:

  ```text
  https://your-backend-domain.example.com/api/health
  ```

Do not put `MONGODB_URI` or `JWT_SECRET` in the frontend Vercel environment variables. They belong only to the backend deployment. If the MongoDB credentials previously used in local development were real credentials, rotate them before production deployment.

## Render Backend Deployment

The repository includes `render.yaml` for the backend Web Service.

1. Push the latest changes to GitHub.
2. In Render, choose **New > Blueprint** and select the repository.
3. Render will detect `render.yaml`, use `backend` as the service root, run `npm ci`, and start the service with `npm start`.
4. Set these prompted secret values:

  ```text
  MONGODB_URI=mongodb+srv://...
  JWT_SECRET=your-long-random-production-secret
  FRONTEND_URL=https://your-frontend-domain.vercel.app
  ```

5. After deployment, test `https://your-render-service.onrender.com/api/health`.
6. Update the Vercel variable `REACT_APP_API_URL` to:

  ```text
  https://your-render-service.onrender.com/api
  ```

Render supplies the `PORT` variable automatically. Do not commit `.env` files or production secrets.

## Prerequisites

- Node.js 18+
- MongoDB 7+
- Docker & Docker Compose (for containerized deployment)

## Local Development Setup

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nifty-trading
JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
npm install
cp .env.local .env.local
```

Edit `.env.local`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm start
```

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Copy and configure environment
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your production values.

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api
- MongoDB: localhost:27017

### Production Environment Variables

**Backend (.env):**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/nifty-trading
JWT_SECRET=generate_a_strong_random_secret
JWT_EXPIRE=7d
FRONTEND_URL=https://yourdomain.com
```

**Frontend (.env.local):**
```
REACT_APP_API_URL=https://api.yourdomain.com
```

## Database Setup

### MongoDB Atlas (Cloud)

1. Create a cluster at mongodb.com
2. Get connection string
3. Add connection string to `MONGODB_URI` in backend `.env`

### Local MongoDB

```bash
# Using Docker
docker run -d \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7
```

## Deployment Options

### Heroku

1. Create `Procfile` in root:
```
web: cd backend && npm start
```

2. Deploy:
```bash
heroku create nifty-trading-app
git push heroku main
```

### AWS EC2

1. Launch EC2 instance (Ubuntu 22.04)
2. Install Node.js, MongoDB, Nginx
3. Clone repository
4. Configure environment variables
5. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start src/server.js --name "nifty-backend"
pm2 save
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Create two apps:
   - Backend (Node.js)
   - Frontend (React)
3. Set environment variables in app dashboard
4. Deploy

### Azure Container Instances

```bash
# Build images
docker build -t nifty-backend:latest ./backend
docker build -t nifty-frontend:latest .

# Push to Azure Container Registry
az acr build --registry myregistry --image nifty-backend:latest ./backend
az acr build --registry myregistry --image nifty-frontend:latest .

# Deploy
az container create --registry-login-server myregistry.azurecr.io ...
```

## SSL/TLS Certificate (HTTPS)

### Using Let's Encrypt with Nginx

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx

sudo certbot certonly --nginx -d yourdomain.com -d api.yourdomain.com
```

Update Nginx config to use certificates.

## Monitoring & Logging

### PM2 Monitoring

```bash
pm2 monit
pm2 save
pm2 startup
```

### Docker Logs

```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### Application Logging

Logs are written to `/logs` directory. Rotate using `logrotate`:

```bash
sudo logrotate -f /etc/logrotate.d/nifty-trading
```

## Performance Optimization

1. **Database Indexing**: Add indexes on frequently queried fields
2. **Caching**: Implement Redis for session caching
3. **CDN**: Use CloudFront or Cloudflare for static assets
4. **Compression**: Enable gzip in Nginx
5. **Rate Limiting**: Implement rate limiting on API endpoints

## Security Hardening

1. **Update Dependencies**: `npm audit fix`
2. **Secrets Management**: Use AWS Secrets Manager or similar
3. **CORS**: Configure proper CORS origins
4. **HTTPS**: Always use HTTPS in production
5. **DDoS Protection**: Use Cloudflare or AWS Shield
6. **WAF**: Enable Web Application Firewall

## Backup Strategy

```bash
# MongoDB backup
mongodump --uri="mongodb+srv://user:password@cluster.mongodb.net/nifty-trading" --out=/backups

# Restore
mongorestore --uri="mongodb+srv://user:password@cluster.mongodb.net" /backups
```

## Troubleshooting

### MongoDB Connection Error
```bash
# Check MongoDB is running
docker ps | grep mongodb

# Check connection string
echo $MONGODB_URI
```

### Frontend API Connection Error
```bash
# Check REACT_APP_API_URL
env | grep REACT_APP

# Verify backend is running
curl http://localhost:5000/api/health
```

### High Memory Usage
```bash
# Check Node process
ps aux | grep node

# Restart application
pm2 restart all
```

## Support & Documentation

- API Documentation: See `backend/README.md`
- Frontend Documentation: See React components
- Issues: GitHub Issues
- Discussions: GitHub Discussions
