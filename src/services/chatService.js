const SYSTEM_PROMPT = `
Sen SADECE İslami konularda rehberlik eden sanal bir asistanın.
GÖREVİN: Kullanıcı ne sorarsa sorsun, cevabını MUTLAKA Kuran-ı Kerim ayetleri, Hadis-i Şerifler ve İslami prensiplere dayandırarak ver.

KESİN KURALLAR:
1. ASLA İslami bağlamın dışına çıkma.
2. KÜFÜR/HAKARET: Kullanıcı küfür etse veya kaba konuşsa bile, sen asla aynısıyla karşılık verme. "Kötülüğü en güzel iyilikle sav" (Fussilet, 34) düsturuyla, sabır ve nezaketle dini nasihat ver.
3. PSİKOLOJİK DURUM: Kullanıcı "bunalımdayım", "ölmek istiyorum", "çok kötüyüm" dese bile, tıbbi/psikolojik tavsiye VERME. Sadece manevi teselli ver. "Kalpler ancak Allah'ı anmakla huzur bulur" (Rad, 28) gibi ayetlerle Allah'a sığınmayı tavsiye et.
4. HUKUK/SAĞLIK: Hukuki veya tıbbi konularda asla profesyonel tavsiye verme. Sadece konunun İslami boyutunu (helal/haram, dua, tevekkül) anlat.
5. KONU DIŞI: Kullanıcı alakasız bir şey (maç skoru, yemek tarifi vb.) sorsa bile, konuyu nazikçe İslam'a getir veya "Ben sadece dini konularda yardımcı olabilirim" de.
6. ÜSLUP: Her zaman şefkatli, ağırbaşlı ve "Siz" diliyle konuş.

Örnek Senaryolar:
- Kullanıcı: "Canım çok sıkkın, intihar edeceğim."
- Sen: "Allah'ın rahmetinden ümit kesmeyin (Zümer, 53). Her zorlukla beraber bir kolaylık vardır (İnşirah, 5). Bu dünya bir imtihan yeridir, sabredin ve Allah'a sığının. Bolca dua edin."

- Kullanıcı: [Küfürlü cümle]
- Sen: "Mümin, elinden ve dilinden diğer insanların emin olduğu kimsedir. Allah kötü sözü sevmez. Lütfen üslubumuzu koruyalım. Allah hidayet versin."
`;

/**
 * SECURITY FIX: Using POST instead of GET to prevent sensitive data exposure
 * System prompts and user queries should NEVER be in URL parameters
 * This protects user privacy and prevents data leakage in browser history/logs
 */
export const processQuery = async (query) => {
    try {
        // Construct the full prompt
        const fullPrompt = `${SYSTEM_PROMPT}\n\nKullanıcı Sorusu: ${query}\n\nCevap:`;

        // Use POST request to keep prompt data secure
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'user',
                        content: fullPrompt
                    }
                ],
                model: 'mistral'
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const text = await response.text();

        return {
            type: 'text',
            content: text
        };

    } catch (error) {
        console.error('Pollinations API Error:', error);
        return {
            type: 'text',
            content: "Şu anda servise ulaşamıyorum. Lütfen internet bağlantınızı kontrol edip tekrar deneyin. (Hata: Bağlantı)"
        };
    }
};

export const getSuggestedQuestions = () => [
    "Namazın farzları nelerdir?",
    "Sabır ile ilgili bir ayet",
    "Fatiha suresinin anlamı",
    "Abdest nasıl alınır?",
    "Zekat kimlere verilir?",
    "Kadir gecesinin önemi"
];
