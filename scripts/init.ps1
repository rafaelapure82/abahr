# PowerShell – ABA Talent Management Initialization Script
# Run from the project root: .\scripts\init.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║    ABA Talent Management – Project Init      ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# ── 1. Check prerequisites ────────────────────────────────────────────────────
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan

$required = @("node", "npm", "docker", "docker-compose")
foreach ($tool in $required) {
    if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Error "❌ $tool is not installed. Please install it before continuing."
        exit 1
    }
    $version = & $tool --version 2>&1
    Write-Host "  ✅ $tool $version"
}

# ── 2. Copy .env files ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "📋 Setting up environment files..." -ForegroundColor Cyan

if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  ✅ Created root .env from .env.example"
    Write-Host "  ⚠️  Please edit .env and fill in your secrets!" -ForegroundColor Yellow
} else {
    Write-Host "  ℹ️  Root .env already exists, skipping"
}

if (!(Test-Path "backend\.env")) {
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "  ✅ Created backend/.env"
    }
}

if (!(Test-Path "frontend\.env")) {
    if (Test-Path "frontend\.env.example") {
        Copy-Item "frontend\.env.example" "frontend\.env"
        Write-Host "  ✅ Created frontend/.env"
    }
}

# ── 3. Install backend dependencies ──────────────────────────────────────────
Write-Host ""
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
Write-Host "  ✅ Backend dependencies installed"
Set-Location ..

# ── 4. Install frontend dependencies ─────────────────────────────────────────
Write-Host ""
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
if (Test-Path "package.json") {
    npm install
    Write-Host "  ✅ Frontend dependencies installed"
} else {
    Write-Host "  ⚠️  frontend/package.json not found – run Angular init first" -ForegroundColor Yellow
}
Set-Location ..

# ── 5. Create upload directories ──────────────────────────────────────────────
Write-Host ""
Write-Host "📁 Creating required directories..." -ForegroundColor Cyan
$dirs = @("backend\uploads", "backend\logs", "docker\nginx\ssl", "scripts\tmp")
foreach ($d in $dirs) {
    if (!(Test-Path $d)) {
        New-Item -ItemType Directory -Force -Path $d | Out-Null
        Write-Host "  ✅ Created $d"
    }
}

# ── 6. Generate Prisma client ─────────────────────────────────────────────────
Write-Host ""
Write-Host "🗄️  Generating Prisma client..." -ForegroundColor Cyan
Set-Location backend
npx prisma generate
Write-Host "  ✅ Prisma client generated"
Set-Location ..

# ── 7. Start Docker services ──────────────────────────────────────────────────
Write-Host ""
$startDocker = Read-Host "🐳 Start Docker services (postgres + redis)? [y/N]"
if ($startDocker -eq "y" -or $startDocker -eq "Y") {
    docker-compose up -d postgres redis
    Write-Host ""
    Write-Host "  ⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8

    # Run migrations
    Write-Host "  🗄️  Running Prisma migrations..."
    Set-Location backend
    npx prisma migrate dev --name init
    Write-Host "  ✅ Migrations applied"

    # Run seed
    $runSeed = Read-Host "  🌱 Run database seed? [y/N]"
    if ($runSeed -eq "y" -or $runSeed -eq "Y") {
        npx ts-node prisma/seed.ts
        Write-Host "  ✅ Database seeded"
    }
    Set-Location ..
}

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           🚀  Setup Complete!                ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Edit .env and fill in JWT_SECRET, JWT_REFRESH_SECRET" -ForegroundColor Yellow
Write-Host "  2. Start backend:    cd backend && npm run dev" -ForegroundColor Cyan
Write-Host "  3. Start frontend:   cd frontend && npm start" -ForegroundColor Cyan
Write-Host "  4. API Health:       http://localhost:3000/health"
Write-Host "  5. MailHog (email):  http://localhost:8025"
Write-Host ""
