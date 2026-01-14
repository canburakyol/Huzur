import json

tr_path = r'd:\Projem\public\locales\tr\tajweed.json'
en_path = r'd:\Projem\public\locales\en\tajweed.json'

tr_ui = {
  "title": "Tecvid Öğreticisi",
  "subtitle": "Kuran okumanızı güzelleştirin",
  "rule": "Kural",
  "letters": "Harfler",
  "examples": "Örnekler",
  "understood": "Anladım, Pratik Yap",
  "audioNotReady": "Ses dosyası hazır değil.",
  "audioError": "Ses çalınırken hata oluştu: {{error}}",
  "aiCheck": {
    "title": "AI ile Telaffuz Kontrolü",
    "desc": "Yapay zeka ile okuyuşunuzu analiz edin ve anlık geri bildirim alın.",
    "comingSoon": "Yakında"
  }
}

en_ui = {
  "title": "Tajweed Tutor",
  "subtitle": "Improve your Quran recitation",
  "rule": "Rule",
  "letters": "Letters",
  "examples": "Examples",
  "understood": "Understood, Practice",
  "audioNotReady": "Audio file not ready.",
  "audioError": "Error playing audio: {{error}}",
  "aiCheck": {
    "title": "AI Pronunciation Check",
    "desc": "Analyze your recitation with AI and get instant feedback.",
    "comingSoon": "Coming Soon"
  }
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
    
print("Updated tajweed.json with UI strings")
