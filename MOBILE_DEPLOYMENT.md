# Mobile App Deployment Guide

This guide covers deploying The Social Runner mobile applications to both Android Google Play Store and iOS App Store.

## Overview

The Social Runner mobile apps are built using Expo React Native with a WebView wrapper approach, providing native mobile experiences while maintaining the full functionality of the web application.

## Project Structure

```
├── mobile-android/          # Android-specific build
│   ├── app.json            # Android app configuration
│   ├── eas.json            # EAS build configuration
│   └── src/                # React Native source code
├── mobile-ios/             # iOS-specific build
│   ├── app.json            # iOS app configuration
│   ├── eas.json            # EAS build configuration
│   └── src/                # React Native source code
└── .github/workflows/      # Automated deployment workflows
```

## Prerequisites

### Development Environment
- Node.js 18 or later
- Expo CLI: `npm install -g @expo/cli`
- EAS CLI: `npm install -g @expo/cli@latest`
- Git for version control

### Android Requirements
- Google Play Console account ($25 one-time fee)
- Android SDK 33+ (via Android Studio)
- Java Development Kit 11+

### iOS Requirements
- Apple Developer Program membership ($99/year)
- macOS with Xcode 14+
- iOS SDK 16+

## Android Deployment

### 1. Setup Google Play Console

