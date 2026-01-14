import json
import os
import re

tr_json_file = r'd:\Projem\public\locales\tr\tajweed.json'
en_json_file = r'd:\Projem\public\locales\en\tajweed.json'
js_file = r'd:\Projem\src\data\tajweedData.js'

tr_data = {
    "rules": {
        "idgam_meal_gunne": {
            "title": "İdgam Meal Gunne",
            "desc": "Gunne ile karıştırma (birleştirme)",
            "rule": "Sakin Nun (نْ) veya Tenvin (ً ٍ ٌ), Yemnu (ي م ن و) harflerinden birine rastlarsa, harfler şeddeli gibi okunur ve genizden ses (gunne) getirilir.",
            "examples": {
                "0": { "explanation": "Nun harfi Ye harfine uğradığı için idgam olur." },
                "1": { "explanation": "Nun harfi Mim harfine uğradığı için idgam olur." }
            }
        },
        "idgam-bila-gunne": {
            "title": "İdgam Bila Gunne",
            "desc": "Gunnesiz karıştırma",
            "rule": "Sakin Nun veya Tenvin, Lam (ل) veya Ra (ر) harflerine rastlarsa, gunne yapılmadan şeddeli gibi okunur.",
            "examples": {
                "0": { "explanation": "Nun harfi Ra harfine uğradığı için gunnesiz idgam olur." },
                "1": { "explanation": "Tenvin Lam harfine uğradığı için gunnesiz idgam olur." }
            }
        },
        "ihfa": {
            "title": "İhfa",
            "desc": "Gizlemek",
            "rule": "Sakin Nun veya Tenvin, ihfa harflerinden birine rastlarsa, Nun sesi genizden getirilerek gizlenir.",
            "examples": {
                "0": { "explanation": "Sakin Nun, Ze harfine uğradığı için ihfa olur." },
                "1": { "explanation": "Sakin Nun, Şın harfine uğradığı için ihfa olur." }
            }
        },
        "izhar": {
            "title": "İzhar",
            "desc": "Açığa çıkarmak",
            "rule": "Sakin Nun veya Tenvin, boğaz harflerinden (Elif, Ha, Hı, Ayın, Gayın, He) birine rastlarsa, Nun sesi açıkça okunur.",
            "examples": {
                "0": { "explanation": "Sakin Nun, Hı harfine uğradığı için izhar olur." },
                "1": { "explanation": "Tenvin, Elif harfine uğradığı için izhar olur." }
            }
        },
        "iklab": {
            "title": "İklab",
            "desc": "Dönüştürmek",
            "rule": "Sakin Nun veya Tenvin, Be (ب) harfine rastlarsa, Nun sesi Mim (م) sesine dönüştürülür ve gunne yapılır.",
            "examples": {
                "0": { "explanation": "Sakin Nun, Be harfine uğradığı için Mim'e dönüşür." },
                "1": { "explanation": "Tenvin, Be harfine uğradığı için Mim'e dönüşür." }
            }
        },
        "kalkale": {
            "title": "Kalkale",
            "desc": "Sarsmak / Titretmek",
            "rule": "Kutb-u Cedin (ق ط ب ج د) harfleri sakin (cezimli) olduğunda, mahreçleri sarsılarak kuvvetli bir sesle okunur.",
            "examples": {
                "0": { "explanation": "Kaf harfi sakin olduğu için kalkale yapılır." },
                "1": { "explanation": "Dal harfi sakin olduğu için kalkale yapılır." }
            }
        }
    }
}

en_data = {
    "rules": {
        "idgam_meal_gunne": {
            "title": "Idgham Ma'al Ghunnah",
            "desc": "Merging with Nasalization",
            "rule": "If Sakin Noon or Tanween is followed by one of the letters (ي م ن و), they are merged with a nasal sound.",
            "examples": {
                "0": { "explanation": "Noon meets Ya, so Idgham occurs." },
                "1": { "explanation": "Noon meets Meem, so Idgham occurs." }
            }
        },
        "idgam-bila-gunne": {
            "title": "Idgham Bila Ghunnah",
            "desc": "Merging without Nasalization",
            "rule": "If Sakin Noon or Tanween is followed by Lam (ل) or Ra (ر), they are merged without a nasal sound.",
            "examples": {
                "0": { "explanation": "Noon meets Ra, so Idgham without Ghunnah occurs." },
                "1": { "explanation": "Tanween meets Lam, so Idgham without Ghunnah occurs." }
            }
        },
        "ihfa": {
            "title": "Ikhfa",
            "desc": "Concealment",
            "rule": "If Sakin Noon or Tanween is followed by an Ikhfa letter, the Noon sound is concealed with a nasal sound.",
            "examples": {
                "0": { "explanation": "Sakin Noon meets Za, so Ikhfa occurs." },
                "1": { "explanation": "Sakin Noon meets Shin, so Ikhfa occurs." }
            }
        },
        "izhar": {
            "title": "Izhar",
            "desc": "Clarification",
            "rule": "If Sakin Noon or Tanween is followed by a throat letter, the Noon sound is pronounced clearly.",
            "examples": {
                "0": { "explanation": "Sakin Noon meets Kha, so Izhar occurs." },
                "1": { "explanation": "Tanween meets Alif, so Izhar occurs." }
            }
        },
        "iklab": {
            "title": "Iqlab",
            "desc": "Conversion",
            "rule": "If Sakin Noon or Tanween is followed by Ba (ب), the Noon sound changes to Meem (م) with a nasal sound.",
            "examples": {
                "0": { "explanation": "Sakin Noon meets Ba, so it converts to Meem." },
                "1": { "explanation": "Tanween meets Ba, so it converts to Meem." }
            }
        },
        "kalkale": {
            "title": "Qalqalah",
            "desc": "Echoing / Vibration",
            "rule": "When Qalqalah letters (ق ط ب ج د) are Sakin (have Sukoon), they are pronounced with an echoing sound.",
            "examples": {
                "0": { "explanation": "Qaf is Sakin, so Qalqalah occurs." },
                "1": { "explanation": "Dal is Sakin, so Qalqalah occurs." }
            }
        }
    }
}

os.makedirs(os.path.dirname(tr_json_file), exist_ok=True)
os.makedirs(os.path.dirname(en_json_file), exist_ok=True)

with open(tr_json_file, 'w', encoding='utf-8') as f:
    json.dump(tr_data, f, indent=2, ensure_ascii=False)
    
with open(en_json_file, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, indent=2, ensure_ascii=False)
    
# Update JS file
with open(js_file, 'r', encoding='utf-8') as f:
    content = f.read()
    
# Replace 'content.tajweed.rules.' with 'rules.'
new_content = content.replace("'content.tajweed.rules.", "'rules.")
new_content = new_content.replace('"content.tajweed.rules.', '"rules.')

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Updated tajweedData.js and created JSONs")
