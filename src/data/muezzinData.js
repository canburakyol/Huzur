export const MUEZZINS = [
    { 
        id: 'default', 
        name: 'Varsayılan', 
        city: 'Standart', 
        audioUrl: '/sounds/ezan_default.mp3',
        description: 'Standart bildirim sesi'
    },
    { 
        id: 'mecca', 
        name: 'Mekke Makamı', 
        city: 'Mekke', 
        audioUrl: '/sounds/ezan_mecca.mp3',
        description: 'Kabe-i Muazzama müezzinlerinden'
    },
    { 
        id: 'medina', 
        name: 'Medine Makamı', 
        city: 'Medine', 
        audioUrl: '/sounds/ezan_medina.mp3',
        description: 'Mescid-i Nebevi huzuru'
    },
    { 
        id: 'istanbul', 
        name: 'İstanbul Makamı', 
        city: 'İstanbul', 
        audioUrl: '/sounds/ezan_istanbul.mp3',
        description: 'Saba makamında İstanbul ezanı'
    },
    { 
        id: 'cairo', 
        name: 'Kahire Makamı', 
        city: 'Kahire', 
        audioUrl: '/sounds/ezan_cairo.mp3',
        description: 'Mısır tavrı, Rast makamı'
    }
];

export const getMuezzinById = (id) => {
    return MUEZZINS.find(m => m.id === id) || MUEZZINS[0];
};
