import json

tr_path = r'd:\Projem\public\locales\tr\esma.json'
en_path = r'd:\Projem\public\locales\en\esma.json'

tr_ui = {
    "title": "Esmaül Hüsna",
    "subtitle": "Allah'ın 99 Güzel İsmi",
    "daily": "Günün Esması",
    "search_placeholder": "İsim ara...",
    "count_suffix": "isim"
}

en_ui = {
    "title": "Asmaul Husna",
    "subtitle": "99 Beautiful Names of Allah",
    "daily": "Name of the Day",
    "search_placeholder": "Search name...",
    "count_suffix": "names"
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
    
print("Updated esma.json with UI strings")
