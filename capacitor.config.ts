import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor Android config — THE SHIVA
 *
 * The APK is a WebView shell: it loads the full Next.js + MySQL web app from
 * a server URL. The backend cannot run inside the APK.
 *
 * IMPORTANT — set your live backend URL before shipping a release:
 *   1. Edit SERVER_URL below, OR
 *   2. Run:  $env:APP_SERVER_URL="https://your-domain.com"; npx cap sync android
 */
const SERVER_URL =
  process.env.APP_SERVER_URL || 'https://CHANGE-ME.example.com';

const config: CapacitorConfig = {
  appId: 'com.shiva.app',
  appName: 'THE SHIVA',
  webDir: 'www',
  // Load the app from the hosted server (fallback shell lives in www/)
  server: {
    url: SERVER_URL,
    // Allow http:// URLs too (LAN/dev testing). Remove for production HTTPS.
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
