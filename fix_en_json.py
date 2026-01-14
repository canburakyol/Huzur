import json
import os

file_path = 'public/locales/en/translation.json'

# Using Turkish content as placeholder since the file currently has Turkish content for these sections
namaz_sureleri = {
  "title": "Namaz Sureleri",
  "description": "Namazda okunan kısa sureler",
  "items": {
    "0": { "title": "Fatiha Suresi", "text": "Bismillahirrahmanirrahim. Elhamdülillahi rabbil alemin. Errahmanirrahim. Maliki yevmiddin. İyyake na'büdü ve iyyake nestain. İhdinassıratal müstakim. Sıratallezine en'amte aleyhim. Gayril mağdubi aleyhim veleddallin.", "explanation": "Rahman ve Rahim olan Allah'ın adıyla. Hamd, alemlerin Rabbi Allah'a mahsustur. O, Rahman ve Rahim'dir. Din gününün sahibidir. Yalnız sana ibadet eder ve yalnız senden yardım dileriz. Bizi doğru yola ilet. Kendilerine nimet verdiklerinin yoluna; gazaba uğrayanların ve sapıtanların yoluna değil." },
    "1": { "title": "İhlas Suresi", "text": "Kul hüvallahü ehad. Allahüssamed. Lem yelid ve lem yuled. Ve lem yekün lehü küfüven ehad.", "explanation": "De ki: O Allah birdir. Allah sameddir (her şey O'na muhtaç, O hiçbir şeye muhtaç değil). O doğurmamıştır ve doğurulmamıştır. Hiçbir şey O'nun dengi değildir." },
    "2": { "title": "Felak Suresi", "text": "Kul euzü birabbil felak. Min şerri ma halak. Ve min şerri ğasikın iza vekab. Ve min şerrin neffasati fil ukad. Ve min şerri hasidin iza hased.", "explanation": "De ki: Sabahın Rabbine sığınırım. Yarattığı şeylerin şerrinden. Karanlığı çöktüğü zaman gecenin şerrinden. Düğümlere üfleyenlerin şerrinden. Ve haset ettiği zaman hasetçinin şerrinden." },
    "3": { "title": "Nas Suresi", "text": "Kul euzü birabbinnas. Melikinnas. İlahinnas. Min şerril vesvasil hannas. Ellezi yüvesvisü fi sudurinnas. Minel cinneti vennas.", "explanation": "De ki: İnsanların Rabbine sığınırım. İnsanların Melikine (hükümdarına). İnsanların İlahına. O sinsi vesvesecinin şerrinden. O ki insanların göğüslerine vesvese verir. Gerek cinlerden, gerek insanlardan." },
    "4": { "title": "Kevser Suresi", "text": "İnna a'taynakeül kevser. Fesalli lirabbike venhar. İnne şanieke hüvel ebter.", "explanation": "Şüphesiz biz sana Kevser'i verdik. Öyleyse Rabbin için namaz kıl ve kurban kes. Asıl sonu kesik olan, sana kin duyandır." },
    "5": { "title": "Asr Suresi", "text": "Vel asr. İnnel insane lefi husr. İllellezine amenu ve amilussalihati ve tevasav bilhakkı ve tevasav bissabr.", "explanation": "Asra yemin olsun ki, insan gerçekten ziyan içindedir. Ancak iman edip salih ameller işleyenler, birbirlerine hakkı tavsiye edenler ve birbirlerine sabrı tavsiye edenler müstesnadır." },
    "6": { "title": "Fil Suresi", "text": "Elem tera keyfe feale rabbüke biashabül fil. Elem yec'al keydehüm fi tadlil. Ve ersele aleyhim tayran ebabil. Termihim bihicaratin min siccil. Fecealehüm keasfin me'kul.", "explanation": "Rabbinin fil sahiplerine ne yaptığını görmedin mi? Onların tuzaklarını boşa çıkarmadı mı? Üzerlerine sürüler halinde kuşlar gönderdi. Onlara pişmiş çamurdan taşlar atıyorlardı. Sonunda onları yenilmiş ekin yaprakları gibi yaptı." },
    "7": { "title": "Kureyş Suresi", "text": "Li ilafi kureyş. İlafihim rıhleteşşitai vessayf. Felya'büdu rabbe hazelbeyt. Ellezi at'amehüm min cu' ve amenehüm min havf.", "explanation": "Kureyş'in güvenliği için, onların kış ve yaz seferlerinin güvenliği için, bu Beyt'in (Kâbe'nin) Rabbine ibadet etsinler. O ki onları açlıktan doyurdu ve korkudan emin kıldı." },
    "8": { "title": "Maun Suresi", "text": "Eraeytellezi yükezzibü bidden. Fezelikellezi yedu'ül yetim. Ve la yehuddu ala taamil miskin. Feveylün lilmusallin. Ellezine hüm an salatihim sahun. Ellezine hüm yüraun. Ve yemneunelmaun.", "explanation": "Dini yalanlayan kimseyi gördün mü? İşte odur yetimi itip kakan. Yoksulu doyurmaya teşvik etmeyen. Yazıklar olsun o namaz kılanlara ki, onlar namazlarında yanılgı içindedirler. Onlar gösteriş yaparlar ve en ufak yardımı bile engellerler." },
    "9": { "title": "Kafirun Suresi", "text": "Kul ya eyyühel kafirun. La a'büdü ma ta'büdun. Ve la entüm abidune ma a'büd. Ve la ene abidün ma abedtüm. Ve la entüm abidune ma a'büd. Leküm dinüküm veliyedin.", "explanation": "De ki: Ey kafirler! Ben sizin taptıklarınıza tapmam. Siz de benim taptığıma tapmazsınız. Ben sizin taptıklarınıza asla tapacak değilim. Siz de benim taptığıma tapacak değilsiniz. Sizin dininiz size, benim dinim banadır." }
  }
}

