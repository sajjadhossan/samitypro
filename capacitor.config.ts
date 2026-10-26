import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.samitypro.app',
  appName: 'SamityPro',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // Connects directly to live Vercel cloud deployment for real-time synchronization
    url: 'https://samitypro.vercel.app',
    allowNavigation: [
      '*'
    ]
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
