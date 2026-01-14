import json

tr_path = r'd:\Projem\public\locales\tr\wordByWord.json'
en_path = r'd:\Projem\public\locales\en\wordByWord.json'

tr_ui = {
  "title": "Kelime Kelime Kuran",
  "selectSurah": "Sure Seçiniz",
  "freeSurahsBadge": "{{count}} Ücretsiz Sure",
  "chooseSurah": "Sure Seçimi",
  "freeSurahsInfo": "Aşağıdaki sureler ücretsiz olarak erişime açıktır.",
  "unlockAll": "Tüm Sureleri Aç",
  "unlockAllDesc": "Pro'ya geçerek tüm Kuran'ı kelime kelime inceleyin",
  "ayahCount": "{{count}} Ayet",
  "analyze": "Analiz Et",
  "changeSurah": "Sureyi Değiştir",
  "analyzing": "Kelime analiz ediliyor...",
  "close": "Kapat",
  "limitTitle": "Günlük Limit Aşıldı",
  "limitDesc": "Günlük kelime analizi limitine ulaştınız. Sınırsız analiz için Pro'ya geçin.",
  "goToPro": "Pro'ya Geç",
  "analysisError": "Analiz hatası",
  "unknownError": "Bilinmeyen hata",
  "analysisErrorGeneric": "Analiz yapılırken bir hata oluştu."
}

en_ui = {
  "title": "Word by Word Quran",
  "selectSurah": "Select Surah",
  "freeSurahsBadge": "{{count}} Free Surahs",
  "chooseSurah": "Choose Surah",
  "freeSurahsInfo": "The following surahs are available for free.",
  "unlockAll": "Unlock All Surahs",
  "unlockAllDesc": "Upgrade to Pro to access word-by-word for the entire Quran",
  "ayahCount": "{{count}} Ayahs",
  "analyze": "Analyze",
  "changeSurah": "Change Surah",
  "analyzing": "Analyzing word...",
  "close": "Close",
  "limitTitle": "Daily Limit Reached",
  "limitDesc": "You have reached your daily word analysis limit. Upgrade to Pro for unlimited analysis.",
  "goToPro": "Go Pro",
  "analysisError": "Analysis error",
  "unknownError": "Unknown error",
  "analysisErrorGeneric": "An error occurred during analysis."
}

with open(tr_path, 'r', encoding='utf-8') as f:
    tr_data = json.load(f)
tr_data['ui'] = tr_ui
with open(tr_path, 'w', encoding='utf-8') as f:
    json.dump(tr_data, f, indent=2, ensure_ascii=False)

with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)
en_data['ui'] = en_ui
with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, indent=2, ensure_ascii=False)
    
print("Updated wordByWord.json with UI strings")
