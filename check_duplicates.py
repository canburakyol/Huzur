import json
from collections import Counter

def find_duplicate_keys(json_str):
    # Basit bir parser ile duplicate key'leri bulmaya çalışalım
    # Tam bir parser değil ama iş görür
    keys = []
    lines = json_str.split('\n')
    for line in lines:
        line = line.strip()
        if line.startswith('"') and '":' in line:
            key = line.split('":')[0].strip('"')
            keys.append(key)
    
    counts = Counter(keys)
    duplicates = [k for k, v in counts.items() if v > 1]
    return duplicates

filename = 'public/locales/tr/translation.json'
with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

# Önce standart load ile dene
try:
    data = json.loads(content)
    print("Standard JSON Load: SUCCESS")
except Exception as e:
    print(f"Standard JSON Load: FAILED - {e}")

# Duplicate kontrolü (manuel)
# Not: Bu çok basit bir kontrol, nested keyleri ayırmaz ama fikir verir
# duplicates = find_duplicate_keys(content)
# if duplicates:
#     print(f"Potential duplicate keys found: {duplicates}")

# Daha iyi bir duplicate kontrolü:
def dict_raise_on_duplicates(ordered_pairs):
    """Reject duplicate keys."""
    d = {}
    for k, v in ordered_pairs:
        if k in d:
            print(f"DUPLICATE KEY FOUND: {k}")
        d[k] = v
    return d

try:
    json.loads(content, object_pairs_hook=dict_raise_on_duplicates)
    print("Duplicate Key Check: PASSED")
except Exception as e:
    print(f"Duplicate Key Check: FAILED or Finished with duplicates found")
