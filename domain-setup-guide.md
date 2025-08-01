# Domain Setup Guide - www.thesocialrunner.com.au

## Connecting Your Domain to Windows Deployment

This guide shows you how to connect your existing domain www.thesocialrunner.com.au to your Windows-hosted Social Runner application.

## Prerequisites

- Domain registered: www.thesocialrunner.com.au
- Social Runner app running on Windows (port 5000)
- Router admin access
- Static IP address (or Dynamic DNS setup)

## Step 1: Prepare Your Windows Application

### 1.1 Update Environment Configuration
Edit your `.env` file in `C:\SocialRunner\`:

```env
# Add your domain to REPLIT_DOMAINS
REPLIT_DOMAINS=www.thesocialrunner.com.au,thesocialrunner.com.au,localhost,127.0.0.1

# OAuth redirect URLs should include your domain
# Update these in Google/Strava developer consoles:
# https://www.thesocialrunner.com.au/api/auth/google/callback
# https://www.thesocialrunner.com.au/api/auth/strava/callback
```

### 1.2 Restart Application
```cmd
cd C:\SocialRunner
pm2 restart social-runner
```

## Step 2: Configure Router for Internet Access

### 2.1 Find Your Router Settings
1. Open Command Prompt and type: `ipconfig`
2. Note your **Default Gateway** (usually 192.168.1.1)
3. Open web browser and navigate to that IP
4. Login with router admin credentials

### 2.2 Set Up Port Forwarding
Configure these port forwarding rules:

| Service Name | External Port | Internal Port | Internal IP | Protocol |
|-------------|---------------|---------------|-------------|----------|
| Social Runner HTTP | 80 | 5000 | Your PC IP | TCP |
| Social Runner HTTPS | 443 | 5000 | Your PC IP | TCP |

**Your PC IP**: Use the IPv4 address from `ipconfig` command

### 2.3 Enable DMZ (Alternative Method)
If port forwarding is complex:
1. Find **DMZ** settings in router
2. Set your PC's IP as DMZ host
3. This forwards all traffic to your computer

## Step 3: Domain DNS Configuration

### 3.1 For Australian Domain Registrars

#### Domain Central (.com.au domains)
1. Login to Domain Central account
2. Go to **Domain Management** → **DNS Management**
3. Create these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | Your Public IP | 300 |
| A | www | Your Public IP | 300 |
| CNAME | * | www.thesocialrunner.com.au | 300 |

#### Crazy Domains
1. Login to Crazy Domains
2. **Domain Manager** → **DNS Settings**
3. Add A records pointing to your public IP

#### Netregistry
1. Login to Netregistry
2. **Domain Portfolio** → **DNS Zone Manager**
3. Create A records for @ and www

### 3.2 Find Your Public IP Address
Visit any of these sites to find your public IP:
- [whatismyipaddress.com](https://whatismyipaddress.com/)
- [ipinfo.io](https://ipinfo.io/)
- [checkip.amazonaws.com](https://checkip.amazonaws.com/)

### 3.3 DNS Propagation
- DNS changes take 24-48 hours to propagate globally
- Use [dnschecker.org](https://dnschecker.org/) to monitor propagation
- Local changes may be visible within 5-30 minutes

## Step 4: Dynamic IP Management (If Your IP Changes)

### 4.1 Check If You Have Static IP
Contact your ISP to ask about static IP addresses:
- **Telstra**: Business plans include static IP
- **Optus**: Static IP available for additional cost
- **TPG**: Static IP on business plans
- **Aussie Broadband**: Static IP available

### 4.2 Dynamic DNS Setup (If IP Changes)
If you don't have static IP:

#### No-IP (Free Option)
1. Sign up at [noip.com](https://www.noip.com/)
2. Create hostname: `thesocialrunner.ddns.net`
3. Download No-IP Dynamic Update Client
4. Install on your Windows PC
5. Point your domain to the No-IP hostname using CNAME

#### Duck DNS (Free)
1. Sign up at [duckdns.org](https://www.duckdns.org/)
2. Create subdomain: `thesocialrunner.duckdns.org`
3. Install Duck DNS Windows updater
4. Point your domain to Duck DNS using CNAME

## Step 5: SSL Certificate (HTTPS)

### 5.1 Free SSL with Cloudflare
1. Sign up at [cloudflare.com](https://www.cloudflare.com/)
2. Add your domain: thesocialrunner.com.au
3. Update your domain's nameservers to Cloudflare's
4. Enable **Full SSL** in SSL/TLS settings
5. Cloudflare provides free SSL certificate

### 5.2 Let's Encrypt with Win-ACME (Advanced)
1. Download [win-acme](https://www.win-acme.com/)
2. Run as Administrator
3. Generate certificate for your domain
4. Configure IIS or use reverse proxy

## Step 6: OAuth Provider Updates

### 6.1 Update Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI:
   - `https://www.thesocialrunner.com.au/api/auth/google/callback`
   - `http://www.thesocialrunner.com.au/api/auth/google/callback`

