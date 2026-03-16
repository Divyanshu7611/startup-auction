# Ubuntu HTTP Deployment Guide

This guide explains how to run the Startup Auction Admin Dashboard on Ubuntu using HTTP without any security restrictions.

## Prerequisites

1. Node.js (v18 or higher)
2. npm or yarn
3. PostgreSQL database (connection string in .env)

## Quick Start

### Option 1: Using the startup script (Recommended)

```bash
# Make the script executable
chmod +x start-http.sh

# Run the script
./start-http.sh
```

### Option 2: Using npm commands

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the server on HTTP
npm run start:http
```

### Option 3: Development mode

```bash
# Install dependencies
npm install

# Run in development mode on HTTP
npm run dev:http
```

## Accessing the Admin Dashboard

Once the server is running, you can access:

- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Admin Login**: http://localhost:3000/admin/login
- **Manage Auction**: http://localhost:3000/admin/manageAuction
- **Home Page**: http://localhost:3000

## Default Admin Credentials

- **Username**: admin
- **Password**: admin123

## Security Notes

⚠️ **IMPORTANT**: This configuration has all security restrictions removed for HTTP access:

1. No authentication required for admin pages
2. No HTTPS enforcement
3. No session validation
4. Server listens on all interfaces (0.0.0.0)

**This setup is intended for development/testing only. DO NOT use in production without proper security measures.**

## Configuration Details

### What has been changed:

1. **next.config.mjs**: 
   - Added wildcard allowed origins
   - Removed HTTPS redirects
   - Minimal security headers

2. **Admin Authentication**:
   - `isAdminAuthorized()` functions return `true` (no checks)
   - Direct access to all admin routes
   - No session validation

3. **Network Configuration**:
   - Server binds to 0.0.0.0 (all interfaces)
   - Default port: 3000
   - HTTP only (no SSL/TLS)

## Troubleshooting

### Port already in use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### Permission denied
```bash
# Make script executable
chmod +x start-http.sh
```

### Database connection issues
Check your `.env` file and ensure `DATABASE_URL` is correct:
```
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

### Cannot access from other machines
Make sure:
1. Firewall allows port 3000
2. Server is running with `-H 0.0.0.0` flag
3. Use the server's IP address instead of localhost

```bash
# Allow port 3000 through firewall
sudo ufw allow 3000
```

## Accessing from Other Machines

To access the dashboard from other machines on the network:

1. Find your Ubuntu server's IP address:
```bash
ip addr show
# or
hostname -I
```

2. Access from another machine:
```
http://<server-ip>:3000/admin/dashboard
```

Example: `http://192.168.1.100:3000/admin/dashboard`

## Environment Variables

Key environment variables in `.env`:

```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# Admin Credentials (not enforced but available)
ADMIN_USER_ID="admin"
ADMIN_PASSWORD="admin123"

# Session (not used in current setup)
SESSION_SECRET="your_secret_key"
```

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Additional Commands

```bash
# Check if server is running
curl http://localhost:3000

# View server logs
npm run start:http 2>&1 | tee server.log

# Run in background
nohup npm run start:http > server.log 2>&1 &

# Stop background process
pkill -f "next start"
```

## Support

For issues or questions, check:
1. Server logs in the terminal
2. Browser console for client-side errors
3. Database connectivity
4. Port availability
