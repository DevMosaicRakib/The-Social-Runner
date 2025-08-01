import passport from "passport";
import { Strategy as StravaStrategy } from "passport-strava-oauth2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express } from "express";
import { storage } from "./storage";

export function setupStravaAuth(app: Express) {
  // Security: Only enable OAuth if credentials are properly set
  const hasStravaCredentials = process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET;
  const hasGoogleCredentials = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

  // Strava OAuth Strategy
  if (hasStravaCredentials) {
    passport.use(new StravaStrategy({
      clientID: process.env.STRAVA_CLIENT_ID,
      clientSecret: process.env.STRAVA_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production' 
        ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}/api/auth/strava/callback`
        : "/api/auth/strava/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Strava ID
        let user = await storage.getUserByStravaId(profile.id);
        
        if (!user) {
          // Create new user from Strava profile
          user = await storage.createUserFromStrava({
            stravaId: profile.id,
            email: profile.emails?.[0]?.value || null,
            firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || '',
            lastName: profile.name?.familyName || profile.displayName?.split(' ')[1] || '',
            profileImageUrl: profile.photos?.[0]?.value || null,
            location: `${profile._json.city || ''}, ${profile._json.state || ''}, ${profile._json.country || ''}`.trim(),
            stravaAccessToken: accessToken,
            stravaRefreshToken: refreshToken,
            stravaAthlete: profile._json,
            authProvider: 'strava'
          });
        } else {
          // Update existing user's Strava tokens
          user = await storage.updateUserStravaTokens(user.id, {
            stravaAccessToken: accessToken,
            stravaRefreshToken: refreshToken,
            stravaAthlete: profile._json
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // Google OAuth Strategy
  if (hasGoogleCredentials) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production' 
        ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}/api/auth/google/callback`
        : "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await storage.getUserByGoogleId(profile.id);
        
        if (!user) {
          // Create new user from Google profile
          user = await storage.createUserFromGoogle({
            googleId: profile.id,
            email: profile.emails?.[0]?.value || null,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            profileImageUrl: profile.photos?.[0]?.value || null,
            authProvider: 'google'
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // Authentication routes - only register if credentials exist
  if (hasStravaCredentials) {
    app.get('/api/auth/strava', passport.authenticate('strava', { 
      scope: 'read,activity:read' 
    }));
    
    app.get('/api/auth/strava/callback', 
      passport.authenticate('strava', { failureRedirect: '/auth?error=strava_failed' }),
      (req, res) => {
        // Successful authentication
        res.redirect('/profile-setup');
      }
    );
  }

  if (hasGoogleCredentials) {
    app.get('/api/auth/google', passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    }));
    
    app.get('/api/auth/google/callback', 
      passport.authenticate('google', { failureRedirect: '/auth?error=google_failed' }),
      (req, res) => {
        // Successful authentication
        res.redirect('/profile-setup');
      }
    );
  }

  // Fallback routes for when OAuth is not configured
  if (!hasStravaCredentials) {
    app.get('/api/auth/strava', (req, res) => {
      res.status(503).json({ error: 'Strava authentication not configured' });
    });
  }

  if (!hasGoogleCredentials) {
    app.get('/api/auth/google', (req, res) => {
      res.status(503).json({ error: 'Google authentication not configured' });
    });
  }
}

export async function getStravaActivities(accessToken: string) {
  try {
    const response = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=50', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Strava activities');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Strava activities:', error);
    return [];
  }
}

export async function refreshStravaToken(refreshToken: string) {
  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh Strava token');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error refreshing Strava token:', error);
    return null;
  }
}