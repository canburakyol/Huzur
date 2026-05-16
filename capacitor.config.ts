import { CapacitorConfig } from '@capacitor/cli';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env file for Capacitor config context (no external dependency)
function loadEnv() {
    const envPath = resolve(__dirname, '.env');
    if (!existsSync(envPath)) return;

    const content = readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length) {
                process.env[key.trim()] = valueParts.join('=').trim();
            }
        }
    });
}

loadEnv();

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
            appId: process.env.VITE_ADMOB_APP_ID || 'ca-app-pub-3074026744164717~7167273995'
        }
    }
};

export default config;
