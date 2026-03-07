$ErrorActionPreference = "Stop"

Write-Host "=== ProdHub Setup & Run Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if pnpm is available
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: pnpm is not installed. Please install it first: npm install -g pnpm" -ForegroundColor Red
    exit 1
}

# Step 1: Install dependencies
Write-Host "[1/5] Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Step 2: Generate Prisma client
Write-Host "[2/5] Generating Prisma client..." -ForegroundColor Yellow
pnpm db:generate

# Step 3: Start database container
Write-Host "[3/5] Starting database container..." -ForegroundColor Yellow
pnpm db:up

# Wait for database to be ready
Write-Host "Waiting for database to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Step 4: Run migrations
Write-Host "[4/5] Running database migrations..." -ForegroundColor Yellow
pnpm db:migrate

# Step 5: Start development servers
Write-Host "[5/5] Starting development servers..." -ForegroundColor Yellow
Write-Host ""

# Start server in background
Write-Host "Starting API server in background..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-Command", "pnpm dev:server" -WindowStyle Hidden

# Start web in background
Write-Host "Starting web dashboard in background..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-Command", "pnpm dev:web" -WindowStyle Hidden

# Start tracker in background
Write-Host "Starting tracker in background..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-Command", "pnpm dev" -WindowStyle Hidden

Write-Host ""
Write-Host "=== All services started ===" -ForegroundColor Green
Write-Host "- API Server: http://localhost:3000"
Write-Host "- Web Dashboard: http://localhost:3001"
Write-Host "- Tracker: Running (check terminal output)"
Write-Host ""
Write-Host "Press any key to exit (services will keep running)"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
