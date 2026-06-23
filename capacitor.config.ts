/// <reference types="@capacitor/local-notifications" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.cuidapet.app',
  appName: 'CuidaPet',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_cuidapet',
      iconColor: '#26A69A',
    },
  },
};

export default config;
