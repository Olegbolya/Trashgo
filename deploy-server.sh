#!/bin/bash
set -e

# ════════════════════════════════════════════════════════
#  TrashGo — Deploy script (run on server as root)
# ════════════════════════════════════════════════════════

REPO="https://github.com/Olegbolya/Trashgo.git"
APP_DIR="/var/www/trashgo"
DB_USER="trashgo"
DB_NAME="trashgo"
DB_PASS="TrGoDb2024!Secure"
JWT_SECRET="trashgo-jwt-$(openssl rand -hex 16)"
JWT_REFRESH="trashgo-refresh-$(openssl rand -hex 16)"
SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     TrashGo Server Deploy Script         ║"
echo "╚══════════════════════════════════════════╝"
echo "IP: $SERVER_IP"
echo ""

# ── 1. System packages ──────────────────────────────────
echo "[1/7] Installing system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl git nginx postgresql postgresql-contrib openssl

# ── 2. Node.js 20 ────────────────────────────────────────
echo "[2/7] Installing Node.js 20..."
if ! node --version 2>/dev/null | grep -q "v20\|v22\|v24"; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
npm install -g pm2 tsx --quiet
echo "  Node: $(node --version), npm: $(npm --version)"

# ── 3. PostgreSQL ─────────────────────────────────────────
echo "[3/7] Setting up PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

sudo -u postgres psql << SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
  ELSE
    ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';
  END IF;
END \$\$;
SELECT 'User OK';
SQL

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo "  PostgreSQL: OK"

# ── 4. Clone repo ─────────────────────────────────────────
echo "[4/7] Cloning repository..."
rm -rf "$APP_DIR"
git clone --depth=1 "$REPO" "$APP_DIR"
echo "  Cloned: $(ls $APP_DIR)"

# ── 5. API setup ──────────────────────────────────────────
echo "[5/7] Setting up API..."
cd "$APP_DIR/api"
npm install --prefer-offline --quiet

cat > .env << ENV
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH
FRONTEND_URL=http://$SERVER_IP
LATEST_VERSION=1.0.0
LATEST_BUILD=1
ENV

echo "  Running migrations..."
node --import tsx src/db/migrate.ts
echo "  API: OK"

# ── 6. Frontend build ─────────────────────────────────────
echo "[6/7] Building frontend..."
cd "$APP_DIR/trashgo"

cat > .env.production << ENV
VITE_API_URL=http://$SERVER_IP/api/v1
ENV

npm install --prefer-offline --quiet
npm run build
echo "  Frontend built: $(ls dist/ | wc -l) files"

# ── 7. Nginx ──────────────────────────────────────────────
echo "[7/7] Configuring Nginx..."
cat > /etc/nginx/sites-available/trashgo << NGINX
server {
    listen 80 default_server;
    server_name _;

    root $APP_DIR/trashgo/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300;
    }

    # WebSocket
    location /ws {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
    }

    # SPA
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/trashgo /etc/nginx/sites-enabled/trashgo
nginx -t && systemctl restart nginx && systemctl enable nginx
echo "  Nginx: OK"

# ── 8. PM2 ────────────────────────────────────────────────
echo "[8/8] Starting API with PM2..."
pm2 delete trashgo-api 2>/dev/null || true
cd "$APP_DIR/api"
pm2 start "node --import tsx src/index.ts" \
  --name trashgo-api \
  --log /var/log/trashgo-api.log \
  --error /var/log/trashgo-api-error.log \
  --restart-delay 3000 \
  --max-restarts 10
pm2 save
pm2 startup systemd -u root --hp /root 2>&1 | tail -1 | bash 2>/dev/null || true

sleep 5
pm2 list

# ── 9. Final check ────────────────────────────────────────
echo ""
echo "Checking services..."
API_STATUS=$(curl -s http://127.0.0.1:3000/api/v1/version 2>/dev/null || echo "not ready")
HTTP_STATUS=$(curl -sI http://localhost/ 2>/dev/null | head -1 || echo "not ready")
echo "  API: $API_STATUS"
echo "  HTTP: $HTTP_STATUS"

# Save credentials
cat > /root/trashgo-credentials.txt << CREDS
=== TrashGo Credentials ===
URL: http://$SERVER_IP
API: http://$SERVER_IP/api/v1

DB Host:     localhost:5432
DB Name:     $DB_NAME
DB User:     $DB_USER
DB Password: $DB_PASS

JWT Secret:  $JWT_SECRET
JWT Refresh: $JWT_REFRESH
CREDS

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║          DEPLOYMENT COMPLETE!            ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "  Frontend: http://$SERVER_IP"
echo "  API:      http://$SERVER_IP/api/v1/version"
echo ""
echo "  Credentials saved to: /root/trashgo-credentials.txt"
echo ""
echo "  ⚠  Remember to:"
echo "     1. Set up a domain + SSL (Let's Encrypt)"
echo "     2. Change root password"
echo "     3. Configure email/telegram vars in $APP_DIR/api/.env"
