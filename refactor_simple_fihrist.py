import re
import json
import os

# Read the file
file_path = r'd:\Projem\src\data\fihrist.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract data
# This is a bit hacky, assuming the structure is consistent
# We'll use regex to find topics and verses

keys = {}
new_content = "export const fihristData = [\n"

# Regex to find objects
# This is hard to parse with regex perfectly, but let's try to iterate over the content
# Since the file is small and structured, maybe I can just parse it as text

# Let's use a simpler approach: define the data in python and generate the JS and JSON
# But I need to extract the existing data first.

# I'll use regex to find each block
# { topic: '...', verses: [ ... ] }

block_pattern = re.compile(r"\{\s*topic:\s*'([^']+)',\s*verses:\s*\[(.*?)\]\s*\}", re.DOTALL)
verse_pattern = re.compile(r"\{\s*surah:\s*(\d+),\s*ayah:\s*(\d+),\s*note:\s*'([^']+)'\s*\}")

def slugify(text):
    text = text.lower()
    text = text.replace('ı', 'i').replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ö', 'o').replace('ç', 'c')
    text = re.sub(r'[^a-z0-9]', '_', text)
    text = re.sub(r'_+', '_', text)
    return text.strip('_')

matches = block_pattern.finditer(content)
blocks = []

for match in matches:
    topic = match.group(1)
    verses_block = match.group(2)
    
    topic_slug = slugify(topic)
    topic_key = f"fihrist.simple.{topic_slug}.topic"
    keys[topic_key] = topic
    
    verses = []
    verse_matches = verse_pattern.finditer(verses_block)
    for i, v_match in enumerate(verse_matches):
        surah = v_match.group(1)
        ayah = v_match.group(2)
        note = v_match.group(3)
        
        note_key = f"fihrist.simple.{topic_slug}.verses.{i}.note"
        keys[note_key] = note
        
        verses.append(f"            {{ surah: {surah}, ayah: {ayah}, note: '{note_key}' }}")
    
    verses_str = ",\n".join(verses)
    blocks.append(f"    {{\n        topic: '{topic_key}',\n        verses: [\n{verses_str}\n        ]\n    }}")

new_content += ",\n".join(blocks)
new_content += "\n];\n"

# Write JS file
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

# Write Keys JSON
with open(r'd:\Projem\simple_fihrist_keys.json', 'w', encoding='utf-8') as f:
    json.dump(keys, f, ensure_ascii=False, indent=4)

print("Done")
