import { CloudRain, Wind, Waves, Music, Book, Disc } from 'lucide-react';

export const SLEEP_SOUNDS = [
    // Doğa Sesleri (Mevcut)
    { 
        id: 'rain', 
        nameKey: 'huzurMode.rain', 
        category: 'nature', 
        url: '/sounds/rain.mp3',
        icon: CloudRain 
    },
    { 
        id: 'forest', 
        nameKey: 'huzurMode.forest', 
        category: 'nature', 
        url: '/sounds/forest.mp3',
        icon: Wind 
    },
    { 
        id: 'ocean', 
        nameKey: 'huzurMode.ocean', 
        category: 'nature', 
        url: '/sounds/ocean.mp3',
        icon: Waves 
    },
    
    // Zikirler (Placeholder - Kullanıcı eklemeli)
    { 
        id: 'zikir_subhan', 
        nameKey: 'huzurMode.zikirSubhan', 
        category: 'dhikr', 
        url: '/sounds/zikir_subhan.mp3',
        icon: Disc 
    },
    
    // Enstrümantal (Placeholder)
    { 
        id: 'ney', 
        nameKey: 'huzurMode.ney', 
        category: 'music', 
        url: '/sounds/ney.mp3',
        icon: Music 
    },
    
    // Kuran (Placeholder)
    { 
        id: 'rahman', 
        nameKey: 'huzurMode.rahman', 
        category: 'quran', 
        url: '/sounds/rahman.mp3',
        icon: Book 
    }
];

export const CATEGORIES = [
    { id: 'nature', nameKey: 'huzurMode.catNature', icon: Wind },
    { id: 'dhikr', nameKey: 'huzurMode.catDhikr', icon: Disc },
    { id: 'music', nameKey: 'huzurMode.catMusic', icon: Music },
    { id: 'quran', nameKey: 'huzurMode.catQuran', icon: Book },
];
