#!/bin/bash

# Startup script for running the admin dashboard on HTTP in Ubuntu
# This script removes all security restrictions and runs on HTTP

echo "Starting Startup Auction Admin Dashboard on HTTP..."
echo "=================================================="

# Set environment variables to disable HTTPS
export NODE_ENV=production
export HOSTNAME=0.0.0.0
export PORT=3000

# Disable any SSL/TLS requirements
export NODE_TLS_REJECT_UNAUTHORIZED=0

echo "Building the application..."
npm run build

echo ""
echo "Starting the server on HTTP..."
echo "Admin Dashboard will be available at: http://localhost:3000/admin/dashboard"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the Next.js server
npm start
