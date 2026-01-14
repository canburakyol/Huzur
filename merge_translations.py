import json
import os

def unflatten(dictionary):
    result = {}
    for key, value in dictionary.items():
        parts = key.split('.')
        d = result
        for part in parts[:-1]:
            if part not in d:
                d[part] = {}
            d = d[part]
        d[parts[-1]] = value
    return result

def merge(source, destination):
    for key, value in source.items():
        if isinstance(value, dict):
            node = destination.setdefault(key, {})
            merge(value, node)
        else:
            destination[key] = value
    return destination

fihrist_keys_path = r'd:\Projem\simple_fihrist_keys.json'
langs = ['tr', 'en', 'ar']

with open(fihrist_keys_path, 'r', encoding='utf-8') as f:
    fihrist_flat = json.load(f)

fihrist_nested = unflatten(fihrist_flat)

for lang in langs:
    target_path = fr'd:\Projem\public\locales\{lang}\translation.json'
    
    if os.path.exists(target_path):
        with open(target_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                print(f"Error decoding {target_path}, skipping")
                continue
        
        # Merge fihrist data
        # We only want to add if missing? No, we want to add the new keys.
        # For 'tr', we use the values. For 'en' and 'ar', we use the same values for now (better than nothing).
        
        merge(fihrist_nested, data)
        
        with open(target_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"Updated {target_path}")
    else:
        print(f"File not found: {target_path}")
