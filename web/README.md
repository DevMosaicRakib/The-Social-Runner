# The Social Runner - Web Application

This is the web application component of The Social Runner platform.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-super-secret-session-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
```

## Deployment

### Replit Deployments (Recommended)
1. Push to GitHub
2. Connect to Replit Deployments
3. Deploy automatically

### Manual Deployment
```bash
npm run build
npm start
```

## Project Structure

```
web/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
└── package.json     # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Features

- User authentication (email, Google, Strava)
- Event creation and management
- Real-time notifications
- Location-based event discovery
- Running buddy matching
- Progress tracking and achievements

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Multi-provider OAuth
- **Real-time**: WebSockets
- **Build**: Vite

## Support

For deployment issues or questions, refer to the main DEPLOYMENT_GUIDE.md.