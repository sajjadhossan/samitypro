import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.samitypro.app',
  appName: 'SamityPro',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // In production or mobile APK, if configured, can load live cloud Vercel URL or local web assets
    url: process.env.CAPACITOR_SERVER_URL || undefined
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0F172A',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#10B981'
    }
  }
};

export default config;
