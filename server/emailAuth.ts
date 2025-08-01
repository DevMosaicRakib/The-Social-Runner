import bcrypt from 'bcryptjs';
import { Strategy as LocalStrategy } from 'passport-local';
import passport from 'passport';
import type { Express } from 'express';
import { storage } from './storage';
import { registerUserSchema, loginUserSchema, forgotPasswordSchema, resetPasswordSchema } from '@shared/schema';
import { isAuthenticated } from './replitAuth';
import crypto from 'crypto';

// Email verification and password reset functionality
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function setupEmailAuth(app: Express) {
  // Configure Passport Local Strategy
  passport.use('local', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        
        if (!user) {
          return done(null, false, { message: 'No account found with this email address.' });
        }

        if (!user.passwordHash) {
          return done(null, false, { message: 'This account was created with a different sign-in method.' });
        }

        // Check if email is verified
        if (!user.emailVerified) {
          return done(null, false, { message: 'Please verify your email address before signing in. Check your inbox for a verification link.' });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        // Create session-compatible user object
        const sessionUser = {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            profile_image_url: user.profileImageUrl,
          },
          expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
        };

        return done(null, sessionUser);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Register route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

      // Generate email verification token
      const emailVerificationToken = generateVerificationToken();

      // Create user
      const newUser = await storage.createUserFromEmail({
        email: validatedData.email,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        sex: validatedData.sex,
        dateOfBirth: validatedData.dateOfBirth,
        location: validatedData.location,
        emailVerificationToken,
      });

      // Send verification email
      const { emailService } = await import('./emailService');
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const emailSent = await emailService.sendVerificationEmail(
        validatedData.email, 
        validatedData.firstName, 
        emailVerificationToken, 
        baseUrl
      );

      if (!emailSent) {
        console.warn('Failed to send verification email, but user created');
      }

      // Return registration success with verification requirement
      res.status(201).json({ 
        message: 'Registration successful! Please check your email to verify your account before signing in.',
        requiresVerification: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          emailVerified: newUser.emailVerified,
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.issues) {
        // Zod validation error
        return res.status(400).json({ 
          message: 'Invalid input',
          errors: error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        });
      }
      res.status(500).json({ message: 'Failed to create account. Please try again.' });
    }
  });

  // Login route
  app.post('/api/auth/login', (req, res, next) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          console.error('Authentication error:', err);
          return res.status(500).json({ message: 'Authentication failed. Please try again.' });
        }
        
        if (!user) {
          return res.status(401).json({ message: info?.message || 'Invalid email or password.' });
        }

        // Set the session manually instead of using req.login
        (req.session as any).passport = { user: user };
        
        res.json({ 
          message: 'Login successful!',
          user: {
            id: user.claims.sub,
            email: user.claims.email,
            firstName: user.claims.first_name,
            lastName: user.claims.last_name,
          }
        });
      })(req, res, next);
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ 
          message: 'Invalid input',
          errors: error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        });
      }
      res.status(500).json({ message: 'Login failed. Please try again.' });
    }
  });

  // Email verification route
  app.get('/api/auth/verify-email/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const user = await storage.verifyEmail(token);
      
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token.' });
      }

      // Send welcome email after successful verification
      const { emailService } = await import('./emailService');
      await emailService.sendWelcomeEmail(user.email!, user.firstName!);

      res.json({ 
        message: 'Email verified successfully! You can now sign in to your account.',
        verified: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
        }
      });

      res.json({ message: 'Email verified successfully!' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Email verification failed.' });
    }
  });

  // Forgot password route
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !user.passwordHash) {
        // Don't reveal whether the email exists or if it's a social account
        return res.json({ message: 'If an account with this email exists, you will receive a password reset link.' });
      }

      const resetToken = generateVerificationToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.setPasswordResetToken(validatedData.email, resetToken, resetExpires);

      // Send password reset email (development mode will log to console)
      const { emailService } = await import('./emailService');
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const emailSent = await emailService.sendPasswordResetEmail(
        validatedData.email,
        user.firstName || 'User',
        resetToken,
        baseUrl
      );
      
      if (!emailSent) {
        console.warn('Failed to send password reset email, but token stored');
      }
      
      res.json({ message: 'If an account with this email exists, you will receive a password reset link.' });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      if (error.issues) {
        return res.status(400).json({ 
          message: 'Invalid email address',
          errors: error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        });
      }
      res.status(500).json({ message: 'Failed to process password reset request.' });
    }
  });

  // Reset password route
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByPasswordResetToken(validatedData.token);
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token.' });
      }

      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

      await storage.updatePassword(user.id, passwordHash);

      res.json({ message: 'Password reset successfully!' });
    } catch (error: any) {
      console.error('Reset password error:', error);
      if (error.issues) {
        return res.status(400).json({ 
          message: 'Invalid input',
          errors: error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        });
      }
      res.status(500).json({ message: 'Failed to reset password.' });
    }
  });

  // Change password route (for logged-in users)
  app.post('/api/auth/change-password', isAuthenticated, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required.' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.passwordHash) {
        return res.status(400).json({ message: 'Password change not available for this account type.' });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }

      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      await storage.updatePassword(userId, newPasswordHash);

      res.json({ message: 'Password changed successfully!' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password.' });
    }
  });
}