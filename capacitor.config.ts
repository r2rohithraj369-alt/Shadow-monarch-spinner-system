import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shadowmonarch.spinner',
  appName: 'Shadow Monarch Spinner System',
  webDir: 'dist',
  server: {
    androidScheme: 'monarchspinner',
    allowNavigation: [
      '*.supabase.co',
      '*.run.app'
    ]
  }
};

export default config;
