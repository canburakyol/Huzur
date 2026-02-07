/**
 * Günün Görevleri Havuzu
 * id: Benzersiz kimlik
 * text: Görev açıklaması
 * xp: Kazanılacak puan
 * target: Hedef sayı (örn: 33 defa)
 * type: Görev tipi (zikir, dua, reading, etc.)
 * action: Uygulama içi yönlendirme (opsiyonel) -> '/zikirmatik', '/hatim' vb.
 */
export const QUESTS_POOL = [
    // ZİKİR GÖREVLERİ
    { id: 'q_subhanallah_33', text: '33 defa "Sübhanallah" çek', xp: 50, target: 33, type: 'zikir', subType: 'subhanallah', action: '/zikirmatik' },
    { id: 'q_elhamdulillah_33', text: '33 defa "Elhamdülillah" çek', xp: 50, target: 33, type: 'zikir', subType: 'elhamdulillah', action: '/zikirmatik' },
    { id: 'q_allahuekber_33', text: '33 defa "Allahu Ekber" çek', xp: 50, target: 33, type: 'zikir', subType: 'allahuekber', action: '/zikirmatik' },
    { id: 'q_salavat_10', text: '10 defa Salavat getir', xp: 30, target: 10, type: 'zikir', subType: 'salavat', action: '/zikirmatik' },
    { id: 'q_estagfirullah_100', text: '100 defa İstiğfar et', xp: 100, target: 100, type: 'zikir', subType: 'estagfirullah', action: '/zikirmatik' },
    
    // OKUMA GÖREVLERİ
    { id: 'q_read_esma', text: 'Günün Esma-ül Hüsna\'sını oku', xp: 20, target: 1, type: 'reading', action: '/esma' },
    { id: 'q_read_hadith', text: 'Günün Hadis-i Şerif\'ini oku', xp: 20, target: 1, type: 'reading', action: '/hadis' },
    { id: 'q_read_verse', text: 'Günün Ayetini oku ve düşün', xp: 25, target: 1, type: 'reading', action: '/ayet' },

    // SOSYAL / DİĞER
    { id: 'q_share_dua', text: 'Bir arkadaşınla dua paylaş', xp: 40, target: 1, type: 'social', action: '/dua-share' },
    { id: 'q_check_kaaba', text: 'Kıble yönünü kontrol et', xp: 15, target: 1, type: 'utility', subType: 'qibla', action: '/kible' },
    { id: 'q_check_times', text: 'Namaz vakitlerini kontrol et', xp: 10, target: 1, type: 'utility', subType: 'prayer_times', action: '/' }
];

/**
 * Rastgele 3 görev seçer (Her gün için)
 * @returns {Array} 3 adet görev objesi
 */
export const getRandomDailyQuests = () => {
    const shuffled = [...QUESTS_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map(quest => ({
        ...quest,
        progress: 0,
        completed: false,
        isClaimed: false // Ödül alındı mı?
    }));
};