### 6.2 Update Strava OAuth
1. Go to [Strava Developers](https://developers.strava.com/)
2. Edit your application
3. Update **Authorization Callback Domain**:
   - `www.thesocialrunner.com.au`
4. Update redirect URI in your code

## Step 7: Testing and Verification

### 7.1 Local Testing
```cmd
# Test locally first
curl -I http://localhost:5000
# Should return 200 OK
```

### 7.2 Domain Testing
```cmd
# Test your domain (after DNS propagation)
curl -I http://www.thesocialrunner.com.au
nslookup www.thesocialrunner.com.au
```

### 7.3 External Testing
- Test from mobile data (different network)
- Ask friends to test from their locations
- Use online tools like [downforeveryoneorjustme.com](https://downforeveryoneorjustme.com/)

## Step 8: Monitoring and Maintenance

### 8.1 IP Address Monitoring
Create a batch file to check your public IP:

```batch
@echo off
curl -s https://ipinfo.io/ip
echo.
echo Current time: %date% %time%
pause
```

### 8.2 Uptime Monitoring
Set up monitoring services:
- [UptimeRobot](https://uptimerobot.com/) (free)
- [Pingdom](https://www.pingdom.com/)
- [StatusCake](https://www.statuscake.com/)

### 8.3 Regular Backups
Schedule regular backups of:
- Database: Use pgAdmin backup feature
- Application files: Copy C:\SocialRunner folder
- Configuration: Backup .env file

## Troubleshooting

### Common Issues:

1. **Domain not resolving**
   - Check DNS propagation: dnschecker.org
   - Verify A records point to correct IP
   - Wait 24-48 hours for full propagation

2. **Connection refused**
   - Check Windows Firewall allows port 5000
   - Verify router port forwarding is correct
   - Ensure application is running: `pm2 status`

3. **OAuth login fails**
   - Update redirect URIs in Google/Strava
   - Check REPLIT_DOMAINS in .env includes domain
   - Restart application after changes

4. **IP address changed**
   - Update DNS A records with new IP
   - Consider upgrading to static IP
   - Set up Dynamic DNS service

### Support Commands:
```cmd
# Check application status
pm2 status
pm2 logs social-runner

# Check network connectivity
ipconfig
netstat -an | findstr :5000

# Test domain resolution
nslookup www.thesocialrunner.com.au
ping www.thesocialrunner.com.au
```

## Australian-Specific Considerations

### Internet Service Providers
- **Static IP availability**: Check with your ISP
- **Port blocking**: Some ISPs block port 80/443 on residential plans
- **Upload speeds**: Ensure sufficient upload bandwidth for hosting

### Domain Registrars
- **.com.au domains**: Must be registered through approved Australian registrars
- **Local support**: Choose registrars with Australian customer support
- **DNS management**: Ensure registrar provides DNS management tools

### Legal Considerations
- **Privacy policy**: Required for collecting user data
- **Terms of service**: Important for community platform
- **Australian Consumer Law**: Applies to Australian-hosted services

Your Social Runner application will be accessible worldwide at www.thesocialrunner.com.au once DNS propagates!