import { MailService } from '@sendgrid/mail';

// Email service for sending verification emails
class EmailService {
  private mailService: MailService;
  private isConfigured: boolean = false;

  constructor() {
    this.mailService = new MailService();
    
    // For development testing, disable SendGrid and use console logging
    if (false && process.env.SENDGRID_API_KEY) {
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
      this.isConfigured = true;
      console.log('SendGrid email service configured successfully');
    } else {
      console.log('Email service in development mode - verification emails will be logged to console');
      this.isConfigured = false;
    }
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string, baseUrl: string): Promise<boolean> {
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
    
    const emailContent = {
      to: email,
      from: {
        email: 'noreply@thesocialrunner.com.au',
        name: 'The Social Runner'
      },
      subject: 'Reset Your Password - The Social Runner',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center;">
            <h1>🏃‍♀️ The Social Runner</h1>
            <p>Password Reset Request</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2>Hi ${firstName},</h2>
            <p>We received a request to reset your password for The Social Runner. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
            </div>
            
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            
            <hr style="margin: 20px 0; border: none; height: 1px; background: #e5e7eb;">
            <p style="color: #666; font-size: 14px;">This is an automated email from The Social Runner. Please do not reply.</p>
          </div>
        </div>
      `
    };

    if (this.isConfigured) {
      try {
        await this.mailService.send(emailContent);
        console.log(`Password reset email sent successfully to ${email}`);
        return true;
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        return false;
      }
    } else {
      // Development mode - log email content
      console.log('\n=== PASSWORD RESET EMAIL (Development Mode) ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${emailContent.subject}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('=== END EMAIL ===\n');
      return true;
    }
  }

  async sendVerificationEmail(email: string, firstName: string, verificationToken: string, baseUrl: string): Promise<boolean> {
    const verificationUrl = `${baseUrl}/verify-email/${verificationToken}`;
    
    const emailContent = {
      to: email,
      from: {
        email: 'noreply@thesocialrunner.com.au',
        name: 'The Social Runner'
      },
      subject: 'Verify Your Email - The Social Runner',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .button:hover { background: #ea580c; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
            .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🏃‍♀️ The Social Runner</div>
            <div>Australia's Premier Running Community</div>
          </div>
          
          <div class="content">
            <h2>Welcome ${firstName}!</h2>
            <p>Thank you for joining The Social Runner community. To complete your registration and start connecting with fellow runners, please verify your email address.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <div class="divider"></div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>✅ Complete your runner profile</li>
              <li>🗺️ Discover running events near you</li>
              <li>👥 Connect with local runners</li>
              <li>📅 Create and join running events</li>
              <li>🏃‍♂️ Access personalised training plans</li>
            </ul>
            
            <div class="divider"></div>
            
            <p><strong>Can't click the button?</strong><br>
            Copy and paste this link into your browser:</p>
            <p style="background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace;">${verificationUrl}</p>
            
            <p style="margin-top: 30px;"><strong>Need help?</strong><br>
            If you didn't create an account with The Social Runner, you can safely ignore this email.</p>
          </div>
          
          <div class="footer">
            <p>The Social Runner - Connecting runners, one event at a time</p>
            <p>© 2025 The Social Runner. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome ${firstName}!

Thank you for joining The Social Runner community. To complete your registration and start connecting with fellow runners, please verify your email address.

Click here to verify: ${verificationUrl}

What happens next?
• Complete your runner profile
• Discover running events near you  
• Connect with local runners
• Create and join running events
• Access personalised training plans

If you can't click the link, copy and paste this URL into your browser:
${verificationUrl}

Need help? If you didn't create an account with The Social Runner, you can safely ignore this email.

The Social Runner - Connecting runners, one event at a time
© 2025 The Social Runner. All rights reserved.
      `
    };

    if (!this.isConfigured) {
      // For development - log the email instead of sending
      console.log('\n=== EMAIL VERIFICATION (Development Mode) ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${emailContent.subject}`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log('===============================================\n');
      return true;
    }

    try {
      await this.mailService.send(emailContent);
      console.log(`Verification email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const emailContent = {
      to: email,
      from: {
        email: 'noreply@thesocialrunner.com.au',
        name: 'The Social Runner'
      },
      subject: 'Welcome to The Social Runner Community!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to The Social Runner</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .feature-card { background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #f97316; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🏃‍♀️ The Social Runner</div>
            <div>Welcome to Australia's Premier Running Community!</div>
          </div>
          
          <div class="content">
            <h2>G'day ${firstName}! 🇦🇺</h2>
            <p>Your email has been verified and you're now part of The Social Runner community! We're excited to help you connect with fellow runners across Australia.</p>
            
            <div class="feature-card">
              <h3>🗺️ Discover Events</h3>
              <p>Find parkruns, fun runs, and social running events happening near you. From Sydney to Perth, Brisbane to Melbourne - there's always something happening!</p>
            </div>
            
            <div class="feature-card">
              <h3>👥 Build Connections</h3>
              <p>Connect with runners who share your pace, goals, and interests. Whether you're training for your first 5K or your tenth marathon.</p>
            </div>
            
            <div class="feature-card">
              <h3>📅 Create & Join Events</h3>
              <p>Organise group runs, training sessions, or social events. Help build the running community in your local area.</p>
            </div>
            
            <div class="feature-card">
              <h3>🏃‍♂️ Training Plans</h3>
              <p>Access AI-powered training plans developed with international running coaches. Personalised for your goals and fitness level.</p>
            </div>
            
            <p style="margin-top: 30px;"><strong>Ready to get started?</strong><br>
            Complete your profile, explore events in your area, and start connecting with the running community!</p>
          </div>
          
          <div class="footer">
            <p>The Social Runner - Connecting runners, one event at a time</p>
            <p>© 2025 The Social Runner. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };

    if (!this.isConfigured) {
      console.log(`Welcome email would be sent to ${email} (development mode)`);
      return true;
    }

    try {
      await this.mailService.send(emailContent);
      console.log(`Welcome email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();