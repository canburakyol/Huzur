import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.huzurapp.android',
    appName: 'Huzur',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 0,
            launchAutoHide: true
        },
        AdMob: {
            appId: 'ca-app-pub-3074026744164717~7167273995'
        }
    }
};

export default config;
