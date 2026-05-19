import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.clipai.app',
  appName: 'ClipAI',
  webDir: 'dist',
  server: {
    // On device, set VITE_API_URL in your .env.production before building
    // e.g. VITE_API_URL=https://your-api.yourdomain.com
    androidScheme: 'https',
    // Uncomment and set your server URL to load from a live backend during dev:
    // url: 'http://192.168.1.x:3000',
    // cleartext: true,
  },
  plugins: {
    Camera: {
      // iOS: NSCameraUsageDescription is set in Info.plist by Capacitor automatically
    },
  },
  android: {
    // Target Android 14 (API 34) minimum
    minSdkVersion: 24,
    // Allow cleartext HTTP only in debug builds (set in AndroidManifest)
    allowMixedContent: false,
  },
  ios: {
    // The Capacitor CLI will add camera permission to Info.plist
    contentInset: 'automatic',
  },
};

export default config;
