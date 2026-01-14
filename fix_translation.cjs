const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public/locales/tr/translation.json');

try {
    console.log('Reading file...');
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove BOM
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }

    let data = JSON.parse(content);
    console.log('JSON parsed successfully.');

    // --- FIX SPLASH & MENU ---
    if (!data.menu) data.menu = {};
    
    // Check if splash contains menu items
    if (data.splash) {
        const menuKeysInSplash = [
            'weeklySermon', 'support', 'quranMemorize', 'mosque', 
            'goPro', 'proMember', 'proMembership', 'version',
            'huzurMode', 'dailyTasks', 'nuzulExplorer', 'wordByWord', 
            'tajweedTutor', 'prayers', 'prayerTeacher', 'settings', 
            'fontSettings', 'library', 'tafsirLibrary', 'tespihat', 
            'agenda', 'hatim', 'multimedia', 'greetingCards', 'theme',
            'imsakiye', 'zikirmatik', 'deedJournal', 'liveBroadcast',
            'zikirWorld', 'hikmetname', 'esmaUlHusna', 'hadiths', 'zakat'
        ];

        menuKeysInSplash.forEach(key => {
            if (data.splash[key]) {
                console.log(`Moving ${key} from splash to menu`);
                data.menu[key] = data.splash[key];
                delete data.splash[key];
            }
        });
    }

    // --- RESTORE MISSING MENU ITEMS ---
    const defaultMenu = {
        "huzurMode": "Huzur Modu",
        "dailyTasks": "Günlük Görevler",
        "nuzulExplorer": "Nüzul Sebebi",
        "wordByWord": "Kelime Kelime",
        "tajweedTutor": "Tecvid Öğreticisi",
        "prayers": "Dualar",
        "prayerTeacher": "Namaz Hocası",
        "settings": "Ayarlar",
        "fontSettings": "Yazı Tipi",
        "library": "Kütüphane",
        "tafsirLibrary": "Tefsir Kütüphanesi",
        "tespihat": "Tespihat",
        "agenda": "Ajanda",
        "hatim": "Hatimler",
        "multimedia": "Multimedya",
        "greetingCards": "Tebrik Kartı",
        "theme": "Tema",
        "imsakiye": "İmsakiye",
        "zikirmatik": "Zikirmatik",
        "deedJournal": "Amel Defteri",
        "liveBroadcast": "Canlı Yayın",
        "zikirWorld": "Zikir Dünyası",
        "hikmetname": "Hikmetname",
        "esmaUlHusna": "Esmaül Hüsna",
        "hadiths": "Vaktin Hadisi",
        "zakat": "Zekatmatik",
        "weeklySermon": "Haftanın Hutbesi",
        "support": "Destek",
        "quranMemorize": "Kuran Ezberle",
        "mosque": "Mescit",
        "goPro": "Pro'ya Geç",
        "proMember": "PRO ÜYE",
        "proMembership": "Pro Üyelik",
        "version": "Versiyon"
    };

    for (const [key, value] of Object.entries(defaultMenu)) {
        if (!data.menu[key]) {
            console.log(`Restoring missing menu item: ${key}`);
            data.menu[key] = value;
        }
    }

    // --- RESTORE COUNTDOWN ---
    if (!data.countdown) {
        console.log('Restoring countdown object');
        data.countdown = {
            "timeUntil": "{{prayer}} Vaktine",
            "remaining": "Kalan Süre",
            "time": "Vakit",
            "hours": "saat",
            "min": "dk",
            "sec": "sn"
        };
    }

    // --- RESTORE TAFSIR ---
    if (!data.tafsir) {
        console.log('Restoring tafsir object');
        data.tafsir = {
            "title": "Tefsir",
            "selectSource": "Tefsir Kaynağı Seç",
            "loading": "Tefsir yükleniyor...",
            "error": "Tefsir yüklenirken hata oluştu",
            "free": "Ücretsiz",
            "source": "Kaynak",
            "sources": {
                "elmalili": "Elmalılı Hamdi Yazır",
                "elmalili_sadece": "Elmalılı (Sadeleştirilmiş)",
                "ibnkathir_tr": "İbn Kesir",
                "ibnkathir_ar": "تفسير ابن كثير",
                "ibnkathir_en": "Tafsir Ibn Kathir",
                "tabari": "تفسير الطبري",
                "diyanet": "Diyanet İşleri",
                "okuyan": "Mehmet Okuyan"
            },
            "proRequired": "Tam tefsiri okumak için Pro üyelik gereklidir",
            "upgradeToPro": "Pro'ya Geç",
            "libraryTitle": "Tefsir Kütüphanesi",
            "searchSurah": "Sure ara..."
        };
    }

    // --- RESTORE CALENDAR ---
    if (!data.calendar) {
         console.log('Restoring calendar object');
         data.calendar = {
            "hijriMonths": {
                "muharram": "Muharrem",
                "safar": "Safer",
                "rabi1": "Rebiülevvel",
                "rabi2": "Rebiülahir",
                "jumada1": "Cemaziyelevvel",
                "jumada2": "Cemaziyelahir",
                "rajab": "Recep",
                "shaban": "Şaban",
                "ramadan": "Ramazan",
                "shawwal": "Şevval",
                "dhul_qada": "Zilkade",
                "dhul_hijja": "Zilhicce"
            },
            "gregorianMonths": {
                "january": "Ocak",
                "february": "Şubat",
                "march": "Mart",
                "april": "Nisan",
                "may": "Mayıs",
                "june": "Haziran",
                "july": "Temmuz",
                "august": "Ağustos",
                "september": "Eylül",
                "october": "Ekim",
                "november": "Kasım",
                "december": "Aralık"
            },
            "days": {
                "sunday": "Pazar",
                "monday": "Pazartesi",
                "tuesday": "Salı",
                "wednesday": "Çarşamba",
                "thursday": "Perşembe",
                "friday": "Cuma",
                "saturday": "Cumartesi"
            }
         };
    }

    // Write back
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('SUCCESS: Translation file completely repaired.');

} catch (err) {
    console.error('FATAL ERROR:', err);
}
