import json
import os
import re

tr_json_file = r'd:\Projem\public\locales\tr\esma.json'
en_json_file = r'd:\Projem\public\locales\en\esma.json'
js_file = r'd:\Projem\src\data\esmaUlHusnaData.js'

# Read JS file
with open(js_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract data
# { id: 1, arabic: '...', latin: '...', meaning: '...', detail: '...' }
pattern = r"\{ id: (\d+), arabic: '([^']+)', latin: '([^']+)', meaning: '([^']+)', detail: '([^']+)' \}"
matches = re.findall(pattern, content)

tr_data = {}
en_data = {}

for m in matches:
    id_ = m[0]
    arabic = m[1]
    latin = m[2]
    meaning = m[3]
    detail = m[4]
    
    tr_data[id_] = {
        "meaning": meaning,
        "detail": detail
    }
    
    en_data[id_] = {
        "meaning": meaning, 
        "detail": detail
    }

# Write JSONs
os.makedirs(os.path.dirname(tr_json_file), exist_ok=True)
os.makedirs(os.path.dirname(en_json_file), exist_ok=True)

with open(tr_json_file, 'w', encoding='utf-8') as f:
    json.dump(tr_data, f, indent=2, ensure_ascii=False)
    
with open(en_json_file, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, indent=2, ensure_ascii=False)

# Update JS file
def replace_match(m):
    id_ = m.group(1)
    arabic = m.group(2)
    latin = m.group(3)
    return f"{{ id: {id_}, arabic: '{arabic}', latin: '{latin}', meaningKey: 'esma.{id_}.meaning', detailKey: 'esma.{id_}.detail' }}"

new_content = re.sub(pattern, replace_match, content)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Updated esmaUlHusnaData.js and created JSONs")
