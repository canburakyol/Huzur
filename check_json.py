import json

def check_json_depth(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    depth = 0
    for i, line in enumerate(lines):
        for char in line:
            if char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
        
        # Print depth at key points or if negative
        if depth < 0:
            print(f"Error: Negative depth at line {i+1}")
            return
        
        # Check specific lines where we suspect issues
        if i > 1000:
             print(f"Line {i+1}: depth={depth} content={line.strip()[:20]}")

    print(f"Final depth: {depth}")

check_json_depth('public/locales/tr/translation.json')
