# The Social Runner - Android App

This is the Android application for The Social Runner platform.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start --android
```

## Building for Production

```bash
# Login to Expo
npx expo login

# Build for Google Play Store
eas build --platform android --profile production
```

## Configuration

Edit `app.json` to configure:
- App name and bundle identifier
- Permissions and capabilities
- Icon and splash screen
- Build settings

## Deployment to Google Play Store

1. Build production AAB:
   ```bash
   eas build --platform android --profile production
   ```

2. Create Google Play Console account
3. Upload AAB file
4. Complete store listing
5. Submit for review

## Environment Variables

Create `.env` file:
```env
API_BASE_URL=https://your-backend-domain.com/api
EXPO_PUSH_TOKEN=your-expo-push-token
```

## Features

- Native Android UI components
- Push notifications
- Offline support
- Background sync
- Location services
- Camera integration

## Tech Stack

- **Framework**: Expo React Native
- **Language**: TypeScript
- **UI**: React Native components
- **Navigation**: React Navigation
- **State Management**: React Query
- **Notifications**: Expo Notifications

## Development

```bash
# Start Metro bundler
npx expo start

# Run on Android emulator
npx expo start --android

# Run on physical device
npx expo start --android --tunnel
```

## Testing

```bash
# Run tests
npm test

# E2E testing
npm run test:e2e
```

## Troubleshooting

### Common Issues

**Build Failures**
- Clear Expo cache: `npx expo start --clear`
- Check Node.js version compatibility
- Verify all dependencies are installed

**Device Connection**
- Enable USB debugging on Android device
- Check ADB connection: `adb devices`
- Try tunnel connection for network issues

For detailed deployment instructions, see ../DEPLOYMENT_GUIDE.md