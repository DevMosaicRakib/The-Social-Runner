#!/bin/bash

# The Social Runner - Prepare for AWS EC2 Deployment
# Run this script locally before uploading to EC2

echo "🔧 Preparing The Social Runner for AWS EC2 deployment..."

# Create deployment package
DEPLOY_DIR="social-runner-deploy"
mkdir -p $DEPLOY_DIR

echo "📦 Copying application files..."

# Copy essential files and directories
cp -r client/ $DEPLOY_DIR/
cp -r server/ $DEPLOY_DIR/
cp -r shared/ $DEPLOY_DIR/
cp -r scripts/ $DEPLOY_DIR/ 2>/dev/null || echo "No scripts directory found"

# Copy configuration files
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp tsconfig.json $DEPLOY_DIR/
cp vite.config.ts $DEPLOY_DIR/
cp drizzle.config.ts $DEPLOY_DIR/
cp tailwind.config.ts $DEPLOY_DIR/
cp postcss.config.js $DEPLOY_DIR/
cp components.json $DEPLOY_DIR/

# Copy deployment scripts
cp AWS_DEPLOYMENT_GUIDE.md $DEPLOY_DIR/
cp deploy-to-ec2.sh $DEPLOY_DIR/

# Create production environment template
cat > $DEPLOY_DIR/.env.example << 'EOF'
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://runner_user:SocialRunner2025!@localhost:5432/social_runner
PGHOST=localhost
PGPORT=5432
PGDATABASE=social_runner
PGUSER=runner_user
PGPASSWORD=SocialRunner2025!

# Session Secret (generate with: openssl rand -hex 32)
SESSION_SECRET=your_generated_session_secret_here

# OAuth Configuration - Get these from your providers
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
STRAVA_CLIENT_ID=your_strava_client_id_here
STRAVA_CLIENT_SECRET=your_strava_client_secret_here

# Application URLs - Replace with your domain or EC2 IP
REPLIT_DOMAINS=your-domain.com,your-ec2-public-ip
ISSUER_URL=https://replit.com/oidc
REPL_ID=your_repl_id_here

# Optional: Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
EOF

# Create production package.json with build scripts
cat > $DEPLOY_DIR/package.json << 'EOF'
{
  "name": "the-social-runner",
  "version": "1.0.0",
  "description": "Australia's Premier Running Community Platform",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:server && npm run build:client",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js --external:@neondatabase/serverless --external:ws --external:express --external:drizzle-orm --format=esm --target=node18",
    "build:client": "vite build",
    "start": "node dist/index.js",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@jridgewell/trace-mapping": "^0.3.25",
    "@neondatabase/serverless": "^0.9.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@sendgrid/mail": "^8.1.0",
    "@tailwindcss/typography": "^0.5.10",
    "@tailwindcss/vite": "^4.0.0-alpha.7",
    "@tanstack/react-query": "^5.17.9",
    "@types/bcryptjs": "^2.4.6",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.18.0",
    "@types/leaflet": "^1.9.8",
    "@types/memoizee": "^0.4.11",
    "@types/node": "^20.10.6",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "@types/ws": "^8.5.10",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "bcryptjs": "^2.4.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "cmdk": "^0.2.0",
    "connect-pg-simple": "^9.0.1",
    "csv-parser": "^3.0.0",
    "date-fns": "^3.0.6",
    "drizzle-kit": "^0.20.7",
    "drizzle-orm": "^0.29.2",
    "drizzle-zod": "^0.5.1",
    "embla-carousel-react": "^8.0.0",
    "esbuild": "^0.19.11",
    "expo-server-sdk": "^3.7.0",
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "framer-motion": "^10.18.0",
    "input-otp": "^1.2.4",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.305.0",
    "memoizee": "^0.4.15",
    "memorystore": "^1.6.7",
    "nanoid": "^5.0.4",
    "next-themes": "^0.2.1",
    "openid-client": "^5.6.5",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-local": "^1.0.0",
    "passport-strava-oauth2": "^0.2.0",
    "postcss": "^8.4.33",
    "react": "^18.2.0",
    "react-day-picker": "^8.10.0",
    "react-dom": "^18.2.0",
    "react-helmet-async": "^2.0.4",
    "react-hook-form": "^7.48.2",
    "react-icons": "^4.12.0",
    "react-leaflet": "^4.2.1",
    "react-resizable-panels": "^0.0.55",
    "recharts": "^2.9.3",
    "tailwind-merge": "^2.2.0",
    "tailwindcss": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "tsx": "^4.7.0",
    "tw-animate-css": "^0.1.0",
    "typescript": "^5.3.3",
    "vaul": "^0.8.0",
    "vite": "^5.0.10",
    "wouter": "^3.0.0",
    "ws": "^8.16.0",
    "zod": "^3.22.4",
    "zod-validation-error": "^2.1.0"
  }
}
EOF

# Make deployment script executable
chmod +x $DEPLOY_DIR/deploy-to-ec2.sh

# Create README for deployment
cat > $DEPLOY_DIR/DEPLOYMENT_README.md << 'EOF'
# The Social Runner - AWS EC2 Deployment

## Quick Start

1. **Upload to EC2**:
   ```bash
   # From your local machine
   scp -i your-key.pem -r social-runner-deploy ubuntu@your-ec2-ip:/home/ubuntu/the-social-runner
   ```

2. **Connect to EC2 and deploy**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   cd /home/ubuntu/the-social-runner
   chmod +x deploy-to-ec2.sh
   ./deploy-to-ec2.sh
   ```

3. **Configure OAuth credentials**:
   ```bash
   nano .env
   pm2 restart social-runner
   ```

## Files Included

- All application source code
- Production build configuration
- Deployment automation script
- Database schema and migrations
- Nginx configuration
- PM2 process management setup

## Requirements

- AWS EC2 instance (Ubuntu 22.04 LTS recommended)
- Security groups allowing ports 22, 80, 443, 5000
- OAuth credentials from Google and Strava
- Domain name (optional but recommended)

See AWS_DEPLOYMENT_GUIDE.md for detailed instructions.
EOF

echo "✅ Deployment package created in: $DEPLOY_DIR/"
echo
echo "📋 Next Steps:"
echo "1. Upload to EC2: scp -i your-key.pem -r $DEPLOY_DIR ubuntu@your-ec2-ip:/home/ubuntu/the-social-runner"
echo "2. SSH to EC2: ssh -i your-key.pem ubuntu@your-ec2-ip"
echo "3. Run deployment: cd /home/ubuntu/the-social-runner && ./deploy-to-ec2.sh"
echo "4. Configure OAuth in .env file"
echo "5. Restart application: pm2 restart social-runner"
echo
echo "📖 See $DEPLOY_DIR/AWS_DEPLOYMENT_GUIDE.md for detailed instructions"