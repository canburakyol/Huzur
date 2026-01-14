import json
import sys

filename = 'public/locales/tr/translation.json'

try:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Satır satır kontrol için
    lines = content.split('\n')
    
    try:
        json.loads(content)
        print("JSON VALID")
    except json.JSONDecodeError as e:
        print(f"JSON ERROR: {e.msg}")
        print(f"Line: {e.lineno}, Column: {e.colno}")
        print(f"Char position: {e.pos}")
        
        # Hatalı satırı ve çevresini göster
        start_line = max(0, e.lineno - 5)
        end_line = min(len(lines), e.lineno + 5)
        
        print("\nContext:")
        for i in range(start_line, end_line):
            marker = ">>" if i + 1 == e.lineno else "  "
            print(f"{marker} {i+1}: {lines[i]}")

except Exception as e:
    print(f"General Error: {e}")