1. **Create Developer Account**
   - Visit [Google Play Console](https://play.google.com/console)
   - Pay $25 registration fee
   - Complete identity verification

2. **Create New App**
   - Click "Create app"
   - App name: "The Social Runner"
   - Default language: English (United Kingdom)
   - App or game: App
   - Free or paid: Free

### 2. Configure Android Build

Navigate to `mobile-android/` directory and configure:

```json
// app.json
{
  "expo": {
    "name": "The Social Runner",
    "slug": "the-social-runner-android",
    "version": "1.0.0",
    "android": {
      "package": "com.thesocialrunner.android",
      "versionCode": 1
    }
  }
}
```

### 3. Build for Google Play Store

```bash
cd mobile-android/

# Login to Expo
expo login

# Initialize EAS project
eas init

# Build production AAB (Android App Bundle)
eas build --platform android --profile production

# Download the build
eas build:download [build-id]
```

### 4. Upload to Google Play Console

1. **Upload App Bundle**
   - Go to Play Console → Your App → Release → Production
   - Create new release
   - Upload the AAB file

2. **Complete Store Listing**
   - App details: Description, screenshots, icon
   - Content rating: Complete questionnaire
   - Target audience: Age groups
   - Privacy policy: Required URL

3. **Review and Publish**
   - Review all sections
   - Submit for review (1-3 days)

### 5. Automated Android Deployment

The GitHub workflow in `.github/workflows/deploy-android.yml` handles automatic builds:

```yaml
# Triggered on changes to mobile-android/ directory
on:
  push:
    branches: [main]
    paths: ['mobile-android/**']

# Required secrets in GitHub:
# - EXPO_TOKEN
# - GOOGLE_SERVICE_ACCOUNT_KEY
```

## iOS Deployment

### 1. Setup Apple Developer Account

1. **Join Apple Developer Program**
   - Visit [Apple Developer](https://developer.apple.com)
   - Enroll in Developer Program ($99/year)
   - Complete team setup

2. **Create App in App Store Connect**
   - Visit [App Store Connect](https://appstoreconnect.apple.com)
   - Create new app
   - Bundle ID: `com.thesocialrunner.ios`

### 2. Configure iOS Build

Navigate to `mobile-ios/` directory and configure:

```json
// app.json
{
  "expo": {
    "name": "The Social Runner",
    "slug": "the-social-runner-ios",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.thesocialrunner.ios",
      "buildNumber": "1"
    }
  }
}
```

### 3. Build for App Store

```bash
cd mobile-ios/

# Login to Expo
expo login

# Build production IPA
eas build --platform ios --profile production

# Download the build
eas build:download [build-id]
```

### 4. Upload to App Store Connect

1. **Upload IPA File**
   - Use Transporter app or Xcode
   - Upload IPA to App Store Connect

2. **Complete App Information**
   - App Store listing: Description, screenshots, keywords
   - Pricing: Free
   - App Review Information: Demo account if needed

3. **Submit for Review**
   - Review app details
   - Submit for App Store review (1-3 days)

### 5. Automated iOS Deployment

The GitHub workflow in `.github/workflows/deploy-ios.yml` handles automatic builds:

```yaml
# Triggered on changes to mobile-ios/ directory
on:
  push:
    branches: [main]
    paths: ['mobile-ios/**']

# Required secrets in GitHub:
# - EXPO_TOKEN
# - APPLE_ID
# - APPLE_APP_SPECIFIC_PASSWORD
```

## Environment Variables

### Required Secrets

Add these secrets to your GitHub repository or build environment:

```env
# Expo
EXPO_TOKEN=your-expo-access-token

# Android
GOOGLE_SERVICE_ACCOUNT_KEY=your-service-account-json

# iOS
APPLE_ID=your-apple-id@example.com
APPLE_APP_SPECIFIC_PASSWORD=your-app-specific-password

# API Configuration
API_BASE_URL=https://your-web-app-domain.com/api
```

### Getting Expo Token

```bash
# Login to Expo
expo login

# Generate access token
expo whoami
```

## Version Management

### Updating App Versions

For new releases, update version numbers in both platforms:

```json
// mobile-android/app.json
{
  "version": "1.0.1",
  "android": {
    "versionCode": 2
  }
}

// mobile-ios/app.json
{
  "version": "1.0.1",
  "ios": {
    "buildNumber": "2"
  }
}
```

### Release Process

1. **Update Version Numbers**
   - Increment `version` (semantic versioning)
   - Increment `versionCode` (Android) and `buildNumber` (iOS)

2. **Build and Test**
   ```bash
   # Build development version for testing
   eas build --platform all --profile preview
   ```

3. **Production Build**
   ```bash
   # Build production version
   eas build --platform all --profile production
   ```

4. **Submit to Stores**
   ```bash
   # Submit to both stores
   eas submit --platform all --profile production
   ```

## App Store Guidelines

### Android (Google Play)

- **Content Policy**: Ensure app content complies with Play policies
- **Technical Requirements**: Target API level 33+
- **Privacy**: Provide privacy policy URL
- **Permissions**: Only request necessary permissions

### iOS (App Store)

- **App Store Review Guidelines**: Follow Apple's guidelines strictly
- **Human Interface Guidelines**: Use native iOS design patterns
- **Privacy**: Provide privacy policy and permission usage descriptions
- **Performance**: App must launch quickly and run smoothly

## Troubleshooting

### Common Build Issues

**Android Build Failures**
```bash
# Clear Expo cache
expo start --clear

# Check Android SDK version
eas build --platform android --profile development --clear-cache
```

**iOS Build Failures**
```bash
# Update Xcode Command Line Tools
xcode-select --install

# Check iOS deployment target
# Ensure iOS 13.0+ in app.json
```

### Store Rejection Issues

**Google Play Common Issues**
- Missing privacy policy
- Incorrect target audience
- Misleading app description
- Excessive permissions

**App Store Common Issues**
- App crashes on launch
- Missing app functionality
- Violates design guidelines
- Privacy permission descriptions unclear

### Testing Before Release

**Android Testing**
```bash
# Build APK for testing
eas build --platform android --profile preview

# Install on device via ADB
adb install app.apk
```

**iOS Testing**
```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Submit to TestFlight for beta testing
eas submit --platform ios --profile preview
```

## Monitoring and Analytics

### Crash Reporting

Both apps include crash reporting through Expo Application Services:

- Real-time crash reports
- Performance monitoring
- User analytics
- Error tracking

### Usage Analytics

Monitor app performance through:

- Google Play Console (Android)
- App Store Connect (iOS)
- Expo Analytics
- Custom analytics integration

## Support and Maintenance

### Regular Updates

- **Monthly**: Security patches and bug fixes
- **Quarterly**: Feature updates and improvements
- **Annually**: Major version releases

### User Feedback

Monitor user reviews and ratings:

- Google Play Console reviews
- App Store Connect reviews
- In-app feedback system
- Customer support channels

### Performance Monitoring

Track key metrics:

- App launch time
- Crash rates
- User retention
- Feature usage

## Next Steps

After successful deployment:

1. **Monitor Launch Metrics**
   - Download numbers
   - User ratings
   - Crash reports

2. **Gather User Feedback**
   - App store reviews
   - In-app feedback
   - Usage analytics

3. **Plan Updates**
   - Bug fixes
   - Feature improvements
   - Performance optimisations

4. **Marketing and Promotion**
   - Social media campaigns
   - Running community outreach
   - App store optimisation

For detailed technical implementation, refer to the main `DEPLOYMENT_GUIDE.md`.