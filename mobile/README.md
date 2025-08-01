# The Social Runner Mobile App

Native iOS and Android mobile apps for The Social Runner platform.

## Overview

This mobile app wraps the existing web application in a native WebView with mobile-specific enhancements:

- **Native Navigation**: Android back button support with exit confirmation
- **Push Notifications**: Expo notifications integration ready for server implementation
- **Offline Detection**: Network connectivity monitoring and offline messaging
- **Mobile Optimizations**: Custom user agent, viewport handling, and touch optimizations
- **Deep Linking**: Ready for custom URL scheme handling
- **App Store Ready**: Configured for iOS App Store and Google Play Store deployment

## Development Setup

### Prerequisites
- Node.js 18+ installed
- Expo CLI: `npm install -g @expo/eas-cli`
- iOS Simulator (Mac only) or Android Studio
- Expo Go app on your phone for testing

### Installation

```bash
cd mobile
npm install
```

### Running the App

```bash
# Start development server
npm start

# Run on iOS simulator (Mac only)
npm run ios

# Run on Android emulator
npm run android

# Test on physical device with Expo Go
npm start
# Scan QR code with Expo Go app
```

## Configuration

### Web URL Configuration
Update the web URL in `App.tsx`:
```typescript
const WEB_URL = 'https://your-domain.replit.app';
```

Or set environment variable:
```bash
export EXPO_PUBLIC_WEB_URL=https://your-domain.replit.app
```

### App Store Configuration
Update `app.json` with your app details:
- Bundle identifiers
- App icons and splash screens
- Permissions and usage descriptions

## Building for Production

### iOS App Store

1. **Setup EAS Build**:
```bash
eas build:configure
```

2. **Build iOS App**:
```bash
eas build --platform ios --profile production
```

3. **Submit to App Store**:
```bash
eas submit --platform ios
```

### Google Play Store

1. **Build Android App**:
```bash
eas build --platform android --profile production
```

2. **Submit to Play Store**:
```bash
eas submit --platform android
```

## Features

### Mobile Enhancements
- **Smart Back Navigation**: Android back button navigates within the web app
- **Exit Confirmation**: Prevents accidental app closure
- **Loading States**: Native loading indicators with app branding
- **Error Handling**: Network error detection with retry options
- **External Link Handling**: Proper handling of mailto and tel links

### Push Notifications
Ready for server-side implementation:
- Expo push notification setup
- Permission handling for iOS and Android
- Token storage for server communication

### Offline Support
- Network connectivity monitoring
- Offline state UI with retry options
- Automatic reconnection handling

## App Store Assets

Create these assets in the `assets/` folder:
- `icon.png` (1024x1024) - App icon
- `splash.png` (1284x2778) - Splash screen
- `adaptive-icon.png` (1024x1024) - Android adaptive icon foreground
- `favicon.png` (32x32) - Web favicon

## Deployment Checklist

### Pre-Deployment
- [ ] Test on physical iOS and Android devices
- [ ] Update app version in `app.json`
- [ ] Configure proper web URL
- [ ] Add app store assets
- [ ] Test offline functionality
- [ ] Verify push notification setup

### App Store Submission
- [ ] Configure Apple Developer account
- [ ] Update bundle identifier and team ID
- [ ] Build and test production version
- [ ] Submit for App Store review

### Google Play Submission
- [ ] Setup Google Play Console account
- [ ] Configure service account for automated submission
- [ ] Build and test production version
- [ ] Submit for Play Store review

## Environment Variables

Create `.env` file:
```
EXPO_PUBLIC_WEB_URL=https://your-domain.replit.app
```

## Troubleshooting

### Common Issues

**Build Failures**:
- Ensure all required permissions are declared
- Check bundle identifiers are unique
- Verify Apple/Google account configurations

**WebView Issues**:
- Test web app is mobile-responsive
- Verify HTTPS configuration
- Check CORS settings if API calls fail

**Notification Problems**:
- Ensure notification permissions are requested
- Test on physical devices (not simulators)
- Verify server-side push notification implementation

## Next Steps

1. **Deploy Web App**: Ensure your web app is deployed and accessible
2. **Test Mobile App**: Use Expo Go to test on physical devices
3. **Build Production**: Create production builds for app stores
4. **Submit Apps**: Submit to iOS App Store and Google Play Store
5. **Monitor Performance**: Use Expo Analytics and app store metrics