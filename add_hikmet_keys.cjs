const fs = require('fs');
const path = require('path');

const hikmetCategories = {
    tr: {
        hikmet: {
            categories: {
                hadis: {
                    title: "Hadis-i Şerifler",
                    desc: "Peygamber Efendimiz'in mübarek sözleri"
                },
                alim: {
                    title: "Âlimlerden",
                    desc: "İslam âlimlerinden hikmetli sözler"
                },
                sufi: {
                    title: "Tasavvuf",
                    desc: "Sufi büyüklerinden hikmetler"
                },
                ayet: {
                    title: "Kur'an'dan",
                    desc: "Kur'an-ı Kerim'den hikmetli ayetler"
                }
            },
            items: {
                1: { text: "Dua, ibadetin özüdür.", source: "Hz. Muhammed (s.a.v.)", ref: "Tirmizi" },
                2: { text: "Kolaylaştırınız, zorlaştırmayınız.", source: "Hz. Muhammed (s.a.v.)", ref: "Buhari" },
                3: { text: "İnsanların en hayırlısı, insanlara faydalı olandır.", source: "Hz. Muhammed (s.a.v.)", ref: "Beyhaki" },
                4: { text: "Güzel ahlak, dinin yarısıdır.", source: "Hz. Muhammed (s.a.v.)", ref: "Hakim" },
                5: { text: "Müslüman, elinden ve dilinden emin olunan kimsedir.", source: "Hz. Muhammed (s.a.v.)", ref: "Buhari" },
                6: { text: "Hikmet, müminin yitik malıdır; onu nerede bulursa alır.", source: "Hz. Muhammed (s.a.v.)", ref: "Tirmizi" },
                7: { text: "Sabır, imanın yarısıdır.", source: "Hz. Muhammed (s.a.v.)", ref: "Ebu Nuaym" },
                8: { text: "Tefekkür etmek, bir sene nafile ibadetten hayırlıdır.", source: "Hz. Muhammed (s.a.v.)", ref: "Deylemi" },
                9: { text: "İlim öğrenmek, her Müslümana farzdır.", source: "İmam Gazali", ref: "İhya" },
                10: { text: "Kalp, Allah'ın evidir.", source: "İbn Arabi", ref: "Fusus" },
                11: { text: "Nefs, en büyük düşmandır.", source: "İmam Rabbani", ref: "Mektubat" },
                12: { text: "Edep, aklın sureti ve lisanıdır.", source: "Mevlana", ref: "Mesnevi" },
                13: { text: "Allah'ı seven, her şeyi sever.", source: "Yunus Emre", ref: "Divan" },
                14: { text: "Sabır, acı bir ağaç olsa da meyvesi tatlıdır.", source: "İmam Şafii", ref: "" },
                15: { text: "Tevazu kapıları açar, kibir kapatır.", source: "Hasan Basri", ref: "" },
                16: { text: "Ben, benden gidince bende sen kaldın.", source: "Mevlana", ref: "Divan-ı Kebir" },
                17: { text: "Gel, ne olursan ol, yine gel.", source: "Mevlana", ref: "Mesnevi" },
                18: { text: "Aşk, suskunluğun dilidir.", source: "Şems-i Tebrizi", ref: "" },
                19: { text: "Gönül bir aynadır, onu temiz tut.", source: "Hacı Bektaş Veli", ref: "" },
                20: { text: "Bir olan Allah'a yönel, çoklukta boğulma.", source: "İbn Arabi", ref: "Fusus" },
                21: { text: "Kalbin kapısı, zikir ile açılır.", source: "Abdulkadir Geylani", ref: "" },
                22: { text: "Dünya bir köprüdür, üzerinde mesken tutma.", source: "Hz. İsa (a.s.)", ref: "" },
                23: { text: "Sufi, vaktinin oğludur.", source: "Cüneyd-i Bağdadi", ref: "" },
                24: { text: "Onlar, Allah'ı anmakla kalpleri mutmain olanlardır.", source: "Kur'an-ı Kerim", ref: "Ra'd, 28" },
                25: { text: "Muhakkak ki zorlukla beraber kolaylık vardır.", source: "Kur'an-ı Kerim", ref: "İnşirah, 6" },
                26: { text: "Allah, sabredenlerle beraberdir.", source: "Kur'an-ı Kerim", ref: "Bakara, 153" },
                27: { text: "Kim Allah'a tevekkül ederse, O ona yeter.", source: "Kur'an-ı Kerim", ref: "Talak, 3" },
                28: { text: "Rabbiniz size dua edin, size icabet edeyim dedi.", source: "Kur'an-ı Kerim", ref: "Mü'min, 60" },
                29: { text: "İyi amel işleyenlerin mükafatı, yaptıklarının en güzeli olacaktır.", source: "Kur'an-ı Kerim", ref: "Zümer, 35" },
                30: { text: "Kim tövbe edip salih amel işlerse, şüphesiz Allah onun tövbesini kabul eder.", source: "Kur'an-ı Kerim", ref: "Furkan, 71" }
            }
        }
    },
    en: {
        hikmet: {
            categories: {
                hadis: {
                    title: "Hadiths",
                    desc: "Blessed sayings of Prophet Muhammad"
                },
                alim: {
                    title: "From Scholars",
                    desc: "Wise sayings from Islamic scholars"
                },
                sufi: {
                    title: "Sufism",
                    desc: "Wisdom from Sufi masters"
                },
                ayet: {
                    title: "From Quran",
                    desc: "Wise verses from the Holy Quran"
                }
            },
            items: {
                1: { text: "Prayer is the essence of worship.", source: "Prophet Muhammad (pbuh)", ref: "Tirmidhi" },
                2: { text: "Make things easy, not difficult.", source: "Prophet Muhammad (pbuh)", ref: "Bukhari" },
                3: { text: "The best of people are those who benefit others.", source: "Prophet Muhammad (pbuh)", ref: "Bayhaqi" },
                4: { text: "Good character is half of religion.", source: "Prophet Muhammad (pbuh)", ref: "Hakim" },
                5: { text: "A Muslim is one from whose tongue and hands others are safe.", source: "Prophet Muhammad (pbuh)", ref: "Bukhari" },
                6: { text: "Wisdom is the lost property of the believer.", source: "Prophet Muhammad (pbuh)", ref: "Tirmidhi" },
                7: { text: "Patience is half of faith.", source: "Prophet Muhammad (pbuh)", ref: "Abu Nuaym" },
                8: { text: "An hour of reflection is better than a year of worship.", source: "Prophet Muhammad (pbuh)", ref: "Daylami" },
                9: { text: "Seeking knowledge is obligatory for every Muslim.", source: "Imam Ghazali", ref: "Ihya" },
                10: { text: "The heart is the house of God.", source: "Ibn Arabi", ref: "Fusus" },
                11: { text: "The ego is the greatest enemy.", source: "Imam Rabbani", ref: "Maktubat" },
                12: { text: "Manners are the face and language of the mind.", source: "Rumi", ref: "Masnavi" },
                13: { text: "Whoever loves God, loves everything.", source: "Yunus Emre", ref: "Divan" },
                14: { text: "Patience is a bitter tree but its fruit is sweet.", source: "Imam Shafi", ref: "" },
                15: { text: "Humility opens doors, arrogance closes them.", source: "Hasan al-Basri", ref: "" },
                16: { text: "When I left myself, only You remained.", source: "Rumi", ref: "Divan-i Kabir" },
                17: { text: "Come, whoever you are, come again.", source: "Rumi", ref: "Masnavi" },
                18: { text: "Love is the language of silence.", source: "Shams Tabrizi", ref: "" },
                19: { text: "The heart is a mirror, keep it clean.", source: "Haji Bektash Veli", ref: "" },
                20: { text: "Turn to the One God, do not drown in multiplicity.", source: "Ibn Arabi", ref: "Fusus" },
                21: { text: "The door of the heart opens with remembrance.", source: "Abdul Qadir Gilani", ref: "" },
                22: { text: "The world is a bridge, do not build your home on it.", source: "Prophet Jesus (pbuh)", ref: "" },
                23: { text: "The Sufi is the son of his time.", source: "Junayd al-Baghdadi", ref: "" },
                24: { text: "Those who remember Allah find peace in their hearts.", source: "Holy Quran", ref: "Ra'd, 28" },
                25: { text: "Verily, with hardship comes ease.", source: "Holy Quran", ref: "Inshirah, 6" },
                26: { text: "Allah is with those who are patient.", source: "Holy Quran", ref: "Baqarah, 153" },
                27: { text: "Whoever relies on Allah, He is sufficient for them.", source: "Holy Quran", ref: "Talaq, 3" },
                28: { text: "Your Lord said: Call upon Me, I will answer you.", source: "Holy Quran", ref: "Ghafir, 60" },
                29: { text: "Those who do good will receive the best reward.", source: "Holy Quran", ref: "Zumar, 35" },
                30: { text: "Whoever repents and does good, Allah accepts their repentance.", source: "Holy Quran", ref: "Furqan, 71" }
            }
        }
    },
    ar: {
        hikmet: {
            categories: {
                hadis: {
                    title: "الأحاديث النبوية",
                    desc: "أقوال النبي محمد ﷺ المباركة"
                },
                alim: {
                    title: "من العلماء",
                    desc: "حكم علماء الإسلام"
                },
                sufi: {
                    title: "التصوف",
                    desc: "حكم من أقطاب الصوفية"
                },
                ayet: {
                    title: "من القرآن",
                    desc: "آيات حكيمة من القرآن الكريم"
                }
            },
            items: {
                1: { text: "الدعاء هو العبادة.", source: "النبي محمد ﷺ", ref: "الترمذي" },
                2: { text: "يسروا ولا تعسروا.", source: "النبي محمد ﷺ", ref: "البخاري" },
                3: { text: "خير الناس أنفعهم للناس.", source: "النبي محمد ﷺ", ref: "البيهقي" },
                4: { text: "حسن الخلق نصف الدين.", source: "النبي محمد ﷺ", ref: "الحاكم" },
                5: { text: "المسلم من سلم المسلمون من لسانه ويده.", source: "النبي محمد ﷺ", ref: "البخاري" },
                6: { text: "الحكمة ضالة المؤمن.", source: "النبي محمد ﷺ", ref: "الترمذي" },
                7: { text: "الصبر نصف الإيمان.", source: "النبي محمد ﷺ", ref: "أبو نعيم" },
                8: { text: "تفكر ساعة خير من عبادة سنة.", source: "النبي محمد ﷺ", ref: "الديلمي" },
                9: { text: "طلب العلم فريضة على كل مسلم.", source: "الإمام الغزالي", ref: "الإحياء" },
                10: { text: "القلب بيت الله.", source: "ابن عربي", ref: "الفصوص" },
                11: { text: "النفس أكبر عدو.", source: "الإمام الرباني", ref: "المكتوبات" },
                12: { text: "الأدب صورة العقل ولسانه.", source: "الرومي", ref: "المثنوي" },
                13: { text: "من أحب الله أحب كل شيء.", source: "يونس أمره", ref: "الديوان" },
                14: { text: "الصبر شجرة مرة لكن ثمرها حلو.", source: "الإمام الشافعي", ref: "" },
                15: { text: "التواضع يفتح الأبواب والكبر يغلقها.", source: "الحسن البصري", ref: "" },
                16: { text: "حين ذهبت أنا بقيت أنت.", source: "الرومي", ref: "ديوان كبير" },
                17: { text: "تعال، مهما كنت، تعال مرة أخرى.", source: "الرومي", ref: "المثنوي" },
                18: { text: "العشق لغة الصمت.", source: "شمس التبريزي", ref: "" },
                19: { text: "القلب مرآة فحافظ عليها نظيفة.", source: "الحاج بكتاش ولي", ref: "" },
                20: { text: "توجه إلى الله الواحد ولا تغرق في الكثرة.", source: "ابن عربي", ref: "الفصوص" },
                21: { text: "باب القلب يفتح بالذكر.", source: "عبد القادر الجيلاني", ref: "" },
                22: { text: "الدنيا جسر فلا تبن عليها بيتاً.", source: "النبي عيسى عليه السلام", ref: "" },
                23: { text: "الصوفي ابن وقته.", source: "الجنيد البغدادي", ref: "" },
                24: { text: "ألا بذكر الله تطمئن القلوب.", source: "القرآن الكريم", ref: "الرعد، 28" },
                25: { text: "فإن مع العسر يسراً.", source: "القرآن الكريم", ref: "الشرح، 6" },
                26: { text: "إن الله مع الصابرين.", source: "القرآن الكريم", ref: "البقرة، 153" },
                27: { text: "ومن يتوكل على الله فهو حسبه.", source: "القرآن الكريم", ref: "الطلاق، 3" },
                28: { text: "ادعوني أستجب لكم.", source: "القرآن الكريم", ref: "غافر، 60" },
                29: { text: "للذين أحسنوا الحسنى وزيادة.", source: "القرآن الكريم", ref: "الزمر، 35" },
                30: { text: "من تاب وعمل صالحاً فإن الله يتوب عليه.", source: "القرآن الكريم", ref: "الفرقان، 71" }
            }
        }
    }
};

['tr', 'en', 'ar'].forEach(lang => {
    const filePath = path.join(__dirname, 'public', 'locales', lang, 'translation.json');
    
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Merge hikmet object
        if (!data.hikmet) {
            data.hikmet = hikmetCategories[lang].hikmet;
        } else {
            // Deep merge
            data.hikmet.categories = hikmetCategories[lang].hikmet.categories;
            data.hikmet.items = hikmetCategories[lang].hikmet.items;
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Updated hikmet in ${lang}/translation.json`);
    }
});

console.log('Done!');
