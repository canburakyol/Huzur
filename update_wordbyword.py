import json
import os
import re

tr_json_file = r'd:\Projem\public\locales\tr\wordByWord.json'
en_json_file = r'd:\Projem\public\locales\en\wordByWord.json'
js_file = r'd:\Projem\src\data\wordByWordData.js'

tr_data = {
    "surahs": {
        "1": {
            "name": "Fatiha",
            "meaning": "Açılış",
            "verses": {
                "1": { "words": ["adıyla", "Allah'ın", "Rahman olan", "Rahim olan"] },
                "2": { "words": ["Hamd", "Allah'a aittir", "Rabbi", "âlemlerin"] },
                "3": { "words": ["Rahman", "Rahim"] },
                "4": { "words": ["Sahibi", "günün", "hesap/din"] },
                "5": { "words": ["Yalnız Sana", "ibadet ederiz", "ve yalnız Senden", "yardım dileriz"] },
                "6": { "words": ["Bizi hidayet et", "yola", "dosdoğru"] },
                "7": { "words": ["Yoluna", "o kimselerin", "nimet verdiğin", "onlara", "değil", "gazaba uğramışların", "onların", "ve değil", "sapıtmışların"] }
            }
        },
        "112": {
            "name": "İhlas",
            "meaning": "Samimiyet/Arınma",
            "verses": {
                "1": { "words": ["De ki", "O", "Allah", "birdir"] },
                "2": { "words": ["Allah", "Samed'dir (her şey O'na muhtaç)"] },
                "3": { "words": ["-medi", "doğurmadı", "ve -medi", "doğurulmadı"] },
                "4": { "words": ["Ve olmadı", "olmak", "O'nun", "dengi", "hiçbiri"] }
            }
        },
        "113": {
            "name": "Felak",
            "meaning": "Sabah Aydınlığı",
            "verses": {
                "1": { "words": ["De ki", "sığınırım", "Rabbine", "sabahın"] },
                "2": { "words": ["-dan/-den", "şerrinden", "şeylerin", "yarattığı"] },
                "3": { "words": ["Ve -dan", "şerrinden", "karanlığın", "zaman", "çöktüğü"] },
                "4": { "words": ["Ve -dan", "şerrinden", "üfürükçülerin", "içinde", "düğümlere"] },
                "5": { "words": ["Ve -dan", "şerrinden", "hasetçinin", "zaman", "haset ettiği"] }
            }
        },
        "114": {
            "name": "Nas",
            "meaning": "İnsanlar",
            "verses": {
                "1": { "words": ["De ki", "sığınırım", "Rabbine", "insanların"] },
                "2": { "words": ["Melik'ine (Hükümdarına)", "insanların"] },
                "3": { "words": ["İlahına", "insanların"] },
                "4": { "words": ["-dan", "şerrinden", "vesvesecinin", "sinsi sinsi geri çekilenin"] },
                "5": { "words": ["Ki o", "vesvese verir", "içinde", "göğüslerinin", "insanların"] },
                "6": { "words": ["-dan", "cinlerden", "ve insanlardan"] }
            }
        }
    }
}

en_data = {
    "surahs": {
        "1": {
            "name": "Al-Fatiha",
            "meaning": "The Opening",
            "verses": {
                "1": { "words": ["In the name", "of Allah", "the Entirely Merciful", "the Especially Merciful"] },
                "2": { "words": ["All praise", "is due to Allah", "Lord", "of the worlds"] },
                "3": { "words": ["The Entirely Merciful", "The Especially Merciful"] },
                "4": { "words": ["Sovereign", "of the Day", "of Recompense"] },
                "5": { "words": ["It is You", "we worship", "and You", "we ask for help"] },
                "6": { "words": ["Guide us", "to the path", "the straight"] },
                "7": { "words": ["The path", "of those", "You have bestowed favor", "upon them", "not", "of those who have evoked [Your] anger", "upon them", "and not", "of those who are astray"] }
            }
        },
        "112": {
            "name": "Al-Ikhlas",
            "meaning": "Sincerity",
            "verses": {
                "1": { "words": ["Say", "He is", "Allah", "One"] },
                "2": { "words": ["Allah", "the Eternal Refuge"] },
                "3": { "words": ["He neither", "begets", "nor", "is born"] },
                "4": { "words": ["And nor", "is", "to Him", "equivalent", "anyone"] }
            }
        },
        "113": {
            "name": "Al-Falaq",
            "meaning": "The Daybreak",
            "verses": {
                "1": { "words": ["Say", "I seek refuge", "in the Lord", "of daybreak"] },
                "2": { "words": ["From", "the evil", "of that which", "He created"] },
                "3": { "words": ["And from", "the evil", "of darkness", "when", "it settles"] },
                "4": { "words": ["And from", "the evil", "of the blowers", "in", "knots"] },
                "5": { "words": ["And from", "the evil", "of an envier", "when", "he envies"] }
            }
        },
        "114": {
            "name": "An-Nas",
            "meaning": "Mankind",
            "verses": {
                "1": { "words": ["Say", "I seek refuge", "in the Lord", "of mankind"] },
                "2": { "words": ["The Sovereign", "of mankind"] },
                "3": { "words": ["The God", "of mankind"] },
                "4": { "words": ["From", "the evil", "of the whisperer", "the withdrawing"] },
                "5": { "words": ["Who", "whispers", "in", "the breasts", "of mankind"] },
                "6": { "words": ["From", "the jinn", "and mankind"] }
            }
        }
    }
}

