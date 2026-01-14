// Library Data - Kütüphane İçerikleri
// Comprehensive Islamic Library Content

// ==================== 1. KİTAPLAR ====================
import { prayers as PRAYERS } from './prayers';
export { PRAYERS };

export const BOOKS = [
    {
        id: 'islam-tarihi',
        title: 'İslam Tarihi',
        icon: '📚',
        description: 'Hz. Muhammed\'den günümüze İslam medeniyetinin tarihi',
        chapters: [
            {
                title: 'Cahiliye Dönemi',
                content: `İslam öncesi Arap yarımadası "Cahiliye Dönemi" olarak adlandırılır. Bu dönemde Araplar arasında putperestlik yaygındı. Kâbe'de 360'tan fazla put bulunuyordu. En büyük putlar Lat, Menat ve Uzza idi.

Toplum kabile yapısı üzerine kuruluydu. Kabileler arası savaşlar sık yaşanırdı. Kız çocuklarını diri diri gömmek gibi vahşi adetler vardı. Kölelik yaygındı ve kadınların hiçbir hakkı yoktu.

Ancak bu dönemde Hz. İbrahim'den kalan "Haniflik" geleneği tamamen yok olmamıştı. Bazı insanlar putlara tapmayı reddediyor, tek Allah'a inanıyordu. Kâbe, Hz. İbrahim ve Hz. İsmail tarafından inşa edilmişti ve hâlâ kutsal sayılıyordu.`
            },
            {
                title: 'Hz. Muhammed\'in Doğumu',
                content: `Hz. Muhammed (s.a.v.), Miladi 571 yılında Mekke'de doğdu. Doğum tarihi, "Fil Vakası"ndan yaklaşık 50-55 gün sonrasına denk gelir. Fil Vakası, Habeşistan Valisi Ebrehe'nin Kâbe'yi yıkmak için fil ordusuyla saldırması ve Allah'ın gönderdiği ebabil kuşlarıyla helak edilmesi olayıdır.

Babası Abdullah, annesi Âmine'dir. Babası Abdullah, Hz. Muhammed doğmadan önce ticaret yolculuğu dönüşünde Medine'de vefat etti. Hz. Muhammed yetim olarak dünyaya geldi.

Dönemin geleneğine göre çöl havasının daha sağlıklı olması nedeniyle Halime es-Sa'diye'ye sütanneliğe verildi. Halime'nin yanında 4-5 yıl kaldı. Bu dönemde "göğsünün yarılması" (şakk-ı sadr) hadisesi yaşandı. Annesi Âmine, Hz. Muhammed 6 yaşındayken Medine dönüşü yolda vefat etti. Dedesi Abdülmuttalib'in bakımına geçti. 8 yaşında dedesi de vefat edince amcası Ebu Talib onu sahiplendi.`
            },
            {
                title: 'İlk Vahiy ve Peygamberlik',
                content: `Hz. Muhammed, 40 yaşına geldiğinde Mekke yakınlarındaki Hira Mağarası'na çekilerek tefekkür ve ibadet etmeye başladı. 610 yılının Ramazan ayında, Kadir Gecesi'nde Cebrail (a.s.) ilk kez vahiy getirdi.

"Oku!" emriyle başlayan Alak Suresi'nin ilk beş ayeti nazil oldu: "Yaratan Rabbinin adıyla oku! O, insanı alaktan (asılıp tutunan zigottan) yarattı. Oku! Rabbin sonsuz kerem sahibidir. O kalemle öğretendir. İnsana bilmediğini öğretendir."

Hz. Muhammed bu olaydan çok etkilendi ve titreyerek eve döndü. Eşi Hz. Hatice onu teselli etti ve amcasının oğlu Varaka bin Nevfel'e götürdü. Varaka, Tevrat ve İncil'i bilen bir Hristiyan'dı. O, bunun peygamberlik işareti olduğunu söyledi ve Hz. Muhammed'in son peygamber olacağını müjdeledi.`
            },
            {
                title: 'Mekke Dönemi',
                content: `Mekke dönemi yaklaşık 13 yıl sürdü (610-622). İlk 3 yıl gizli davet dönemi olarak geçti. Hz. Hatice, Hz. Ebubekir, Hz. Ali ve Zeyd bin Harise ilk Müslümanlardandı.

Gizli davet döneminden sonra açık davet başladı. Hz. Muhammed, Safa Tepesi'nden Kureyş'i uyardı. Müşrikler tepki gösterdi. Özellikle Ebu Leheb ve Ebu Cehil şiddetli muhalefet başlattı.

Müslümanlara ağır işkenceler yapıldı. Bilal-i Habeşi, Ammar bin Yasir, Sümeyye (ilk şehit kadın), Yasir ve daha pek çok sahabe işkenceye maruz kaldı. Baskılar artınca bazı Müslümanlar Habeşistan'a hicret etti (615).

Müşrikler 3 yıl süren ağır bir boykot uyguladı (616-619). Müslümanlar ve onları koruyan Haşimoğulları Şi'b-i Ebu Talib'de abluka altında tutuldu. Açlık ve sefalet içinde yaşadılar.

619 yılı "Hüzün Yılı" olarak anıldı. Hz. Hatice ve Ebu Talib vefat etti. Hz. Muhammed, Taif'e gitti ancak taşlandı. Dönüşte Mirac hadisesi yaşandı - göklere yükseliş ve beş vakit namazın farz kılınması.`
            },
            {
                title: 'Hicret',
                content: `622 yılında gerçekleşen Mekke'den Medine'ye hicret, İslam tarihinin en önemli dönüm noktasıdır. Hicri takvimin başlangıcı olarak kabul edilir.

Akabe Biatları ile Medineli Müslümanlar Hz. Muhammed'i şehirlerine davet etti. Müşrikler bunu öğrenince Hz. Muhammed'i öldürmeye karar verdi. Her kabileden bir kişi seçildi ve geceleyin evini basacaklardı.

Hz. Ali, yatağına yatarak onu korudu. Hz. Muhammed ve Hz. Ebubekir gizlice evden çıkıp Sevr Mağarası'na sığındı. Müşrikler kapıya geldiklerinde mağaranın girişinde örümcek ağı ve güvercin yuvası gördüler ve içeri bakmadılar.

Üç gün mağarada kaldıktan sonra Medine'ye doğru yola çıktılar. Kuba'ya vardıklarında ilk mescidi inşa ettiler. Medine'ye girişlerinde büyük bir coşkuyla karşılandılar. "Tala'al-Bedru Aleyna" ilahisi bu vesileyle söylendi.`
            },
            {
                title: 'Medine Dönemi',
                content: `Medine dönemi 10 yıl sürdü (622-632). İslam devletinin ilk nüvesi burada atıldı. Mescid-i Nebevi inşa edildi. Ensar (Medineli Müslümanlar) ve Muhacir (Mekke'den göç edenler) arasında kardeşlik ilan edildi.

"Medine Vesikası" ile şehirdeki tüm gruplar (Müslümanlar, Yahudiler, müşrikler) tek bir anayasa altında toplandı. Bu, tarihin ilk yazılı anayasası olarak kabul edilir.

Önemli savaşlar:
• Bedir Savaşı (624): 313 Müslüman, 1000 müşriğe karşı mucizevi zafer kazandı.
• Uhud Savaşı (625): Okçuların yerlerini terk etmesiyle sıkıntı yaşandı, 70 sahabe şehit düştü.  
• Hendek Savaşı (627): 10.000 kişilik düşman ordusuna karşı şehrin çevresine hendek kazıldı.

Antlaşmalar:
• Hudeybiye Antlaşması (628): Görünürde Müslümanların aleyhine olan bu antlaşma, aslında "Fethu'l-Mübin" (apaçık fetih) olarak nitelendirildi.
• Mekke'nin Fethi (630): 10.000 kişilik orduyla kan dökülmeden Mekke fethedildi. Genel af ilan edildi.`
            },
            {
                title: 'Dört Halife Dönemi',
                content: `Hz. Muhammed'in vefatından sonra dört büyük halife dönemi başladı (632-661). Bu dönem "Hulefa-i Raşidin" (Doğru Yolda Olan Halifeler) olarak anılır.

Hz. Ebubekir (632-634): İlk halife. Ridde savaşlarıyla dinden dönenlere karşı mücadele etti. Kuran'ın tek kitap halinde toplanmasını başlattı. Suriye ve Irak fetihlerine başladı.

Hz. Ömer (634-644): İkinci halife. Adaleti ile ünlüdür. Kudüs, Mısır, İran, Suriye fethedildi. Divan teşkilatı kuruldu. Hicri takvim başlatıldı. Bir Mecusi köle tarafından şehit edildi.

Hz. Osman (644-656): Üçüncü halife. Kuran'ın çoğaltılarak vilayetlere gönderilmesini sağladı (Mushaf-ı Osmani). İslam donanması kuruldu. Kıbrıs fethedildi. Fitne döneminde şehit edildi.

Hz. Ali (656-661): Dördüncü halife. Cemel Vakası ve Sıffin Savaşı gibi iç çatışmalar yaşandı. Hilafet merkezini Kufe'ye taşıdı. Hariciler tarafından şehit edildi.`
            },
            {
                title: 'Emeviler ve Abbasiler',
                content: `Emevi Devleti (661-750): Hz. Ali'nin şehadetinden sonra Muaviye hilafeti ele geçirdi. Başkent Şam oldu. Hilafet babadan oğula geçen saltanata dönüştü.

Emeviler döneminde:
• İslam İspanya'ya kadar yayıldı (Endülüs)
• Kuzey Afrika tamamen fethedildi
• Türkistan'a girildi
• Arapça resmi dil oldu
• İslam mimarisi gelişti (Kubbetüs-Sahra, Emeviye Camii)

Abbasi Devleti (750-1258): Emeviler yıkılarak Abbasiler iktidara geldi. Başkent Bağdat oldu. İslam medeniyetinin "Altın Çağı" yaşandı.

Abbasiler döneminde:
• Beytü'l-Hikme (Bilgelik Evi) kuruldu
• Yunanca, Farsça, Hintçe eserler Arapça'ya çevrildi
• Matematik, tıp, astronomi, felsefe gelişti (Harezmi, İbni Sina, Farabi)
• Büyük şehirler ve kütüphaneler kuruldu
• 1258'de Moğol istilasıyla Bağdat düştü ve Abbasi hilafeti son buldu`
            },
            {
                title: 'Selçuklular ve Osmanlılar',
                content: `Türklerin İslam'a Girişi: Türkler 10. yüzyılda kitleler halinde İslam'ı kabul etti. Karahanlılar, İslam'ı kabul eden ilk Türk devletidir (840).

Büyük Selçuklu İmparatorluğu (1037-1194):
• Tuğrul Bey Bağdat'a girerek Abbasi halifesini Şii Büveyhoğulları'ndan kurtardı
• Sultan Alparslan, 1071 Malazgirt Zaferi ile Anadolu'nun kapılarını Türklere açtı
• Melikşah döneminde imparatorluk en geniş sınırlarına ulaştı
• Nizamiye Medreseleri kuruldu (ilk düzenli üniversiteler)
• Haçlı Seferlerine karşı mücadele edildi

Osmanlı İmparatorluğu (1299-1922):
• Osman Gazi tarafından 1299'da kuruldu
• 1453'te Fatih Sultan Mehmed İstanbul'u fethetti
• Yavuz Sultan Selim 1517'de hilafeti Osmanlı'ya taşıdı
• Kanuni Sultan Süleyman döneminde imparatorluk zirvesine ulaştı
• 600 yıldan fazla 3 kıtada hüküm sürdü
• 1922'de saltanat, 1924'te hilafet kaldırıldı`
            },
            {
                title: 'Modern Dönem',
                content: `Hilafetin Kaldırılması (1924): Türkiye Cumhuriyeti'nin kurulmasıyla hilafet kurumu 3 Mart 1924'te kaldırıldı. İslam dünyası merkezi bir otoriteden yoksun kaldı.

Sömürge Dönemi: 19. ve 20. yüzyıllarda Müslüman coğrafyasının büyük bölümü İngiliz, Fransız, Hollanda ve İtalyan sömürgesi altına girdi. Hindistan, Mısır, Cezayir, Endonezya, Libya ve daha pek çok ülke bağımsızlıklarını kaybetti.

Bağımsızlık Hareketleri: 1940'lardan itibaren Müslüman ülkeler bağımsızlıklarını kazanmaya başladı:
• Pakistan (1947)
• Endonezya (1949)  
• Mısır (1952)
• Cezayir (1962)
• Körfez ülkeleri (1970'ler)

Günümüz: Bugün dünyada yaklaşık 2 milyar Müslüman yaşamaktadır. 57 ülke İslam İşbirliği Teşkilatı'na üyedir. Müslümanlar, dünyanın her yerinde varlığını sürdürmekte ve İslam, dünyanın en hızlı büyüyen dini olmaya devam etmektedir.

Modern dönemde İslami uyanış hareketleri, İslami finans, helal endüstrisi ve İslami eğitim kurumları büyük gelişme göstermiştir.`
            }
        ]
    },
    {
        id: 'peygamberler',
        title: 'Peygamberler Tarihi',
        icon: '🌟',
        description: 'Kuran\'da adı geçen 25 peygamberin hayatları',
        chapters: [
            { title: 'Hz. Adem (a.s.)', content: 'İlk insan ve ilk peygamber. Cennetten dünyaya indirilişi, tövbesi, çocukları Habil ve Kabil kıssası.' },
            { title: 'Hz. İdris (a.s.)', content: 'Yüce makamlara yükseltilen, ilim ve hikmet sahibi peygamber. Yazı yazan ilk insan olarak bilinir.' },
            { title: 'Hz. Nuh (a.s.)', content: '950 yıl kavmini Allah\'a davet etti. Büyük tufan ve gemi kıssası. Ulul-azm peygamberlerden biri.' },
            { title: 'Hz. Hud (a.s.)', content: 'Ad kavmine gönderildi. Kavmi şiddetli bir fırtına ile helak edildi.' },
            { title: 'Hz. Salih (a.s.)', content: 'Semud kavmine gönderildi. Mucize olarak kayadan deve çıkardı. Kavmi korkunç bir sesle helak edildi.' },
            { title: 'Hz. İbrahim (a.s.)', content: 'Halilullah (Allah\'ın dostu). Ateşe atılması, oğlu İsmail\'i kurban etmesi, Kâbe\'nin inşası. Ulul-azm peygamberlerden.' },
            { title: 'Hz. Lut (a.s.)', content: 'Hz. İbrahim\'in yeğeni. Sodom ve Gomore halkına gönderildi. Kavmi helak edildi.' },
            { title: 'Hz. İsmail (a.s.)', content: 'Hz. İbrahim\'in oğlu. Kurban kıssası. Kâbe\'nin inşasına yardım etti. Arapların atası.' },
            { title: 'Hz. İshak (a.s.)', content: 'Hz. İbrahim\'in oğlu. İsrailoğullarının atası. Yaşlı annesinden doğdu.' },
            { title: 'Hz. Yakub (a.s.)', content: 'Hz. İshak\'ın oğlu. 12 oğlu vardı. Yusuf kıssası. İsrail lakabıyla anılır.' },
            { title: 'Hz. Yusuf (a.s.)', content: 'En güzel kıssa. Kardeşleri tarafından kuyuya atıldı, Mısır\'da köle oldu, hapiste kaldı, sonra Mısır\'ın hazine bakanı oldu.' },
            { title: 'Hz. Eyyub (a.s.)', content: 'Sabır peygamberi. Ağır hastalıklara rağmen sabretti. Allah onu sağlığına kavuşturdu.' },
            { title: 'Hz. Şuayb (a.s.)', content: 'Medyen halkına gönderildi. Ölçü ve tartıda hile yapılmamasını emretti.' },
            { title: 'Hz. Musa (a.s.)', content: 'Kelimullah. Firavun\'a karşı mücadele, denizin yarılması, Tur Dağı\'nda vahiy. Ulul-azm peygamberlerden.' },
            { title: 'Hz. Harun (a.s.)', content: 'Hz. Musa\'nın kardeşi ve yardımcısı. Fasih konuşmasıyla bilinir.' },
            { title: 'Hz. Davud (a.s.)', content: 'Hem peygamber hem hükümdar. Zebur kendisine verildi. Demiri yumuşatma mucizesi. Güzel sesi vardı.' },
            { title: 'Hz. Süleyman (a.s.)', content: 'Hz. Davud\'un oğlu. Hayvanların ve cinlerin dili, rüzgarın emrine verilmesi. Sebe Kraliçesi Belkıs kıssası.' },
            { title: 'Hz. İlyas (a.s.)', content: 'İsrailoğullarına gönderildi. Baal putuna tapan kavmini uyardı.' },
            { title: 'Hz. Elyesa (a.s.)', content: 'Hz. İlyas\'tan sonra gelen peygamber. Faziletli kimselerden.' },
            { title: 'Hz. Yunus (a.s.)', content: 'Balık tarafından yutuldu. Karanlıklar içinde dua etti. Tövbesi kabul edildi. Ninova halkına gönderildi.' },
            { title: 'Hz. Zekeriya (a.s.)', content: 'Hz. Meryem\'in bakıcısı. Yaşlılığında Hz. Yahya\'yı istedi ve duası kabul edildi.' },
            { title: 'Hz. Yahya (a.s.)', content: 'Hz. Zekeriya\'nın oğlu, Hz. İsa\'nın kuzeni. Şehit edilen peygamber.' },
            { title: 'Hz. İsa (a.s.)', content: 'Babasız doğdu. Beşikte konuştu. Ölüleri diriltme mucizesi. İncil kendisine verildi. Göğe yükseltildi. Ulul-azm peygamberlerden.' },
            { title: 'Hz. Zülkifl (a.s.)', content: 'Sabreden, faziletli bir peygamber. "İki kat" anlamına gelen isim verildi.' },
            { title: 'Hz. Muhammed (s.a.v.)', content: 'Son peygamber, Peygamberlerin Efendisi. Kuran-ı Kerim kendisine indirildi. Ümmeti en kalabalık ümmet. Ulul-azm peygamberlerden.' }
        ]
    },
    {
        id: 'siyer',
        title: 'Siyer-i Nebi',
        icon: '🌙',
        description: 'Hz. Muhammed (s.a.v.)\'in detaylı hayat hikayesi',
        chapters: [
            { title: 'Doğumu ve Çocukluğu', content: '571 yılında Mekke\'de Fil Vakası\'ndan sonra doğdu. Halime\'ye sütanneliğe verildi. Göğsünün yarılması hadisesi. Annesinin vefatı, dedesinin bakımı.' },
            { title: 'Gençliği', content: 'Ticaretle uğraştı. "Muhammed\'ül-Emin" (Güvenilir Muhammed) lakabını aldı. Ficar Savaşı\'na katıldı. Hilful-Fudul Cemiyeti\'ne üye oldu.' },
            { title: 'Hz. Hatice ile Evliliği', content: '25 yaşında Hz. Hatice ile evlendi. 25 yıl mutlu bir evlilik sürdürdüler. 6 çocukları oldu: Kasım, Abdullah, Zeynep, Rukiye, Ümmü Gülsüm, Fatıma.' },
            { title: 'İlk Vahiy', content: 'Hira Mağarası\'nda ibadet ederken 610\'da ilk vahiy geldi. Hz. Hatice\'nin tesellisi ve Varaka bin Nevfel\'in teyidi.' },
            { title: 'Gizli Davet', content: '3 yıl süren gizli davet dönemi. İlk Müslümanlar: Hz. Hatice, Hz. Ebubekir, Hz. Ali, Zeyd bin Harise.' },
            { title: 'Açık Davet', content: 'Safa Tepesi\'nden açık davet. Kureyş\'in düşmanlığı başladı. İşkenceler ve Habeşistan hicreti.' },
            { title: 'Boykot Yılları', content: '3 yıl Ebu Talib Mahallesi\'nde abluka altında yaşadılar. Çok zor günler geçirdiler.' },
            { title: 'Hüzün Yılı', content: 'Hz. Hatice ve Ebu Talib\'in vefatı. Taif yolculuğu ve hakaretler.' },
            { title: 'İsra ve Mirac', content: 'Bir gecede Mescid-i Haram\'dan Mescid-i Aksa\'ya, oradan göklere yükseliş. Beş vakit namazın farz kılınması.' },
            { title: 'Akabe Biatları', content: 'Medineli Müslümanlarla görüşmeler. Hicret\'in planlanması.' },
            { title: 'Hicret', content: '622\'de Mekke\'den Medine\'ye hicret. Sevr Mağarası\'nda üç gün. Kuba Mescidi\'nin inşası.' },
            { title: 'Medine\'de İlk Yıllar', content: 'Ensar-Muhacir kardeşliği. Mescid-i Nebevi\'nin inşası. Medine Vesikası.' },
            { title: 'Bedir Savaşı', content: '624\'te 313 Müslüman, 1000 müşriğe karşı zafer kazandı. İlk büyük zafer.' },
            { title: 'Uhud Savaşı', content: '625\'te yaşanan savaş. Okçuların yerlerini terk etmesiyle yaşanan sıkıntı.' },
            { title: 'Hendek Savaşı', content: '627\'de Medine\'yi kuşatan düşmana karşı hendek kazıldı. Psikolojik zafer.' },
            { title: 'Hudeybiye Antlaşması', content: '628\'de yapılan antlaşma. Görünürde aleyhte, sonuçta büyük fetih.' },
            { title: 'Mekke\'nin Fethi', content: '630\'da 10.000 kişilik orduyla kan dökülmeden Mekke fethedildi. Genel af ilan edildi.' },
            { title: 'Veda Haccı', content: '632\'de yapılan son hac. Veda Hutbesi. "Bugün dininizi tamamladım" ayeti.' },
            { title: 'Vefatı', content: '632\'de Medine\'de vefat etti. Ravza-i Mutahhara\'ya defnedildi. 63 yaşındaydı.' }
        ]
    },
    {
        id: 'sahabe',
        title: 'Sahabe Hayatları',
        icon: '⭐',
        description: 'Hz. Peygamber\'in ashabının örnek hayatları',
        chapters: [
            {
                title: 'Hz. Ebubekir (r.a.)', content: `"Sıddık" (çok doğru sözlü) lakabıyla bilinen Hz. Ebubekir, Hz. Muhammed'in en yakın arkadaşı ve İslam'ın ilk halifesidir. Cahiliye döneminde de saygın bir tüccardı.

İlk iman eden hür erkektir. Mirac hadisesini tereddütsüz kabul ettiği için "Sıddık" lakabını aldı. Hicret'te Hz. Muhammed'e eşlik etti, Sevr Mağarası'nda birlikte saklandılar.

Tüm malını İslam için harcadı. Bilal-i Habeşi gibi işkence gören köleleri satın alıp azat etti. Hz. Muhammed'in vefatından sonra halife seçildi (632-634). Ridde Savaşları ile dinden dönenlere karşı mücadele etti. Kuran'ın tek kitap halinde toplanmasını başlattı. 634'te vefat etti ve Hz. Muhammed'in yanına defnedildi.` },
            {
                title: 'Hz. Ömer (r.a.)', content: `"Faruk" (hak ile batılı ayıran) lakabıyla bilinen Hz. Ömer, İslam'ın ikinci halifesidir. Müslüman olmadan önce İslam'ın en şiddetli düşmanlarındandı.

Nuaym bin Abdullah'ın Müslüman olduğunu öğrenince kız kardeşinin evine gitti. Orada Taha Suresi'ni duyunca kalbi yumuşadı ve Müslüman oldu. İslam'a girişiyle Müslümanlar güç kazandı, açıkça namaz kılmaya başladılar.

Hilafeti döneminde (634-644) Kudüs, Mısır, İran, Suriye fethedildi. Adaletiyle meşhurdur. Geceleri halkın arasına kılık değiştirip çıkar, sorunlarını dinlerdi. Divan teşkilatını kurdu, maaş sistemi başlattı, Hicri takvimi başlattı. 644'te namaz kılarken bir Mecusi köle tarafından hançerlenerek şehit edildi.` },
            {
                title: 'Hz. Osman (r.a.)', content: `"Zinnureyn" (iki nur sahibi) lakabıyla bilinen Hz. Osman, Hz. Muhammed'in iki kızıyla (Rukiye ve Ümmü Gülsüm) evlendiği için bu ismi aldı. İslam'ın üçüncü halifesidir.

İlk Müslümanlardan biri ve çok zengin bir tüccardı. Cömertliğiyle tanınır. Tebük Seferi'nde ordunun üçte birini tek başına donatmıştı. Rume kuyusunu satın alıp Müslümanlara vakfetmişti.

Hilafeti döneminde (644-656) Kuran nüshalarını çoğaltarak tüm vilayetlere gönderdi (Mushaf-ı Osmani). İslam tarihindeki ilk deniz savaşı (Zâtü's-Savari) yapıldı. Kıbrıs fethedildi. Fitne döneminde evini kuşatan isyancılar tarafından Kuran okurken şehit edildi (656).` },
            {
                title: 'Hz. Ali (r.a.)', content: `"Esedullah" (Allah'ın Aslanı) ve "Haydar-ı Kerrar" lakabıyla bilinen Hz. Ali, Hz. Muhammed'in amcası Ebu Talib'in oğlu ve damadıdır. İslam'ın dördüncü halifesidir.

İlk Müslüman olan çocuktur (10 yaşında). Hicret gecesi Hz. Muhammed'in yatağına yatarak onu korudu. Hz. Fatıma ile evlendi, Hasan ve Hüseyin'in babasıdır. Cesureti ve kahramanlığıyla tanınır. Hayber'de kale kapısını söküp kalkan olarak kullandı.

İlmi çok derindir. "Ben ilmin şehriyim, Ali de kapısıdır" hadisi meşhurdur. Hilafeti döneminde (656-661) Cemel Vakası ve Sıffin Savaşı gibi iç karışıklıklar yaşandı. Hilafet merkezini Kufe'ye taşıdı. 661'de namaza giderken Hariciler tarafından şehit edildi.` },
            {
                title: 'Hz. Talha (r.a.)', content: `Aşere-i Mübeşşere'den (cennetle müjdelenen on sahabe) biridir. "Talha'tül-Hayr" (hayırlı Talha) ve "Talha'tül-Cûd" (cömert Talha) lakaplarıyla anılır.

Uhud Savaşı'nda Hz. Muhammed'i korumak için canını ortaya koydu. Vücudunda 70'ten fazla yara aldı. Üzerine gelen okları eliyle tuttu, eli sakat kaldı. Hz. Muhammed, "Talha cenneti hak etti" buyurdu.

Çok zengin ve cömert bir sahabeydi. Günlük geliri 1000 dinardı ve hepsini fakirlere dağıtırdı. Cemel Vakası'nda (656) şehit düştü.` },
            {
                title: 'Hz. Zübeyr (r.a.)', content: `Aşere-i Mübeşşere'dendir. "Havariyyü'r-Rasul" (Peygamber'in havarisi) lakabıyla anılır. Hz. Hatice'nin yeğeni ve Hz. Muhammed'in halası Safiye'nin oğludur.

İslam uğrunda ilk kılıç çeken sahabedir. 16 yaşında Müslüman oldu. Bedir, Uhud, Hendek dahil tüm savaşlara katıldı. Cesaret ve kahramanlığıyla ün saldı.

Mısır'ın fethinde önemli rol oynadı. Hz. Ebubekir ve Hz. Ömer dönemlerinde danışmanlık yaptı. Cemel Vakası'nda (656) şehit düştü.` },
            {
                title: 'Hz. Abdurrahman bin Avf (r.a.)', content: `Aşere-i Mübeşşere'dendir. İslam öncesi adı Abdü Amr idi, Hz. Muhammed tarafından Abdurrahman olarak değiştirildi.

İlk Müslümanlardandır. Hz. Ebubekir vesilesiyle Müslüman oldu. Habeşistan ve Medine hicretlerine katıldı. Çok başarılı bir tüccardı, ancak kazancının büyük bölümünü İslam yolunda harcardı.

Tebük Seferi'nde ordunun yarısını donatmıştı. Hz. Ömer'in şehit edilmesinden sonra halife seçimi komitesinde görev aldı. Hayır işlerinden geri kalmaz, fakirlere sürekli yardım ederdi. 652'de Medine'de vefat etti.` },
            {
                title: 'Hz. Sad bin Ebi Vakkas (r.a.)', content: `Aşere-i Mübeşşere'dendir. İslam uğrunda ilk ok atan sahabedir. Hz. Muhammed'in dayısıdır (annesi Peygamber'in anne tarafından akrabasıdır).

17 yaşında Müslüman oldu, ilk Müslümanlardan biridir. Uhud'da Hz. Muhammed'i korumak için ok attı. Peygamber, "At ya Sa'd! Anam babam sana feda olsun!" dedi. Bu sözü duyan tek sahabedir.

Hz. Ömer döneminde Kadisiye Savaşı'nın komutanlığını yaptı (636). İran'ın büyük bölümünü fethetti. Kufe şehrini kurdu. Fitnelerden uzak durdu. 675'te Medine yakınlarında vefat etti.` },
            {
                title: 'Hz. Said bin Zeyd (r.a.)', content: `Aşere-i Mübeşşere'dendir. Hz. Ömer'in kız kardeşi Fatıma'nın kocasıdır. Babası Zeyd bin Amr, Cahiliye'de bile putlara tapmayan bir Hanif'ti.

Hz. Ömer'in Müslüman olmasına vesile olan ayet (Taha Suresi), onun evinde okunuyordu. İlk Müslümanlardandır. Bedir hariç tüm savaşlara katıldı (Bedir'de özel görevdeydi).

Şam'ın fethinde önemli rol oynadı. Mütevazı ve takva sahibi bir insandı. 671'de Medine'de vefat etti.` },
            {
                title: 'Hz. Ebu Ubeyde bin Cerrah (r.a.)', content: `Aşere-i Mübeşşere'dendir. "Eminü'l-Ümme" (ümmetin emini) lakabıyla Hz. Muhammed tarafından nitelendirildi.

İlk Müslümanlardandır. Bedir Savaşı'nda babasıyla karşı karşıya geldi ve onu öldürmek zorunda kaldı. Bu durum çok ağrına gitti ancak İslam için her şeyi feda etmişti.

Hz. Ebubekir döneminde Suriye ordularının genel komutanlığına atandı. Hz. Ömer döneminde Şam, Kudüs ve Filistin'in fethini gerçekleştirdi. 639'da Amvas'ta (Filistin) veba salgınında şehit düştü.` },
            {
                title: 'Hz. Bilal-i Habeşi (r.a.)', content: `İslam'ın ilk müezzinidir. Habeşistan asıllı bir köleydi. İşkenceci sahibi Ümeyye bin Halef, Müslüman olduğunu öğrenince ona ağır işkenceler yaptı.

Yakıcı güneş altında kızgın kumlara yatırılıp göğsüne kocaman kayalar konuldu. "Putlara tap!" denildiğinde sadece "Ehad! Ehad!" (Allah birdir!) diyordu. Hz. Ebubekir onu satın alarak azat etti.

Mekke'nin fethinde Kâbe'nin üzerine çıkarak ezan okudu. Hz. Muhammed'in vefatından sonra büyük acı duydu, bir daha ezan okumadı (sadece Hz. Ömer'in ısrarıyla bir kez okudu). Şam'a gitti ve 640'ta orada vefat etti.` },
            {
                title: 'Hz. Halid bin Velid (r.a.)', content: `"Seyfullah" (Allah'ın Kılıcı) lakabıyla bilinen büyük komutandır. Hz. Muhammed onu bu lakapla ödüllendirdi. 100'den fazla savaşa katıldı, hiçbirinde yenilmedi.

Uhud Savaşı'nda (henüz müşrikken) okçuların boş bıraktığı geçitten saldırarak Müslümanlara ağır kayıplar verdirmişti. 629'da Müslüman oldu. Mute Savaşı'nda üç komutan şehit düşünce komutayı aldı ve orduyu kurtardı.

Hz. Ebubekir döneminde Ridde Savaşları'nda büyük başarılar kazandı. Yermük Savaşı'nda (636) Bizans'ın büyük ordusunu yendi. Hz. Ömer tarafından komutanlıktan alındığında itiraz etmedi, basit bir asker olarak savaşmaya devam etti. 642'de Humus'ta vefat etti.` },
            {
                title: 'Hz. Mus\'ab bin Umeyr (r.a.)', content: `Mekke'nin en zengin ailelerinden birinin çocuğuydu. Gençliğinde lüks içinde yaşar, en pahalı kıyafetleri giyer, en güzel kokuları sürerdi.

Müslüman olunca ailesi onu evden kovdu, tüm mallarından mahrum bıraktı. Açlık ve sefalet çekti ama imanından vazgeçmedi. Birinci Akabe Biatı'ndan sonra Medine'ye İslam'ı öğretmek üzere gönderildi - İslam'ın ilk elçisidir.

Uhud Savaşı'nda sancaktardı. Sağ eli kesildi, sancağı sol eline aldı. Sol eli de kesilince sancağı kollarıyla tuttu. Son nefesine kadar sancağı bırakmadı ve şehit düştü. Kefenlenecek bez bile yoktu, onu hurma lifleriyle örttüler.` },
            {
                title: 'Hz. Selman-ı Farisi (r.a.)', content: `İranlı (Fars) bir sahabedir. Aslen Zerdüşt dinindendi, sonra Hristiyanlığa geçti. Rahiplerin "Son peygamber Arap topraklarından çıkacak" demesi üzerine yola çıktı.

Yolda köle olarak satıldı. Medine'ye geldiğinde Hz. Muhammed'i buldu ve Müslüman oldu. Hz. Muhammed onu azat etmesi için yardım etti. "Selman bizdendir, Ehl-i Beyt'tendir" hadisiyle onurlandırıldı.

Hendek Savaşı'nda (627) şehrin etrafına hendek kazılması fikrini veren odur. Bu, Arapların bilmediği bir İran savaş taktiğiydi. Hz. Ömer döneminde Medain valiliği yaptı. Çok mütevazı yaşardı. 656'da vefat etti.` },
            {
                title: 'Hz. Ebu Hureyre (r.a.)', content: `En çok hadis rivayet eden sahabedir. 5374 hadis nakletmiştir. Gerçek adı Abdurrahman'dır. Küçük bir kedisi olduğu için "Ebu Hureyre" (kedicik babası) lakabını Hz. Muhammed verdi.

Hayber Savaşı'ndan (628) sonra Müslüman oldu. Hz. Muhammed'in yanından hiç ayrılmadı. Suffe ashabındandı - Mescid-i Nebevi'de kalarak ilim öğrenen fakir sahabelerden.

Hafızası çok güçlüydü. Bir gün Hz. Muhammed'e "Senden duyduklarımı unutuyorum" dedi. Peygamber, ridasını (üst giysisini) açmasını söyledi ve dua etti. O günden sonra hiçbir şey unutmadı. Medine'de müftülük ve kadılık yaptı. 678'de Medine'de vefat etti.` }
        ]
    }
];

