# The Social Runner

A comprehensive social running platform that connects Australian runners through intelligent event management, advanced location-based tracking, and seamless mobile and web experiences.

## Features

- **Multi-Provider Authentication**: Sign in with Strava, Google, or email/password
- **Event Management**: Create and discover running events with intelligent filtering
- **Location-Based Search**: Find events near you with suburb-based search
- **Profile Management**: Complete runner profiles with preferences and statistics
- **Buddy Matching**: Connect with like-minded running partners
- **OAuth Integration**: Sync with Strava activities and clubs
- **Mobile-First Design**: Responsive design optimized for mobile devices

## Technology Stack

- **Frontend**: React 18 with TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Node.js with Express.js, Passport.js authentication
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query for server state
- **Build Tools**: Vite for development and production builds

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- OAuth credentials for Strava and Google (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd the-social-runner
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy example env file
cp .env.example .env

# Configure your environment variables:
DATABASE_URL=postgresql://username:password@localhost:5432/social_runner
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility libraries
├── server/                 # Express.js backend
│   ├── routes/             # API route handlers
│   ├── auth/               # Authentication strategies
│   └── db/                 # Database configuration
├── shared/                 # Shared TypeScript types and schemas
└── scripts/                # Build and deployment scripts
```

## Authentication

The platform supports multiple authentication methods:

- **Email/Password**: Traditional account creation with secure password hashing
- **Strava OAuth**: Import running profile and activity data
- **Google OAuth**: Quick sign-up with Google account

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Email/password login
- `GET /api/auth/strava` - Strava OAuth flow
- `GET /api/auth/google` - Google OAuth flow
- `GET /api/auth/user` - Get current user profile

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event (authenticated)
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/join` - Join event
- `GET /api/events/search/location` - Location-based event search

### Profile
- `PATCH /api/auth/profile` - Update user profile
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/settings` - Update notification preferences

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team.