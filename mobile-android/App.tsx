import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  BackHandler, 
  Platform, 
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  AppState,
  Linking
} from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://your-domain.replit.app';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(WEB_URL);
  const [appState, setAppState] = useState(AppState.currentState);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>('undetermined');
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  // Handle splash screen
  useEffect(() => {
    const hideSplash = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Show splash for 2 seconds
      await SplashScreen.hideAsync();
    };
    
    hideSplash();
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      
      // Show exit confirmation
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit The Social Runner?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => BackHandler.exitApp() }
        ]
      );
      return true;
    });

    return () => backHandler.remove();
  }, [canGoBack]);



  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);
      
      // Notify web app of connection status
      if (webViewRef.current && !loading) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'network_status',
          isConnected: connected,
          connectionType: state.type
        }));
      }
    });

    return () => unsubscribe();
  }, [loading]);

  // Monitor app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground - refresh if needed
        if (webViewRef.current && isConnected) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'app_foreground'
          }));
        }
      }
      setAppState(nextAppState);
    });

    return () => subscription?.remove();
  }, [appState, isConnected]);

  // Monitor screen dimensions for adaptive layout
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
      
      // Notify web app of screen changes
      if (webViewRef.current && !loading) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'screen_change',
          dimensions: window,
          isTablet: window.width > 768
        }));
      }
    });

    return () => subscription?.remove();
  }, [loading]);

  // Handle notification responses
  useEffect(() => {
    if (lastNotificationResponse) {
      const data = lastNotificationResponse.notification.request.content.data;
      
      if (data.url && webViewRef.current) {
        // Navigate to specific URL from notification
        webViewRef.current.postMessage(JSON.stringify({
          type: 'notification_tap',
          url: data.url,
          data: data
        }));
      }
    }
  }, [lastNotificationResponse]);

  // Request notification permissions and setup
  useEffect(() => {
    setupPushNotifications();
  }, []);

  const setupPushNotifications = useCallback(async () => {
    try {
      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('events', {
          name: 'Running Events',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#f97316',
          sound: 'default',
          description: 'Notifications about running events you\'ve joined'
        });

        await Notifications.setNotificationChannelAsync('social', {
          name: 'Social Updates',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 150, 150, 150],
          lightColor: '#3b82f6',
          sound: 'default',
          description: 'Social interactions and community updates'
        });

        await Notifications.setNotificationChannelAsync('achievements', {
          name: 'Achievements',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 300, 100, 300],
          lightColor: '#10b981',
          sound: 'default',
          description: 'Your running achievements and milestones'
        });
      }

      if (!Device.isDevice) {
        setNotificationPermission('unavailable');
        return;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      setNotificationPermission(existingStatus);

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });
        finalStatus = status;
        setNotificationPermission(status);
      }

      if (finalStatus === 'granted') {
        try {
          // Get push token
          const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
          });
          
          if (tokenData?.data) {
            setPushToken(tokenData.data);
            await AsyncStorage.setItem('pushToken', tokenData.data);
            
            // Send token to web app
            setTimeout(() => {
              if (webViewRef.current) {
                webViewRef.current.postMessage(JSON.stringify({
                  type: 'push_token',
                  token: tokenData.data,
                  permission: finalStatus
                }));
              }
            }, 2000); // Wait for web app to load
          }
        } catch (tokenError) {
          console.log('Error getting push token:', tokenError);
        }
      }
    } catch (error) {
      console.log('Error setting up push notifications:', error);
    }
  }, []);

  // Adaptive performance optimization
  const getPerformanceConfig = useCallback(() => {
    const { width, height } = screenData;
    const isTablet = width > 768;
    const isLowEndDevice = Device.totalMemory ? Device.totalMemory < 3000000000 : false; // Less than 3GB RAM
    
    return {
      // Reduce animations on low-end devices
      enableAnimations: !isLowEndDevice,
      // Adjust image quality based on screen size
      imageQuality: isTablet ? 'high' : 'medium',
      // Reduce concurrent network requests on slow devices
      maxConcurrentRequests: isLowEndDevice ? 3 : 6,
      // Enable hardware acceleration
      hardwareAcceleration: true,
      // Adjust cache settings
      cacheEnabled: true,
      cacheSize: isLowEndDevice ? 50 : 100, // MB
      // Screen metrics
      screenMetrics: {
        width,
        height,
        isTablet,
        pixelRatio: screenData.scale,
        fontScale: screenData.fontScale
      }
    };
  }, [screenData]);

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCurrentUrl(navState.url);
    setLoading(navState.loading);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    Alert.alert(
      'Connection Error',
      'Unable to load The Social Runner. Please check your internet connection and try again.',
      [
        { text: 'Retry', onPress: () => webViewRef.current?.reload() },
        { text: 'OK' }
      ]
    );
  };

  const injectedJavaScript = `
    // Enhanced mobile-specific optimizations
    (function() {
      // Performance configuration
      const performanceConfig = ${JSON.stringify(getPerformanceConfig())};
      
      // Add viewport meta tag for optimal mobile experience
      var meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);
      
      // Enhance mobile app context
      window.isMobileApp = true;
      window.platform = '${Platform.OS}';
      window.deviceInfo = {
        isTablet: performanceConfig.screenMetrics.isTablet,
        screenWidth: performanceConfig.screenMetrics.width,
        screenHeight: performanceConfig.screenMetrics.height,
        pixelRatio: performanceConfig.screenMetrics.pixelRatio,
        fontScale: performanceConfig.screenMetrics.fontScale
      };
      
      // Performance optimizations
      window.performanceConfig = performanceConfig;
      
      // Mobile-optimized touch handling
      document.addEventListener('touchstart', function(e) {
        // Prevent 300ms click delay
        if (e.touches.length === 1) {
          e.target.click && e.target.click();
        }
      }, { passive: true });
      
      // Optimized scroll performance
      var lastScrollTime = 0;
      window.addEventListener('scroll', function() {
        var now = Date.now();
        if (now - lastScrollTime > 16) { // ~60fps
          lastScrollTime = now;
          // Throttled scroll handling
        }
      }, { passive: true });
      
      // Handle external links and deep links
      document.addEventListener('click', function(e) {
        var target = e.target.closest('a');
        if (target && target.href) {
          if (target.href.startsWith('mailto:') || target.href.startsWith('tel:')) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'external_link',
              url: target.href
            }));
            e.preventDefault();
          } else if (target.href.includes('thesocialrunner://')) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'deep_link',
              url: target.href
            }));
            e.preventDefault();
          }
        }
      });
      
      // Push notification handlers
      window.registerPushNotifications = function(userId) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'register_push',
          userId: userId
        }));
      };
      
      window.showLocalNotification = function(title, body, data) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'local_notification',
          title: title,
          body: body,
          data: data || {}
        }));
      };
      
      // Enhanced error handling
      window.addEventListener('error', function(e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'javascript_error',
          message: e.message,
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno
        }));
      });
      
      // Network status handler
      window.addEventListener('online', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'network_online'
        }));
      });
      
      window.addEventListener('offline', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'network_offline'
        }));
      });
      
      // Adaptive image loading based on performance config
      if (!performanceConfig.enableAnimations) {
        // Disable CSS animations on low-end devices
        var style = document.createElement('style');
        style.textContent = '*, *::before, *::after { animation-duration: 0.01ms !important; animation-delay: 0.01ms !important; transition-duration: 0.01ms !important; transition-delay: 0.01ms !important; }';
        document.head.appendChild(style);
      }
      
      // Notify app when page is ready with performance metrics
      var startTime = performance.now();
      window.addEventListener('load', function() {
        var loadTime = performance.now() - startTime;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'page_ready',
          loadTime: loadTime,
          performanceConfig: performanceConfig
        }));
      });
      
      // Initial ready signal
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'script_injected',
        timestamp: Date.now()
      }));
    })();
    true;
  `;

  const handleMessage = useCallback(async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'external_link':
          // Handle mailto and tel links
          if (data.url.startsWith('mailto:') || data.url.startsWith('tel:')) {
            await Linking.openURL(data.url);
          }
          break;
          
        case 'deep_link':
          // Handle deep links within the app
          console.log('Deep link:', data.url);
          break;
          
        case 'register_push':
          // Register user for push notifications
          if (pushToken && data.userId) {
            await AsyncStorage.setItem('userId', data.userId);
            // Here you would typically send the push token to your server
            console.log('Registered push notifications for user:', data.userId);
          }
          break;
          
        case 'local_notification':
          // Show local notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: data.title,
              body: data.body,
              data: data.data,
              sound: 'default',
            },
            trigger: null, // Show immediately
          });
          break;
          
        case 'page_ready':
          console.log('Page loaded in', data.loadTime, 'ms');
          setLoading(false);
          
          // Send initial app context to web app
          if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'app_context',
              pushToken: pushToken,
              notificationPermission: notificationPermission,
              deviceInfo: getPerformanceConfig().screenMetrics,
              platform: Platform.OS,
              appVersion: Constants.expoConfig?.version || '1.0.0'
            }));
          }
          break;
          
        case 'javascript_error':
          console.log('Web app error:', data.message, 'at', data.filename + ':' + data.lineno);
          break;
          
        case 'network_online':
        case 'network_offline':
          setIsConnected(data.type === 'network_online');
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.log('Message parsing error:', error);
    }
  }, [pushToken, notificationPermission, getPerformanceConfig]);

  if (!isConnected) {
    return (
      <View style={styles.offlineContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Text style={styles.offlineTitle}>No Internet Connection</Text>
        <Text style={styles.offlineText}>
          Please check your internet connection and try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Loading The Social Runner...</Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_URL }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        userAgent={`TheSocialRunnerMobileApp/1.0 (${Platform.OS}; ${Device.modelName || 'Unknown'})`}
        cacheEnabled={getPerformanceConfig().cacheEnabled}
        cacheMode="LOAD_DEFAULT"
        overScrollMode="never"
        bounces={Platform.OS === 'ios'}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyboardDisplayRequiresUserAction={false}
        hideKeyboardAccessoryView={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        dataDetectorTypes="none"
        allowsProtectedMedia={true}
        useWebKit={true}
        applicationNameForUserAgent="The Social Runner"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  offlineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  offlineText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});