// ==================== 2. DİNİ METİNLER ====================
export const RELIGIOUS_TEXTS = [
    {
        id: 'kirk-hadis',
        title: 'Kırk Hadis',
        icon: '📜',
        description: 'İmam Nevevi\'nin derlediği 40 önemli hadis',
        items: [
            { number: 1, arabic: 'إنَّمَا الأَعْمَالُ بِالنِّيَّاتِ', text: 'Ameller niyetlere göredir.', explanation: 'Her iş yapılırken niyet çok önemlidir. Allah, yapılan işin dış görünüşünden ziyade kalpteki niyete bakar. Müminin niyeti, amelinden hayırlıdır.' },
            { number: 2, arabic: 'بُنِيَ الإِسْلَامُ عَلَى خَمْسٍ', text: 'İslam beş temel üzerine kurulmuştur.', explanation: 'İslam; Allah\'tan başka ilah olmadığına ve Muhammed\'in O\'nun elçisi olduğuna şehadet etmek, namaz kılmak, zekat vermek, hacca gitmek ve Ramazan orucunu tutmak üzerine bina edilmiştir.' },
            { number: 3, arabic: 'الإِيمَانُ بِضْعٌ وَسَبْعُونَ شُعْبَةً', text: 'İman yetmiş küsur şubedir.', explanation: 'İman yetmiş küsur derecedir. En üstünü "La ilahe illallah" demek, en aşağısı ise yoldaki eziyet veren bir şeyi kaldırmaktır. Haya da imandan bir şubedir.' },
            { number: 4, arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ', text: 'Biriniz kendisi için istediğini kardeşi için istemedikçe tam iman etmiş olmaz.', explanation: 'Gerçek mümin, kendisine layık gördüğü güzellikleri din kardeşi için de ister. Bencillik imanın kemaline engeldir.' },
            { number: 5, arabic: 'الْحَلَالُ بَيِّنٌ وَالْحَرَامُ بَيِّنٌ', text: 'Helal bellidir, haram da bellidir.', explanation: 'Helal de haram da açıklanmıştır. Ancak ikisi arasında şüpheli şeyler vardır. Şüpheli şeylerden kaçınan, dinini ve ırzını korumuş olur.' },
            { number: 6, arabic: 'أَلَا وَإِنَّ فِي الْجَسَدِ مُضْغَةً', text: 'Vücudun içinde bir et parçası vardır; o düzelirse bütün vücut düzelir.', explanation: 'Dikkat edin! Vücutta bir et parçası vardır ki, o iyi olursa bütün vücut iyi olur; o bozulursa bütün vücut bozulur. İşte o kalptir.' },
            { number: 7, arabic: 'الدِّينُ النَّصِيحَةُ', text: 'Din nasihattir (samimiyettir).', explanation: 'Din samimiyettir. Allah\'a, Kitabı\'na, Resulü\'ne, Müslümanların idarecilerine ve bütün Müslümanlara karşı samimi olmaktır.' },
            { number: 8, arabic: 'كُلُّ الْمُسْلِمِ عَلَى الْمُسْلِمِ حَرَامٌ', text: 'Müslüman Müslümanın kardeşidir.', explanation: 'Her Müslümanın kanı, malı ve onuru diğer Müslümana haramdır. Müslüman Müslümana zulmetmez, onu yardımsız bırakmaz ve onu küçük görmez.' },
            { number: 9, arabic: 'مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ', text: 'Yasakladığım şeylerden kaçının.', explanation: 'Size bir şeyi yasakladığımda ondan sakının. Bir şeyi emrettiğimde ise gücünüz yettiğince onu yerine getirin.' },
            { number: 10, arabic: 'إِنَّ اللَّهَ طَيِّبٌ لَا يَقْبَلُ إِلَّا طَيِّبًا', text: 'Allah temizdir, ancak temiz olanı kabul eder.', explanation: 'Allah Teala tayyiptir (temizdir), sadece tayyip olanları kabul eder. Helal kazanç ve temiz niyet ibadetlerin kabulü için şarttır.' }
        ]
    },
    {
        id: 'islam-sartlari',
        title: 'İslam\'ın Şartları',
        icon: '🕌',
        description: 'Beş temel esas',
        items: [
            { number: 1, title: 'Kelime-i Şehadet', text: 'Eşhedü en la ilahe illallah ve eşhedü enne Muhammeden abdühü ve resulüh', explanation: 'Allah\'tan başka ilah olmadığına ve Hz. Muhammed\'in O\'nun kulu ve elçisi olduğuna şehadet etmek.' },
            { number: 2, title: 'Namaz', text: 'Günde beş vakit namaz kılmak', explanation: 'Sabah, öğle, ikindi, akşam ve yatsı namazları farz-ı ayındır.' },
            { number: 3, title: 'Oruç', text: 'Ramazan ayında oruç tutmak', explanation: 'İmsak vaktinden iftar vaktine kadar yeme, içme ve cinsel ilişkiden uzak durmak.' },
            { number: 4, title: 'Zekat', text: 'Malın zekatını vermek', explanation: 'Nisap miktarına ulaşan malın kırkta birini ihtiyaç sahiplerine vermek.' },
            { number: 5, title: 'Hac', text: 'Gücü yetenlerin hacca gitmesi', explanation: 'Ömürde bir kez, mali ve bedeni gücü yetenlerin Kâbe\'yi ziyaret etmesi.' }
        ]
    },
    {
        id: 'iman-sartlari',
        title: 'İmanın Şartları',
        icon: '✨',
        description: 'Altı iman esası',
        items: [
            { number: 1, title: 'Allah\'a İman', text: 'Allah\'ın varlığına ve birliğine inanmak', explanation: 'Allah birdir, ortağı yoktur. Her şeyin yaratıcısıdır.' },
            { number: 2, title: 'Meleklere İman', text: 'Meleklerin varlığına inanmak', explanation: 'Cebrail, Mikail, İsrafil, Azrail ve diğer melekler.' },
            { number: 3, title: 'Kitaplara İman', text: 'İlahi kitaplara inanmak', explanation: 'Tevrat, Zebur, İncil ve Kuran-ı Kerim.' },
            { number: 4, title: 'Peygamberlere İman', text: 'Tüm peygamberlere inanmak', explanation: 'Hz. Adem\'den Hz. Muhammed\'e kadar tüm peygamberler.' },
            { number: 5, title: 'Ahiret Gününe İman', text: 'Kıyamet ve ahiret hayatına inanmak', explanation: 'Ölüm, kabir, kıyamet, hesap, cennet ve cehennem.' },
            { number: 6, title: 'Kadere İman', text: 'Kadere, hayrın ve şerrin Allah\'tan olduğuna inanmak', explanation: 'Her şey Allah\'ın bilgisi ve takdiri dahilindedir.' }
        ]
    },
    {
        id: 'namaz-sureleri',
        title: 'Namaz Sureleri',
        icon: '📿',
        description: 'Namazda okunan kısa sureler',
        items: [
            { 
                number: 1, 
                title: 'Fatiha Suresi', 
                arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 
                text: 'Bismillahirrahmanirrahim. Elhamdülillahi rabbil alemin. Errahmanirrahim. Maliki yevmiddin. İyyake na\'büdü ve iyyake nestain. İhdinassıratal müstakim. Sıratallezine en\'amte aleyhim. Gayril mağdubi aleyhim veleddallin.', 
                explanation: 'Rahman ve Rahim olan Allah\'ın adıyla. Hamd, alemlerin Rabbi Allah\'a mahsustur. O, Rahman ve Rahim\'dir. Din gününün sahibidir. Yalnız sana ibadet eder ve yalnız senden yardım dileriz. Bizi doğru yola ilet. Kendilerine nimet verdiklerinin yoluna; gazaba uğrayanların ve sapıtanların yoluna değil.' 
            },
            { 
                number: 2, 
                title: 'İhlas Suresi', 
                arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', 
                text: 'Kul hüvallahü ehad. Allahüssamed. Lem yelid ve lem yuled. Ve lem yekün lehü küfüven ehad.', 
                explanation: 'De ki: O Allah birdir. Allah sameddir (her şey O\'na muhtaç, O hiçbir şeye muhtaç değil). O doğurmamıştır ve doğurulmamıştır. Hiçbir şey O\'nun dengi değildir.' 
            },
            { 
                number: 3, 
                title: 'Felak Suresi', 
                arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', 
                text: 'Kul euzü birabbil felak. Min şerri ma halak. Ve min şerri ğasikın iza vekab. Ve min şerrin neffasati fil ukad. Ve min şerri hasidin iza hased.', 
                explanation: 'De ki: Sabahın Rabbine sığınırım. Yarattığı şeylerin şerrinden. Karanlığı çöktüğü zaman gecenin şerrinden. Düğümlere üfleyenlerin şerrinden. Ve haset ettiği zaman hasetçinin şerrinden.' 
            },
            { 
                number: 4, 
                title: 'Nas Suresi', 
                arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ', 
                text: 'Kul euzü birabbinnas. Melikinnas. İlahinnas. Min şerril vesvasil hannas. Ellezi yüvesvisü fi sudurinnas. Minel cinneti vennas.', 
                explanation: 'De ki: İnsanların Rabbine sığınırım. İnsanların Melikine (hükümdarına). İnsanların İlahına. O sinsi vesvesecinin şerrinden. O ki insanların göğüslerine vesvese verir. Gerek cinlerden, gerek insanlardan.' 
            },
            { 
                number: 5, 
                title: 'Kevser Suresi', 
                arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ۝ فَصَلِّ لِرَبِّكَ وَانْحَرْ ۝ إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ', 
                text: 'İnna a\'taynakeül kevser. Fesalli lirabbike venhar. İnne şanieke hüvel ebter.', 
                explanation: 'Şüphesiz biz sana Kevser\'i verdik. Öyleyse Rabbin için namaz kıl ve kurban kes. Asıl sonu kesik olan, sana kin duyandır.' 
            },
            { 
                number: 6, 
                title: 'Asr Suresi', 
                arabic: 'وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ۝ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ', 
                text: 'Vel asr. İnnel insane lefi husr. İllellezine amenu ve amilussalihati ve tevasav bilhakkı ve tevasav bissabr.', 
                explanation: 'Asra yemin olsun ki, insan gerçekten ziyan içindedir. Ancak iman edip salih ameller işleyenler, birbirlerine hakkı tavsiye edenler ve birbirlerine sabrı tavsiye edenler müstesnadır.' 
            },
            { 
                number: 7, 
                title: 'Fil Suresi', 
                arabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ ۝ أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ ۝ وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ ۝ تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ ۝ فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍ', 
                text: 'Elem tera keyfe feale rabbüke biashabül fil. Elem yec\'al keydehüm fi tadlil. Ve ersele aleyhim tayran ebabil. Termihim bihicaratin min siccil. Fecealehüm keasfin me\'kul.', 
                explanation: 'Rabbinin fil sahiplerine ne yaptığını görmedin mi? Onların tuzaklarını boşa çıkarmadı mı? Üzerlerine sürüler halinde kuşlar gönderdi. Onlara pişmiş çamurdan taşlar atıyorlardı. Sonunda onları yenilmiş ekin yaprakları gibi yaptı.' 
            },
            { 
                number: 8, 
                title: 'Kureyş Suresi', 
                arabic: 'لِإِيلَافِ قُرَيْشٍ ۝ إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ ۝ فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ ۝ الَّذِي أَطْعَمَهُم مِّن جُوعٍ وَآمَنَهُم مِّنْ خَوْفٍ', 
                text: 'Li ilafi kureyş. İlafihim rıhleteşşitai vessayf. Felya\'büdu rabbe hazelbeyt. Ellezi at\'amehüm min cu\' ve amenehüm min havf.', 
                explanation: 'Kureyş\'in güvenliği için, onların kış ve yaz seferlerinin güvenliği için, bu Beyt\'in (Kâbe\'nin) Rabbine ibadet etsinler. O ki onları açlıktan doyurdu ve korkudan emin kıldı.' 
            },
            { 
                number: 9, 
                title: 'Maun Suresi', 
                arabic: 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ ۝ فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ ۝ وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ ۝ فَوَيْلٌ لِّلْمُصَلِّينَ ۝ الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ ۝ الَّذِينَ هُمْ يُرَاءُونَ ۝ وَيَمْنَعُونَ الْمَاعُونَ', 
                text: 'Eraeytellezi yükezzibü bidden. Fezelikellezi yedu\'ül yetim. Ve la yehuddu ala taamil miskin. Feveylün lilmusallin. Ellezine hüm an salatihim sahun. Ellezine hüm yüraun. Ve yemneunelmaun.', 
                explanation: 'Dini yalanlayan kimseyi gördün mü? İşte odur yetimi itip kakan. Yoksulu doyurmaya teşvik etmeyen. Yazıklar olsun o namaz kılanlara ki, onlar namazlarında yanılgı içindedirler. Onlar gösteriş yaparlar ve en ufak yardımı bile engellerler.' 
            },
            { 
                number: 10, 
                title: 'Kafirun Suresi', 
                arabic: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ ۝ لَا أَعْبُدُ مَا تَعْبُدُونَ ۝ وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ ۝ وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ ۝ وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ ۝ لَكُمْ دِينُكُمْ وَلِيَ دِينِ', 
                text: 'Kul ya eyyühel kafirun. La a\'büdü ma ta\'büdun. Ve la entüm abidune ma a\'büd. Ve la ene abidün ma abedtüm. Ve la entüm abidune ma a\'büd. Leküm diinüküm veliye diin.', 
                explanation: 'De ki: Ey kafirler! Ben sizin taptıklarınıza tapmam. Siz de benim taptığıma tapmazsınız. Ben sizin taptıklarınıza tapacak değilim. Siz de benim taptığıma tapacak değilsiniz. Sizin dininiz size, benim dinim banadır.' 
            }
        ]
    },
    {
        id: 'dini-terimler',
        title: 'Dini Terimler Sözlüğü',
        icon: '📖',
        description: 'İslami kavramların açıklamaları',
        items: [
            { number: 1, name: 'Akaid', meaning: 'İman esaslarını konu alan ilim dalı', explanation: 'İslam\'ın inanç konularını inceler.' },
            { number: 2, name: 'Bidah', meaning: 'Dinde sonradan çıkarılan şeyler', explanation: 'Hz. Peygamber döneminde olmayan dini uygulamalar.' },
            { number: 3, name: 'Farz', meaning: 'Kesin delille sabit zorunlu ibadet', explanation: 'Yapanın sevap, terk edenin günah kazandığı ibadetler.' },
            { number: 4, name: 'Vacip', meaning: 'Farzdan bir derece aşağı zorunluluk', explanation: 'Vitr namazı, kurban kesmek gibi.' },
            { number: 5, name: 'Sünnet', meaning: 'Hz. Peygamber\'in söz, fiil ve takrirleri', explanation: 'Sünnet-i Müekkede ve Sünnet-i Gayr-i Müekkede.' },
            { number: 6, name: 'Mübah', meaning: 'Yapılıp yapılmaması serbest olan', explanation: 'Helal yiyecekler, şerbet içmek gibi.' },
            { number: 7, name: 'Mekruh', meaning: 'Hoş görülmeyen, yapılmaması daha iyi olan', explanation: 'Tahrimen ve Tenzihen mekruh olmak üzere ikiye ayrılır.' },
            { number: 8, name: 'Haram', meaning: 'Kesin delille yasaklanan', explanation: 'İçki, kumar, faiz, zina gibi büyük günahlar.' },
            { number: 9, name: 'Hadis', meaning: 'Hz. Peygamber\'in sözleri', explanation: 'Sahih, hasen, zayıf gibi derecelere ayrılır.' },
            { number: 10, name: 'Tefsir', meaning: 'Kuran ayetlerinin açıklanması', explanation: 'Rivayet ve dirayet tefsiri olmak üzere ikiye ayrılır.' },
            { number: 11, name: 'İctihad', meaning: 'Dini hükümler çıkarmak için çaba', explanation: 'Müctehid alimlerin yaptığı hukuki yorumlama.' },
            { number: 12, name: 'Takva', meaning: 'Allah\'tan korkup günahlardan kaçınmak', explanation: 'Haramlardan sakınıp helallere yönelmek.' },
            { number: 13, name: 'Tevekkül', meaning: 'Allah\'a güvenip ona bağlanmak', explanation: 'Sebeplere sarılıp sonucu Allah\'a bırakmak.' },
            { number: 14, name: 'İhsan', meaning: 'Allah\'ı görür gibi ibadet etmek', explanation: 'Sen Allah\'ı görmesen de O seni görüyor.' },
            { number: 15, name: 'Şirk', meaning: 'Allah\'a ortak koşmak', explanation: 'En büyük günah, affedilmez.' }
        ]
    }
];

// ==================== 3. EĞİTİM İÇERİKLERİ ====================
export const EDUCATION = [
    {
        id: 'ilmihal',
        title: 'Temel İslam Bilgileri',
        icon: '🎓',
        description: 'Her Müslümanın bilmesi gereken temel konular',
        topics: [
            { title: 'Abdest', content: 'Namaz için gerekli temizlik. Farzları: Yüzü yıkamak, kolları dirseklerle beraber yıkamak, başın dörtte birini mesh etmek, ayakları topuklarla beraber yıkamak.' },
            { title: 'Gusül', content: 'Cenabetten temizlenme. Farzları: Ağza su vermek, burna su çekmek, bütün vücudu yıkamak.' },
            { title: 'Teyemmüm', content: 'Su bulunmadığında veya kullanılamadığında toprakla temizlenme.' },
            { title: 'Namaz Vakitleri', content: 'İmsak, güneş, öğle, ikindi, akşam, yatsı vakitlerinin belirlenmesi.' },
            { title: 'Namazın Farzları', content: 'Şartları: Hadesten taharet, necasetten taharet, setr-i avret, istikbal-i kıble, vakit, niyet. Rükünleri: İftitah tekbiri, kıyam, kıraat, rükû, secde, ka\'de-i ahire.' },
            { title: 'Oruç', content: 'Ramazan orucunun farziyeti, orucu bozan ve bozmayan şeyler, fidye ve kefaret.' },
            { title: 'Zekat', content: 'Nisap miktarı, zekat verilecek yerler, zekatın hesaplanması.' },
            { title: 'Hac', content: 'Haccın farzları: İhram, Arafat vakfesi, ziyaret tavafı. Haccın vacipleri ve sünnetleri.' }
        ]
    },
    {
        id: 'tecvid',
        title: 'Tecvid Kuralları',
        icon: '📖',
        description: 'Kuran\'ı doğru okuma kuralları',
        topics: [
            { title: 'Tecvid Nedir?', content: 'Kuran-ı Kerim\'i harflerin mahreç ve sıfatlarına uygun olarak, hakkını vererek okuma ilmidir.' },
            { title: 'Harflerin Mahreçleri', content: 'Harflerin çıkış yerleri: Boğaz, dil, dudak, geniz ve ağız boşluğu.' },
            { title: 'İdğam', content: 'Bir harfin diğer harfe katılarak okunması. İdğam-ı Bila Ğunne, İdğam-ı Mea\'l-Ğunne.' },
            { title: 'İhfa', content: 'Harfi ne izhar ne idğam yaparak, ikisi arasında ğunne ile okumak.' },
            { title: 'İzhar', content: 'Harfi açık bir şekilde, hiçbir değişiklik yapmadan okumak.' },
            { title: 'İklab', content: 'Nun sakineden sonra Ba harfi gelince, nunu mime çevirip ğunne ile okumak.' },
            { title: 'Med', content: 'Harfleri uzatarak okuma. Med-i Tabii, Med-i Muttasıl, Med-i Munfasıl.' },
            { title: 'Vakıf ve İbtida', content: 'Doğru yerlerde durmak ve doğru yerlerden başlamak.' }
        ]
    },
    {
        id: 'arapca',
        title: 'Arapça Alfabesi',
        icon: '🔤',
        description: '28 Arap harfi ve okunuşları',
        topics: [
            { letter: 'ا', name: 'Elif', pronunciation: 'A', description: 'Uzatma harfi olarak da kullanılır.' },
            { letter: 'ب', name: 'Be', pronunciation: 'B', description: 'Altında bir nokta vardır.' },
            { letter: 'ت', name: 'Te', pronunciation: 'T', description: 'Üstünde iki nokta vardır.' },
            { letter: 'ث', name: 'Se', pronunciation: 'S (peltek)', description: 'Dilin ucunu dişlere değdirerek.' },
            { letter: 'ج', name: 'Cim', pronunciation: 'C', description: 'Ortasında bir nokta vardır.' },
            { letter: 'ح', name: 'Ha', pronunciation: 'H (gırtlaktan)', description: 'Nefesli, gırtlaktan çıkar.' },
            { letter: 'خ', name: 'Hı', pronunciation: 'H (kalın)', description: 'Kalın h sesi.' },
            { letter: 'د', name: 'Dal', pronunciation: 'D', description: 'Dilin ucuyla.' },
            { letter: 'ذ', name: 'Zel', pronunciation: 'Z (peltek)', description: 'Dilin ucu dişlerin arasından.' },
            { letter: 'ر', name: 'Ra', pronunciation: 'R', description: 'Titreşimli r sesi.' },
            { letter: 'ز', name: 'Ze', pronunciation: 'Z', description: 'Normal z sesi.' },
            { letter: 'س', name: 'Sin', pronunciation: 'S', description: 'İnce s sesi.' },
            { letter: 'ش', name: 'Şın', pronunciation: 'Ş', description: 'Şın sesi.' },
            { letter: 'ص', name: 'Sad', pronunciation: 'S (kalın)', description: 'Kalın s sesi.' },
            { letter: 'ض', name: 'Dad', pronunciation: 'D (kalın)', description: 'Kalın d sesi, Arapça\'ya özgü.' },
            { letter: 'ط', name: 'Tı', pronunciation: 'T (kalın)', description: 'Kalın t sesi.' },
            { letter: 'ظ', name: 'Zı', pronunciation: 'Z (kalın peltek)', description: 'Kalın, peltek z sesi.' },
            { letter: 'ع', name: 'Ayın', pronunciation: 'A (gırtlaktan)', description: 'Gırtlaktan çıkan a sesi.' },
            { letter: 'غ', name: 'Ğayın', pronunciation: 'Ğ', description: 'Gırtlaktan ğ sesi.' },
            { letter: 'ف', name: 'Fe', pronunciation: 'F', description: 'F sesi.' },
            { letter: 'ق', name: 'Kaf', pronunciation: 'K (kalın)', description: 'Kalın k, gırtlaktan.' },
            { letter: 'ك', name: 'Kef', pronunciation: 'K', description: 'Normal k sesi.' },
            { letter: 'ل', name: 'Lam', pronunciation: 'L', description: 'L sesi.' },
            { letter: 'م', name: 'Mim', pronunciation: 'M', description: 'M sesi.' },
            { letter: 'ن', name: 'Nun', pronunciation: 'N', description: 'N sesi.' },
            { letter: 'ه', name: 'He', pronunciation: 'H', description: 'Normal h sesi.' },
            { letter: 'و', name: 'Vav', pronunciation: 'V/U', description: 'V veya U/O uzatması.' },
            { letter: 'ي', name: 'Ye', pronunciation: 'Y/İ', description: 'Y veya İ uzatması.' }
        ]
    }
];

// ==================== 4. REFERANSLAR ====================
export const REFERENCES = [
    {
        id: 'esma',
        title: 'Esma-ül Hüsna',
        icon: '✨',
        description: 'Allah\'ın 99 güzel ismi',
        items: [
            { number: 1, arabic: 'الرَّحْمَنُ', name: 'Er-Rahman', meaning: 'Dünyada bütün mahlûkata merhamet eden' },
            { number: 2, arabic: 'الرَّحِيمُ', name: 'Er-Rahim', meaning: 'Ahirette müminlere merhamet eden' },
            { number: 3, arabic: 'المَلِكُ', name: 'El-Melik', meaning: 'Mülkün sahibi, gerçek hükümdar' },
            { number: 4, arabic: 'القُدُّوسُ', name: 'El-Kuddüs', meaning: 'Her türlü eksiklikten uzak' },
            { number: 5, arabic: 'السَّلَامُ', name: 'Es-Selam', meaning: 'Selamet veren, esenlik kaynağı' },
            { number: 6, arabic: 'المُؤْمِنُ', name: 'El-Mü\'min', meaning: 'Güven veren, inanan kullarını koruyan' },
            { number: 7, arabic: 'المُهَيْمِنُ', name: 'El-Müheymin', meaning: 'Her şeyi gözetip koruyan' },
            { number: 8, arabic: 'العَزِيزُ', name: 'El-Aziz', meaning: 'Güçlü, yenilmez, onurlu' },
            { number: 9, arabic: 'الجَبَّارُ', name: 'El-Cebbar', meaning: 'İstediğini yapan, düzeltici' },
            { number: 10, arabic: 'المُتَكَبِّرُ', name: 'El-Mütekebbir', meaning: 'Büyüklükte eşi olmayan' },
            // ... diğer isimler kısaltıldı, 99'a kadar devam eder
        ]
    },
    {
        id: 'cennetle-mujdelenen',
        title: 'Aşere-i Mübeşşere',
        icon: '🌟',
        description: 'Cennetle müjdelenen 10 sahabe',
        items: [
            { number: 1, name: 'Hz. Ebubekir (r.a.)', title: 'Sıddık', description: 'İlk halife, Peygamber\'in en yakın arkadaşı' },
            { number: 2, name: 'Hz. Ömer (r.a.)', title: 'Faruk', description: 'İkinci halife, adaleti ile meşhur' },
            { number: 3, name: 'Hz. Osman (r.a.)', title: 'Zinnureyn', description: 'Üçüncü halife, Kuran\'ı çoğaltan' },
            { number: 4, name: 'Hz. Ali (r.a.)', title: 'Esedullah', description: 'Dördüncü halife, Peygamber\'in damadı' },
            { number: 5, name: 'Hz. Talha (r.a.)', title: 'Talha\'tül-Hayr', description: 'Uhud kahramanı' },
            { number: 6, name: 'Hz. Zübeyr (r.a.)', title: 'Havariyyü\'r-Rasul', description: 'Peygamber\'in havarisi' },
            { number: 7, name: 'Hz. Abdurrahman bin Avf (r.a.)', title: '', description: 'Zengin tüccar, cömert sahabe' },
            { number: 8, name: 'Hz. Sa\'d bin Ebi Vakkas (r.a.)', title: '', description: 'İlk ok atan sahabe' },
            { number: 9, name: 'Hz. Said bin Zeyd (r.a.)', title: '', description: 'Hz. Ömer\'in eniştesi' },
            { number: 10, name: 'Hz. Ebu Ubeyde bin Cerrah (r.a.)', title: 'Eminül-Ümme', description: 'Ümmetin emini' }
        ]
    }
];

// ==================== 5. SORU-CEVAP ====================
export const FAQ = [
    {
        id: 'genel',
        category: 'Genel Sorular',
        icon: '❓',
        questions: [
            { q: 'Müslüman olmak için ne gerekir?', a: 'Kelime-i şehadet getirmek yeterlidir: "Eşhedü en la ilahe illallah ve eşhedü enne Muhammeden abdühü ve rasulüh" (Allah\'tan başka ilah olmadığına ve Muhammed\'in O\'nun kulu ve elçisi olduğuna şehadet ederim).' },
            { q: 'Günde kaç vakit namaz kılınır?', a: 'Günde 5 vakit namaz farzdır: Sabah, Öğle, İkindi, Akşam ve Yatsı.' },
            { q: 'Kuran kaç sureden oluşur?', a: 'Kuran-ı Kerim 114 sureden oluşmaktadır. İlk sure Fatiha, son sure Nas suresidir.' },
            { q: 'Zekat nisabı nedir?', a: 'Zekat nisabı, 80.18 gram altın veya 561.2 gram gümüş değerindedir. Bu miktara sahip olan ve üzerinden bir yıl geçen Müslümanlar zekat vermekle yükümlüdür.' },
            { q: 'Hac ne zaman yapılır?', a: 'Hac, Zilhicce ayının 8-12. günleri arasında yapılır. Arefe günü (9 Zilhicce) Arafat vakfesi yapılır.' }
        ]
    },
    {
        id: 'namaz',
        category: 'Namaz Soruları',
        icon: '🕌',
        questions: [
            { q: 'Abdest nasıl alınır?', a: 'Niyet edilir, eller bileklere kadar yıkanır, ağıza ve buruna su verilir, yüz yıkanır, kollar dirseklerle yıkanır, baş mesh edilir, kulaklar mesh edilir, ayaklar topuklarla yıkanır.' },
            { q: 'Namazı bozan şeyler nelerdir?', a: 'Konuşmak, gülmek, yemek-içmek, abdestin bozulması, kıbleden dönmek, fazla hareket etmek namazı bozar.' },
            { q: 'Sehiv secdesi ne zaman yapılır?', a: 'Namazda vacip bir şeyin terki veya geciktirilmesi, farzın tehiri gibi durumlarda sehiv secdesi yapılır.' },
            { q: 'Kadınların namaz kılması erkeklerden farklı mı?', a: 'Temel olarak aynıdır, ancak bazı şekil farklılıkları vardır. Kadınlar ellerini omuz hizasına kaldırır, secdede kollarını yere yapıştırır.' },
            { q: 'Cemaatle namaz kılmanın fazileti nedir?', a: 'Cemaatle kılınan namaz, tek başına kılınan namazdan 27 derece daha faziletlidir (hadis).' }
        ]
    },
    {
        id: 'oruc',
        category: 'Oruç Soruları',
        icon: '🌙',
        questions: [
            { q: 'Orucu bozan şeyler nelerdir?', a: 'Bilerek yemek, içmek, cinsel ilişki, kusturmak, iğne yaptırmak (besleyici), sigara içmek orucu bozar.' },
            { q: 'Orucu bozmayan şeyler nelerdir?', a: 'Unutarak yemek-içmek, kan aldırmak, göze ilaç damlatmak, diş fırçalamak (yutmamak şartıyla) orucu bozmaz.' },
            { q: 'Oruç fidyesi ne kadardır?', a: 'Oruç fidyesi, bir fakiri bir gün doyuracak miktardır. Güncel Diyanet görüşüne göre hesaplanır.' },
            { q: 'Hangi durumlarda oruç tutulmaz?', a: 'Hastalık, hamilelik, emzirme, yolculuk, aşırı yaşlılık gibi durumlarda oruç tutulmayabilir ve fidye verilir veya kaza edilir.' }
        ]
    }
];

// ==================== 6. SESLİ KÜTÜPHANE (PREMIUM) ====================
export const AUDIO = [
    {
        id: 'hatim',
        title: 'Hatim Setleri',
        icon: '🎧',
        description: 'Kabe imamları ve ünlü hafızlardan Kur\'an tilavetleri',
        type: 'reciters',
        isPro: true,
        items: [] // Populated dynamically from quranService
    },
    {
        id: 'riyazus-salihin',
        title: 'Riyazüs Salihin',
        icon: '📚',
        description: 'Hadis-i Şerif okumaları ve açıklamaları',
        type: 'playlist',
        isPro: true,
        items: [
            { number: 1, title: '1. Bölüm: İhlas ve Niyet', duration: '15:30', url: 'https://example.com/audio/riyaz-1.mp3' },
            { number: 2, title: '2. Bölüm: Tövbe', duration: '18:45', url: 'https://example.com/audio/riyaz-2.mp3' },
            { number: 3, title: '3. Bölüm: Sabır', duration: '22:10', url: 'https://example.com/audio/riyaz-3.mp3' },
            { number: 4, title: '4. Bölüm: Doğruluk', duration: '14:20', url: 'https://example.com/audio/riyaz-4.mp3' },
            { number: 5, title: '5. Bölüm: Murakabe', duration: '16:50', url: 'https://example.com/audio/riyaz-5.mp3' }
        ]
    },
    {
        id: 'siyer-sohbetleri',
        title: 'Siyer Sohbetleri',
        icon: '🕌',
        description: 'Hz. Peygamber\'in hayatı üzerine sohbetler',
        type: 'playlist',
        isPro: true,
        items: [
            { number: 1, title: 'Mekke Dönemi Başlangıcı', duration: '45:00', url: 'https://example.com/audio/siyer-1.mp3' },
            { number: 2, title: 'Habeşistan Hicreti', duration: '42:15', url: 'https://example.com/audio/siyer-2.mp3' },
            { number: 3, title: 'Hüzün Yılı ve Taif', duration: '38:50', url: 'https://example.com/audio/siyer-3.mp3' },
            { number: 4, title: 'İsra ve Mirac', duration: '50:10', url: 'https://example.com/audio/siyer-4.mp3' },
            { number: 5, title: 'Hicret Yolculuğu', duration: '48:30', url: 'https://example.com/audio/siyer-5.mp3' }
        ]
    },
    {
        id: 'peygamberler-tarihi',
        title: 'Peygamberler Tarihi',
        icon: '🌟',
        description: 'Peygamberlerin ibretlik hayat hikayeleri',
        type: 'playlist',
        isPro: true,
        items: [
            { number: 1, title: 'Hz. Adem ve Yaradılış', duration: '35:20', url: 'https://example.com/audio/peygamberler-1.mp3' },
            { number: 2, title: 'Hz. Nuh ve Tufan', duration: '40:15', url: 'https://example.com/audio/peygamberler-2.mp3' },
            { number: 3, title: 'Hz. İbrahim ve Tevhid', duration: '44:50', url: 'https://example.com/audio/peygamberler-3.mp3' },
            { number: 4, title: 'Hz. Yusuf\'un Kıssası', duration: '55:00', url: 'https://example.com/audio/peygamberler-4.mp3' },
            { number: 5, title: 'Hz. Musa ve Firavun', duration: '52:30', url: 'https://example.com/audio/peygamberler-5.mp3' }
        ]
    }
];

// ==================== 7. İSLAMİ AKADEMİ (VIDEO) ====================
export const VIDEO = [
    {
        id: 'tecvid-dersleri',
        title: 'Tecvid Dersleri',
        icon: '🎬',
        description: 'Kur\'an Mektebim kanalından kapsamlı tecvid eğitimi',
        type: 'external_video',
        isPro: false,
        source: 'Kuran Mektebim',
        channelUrl: 'https://www.youtube.com/@KuranMektebim',
        playlistUrl: 'https://www.youtube.com/@KuranMektebim/playlists',
        topics: [
            'Tecvid\'e Giriş',
            'Harflerin Mahreçleri',
            'İdğam Kuralları',
            'İhfa ve İzhar',
            'Kalkale Kuralı',
            'Med (Uzatma) Kuralları',
            'Ra Harfi Okuma Kuralları',
            'Vakıf ve Geçiş İşaretleri',
            'Uygulamalı Kısa Sureler'
        ]
    },
    {
        id: 'diyanet-kuran-ogreniyorum',
        title: 'Kur\'an Öğreniyorum',
        icon: '📖',
        description: 'Diyanet TV resmi Kur\'an eğitim programı',
        type: 'external_video',
        isPro: false,
        source: 'Diyanet TV',
        channelUrl: 'https://www.youtube.com/@DiyanetTV',
        playlistUrl: 'https://www.diyanet.tv/kuran-ogreniyorum',
        topics: [
            'Elif-Ba Eğitimi',
            'Harf Tanıma ve Okuma',
            'Tecvid Kuralları',
            'Sure Okumaları',
            'Pratik Uygulamalar'
        ]
    },
    {
        id: 'kisa-sureler-tefsiri',
        title: 'Kısa Sureler Tefsiri',
        icon: '🕌',
        description: 'Namazda okunan surelerin anlam ve tefsirleri',
        type: 'external_video',
        isPro: false,
        source: 'Diyanet TV / İsmail Yaşar',
        channelUrl: 'https://www.youtube.com/@DiyanetTV',
        searchQuery: 'kısa sureler tefsiri türkçe',
        topics: [
            'Fatiha Suresi Tefsiri',
            'İhlas Suresi Tefsiri',
            'Felak Suresi Tefsiri',
            'Nas Suresi Tefsiri',
            'Fil Suresi Tefsiri',
            'Kureyş Suresi Tefsiri',
            'Maun Suresi Tefsiri',
            'Kevser Suresi Tefsiri',
            'Kafirun Suresi Tefsiri',
            'Nasr Suresi Tefsiri'
        ]
    },
    {
        id: 'gunluk-sunnetler',
        title: 'Günlük Hayatta Sünnetler',
        icon: '☀️',
        description: 'Peygamber Efendimiz\'in günlük hayat öğretileri',
        type: 'external_video',
        isPro: true,
        source: 'Çeşitli Kanallar',
        searchQuery: 'günlük sünnetler peygamber efendimiz',
        topics: [
            'Sabah Rutini Sünnetleri',
            'Yeme İçme Adabı',
            'Uyku Öncesi Sünnetler',
            'Eve Giriş Çıkış Adabı',
            'Selamlaşma Sünnetleri',
            'Temizlik ve Giyinme',
            'Cuma Günü Sünnetleri',
            '100 Günlük Sünnet'
        ]
    },
    {
        id: 'siyer-dersleri',
        title: 'Siyer-i Nebi',
        icon: '🌙',
        description: 'Hz. Peygamber\'in hayatı - Kapsamlı siyer dersleri',
        type: 'external_video',
        isPro: true,
        source: 'Diyanet TV / Akademi Kanalları',
        channelUrl: 'https://www.youtube.com/@DiyanetTV',
        searchQuery: 'siyer dersleri peygamber hayatı',
        topics: [
            'Mekke Dönemi',
            'Hicret',
            'Medine Dönemi',
            'Gazve ve Seferler',
            'Veda Hutbesi'
        ]
    }
];


// Tüm kategoriler
export const LIBRARY_CATEGORIES = [
    { id: 'books', title: 'Kitaplar', icon: '📚', data: BOOKS },
    { id: 'texts', title: 'Dini Metinler', icon: '📜', data: RELIGIOUS_TEXTS },
    { id: 'education', title: 'Eğitim', icon: '🎓', data: EDUCATION },
    { id: 'references', title: 'Referanslar', icon: '📋', data: REFERENCES },
    { id: 'prayers', title: 'Peygamber Duaları', icon: '🤲', data: PRAYERS },
    { id: 'audio', title: 'Sesli Kütüphane', icon: '🎧', data: AUDIO, isPro: true },
    { id: 'video', title: 'İslami Akademi', icon: '🎬', data: VIDEO },
    { id: 'faq', title: 'Soru-Cevap', icon: '❓', data: FAQ }
];

