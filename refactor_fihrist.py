import re
import json
import os

# Path to the input file
input_path = r'd:\Projem\src\data\detailedFihrist.js'
output_path = r'd:\Projem\src\data\detailedFihrist.js'
json_output_path = r'd:\Projem\fihrist_keys.json'

def slugify(text):
    text = text.lower()
    text = text.replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ı', 'i').replace('ö', 'o').replace('ç', 'c')
    text = re.sub(r'[^a-z0-9]+', '_', text)
    return text.strip('_')

with open(input_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the array content
match = re.search(r'export const detailedFihrist = (\[.*\]);', content, re.DOTALL)
if not match:
    print("Could not find detailedFihrist array")
    exit(1)

array_str = match.group(1)

# Python's eval is dangerous, but for this specific file structure it might be easiest if we sanitize it
# Or we can use regex to find category and title
# Let's use regex to replace strings with keys and build a dictionary

translations = {}
new_content = content

# Find categories
categories = set()
def replace_category(match):
    original = match.group(1)
    key = f"fihrist.categories.{slugify(original)}"
    translations[key] = original
    return f'category: "{key}"'

new_content = re.sub(r'category:\s*"([^"]+)"', replace_category, new_content)

# Find titles
def replace_title(match):
    original = match.group(1)
    key = f"fihrist.topics.{slugify(original)}"
    translations[key] = original
    return f'title: "{key}"'

new_content = re.sub(r'title:\s*"([^"]+)"', replace_title, new_content)

# Write the new JS file
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

# Write the translations to a JSON file
with open(json_output_path, 'w', encoding='utf-8') as f:
    json.dump(translations, f, ensure_ascii=False, indent=2)

print(f"Updated {output_path}")
print(f"Generated {json_output_path}")
