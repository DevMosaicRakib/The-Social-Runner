# Windows Deployment Guide - The Social Runner

## Overview

This guide will help you deploy The Social Runner on a Windows machine using familiar Windows tools and GUI applications. Much easier than Linux command line!

## Prerequisites

- Windows 10/11 (64-bit)
- Administrator access
- Internet connection

## Step 1: Install Required Software

### 1.1 Download and Install Node.js
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (recommended for production)
3. Run the installer with **default settings**
4. Check "Add to PATH" option
5. Open Command Prompt and verify: `node --version`

### 1.2 Install PostgreSQL Database
1. Go to [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Download PostgreSQL installer (latest version)
3. Run installer and remember the **password** you set for postgres user
4. Install with default settings (port 5432)
5. Install pgAdmin (database management tool) when prompted

### 1.3 Install Git (Optional)
1. Go to [git-scm.com](https://git-scm.com/download/win)
2. Download and install with default settings
3. This helps with code updates later

## Step 2: Setup Database

### 2.1 Using pgAdmin (GUI Method - Recommended)
1. Open **pgAdmin** from Start Menu
2. Connect using the password you set during installation
3. Right-click **Databases** → **Create** → **Database**
4. Database name: `social_runner`
5. Click **Save**

### 2.2 Create Database User
1. In pgAdmin, right-click **Login/Group Roles** → **Create** → **Login/Group Role**
2. Name: `runner_user`
3. Go to **Definition** tab → Password: `SocialRunner2025!`
4. Go to **Privileges** tab → Check **Can login?** and **Create databases?**
5. Click **Save**

## Step 3: Download Application Files

### Method 1: Download from Replit (Recommended)
1. Go to your Replit project
2. Click the three dots menu → **Download as ZIP**
3. Extract to `C:\SocialRunner\`

### Method 2: Manual File Transfer
1. Create folder `C:\SocialRunner\`
2. Copy all your project files to this folder

## Step 4: Setup Application

### 4.1 Open Command Prompt as Administrator
1. Press `Win + R` → type `cmd` → Press `Ctrl + Shift + Enter`
2. Navigate to your project: `cd C:\SocialRunner`

### 4.2 Install Dependencies
```cmd
npm install
```

### 4.3 Install Global Tools
```cmd
npm install -g pm2 typescript tsx drizzle-kit
```

## Step 5: Configure Environment

### 5.1 Create Environment File
1. In `C:\SocialRunner\`, create a new file called `.env`
2. Copy and paste this content:

```env
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://runner_user:SocialRunner2025!@localhost:5432/social_runner
PGHOST=localhost
PGPORT=5432
PGDATABASE=social_runner
PGUSER=runner_user
PGPASSWORD=SocialRunner2025!

# Session Secret (generate a random string)
SESSION_SECRET=your_random_32_character_string_here

# OAuth Configuration - REPLACE WITH YOUR ACTUAL VALUES
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
STRAVA_CLIENT_ID=your_strava_client_id_here
STRAVA_CLIENT_SECRET=your_strava_client_secret_here

# Application URLs - REPLACE WITH YOUR ACTUAL IP/DOMAIN
REPLIT_DOMAINS=localhost,127.0.0.1,your-domain.com
ISSUER_URL=https://replit.com/oidc
REPL_ID=your_repl_id_here

# Optional: Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

### 5.2 Get Your OAuth Credentials

#### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Go to **Credentials** → **Create OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
7. Copy Client ID and Client Secret to `.env` file

#### Strava OAuth Setup:
1. Go to [Strava Developers](https://developers.strava.com/)
2. Create new application
3. Authorization Callback Domain: `localhost`
4. Copy Client ID and Client Secret to `.env` file

## Step 6: Setup Database Schema

In Command Prompt:
```cmd
npm run db:push
```

## Step 7: Build and Start Application

### 7.1 Build Application
```cmd
npm run build
```

### 7.2 Start with PM2 (Production)
```cmd
pm2 start dist/index.js --name social-runner
pm2 startup
pm2 save
```

### 7.3 Alternative: Start Directly (Development)
```cmd
npm start
```

## Step 8: Access Your Application

Open your web browser and go to:
- **http://localhost:5000**
- **http://127.0.0.1:5000**
- **http://your-computer-ip:5000** (for network access)

## Step 9: Make Accessible from Internet (Connect to www.thesocialrunner.com.au)

### 9.1 Windows Firewall Configuration
1. Open **Windows Security** → **Firewall & network protection**
2. Click **Advanced settings**
3. Click **Inbound Rules** → **New Rule**
4. Rule Type: **Port**
5. Port: **5000** and **80** (for HTTP)
6. Action: **Allow the connection**
7. Name: **Social Runner App**

### 9.2 Router Port Forwarding (For Internet Access)
To make your app accessible from the internet:

1. **Find Your Router's Admin Panel**:
   - Open Command Prompt: `ipconfig`
   - Note the **Default Gateway** (usually 192.168.1.1 or 192.168.0.1)
   - Open browser and go to that IP address
   - Login with router admin credentials

2. **Set Up Port Forwarding**:
   - Find **Port Forwarding** or **Virtual Server** section
   - Add new rule:
     - **Service Name**: Social Runner
     - **External Port**: 80
     - **Internal Port**: 5000
     - **Internal IP**: Your computer's IP (from ipconfig)
     - **Protocol**: TCP
   - Save settings and restart router

3. **Find Your Public IP**:
   - Visit [whatismyipaddress.com](https://whatismyipaddress.com/)
   - Note your public IP address

### 9.3 Domain Name Setup (www.thesocialrunner.com.au)

#### Option 1: DNS A Record (Recommended)
1. **Login to your domain registrar** (where you bought thesocialrunner.com.au)
2. **Find DNS Management** or **DNS Zone Editor**
3. **Create A Record**:
   - **Name**: @ (for root domain) and www
   - **Type**: A
   - **Value**: Your public IP address
   - **TTL**: 300 (5 minutes)
4. **Save changes** (may take 24-48 hours to propagate)

#### Option 2: Dynamic DNS (If your IP changes)
1. **Sign up for Dynamic DNS service**:
   - [No-IP.com](https://www.noip.com/) (free option)
   - [DynDNS](https://dyn.com/)
   - [Duck DNS](https://www.duckdns.org/) (free)

2. **Install Dynamic DNS client** on your Windows machine
3. **Point your domain** to the dynamic DNS hostname
4. **Update router** to use dynamic DNS hostname

### 9.4 Update Application Configuration
1. **Edit your .env file**:
```env
# Update REPLIT_DOMAINS with your domain
REPLIT_DOMAINS=www.thesocialrunner.com.au,thesocialrunner.com.au,localhost,your-public-ip
```

2. **Restart the application**:
```cmd
pm2 restart social-runner
```

### 9.5 Test Internet Access
1. **From your local network**: `http://www.thesocialrunner.com.au`
2. **From mobile data** (different network): `http://www.thesocialrunner.com.au`
3. **Check from another location**: Ask someone else to test

### 9.6 Optional: Install IIS for Better Web Server (Advanced)
For production use, you can set up IIS as a reverse proxy:

1. **Enable IIS**:
   - Control Panel → Programs → Windows Features
   - Check **Internet Information Services**
   - Include **Application Request Routing** and **URL Rewrite**

2. **Configure IIS as Reverse Proxy**:
   - Create new website in IIS Manager
   - Set port to 80
   - Configure URL Rewrite to proxy to localhost:5000
   - This allows standard HTTP port 80 access

## Step 10: Optional - Install as Windows Service

### 10.1 Install PM2 Windows Service
```cmd
npm install -g pm2-windows-service
pm2-service-install
pm2-service-start
```

This makes the app start automatically when Windows boots.

## Management Commands

### Check Application Status
```cmd
pm2 status
pm2 logs social-runner
```

### Restart Application
```cmd
pm2 restart social-runner
```

### Stop Application
```cmd
pm2 stop social-runner
```

### Update Application
1. Download new files
2. Replace in `C:\SocialRunner\`
3. Run:
```cmd
npm install
npm run build
pm2 restart social-runner
```

## Troubleshooting

### Common Issues:

1. **Port 5000 already in use**
   - Change PORT in `.env` to 3000 or 8000
   - Restart: `pm2 restart social-runner`

2. **Database connection failed**
   - Check PostgreSQL is running (Services → PostgreSQL)
   - Verify password in `.env` matches what you set

3. **npm command not found**
   - Restart Command Prompt after Node.js installation
   - Add Node.js to PATH in System Environment Variables

4. **PM2 command not found**
   - Run: `npm install -g pm2`
   - Restart Command Prompt

### Check Services:
1. Press `Win + R` → type `services.msc` → Enter
2. Look for **postgresql** - should be **Running**

### Database Management:
- Use **pgAdmin** to view/manage your database
- Backup: Right-click database → **Backup**
- Restore: Right-click database → **Restore**

## Windows-Specific Advantages

1. **GUI Tools**: pgAdmin for database, Task Manager for monitoring
2. **No Command Line Complexity**: Most tasks can be done through Windows interface
3. **Familiar Environment**: Windows users feel comfortable
4. **Visual Process Management**: Task Manager shows resource usage
5. **Easy File Management**: Windows Explorer for file operations
6. **Built-in Firewall**: Windows Firewall with GUI configuration

## Production Deployment Options

### Option 1: Local Network Server
- Great for small teams or local organizations
- Access via `http://computer-ip:5000`
- Simple firewall configuration

### Option 2: Windows VPS (Cloud)
- Rent Windows Server VPS from providers like:
  - DigitalOcean Windows Droplets
  - AWS EC2 Windows
  - Azure Windows VMs
  - Vultr Windows instances
- Same setup process, but accessible from internet

### Option 3: Windows Home with Internet Access
- Configure router port forwarding (port 80 → 5000)
- Point www.thesocialrunner.com.au to your public IP
- Use Dynamic DNS if your IP address changes
- Perfect for small business or community use

## Security Considerations

1. **Keep Windows Updated**: Enable automatic updates
2. **Strong Passwords**: Use complex database passwords
3. **Firewall Rules**: Only allow necessary ports (5000)
4. **Antivirus**: Keep Windows Defender or your antivirus active
5. **Regular Backups**: Backup database and application files

Your Social Runner application will be running on Windows with a familiar, manageable environment!