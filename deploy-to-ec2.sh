#!/bin/bash

# The Social Runner - AWS EC2 Deployment Script
# Run this script on your EC2 instance as ubuntu user

set -e

echo "🚀 Starting The Social Runner deployment on AWS EC2..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as ubuntu user
if [ "$USER" != "ubuntu" ]; then
    print_error "This script should be run as ubuntu user"
    exit 1
fi

print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_status "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

print_status "Installing additional dependencies..."
sudo apt install -y postgresql postgresql-contrib nginx git htop curl unzip

print_status "Installing global Node.js packages..."
sudo npm install -g pm2 typescript tsx drizzle-kit

print_status "Setting up PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE social_runner;
CREATE USER runner_user WITH ENCRYPTED PASSWORD 'SocialRunner2025!';
GRANT ALL PRIVILEGES ON DATABASE social_runner TO runner_user;
ALTER USER runner_user CREATEDB;
\q
EOF

print_status "PostgreSQL setup completed"

# Clone or setup application
if [ ! -d "/home/ubuntu/the-social-runner" ]; then
    print_status "Please upload your application files to /home/ubuntu/the-social-runner"
    print_warning "You can use: scp -i your-key.pem -r ./your-project ubuntu@your-ec2-ip:/home/ubuntu/"
    print_warning "Or clone from Git: git clone https://github.com/yourusername/the-social-runner.git"
    
    mkdir -p /home/ubuntu/the-social-runner
    print_warning "Application directory created. Upload your files and run this script again."
    exit 0
fi

cd /home/ubuntu/the-social-runner

print_status "Installing application dependencies..."
npm install

print_status "Setting up environment variables..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://runner_user:SocialRunner2025!@localhost:5432/social_runner
PGHOST=localhost
PGPORT=5432
PGDATABASE=social_runner
PGUSER=runner_user
PGPASSWORD=SocialRunner2025!

# Session Secret (generated)
SESSION_SECRET=$(openssl rand -hex 32)

# OAuth Configuration - REPLACE WITH YOUR ACTUAL VALUES
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
STRAVA_CLIENT_ID=your_strava_client_id_here
STRAVA_CLIENT_SECRET=your_strava_client_secret_here

# Application URLs - REPLACE WITH YOUR ACTUAL DOMAIN/IP
REPLIT_DOMAINS=\$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
ISSUER_URL=https://replit.com/oidc
REPL_ID=your_repl_id_here

# Optional: Email Configuration
# SENDGRID_API_KEY=your_sendgrid_api_key_here
EOF
    
    chmod 600 .env
    print_warning "Environment file created. Please edit .env with your actual OAuth credentials:"
    print_warning "nano .env"
fi

print_status "Setting up database schema..."
npm run db:push

print_status "Building application..."
npm run build

print_status "Creating PM2 ecosystem file..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'social-runner',
    script: 'dist/index.js',
    cwd: '/home/ubuntu/the-social-runner',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

mkdir -p logs

print_status "Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 startup | tail -1 | sudo bash
pm2 save

print_status "Setting up Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/social-runner << EOF
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Static files
    location /assets/ {
        alias /home/ubuntu/the-social-runner/dist/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /tsr-logo.svg {
        alias /home/ubuntu/the-social-runner/client/public/tsr-logo.svg;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /favicon.ico {
        alias /home/ubuntu/the-social-runner/client/public/favicon.ico;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout       60s;
        proxy_send_timeout          60s;
        proxy_read_timeout          60s;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/social-runner /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t && sudo systemctl restart nginx
sudo systemctl enable nginx

print_status "Setting up firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 5000

print_status "Creating maintenance scripts..."
cat > update-app.sh << 'EOF'
#!/bin/bash
cd /home/ubuntu/the-social-runner
echo "Updating The Social Runner..."
git pull origin main || echo "No git repository found - manual update required"
npm install
npm run build
pm2 restart social-runner
echo "Application updated successfully!"
EOF

cat > backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump social_runner > $BACKUP_DIR/db_backup_$DATE.sql
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
echo "Database backup completed: $BACKUP_DIR/db_backup_$DATE.sql"
EOF

chmod +x update-app.sh backup-db.sh

# Setup log rotation
sudo tee /etc/logrotate.d/social-runner << EOF
/home/ubuntu/the-social-runner/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reload social-runner
    endscript
}
EOF

print_status "Getting server information..."
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
PRIVATE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)

echo
echo "🎉 Deployment completed successfully!"
echo
echo "📋 Server Information:"
echo "  Public IP:  $PUBLIC_IP"
echo "  Private IP: $PRIVATE_IP"
echo
echo "🌐 Access your application:"
echo "  HTTP:  http://$PUBLIC_IP"
echo "  Direct: http://$PUBLIC_IP:5000"
echo
echo "🔧 Management Commands:"
echo "  Check status:     pm2 status"
echo "  View logs:        pm2 logs social-runner"
echo "  Restart app:      pm2 restart social-runner"
echo "  Update app:       ./update-app.sh"
echo "  Backup database:  ./backup-db.sh"
echo
echo "⚠️  Important Next Steps:"
echo "1. Edit .env file with your OAuth credentials:"
echo "   nano .env"
echo "2. Update REPLIT_DOMAINS in .env with your domain name"
echo "3. Restart the application: pm2 restart social-runner"
echo "4. For SSL, install Let's Encrypt: sudo certbot --nginx"
echo
echo "🔍 Verify deployment:"
echo "  curl -I http://$PUBLIC_IP"
echo

# Final check
if pm2 list | grep -q "online"; then
    print_status "✅ Application is running successfully!"
else
    print_error "❌ Application may not be running properly. Check logs: pm2 logs social-runner"
fi