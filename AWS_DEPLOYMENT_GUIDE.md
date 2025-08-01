# AWS EC2 Deployment Guide - The Social Runner

## Prerequisites

Before starting, ensure you have:
- AWS CLI configured with appropriate permissions
- An AWS account with EC2 access
- SSH key pair for EC2 instance access
- Domain name (optional, but recommended)

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance via AWS Console
```bash
# Launch Ubuntu 22.04 LTS instance
# Recommended: t3.medium or larger (2 vCPU, 4GB RAM minimum)
# Storage: 20GB minimum
# Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (Node.js)
```

### 1.2 Security Group Configuration
```bash
# Inbound Rules:
# SSH (22) - Your IP
# HTTP (80) - 0.0.0.0/0
# HTTPS (443) - 0.0.0.0/0
# Custom TCP (5000) - 0.0.0.0/0 (for Node.js app)
```

## Step 2: Connect to EC2 Instance

```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Update system packages
sudo apt update && sudo apt upgrade -y
```

## Step 3: Install Required Software

### 3.1 Install Node.js 20
```bash
# Install Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3.2 Install PostgreSQL
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

### 3.3 PostgreSQL Database Setup
```sql
-- In PostgreSQL shell
CREATE DATABASE social_runner;
CREATE USER runner_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE social_runner TO runner_user;
\q
```

### 3.4 Install PM2 Process Manager
```bash
# Install PM2 globally
sudo npm install -g pm2

# Configure PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### 3.5 Install Nginx (Optional - for production)
```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 4: Clone and Setup Application

### 4.1 Clone Repository
```bash
# Navigate to home directory
cd /home/ubuntu

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/yourusername/the-social-runner.git
cd the-social-runner

# Or upload files via SCP if not using Git:
# scp -i your-key.pem -r ./project-folder ubuntu@your-ec2-ip:/home/ubuntu/
```

### 4.2 Install Dependencies
```bash
# Install all dependencies
npm install

# Install development dependencies globally if needed
sudo npm install -g typescript tsx drizzle-kit
```

## Step 5: Environment Configuration

### 5.1 Create Production Environment File
```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://runner_user:your_secure_password@localhost:5432/social_runner
PGHOST=localhost
PGPORT=5432
PGDATABASE=social_runner
PGUSER=runner_user
PGPASSWORD=your_secure_password

# Session Secret (generate a strong random string)
SESSION_SECRET=$(openssl rand -hex 32)

# OAuth Configuration (replace with your actual credentials)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret

# Application URLs
REPLIT_DOMAINS=your-domain.com,your-ec2-ip
ISSUER_URL=https://replit.com/oidc
REPL_ID=your_repl_id

# Email Configuration (optional)
SENDGRID_API_KEY=your_sendgrid_api_key
EOF
```

### 5.2 Set Proper Permissions
```bash
# Secure environment file
chmod 600 .env

# Make sure ubuntu user owns all files
sudo chown -R ubuntu:ubuntu /home/ubuntu/the-social-runner
```

## Step 6: Database Setup

### 6.1 Run Database Migrations
```bash
# Push database schema
npm run db:push

# Verify database tables were created
sudo -u postgres psql -d social_runner -c "\dt"
```

## Step 7: Build Application

### 7.1 Production Build
```bash
# Build the application
npm run build

