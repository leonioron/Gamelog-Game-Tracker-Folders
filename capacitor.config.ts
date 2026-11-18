import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gamelog.app',
  appName: 'Gamelog',
  webDir: 'dist',
  backgroundColor: '#090D14',
  server: {
    androidScheme: 'https',
  },
};

export default config;
