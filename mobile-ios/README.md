# The Social Runner - iOS App

This is the iOS application for The Social Runner platform.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (requires macOS)
npx expo start --ios
```

## Building for Production

```bash
# Login to Expo
npx expo login

# Build for App Store
eas build --platform ios --profile production
```

## Configuration

Edit `app.json` to configure:
- App name and bundle identifier  
- iOS permissions (NSLocationUsageDescription, etc.)
- Icon and splash screen
- Build settings and capabilities

## Deployment to App Store

1. **Prerequisites**
   - Apple Developer Program membership ($99/year)
   - macOS with Xcode installed

2. **Build IPA**:
   ```bash
   eas build --platform ios --profile production
   ```

3. **Create App in App Store Connect**
   - Visit appstoreconnect.apple.com
   - Create new app with bundle ID: `com.thesocialrunner.ios`

4. **Upload and Submit**
   - Upload IPA through Transporter or Xcode
   - Complete app information and submit for review

## Environment Variables

Create `.env` file:
```env
API_BASE_URL=https://your-backend-domain.com/api
EXPO_PUSH_TOKEN=your-expo-push-token
```

## Features

- Native iOS UI components
- Push notifications with iOS-specific styling
- Background app refresh
- iOS-specific permissions handling
- Haptic feedback
- iOS share sheet integration

## Tech Stack

- **Framework**: Expo React Native
- **Language**: TypeScript
- **UI**: React Native with iOS-specific components
- **Navigation**: React Navigation
- **State Management**: React Query
- **Notifications**: Expo Notifications

## Development

```bash
# Start Metro bundler
npx expo start

# Run on iOS Simulator (macOS only)
npx expo start --ios

# Run on physical iOS device
npx expo start --ios --tunnel
```

## iOS-Specific Considerations

### Permissions
All iOS permissions are declared in `app.json` under `ios.infoPlist`:
- Location access for finding nearby events
- Camera access for profile photos
- Photo library access for image selection
- Calendar access for event scheduling

### App Store Guidelines
- Ensure app provides clear value to users
- Include privacy policy if collecting user data
- Follow iOS Human Interface Guidelines
- Test on multiple iOS versions and devices

### TestFlight Beta Testing

```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios --profile preview
```

## Testing

```bash
# Run tests
npm test

# iOS-specific testing
npm run test:ios
```

## Troubleshooting

### Common Issues

**iOS Simulator Issues**
- Ensure Xcode and Command Line Tools are installed
- Reset simulator: Device > Erase All Content and Settings
- Check iOS Simulator version compatibility

**Code Signing Issues**
- Verify Apple Developer account is active
- Check bundle identifier matches App Store Connect
- Ensure provisioning profiles are valid

**Build Failures**
- Clear Expo cache: `npx expo start --clear`
- Update Xcode to latest version
- Check iOS deployment target compatibility

For detailed deployment instructions, see ../DEPLOYMENT_GUIDE.md