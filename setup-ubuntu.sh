#!/bin/bash

# Quick setup script for Ubuntu HTTP deployment
# This script sets up everything needed to run the admin dashboard on HTTP

echo "=========================================="
echo "Startup Auction - Ubuntu HTTP Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js v18 or higher:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your configuration."
    echo "You can copy from .env.sample if available."
    exit 1
fi

echo "✓ .env file found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✓ Build completed"
echo ""

# Make start script executable
chmod +x start-http.sh

echo "=========================================="
echo "✅ Setup completed successfully!"
echo "=========================================="
echo ""
echo "To start the server, run:"
echo "  ./start-http.sh"
echo ""
echo "Or use npm:"
echo "  npm run start:http"
echo ""
echo "The admin dashboard will be available at:"
echo "  http://localhost:3000/admin/dashboard"
echo ""
echo "Default credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "⚠️  Note: All security restrictions have been removed."
echo "   This is for HTTP access only. Not for production use."
echo ""
