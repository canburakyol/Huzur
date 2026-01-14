import re
import json
import os

input_file = r'd:\Projem\src\data\hadiths.js'
tr_json_file = r'd:\Projem\public\locales\tr\hadiths.json'
en_json_file = r'd:\Projem\public\locales\en\hadiths.json'
output_js_file = r'd:\Projem\src\data\hadiths.js'

if not os.path.exists(input_file):
    print(f"File not found: {input_file}")
    exit(1)

with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract Categories
# { id: 'iman', name: 'İman', icon: '💖', color: '#e74c3c' },
cat_pattern = r"\{ id: '([^']+)', name: '([^']+)', icon: '([^']+)', color: '([^']+)' \}"
categories = re.findall(cat_pattern, content)

tr_data = {"categories": {}, "items": {}}
en_data = {"categories": {}, "items": {}}

cat_map = {
    "iman": "Faith",
    "ibadet": "Worship",
    "ahlak": "Ethics",
    "aile": "Family",
    "ilim": "Knowledge",
    "dua": "Supplication",
    "sabir": "Patience",
    "rizik": "Sustenance"
}

for cat_id, cat_name, icon, color in categories:
    tr_data["categories"][cat_id] = cat_name
    en_data["categories"][cat_id] = cat_map.get(cat_id, cat_name)

# Extract Hadiths
# {
#     id: 1,
#     category: 'iman',
#     arabic: '...',
#     text: '...',
#     source: '...',
#     narrator: '...'
# },
hadith_pattern = r"\{\s+id: (\d+),\s+category: '([^']+)',\s+arabic: '(.*?)',\s+text: '(.*?)',\s+source: '(.*?)',\s+narrator: '(.*?)'\s+\}"

hadiths = re.findall(hadith_pattern, content, re.DOTALL)

print(f"Found {len(categories)} categories and {len(hadiths)} hadiths.")

for hid, cat, arabic, text, source, narrator in hadiths:
    # Unescape text for JSON
    text = text.replace("\\'", "'")
    
    tr_data["items"][hid] = {
        "text": text,
        "source": source,
        "narrator": narrator
    }
    
    # For EN, translate source and narrator
    en_source = source.replace("Buhârî", "Bukhari").replace("Müslim", "Muslim").replace("Tirmizî", "Tirmidhi").replace("Ebû Dâvûd", "Abu Dawood").replace("İbn Mâce", "Ibn Majah").replace("Nesâî", "Nasai").replace("Ahmed", "Ahmad").replace("Beyhakî", "Bayhaqi").replace("Hadis", "Hadith")
    en_narrator = narrator.replace("Hz.", "").replace("(r.a.)", "(ra)").replace("Ebû", "Abu").replace("Ömer", "Umar").replace("Âişe", "Aisha").replace("Enes", "Anas").replace("Abdullah bin", "Abdullah ibn").replace("Resûlünü", "Messenger").replace("Peygamber", "Prophet").replace("Osman", "Uthman").replace("Ali", "Ali")
    
    en_data["items"][hid] = {
        "text": text, # Keep TR text for now
        "source": en_source,
        "narrator": en_narrator
    }

# Write JSONs
os.makedirs(os.path.dirname(tr_json_file), exist_ok=True)
os.makedirs(os.path.dirname(en_json_file), exist_ok=True)

with open(tr_json_file, 'w', encoding='utf-8') as f:
    json.dump(tr_data, f, indent=2, ensure_ascii=False)
    
with open(en_json_file, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, indent=2, ensure_ascii=False)

# Update JS file
# Replace categories
def replace_cat(match):
    cid = match.group(1)
    icon = match.group(3)
    color = match.group(4)
    return f"{{ id: '{cid}', nameKey: 'categories.{cid}', icon: '{icon}', color: '{color}' }}"
    
new_content = re.sub(cat_pattern, replace_cat, content)

# Replace hadiths
def replace_hadith(match):
    hid = match.group(1)
    cat = match.group(2)
    arabic = match.group(3)
    return f"{{ id: {hid}, category: '{cat}', arabic: '{arabic}', textKey: 'items.{hid}.text', sourceKey: 'items.{hid}.source', narratorKey: 'items.{hid}.narrator' }}"

new_content = re.sub(hadith_pattern, replace_hadith, new_content, flags=re.DOTALL)

with open(output_js_file, 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Successfully updated hadiths.js and created JSONs")
