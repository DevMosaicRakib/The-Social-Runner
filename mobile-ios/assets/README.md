# Mobile App Assets

Place the following required assets in this directory:

## Required Files
- `icon.png` (1024x1024) - Main app icon for both iOS and Android
- `splash.png` (1284x2778) - Splash screen image
- `adaptive-icon.png` (1024x1024) - Android adaptive icon foreground
- `favicon.png` (32x32) - Web favicon for PWA functionality

## Icon Guidelines

### App Icon (icon.png)
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Should work on both light and dark backgrounds
- Will be automatically resized for different platforms

### Splash Screen (splash.png)
- Size: 1284x2778 pixels (iPhone 12 Pro Max dimensions)
- Format: PNG
- Should contain your app logo/branding
- Keep important content in the center safe area

### Adaptive Icon (adaptive-icon.png)
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Android only - the foreground layer of the adaptive icon
- Should work with various background shapes (circle, square, rounded square)

### Favicon (favicon.png)
- Size: 32x32 pixels
- Format: PNG
- Used when the app runs in a web browser

## Creating Assets

You can use the TSR logo from your web app as the basis for these assets. Consider:

1. **Extract the TSR logo** from `client/src/components/tsr-logo.tsx`
2. **Create high-resolution versions** at the required sizes
3. **Test on different backgrounds** to ensure visibility
4. **Use design tools** like Figma, Sketch, or even online generators

## Temporary Placeholders

For development purposes, you can use placeholder assets:
- Copy your existing web app logo/favicon
- Use simple colored backgrounds for splash screens
- Generate assets using online tools like https://appicon.co/

Replace these with professional assets before app store submission.