faq = {
  "title": "Soru-Cevap",
  "genel": {
    "category": "Genel Sorular",
    "questions": {
      "0": { "q": "Müslüman olmak için ne gerekir?", "a": "Kelime-i şehadet getirmek yeterlidir: \"Eşhedü en la ilahe illallah ve eşhedü enne Muhammeden abdühü ve rasulüh\" (Allah'tan başka ilah olmadığına ve Muhammed'in O'nun kulu ve elçisi olduğuna şehadet ederim)." },
      "1": { "q": "Günde kaç vakit namaz kılınır?", "a": "Günde 5 vakit namaz farzdır: Sabah, Öğle, İkindi, Akşam ve Yatsı." },
      "2": { "q": "Kuran kaç sureden oluşur?", "a": "Kuran-ı Kerim 114 sureden oluşmaktadır. İlk sure Fatiha, son sure Nas suresidir." },
      "3": { "q": "Zekat nisabı nedir?", "a": "Zekat nisabı, 80.18 gram altın veya 561.2 gram gümüş değerindedir. Bu miktara sahip olan ve üzerinden bir yıl geçen Müslümanlar zekat vermekle yükümlüdür." },
      "4": { "q": "Hac ne zaman yapılır?", "a": "Hac, Zilhicce ayının 8-12. günleri arasında yapılır. Arefe günü (9 Zilhicce) Arafat vakfesi yapılır." }
    }
  },
  "namaz": {
    "category": "Namaz Soruları",
    "questions": {
      "0": { "q": "Abdest nasıl alınır?", "a": "Niyet edilir, eller bileklere kadar yıkanır, ağıza ve buruna su verilir, yüz yıkanır, kollar dirseklerle yıkanır, baş mesh edilir, kulaklar mesh edilir, ayaklar topuklarla yıkanır." },
      "1": { "q": "Namazı bozan şeyler nelerdir?", "a": "Konuşmak, gülmek, yemek-içmek, abdestin bozulması, kıbleden dönmek, fazla hareket etmek namazı bozar." },
      "2": { "q": "Sehiv secdesi ne zaman yapılır?", "a": "Namazda vacip bir şeyin terki veya geciktirilmesi, farzın tehiri gibi durumlarda sehiv secdesi yapılır." },
      "3": { "q": "Kadınların namaz kılması erkeklerden farklı mı?", "a": "Temel olarak aynıdır, ancak bazı şekil farklılıkları vardır. Kadınlar ellerini omuz hizasına kaldırır, secdede kollarını yere yapıştırır." },
      "4": { "q": "Cemaatle namaz kılmanın fazileti nedir?", "a": "Cemaatle kılınan namaz, tek başına kılınan namazdan 27 derece daha faziletlidir (hadis)." }
    }
  },
  "oruc": {
    "category": "Oruç Soruları",
    "questions": {
      "0": { "q": "Orucu bozan şeyler nelerdir?", "a": "Bilerek yemek, içmek, cinsel ilişki, kusturmak, iğne yaptırmak (besleyici), sigara içmek orucu bozar." },
      "1": { "q": "Orucu bozmayan şeyler nelerdir?", "a": "Unutarak yemek-içmek, kan aldırmak, göze ilaç damlatmak, diş fırçalamak (yutmamak şartıyla) orucu bozmaz." },
      "2": { "q": "Oruç fidyesi ne kadardır?", "a": "Oruç fidyesi, bir fakiri bir gün doyuracak miktardır. Güncel Diyanet görüşüne göre hesaplanır." },
      "3": { "q": "Hangi durumlarda oruç tutulmaz?", "a": "Hastalık, hamilelik, emzirme, yolculuk, aşırı yaşlılık gibi durumlarda oruç tutulmayabilir ve fidye verilir veya kaza edilir." }
    }
  }
}

