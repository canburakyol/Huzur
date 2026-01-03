// Hikmetname Data
// Islamic wisdom, quotes from scholars, Sufi masters, and prophetic traditions

export const HIKMET_CATEGORIES = [
    { id: 'hadis', title: 'hikmet.categories.hadis.title', icon: '📜', description: 'hikmet.categories.hadis.desc' },
    { id: 'alim', title: 'hikmet.categories.alim.title', icon: '📚', description: 'hikmet.categories.alim.desc' },
    { id: 'sufi', title: 'hikmet.categories.sufi.title', icon: '🌹', description: 'hikmet.categories.sufi.desc' },
    { id: 'ayet', title: 'hikmet.categories.ayet.title', icon: '📖', description: 'hikmet.categories.ayet.desc' }
];

export const HIKMETLER = [
    // Hadis-i Şerifler
    { id: 1, category: 'hadis', text: 'hikmet.items.1.text', source: 'hikmet.items.1.source', reference: 'hikmet.items.1.ref' },
    { id: 2, category: 'hadis', text: 'hikmet.items.2.text', source: 'hikmet.items.2.source', reference: 'hikmet.items.2.ref' },
    { id: 3, category: 'hadis', text: 'hikmet.items.3.text', source: 'hikmet.items.3.source', reference: 'hikmet.items.3.ref' },
    { id: 4, category: 'hadis', text: 'hikmet.items.4.text', source: 'hikmet.items.4.source', reference: 'hikmet.items.4.ref' },
    { id: 5, category: 'hadis', text: 'hikmet.items.5.text', source: 'hikmet.items.5.source', reference: 'hikmet.items.5.ref' },
    { id: 6, category: 'hadis', text: 'hikmet.items.6.text', source: 'hikmet.items.6.source', reference: 'hikmet.items.6.ref' },
    { id: 7, category: 'hadis', text: 'hikmet.items.7.text', source: 'hikmet.items.7.source', reference: 'hikmet.items.7.ref' },
    { id: 8, category: 'hadis', text: 'hikmet.items.8.text', source: 'hikmet.items.8.source', reference: 'hikmet.items.8.ref' },

    // Alimlerden
    { id: 9, category: 'alim', text: 'hikmet.items.9.text', source: 'hikmet.items.9.source', reference: 'hikmet.items.9.ref' },
    { id: 10, category: 'alim', text: 'hikmet.items.10.text', source: 'hikmet.items.10.source', reference: 'hikmet.items.10.ref' },
    { id: 11, category: 'alim', text: 'hikmet.items.11.text', source: 'hikmet.items.11.source', reference: 'hikmet.items.11.ref' },
    { id: 12, category: 'alim', text: 'hikmet.items.12.text', source: 'hikmet.items.12.source', reference: 'hikmet.items.12.ref' },
    { id: 13, category: 'alim', text: 'hikmet.items.13.text', source: 'hikmet.items.13.source', reference: 'hikmet.items.13.ref' },
    { id: 14, category: 'alim', text: 'hikmet.items.14.text', source: 'hikmet.items.14.source', reference: 'hikmet.items.14.ref' },
    { id: 15, category: 'alim', text: 'hikmet.items.15.text', source: 'hikmet.items.15.source', reference: 'hikmet.items.15.ref' },

    // Tasavvuf / Sufi
    { id: 16, category: 'sufi', text: 'hikmet.items.16.text', source: 'hikmet.items.16.source', reference: 'hikmet.items.16.ref' },
    { id: 17, category: 'sufi', text: 'hikmet.items.17.text', source: 'hikmet.items.17.source', reference: 'hikmet.items.17.ref' },
    { id: 18, category: 'sufi', text: 'hikmet.items.18.text', source: 'hikmet.items.18.source', reference: 'hikmet.items.18.ref' },
    { id: 19, category: 'sufi', text: 'hikmet.items.19.text', source: 'hikmet.items.19.source', reference: 'hikmet.items.19.ref' },
    { id: 20, category: 'sufi', text: 'hikmet.items.20.text', source: 'hikmet.items.20.source', reference: 'hikmet.items.20.ref' },
    { id: 21, category: 'sufi', text: 'hikmet.items.21.text', source: 'hikmet.items.21.source', reference: 'hikmet.items.21.ref' },
    { id: 22, category: 'sufi', text: 'hikmet.items.22.text', source: 'hikmet.items.22.source', reference: 'hikmet.items.22.ref' },
    { id: 23, category: 'sufi', text: 'hikmet.items.23.text', source: 'hikmet.items.23.source', reference: 'hikmet.items.23.ref' },

    // Kuran'dan Hikmetler
    { id: 24, category: 'ayet', text: 'hikmet.items.24.text', source: 'hikmet.items.24.source', reference: 'hikmet.items.24.ref' },
    { id: 25, category: 'ayet', text: 'hikmet.items.25.text', source: 'hikmet.items.25.source', reference: 'hikmet.items.25.ref' },
    { id: 26, category: 'ayet', text: 'hikmet.items.26.text', source: 'hikmet.items.26.source', reference: 'hikmet.items.26.ref' },
    { id: 27, category: 'ayet', text: 'hikmet.items.27.text', source: 'hikmet.items.27.source', reference: 'hikmet.items.27.ref' },
    { id: 28, category: 'ayet', text: 'hikmet.items.28.text', source: 'hikmet.items.28.source', reference: 'hikmet.items.28.ref' },
    { id: 29, category: 'ayet', text: 'hikmet.items.29.text', source: 'hikmet.items.29.source', reference: 'hikmet.items.29.ref' },
    { id: 30, category: 'ayet', text: 'hikmet.items.30.text', source: 'hikmet.items.30.source', reference: 'hikmet.items.30.ref' }
];

// Get random hikmet
export const getRandomHikmet = () => {
    return HIKMETLER[Math.floor(Math.random() * HIKMETLER.length)];
};

// Get hikmet by category
export const getHikmetByCategory = (categoryId) => {
    return HIKMETLER.filter(h => h.category === categoryId);
};

// Get daily hikmet (same one each day)
export const getDailyHikmet = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return HIKMETLER[dayOfYear % HIKMETLER.length];
};
