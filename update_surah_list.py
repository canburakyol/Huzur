import re
import os

input_file = r'd:\Projem\src\data\surahList.js'
output_file = r'd:\Projem\src\data\surahList.js'

if not os.path.exists(input_file):
    print(f"File not found: {input_file}")
    exit(1)

with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Regex to match surah objects
# { number: 1, name: "الفاتحة", nameTranslation: "Fatiha", meaning: "Açılış", ayahCount: 7, revelationType: "Mekki" },
pattern = r'\{ number: (\d+), name: "([^"]+)", nameTranslation: "[^"]+", meaning: "[^"]+", ayahCount: (\d+), revelationType: "([^"]+)" \}'

def replace_func(match):
    number = match.group(1)
    name = match.group(2)
    ayahCount = match.group(3)
    revelationType = match.group(4)
    
    rev_key = "revelation.mekki" if revelationType == "Mekki" else "revelation.medeni"
    
    return f'{{ number: {number}, name: "{name}", nameKey: "{number}.name", meaningKey: "{number}.meaning", ayahCount: {ayahCount}, revelationTypeKey: "{rev_key}" }}'

new_content = re.sub(pattern, replace_func, content)

# Update reciters
# { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', country: '🇰🇼 Kuveyt' },
reciter_pattern = r"\{ id: '([^']+)', name: '([^']+)', country: '([^']+)' \}"

def replace_reciter(match):
    rid = match.group(1)
    name = match.group(2)
    country = match.group(3)
    
    country_key = "reciters.kuwait"
    if "Mısır" in country:
        country_key = "reciters.egypt"
    elif "S. Arabistan" in country:
        country_key = "reciters.saudi"
        
    return f"{{ id: '{rid}', name: '{name}', countryKey: '{country_key}' }}"

new_content = re.sub(reciter_pattern, replace_reciter, new_content)

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully updated surahList.js")