os.makedirs(os.path.dirname(tr_json_file), exist_ok=True)
os.makedirs(os.path.dirname(en_json_file), exist_ok=True)

with open(tr_json_file, 'w', encoding='utf-8') as f:
    json.dump(tr_data, f, indent=2, ensure_ascii=False)
    
with open(en_json_file, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, indent=2, ensure_ascii=False)

# Update JS file
with open(js_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Helper to replace content
# We need to replace name: "...", meaning: "..." (surah), and meaning: "..." (word)
# This is tricky with regex because meaning appears in both places.

# Strategy:
# 1. Split by Surah (using keys like `1: {`, `112: {`)
# 2. Inside Surah, replace name and meaning.
# 3. Inside verses, replace words meanings.

def process_surah(match):
    surah_id = match.group(1)
    surah_body = match.group(2)
    
    # Replace Surah name and meaning
    surah_body = re.sub(r'name: "([^"]+)"', f'nameKey: "surahs.{surah_id}.name"', surah_body)
    surah_body = re.sub(r'meaning: "([^"]+)"', f'meaningKey: "surahs.{surah_id}.meaning"', surah_body, count=1) # First meaning is surah meaning
    
    # Process verses
    def process_verse(v_match):
        verse_num = v_match.group(1)
        verse_body = v_match.group(2)
        
        # Process words
        word_idx = 0
        def process_word(w_match):
            nonlocal word_idx
            w_body = w_match.group(0)
            # Replace meaning
            w_body = re.sub(r'meaning: "([^"]+)"', f'meaningKey: "surahs.{surah_id}.verses.{verse_num}.words.{word_idx}"', w_body)
            word_idx += 1
            return w_body
            
        verse_body = re.sub(r'\{ arabic: "[^"]+", transliteration: "[^"]+", meaning: "[^"]+" \}', process_word, verse_body)
        return f'number: {verse_num},{verse_body}'

    surah_body = re.sub(r'number: (\d+),(.*?)words: \[', lambda m: f'number: {m.group(1)},{m.group(2)}words: [', surah_body, flags=re.DOTALL)
    
    # The regex above is too complex to do nested replacement reliably with re.sub
    # Let's iterate line by line or use a simpler approach.
    
    # Simpler approach:
    # Iterate through lines.
    # Keep track of current surah and verse.
    # Replace meaning based on counters.
    
    return f"{surah_id}: {{{surah_body}}}"

# Let's rewrite the file content generation logic completely
lines = content.split('\n')
new_lines = []
current_surah = None
current_verse = None
word_index = 0

for line in lines:
    # Detect Surah start: `  1: {` or `  112: {`
    m_surah = re.match(r'\s+(\d+): \{', line)
    if m_surah:
        current_surah = m_surah.group(1)
        new_lines.append(line)
        continue
        
    # Detect Surah name
    if current_surah and 'name: "' in line:
        line = re.sub(r'name: "([^"]+)"', f'nameKey: "surahs.{current_surah}.name"', line)
        new_lines.append(line)
        continue

    # Detect Surah meaning (first occurrence in surah block, before verses)
    if current_surah and 'meaning: "' in line and 'ayahCount' in lines[lines.index(line)+1]: # Heuristic: meaning is followed by ayahCount usually
        line = re.sub(r'meaning: "([^"]+)"', f'meaningKey: "surahs.{current_surah}.meaning"', line)
        new_lines.append(line)
        continue
        
    # Detect Verse start: `number: 1,`
    m_verse = re.search(r'number: (\d+),', line)
    if m_verse:
        current_verse = m_verse.group(1)
        word_index = 0
        new_lines.append(line)
        continue
        
    # Detect Word meaning
    if current_surah and current_verse and 'meaning: "' in line:
        # This line contains a word object: `{ arabic: "...", transliteration: "...", meaning: "..." }`
        # We need to replace `meaning: "..."` with `meaningKey: "..."`
        # Note: There might be multiple words on one line? No, formatting seems 1 per line.
        # But let's be safe.
        
        def replace_word_meaning(m):
            global word_index
            res = f'meaningKey: "surahs.{current_surah}.verses.{current_verse}.words.{word_index}"'
            word_index += 1
            return res
            
        line = re.sub(r'meaning: "([^"]+)"', replace_word_meaning, line)
        new_lines.append(line)
        continue
        
    new_lines.append(line)

new_content = '\n'.join(new_lines)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated wordByWordData.js and created JSONs")