categories = {
  "books": { "title": "Kitaplar" },
  "texts": { "title": "Dini Metinler" },
  "education": { "title": "Eğitim" },
  "references": { "title": "Referanslar" },
  "faq": { "title": "Soru-Cevap" }
}

countries = {
  "kuwait": "🇰🇼 Kuveyt",
  "egypt": "🇪🇬 Mısır",
  "saudi_arabia": "🇸🇦 S. Arabistan"
}

prayer = {
  "time_remaining_title": "{{prayer}} Vaktine Kalan",
  "time_remaining_body": "{{time}} kaldı."
}

time_block = {
  "hours_short": "sa",
  "minutes_short": "dk"
}

mood = {
  "title": "How Are You Feeling Today?",
  "subtitle": "Let us select the most suitable verse for your mood.",
  "loading": "Searching for the most suitable verse for you...",
  "ai_badge": "AI Powered",
  "error_busy": "Service is busy right now. Please try again.",
  "retry": "Try Again",
  "ai_footer": "Prepared by Gemini AI",
  "another_mood": "Another Mood",
  "error_api": "API error",
  "error_empty": "Empty response"
}

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('"namaz-sureleri":')
if start_idx == -1:
    print("Could not find namaz-sureleri block")
    exit(1)

pre_content = content[:start_idx]

namaz_json = json.dumps({"namaz-sureleri": namaz_sureleri}, ensure_ascii=False, indent=2)[2:-2]

library_suffix = {
    "faq": faq,
    "categories": categories
}
library_suffix_json = json.dumps(library_suffix, ensure_ascii=False, indent=2)[2:-2]

top_level_suffix = {
    "countries": countries,
    "prayer": prayer,
    "time": time_block,
    "mood": mood
}
top_level_json = json.dumps(top_level_suffix, ensure_ascii=False, indent=2)[2:-2]

final_content = pre_content + namaz_json + "\n    },\n" + library_suffix_json + "\n  },\n" + top_level_json + "\n}"

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(final_content)