# Test that the build works
NODE_ENV=production npm start
# Test in browser: http://your-ec2-ip:5000
# Press Ctrl+C to stop
```

## Step 8: Setup PM2 Process Management

### 8.1 Create PM2 Ecosystem File
```bash
cat > ecosystem.config.js << EOF
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
```

### 8.2 Create Logs Directory
```bash
mkdir -p logs
```

### 8.3 Start Application with PM2
```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Check status
pm2 status
pm2 logs social-runner
```

## Step 9: Setup Nginx Reverse Proxy (Production)

### 9.1 Create Nginx Configuration
```bash
sudo tee /etc/nginx/sites-available/social-runner << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com your-ec2-ip;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Static files
    location /assets/ {
        alias /home/ubuntu/the-social-runner/dist/public/assets/;
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
    }
}
EOF
```

### 9.2 Enable Nginx Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/social-runner /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 10: SSL Certificate with Let's Encrypt (Optional but Recommended)

### 10.1 Install Certbot
```bash
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 10.2 Obtain SSL Certificate
```bash
# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Step 11: Setup Monitoring and Maintenance

### 11.1 Create Update Script
```bash
cat > update-app.sh << 'EOF'
#!/bin/bash
cd /home/ubuntu/the-social-runner

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Build application
npm run build

# Restart application
pm2 restart social-runner

echo "Application updated successfully!"
EOF

chmod +x update-app.sh
```

### 11.2 Setup Log Rotation
```bash
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
```

### 11.3 Setup Automatic Backups
```bash
cat > backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
sudo -u postgres pg_dump social_runner > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Database backup completed: $BACKUP_DIR/db_backup_$DATE.sql"
EOF

chmod +x backup-db.sh

# Add to crontab for daily backups at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/the-social-runner/backup-db.sh") | crontab -
```

## Step 12: Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw enable

# Allow required ports
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 5000

# Check status
sudo ufw status
```

## Step 13: Final Testing and Verification

### 13.1 Test Application
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs social-runner --lines 50

# Test database connection
sudo -u postgres psql -d social_runner -c "SELECT COUNT(*) FROM users;"

# Test HTTP response
curl -I http://your-ec2-ip
# or
curl -I http://your-domain.com
```

### 13.2 Performance Monitoring
```bash
# Monitor system resources
pm2 monit

# Check memory usage
free -h

# Check disk usage
df -h

# Check running processes
top
```

## Deployment Commands Summary

Here's the complete deployment script you can run:

```bash
#!/bin/bash
# Complete deployment script - save as deploy.sh

set -e

echo "Starting The Social Runner deployment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib nginx -y

# Install PM2
sudo npm install -g pm2 typescript tsx drizzle-kit

# Setup PostgreSQL
sudo -u postgres createdb social_runner
sudo -u postgres createuser runner_user

# Clone repository (replace with your repo)
cd /home/ubuntu
git clone https://github.com/yourusername/the-social-runner.git
cd the-social-runner

# Install dependencies
npm install

# Create .env file (you'll need to edit this with real values)
cp .env.example .env
nano .env

# Setup database
npm run db:push

# Build application
npm run build

# Setup PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# Setup Nginx (optional)
sudo cp nginx.conf /etc/nginx/sites-available/social-runner
sudo ln -s /etc/nginx/sites-available/social-runner /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

echo "Deployment completed! Your app should be running on http://your-ec2-ip"
```

## Troubleshooting

### Common Issues:

1. **Port 5000 not accessible**: Check security group settings
2. **Database connection failed**: Verify PostgreSQL credentials in .env
3. **PM2 app crashed**: Check logs with `pm2 logs social-runner`
4. **Nginx 502 error**: Ensure Node.js app is running on port 5000
5. **SSL certificate issues**: Verify domain DNS points to EC2 IP

### Useful Commands:
```bash
# Restart services
pm2 restart social-runner
sudo systemctl restart nginx
sudo systemctl restart postgresql

# Check logs
pm2 logs social-runner
sudo journalctl -u nginx -f
sudo tail -f /var/log/nginx/error.log

# Monitor resources
htop
pm2 monit
```

Your application will be accessible at:
- HTTP: `http://your-ec2-ip:5000` or `http://your-domain.com`
- HTTPS: `https://your-domain.com` (if SSL configured)

Remember to:
1. Replace placeholder values with your actual credentials
2. Update security groups and firewall rules as needed
3. Set up regular backups and monitoring
4. Keep your system and dependencies updated