#!/bin/bash

set -e

echo "=== ProdHub Setup & Run Script ==="
echo ""

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "Error: pnpm is not installed. Please install it first: npm install -g pnpm"
    exit 1
fi

# Step 1: Install dependencies
echo "[1/5] Installing dependencies..."
pnpm install

# Step 2: Generate Prisma client
echo "[2/5] Generating Prisma client..."
pnpm db:generate

# Step 3: Start database container
echo "[3/5] Starting database container..."
pnpm db:up

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 3

# Step 4: Run migrations
echo "[4/5] Running database migrations..."
pnpm db:migrate

# Step 5: Start development servers
echo "[5/5] Starting development servers..."
echo ""
echo "Starting server in background..."
pnpm dev:server &

echo "Starting web dashboard in background..."
pnpm dev:web &

echo "Starting tracker in background..."
pnpm dev &

echo ""
echo "=== All services started ==="
echo "- API Server: http://localhost:3000"
echo "- Web Dashboard: http://localhost:3001"
echo "- Tracker: Running (check logs)"
echo ""
echo "Press Ctrl+C to stop all services"
