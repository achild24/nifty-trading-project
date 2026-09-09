#!/bin/bash

# Nifty Trading App - Setup Script
# Run this script to set up the development environment

set -e

echo "🚀 Setting up Nifty 50 Paper Trading App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env..."
    cp backend/.env.example backend/.env
fi

if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local..."
    cp .env.local .env.local 2>/dev/null || echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Start MongoDB:"
echo "   docker run -d -p 27017:27017 \\"
echo "     -e MONGO_INITDB_ROOT_USERNAME=admin \\"
echo "     -e MONGO_INITDB_ROOT_PASSWORD=password \\"
echo "     mongo:7"
echo ""
echo "2. Start Backend (Terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start Frontend (Terminal 2):"
echo "   npm start"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "🐳 Or use Docker Compose for everything:"
echo "   docker-compose up -d"
