export const ACCENT_COLORS = [
    { id: 'amber', name: 'Amber Altin', color: '#f59e0b', dark: '#b45309', rgb: '245, 158, 11' },
    { id: 'antique-gold', name: 'Antik Altin', color: '#d4af37', dark: '#8c6a05', rgb: '212, 175, 55' },
    { id: 'emerald', name: 'Zumrut', color: '#10b981', dark: '#065f46', rgb: '16, 185, 129' },
    { id: 'deep-emerald', name: 'Derin Zumrut', color: '#0f766e', dark: '#064e3b', rgb: '15, 118, 110' },
    { id: 'olive-gold', name: 'Zeytin Altin', color: '#c7a83b', dark: '#7a6221', rgb: '199, 168, 59' },
];

export const THEMES = [
    {
        id: 'green-gold',
        name: 'Yesil & Altin',
        colors: {
            '--nav-accent': '#d4af37',
            '--primary-color': '#d4af37',
            '--primary-dark': '#8c6a05',
            '--accent-color': '#d4af37',
            '--accent-vibrant': '#d4af37',
            '--accent-gold-light': '#d4af37',
            '--nav-accent-rgb': '212, 175, 55',
        },
        bodyGradient: 'linear-gradient(135deg, #0f3d2e 0%, #1a5c45 100%)'
    },
    // Diger eski temalar gerekirse buraya eklenebilir
];
