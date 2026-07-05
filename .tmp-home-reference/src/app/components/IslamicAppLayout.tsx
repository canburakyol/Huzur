import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin, ChevronLeft, Play, Pause, SkipBack, SkipForward,
  Heart, Home, Star, Share2, Book, Compass, Check, Sliders,
  Bell, Zap, ChevronRight, Bookmark, Volume2, Search,
  Settings, Moon, Sun, RotateCcw, Navigation, X
} from "lucide-react";

type Screen = "home" | "quran-list" | "quran-reader" | "kible" | "settings";

// ─── SVG Decorations ────────────────────────────────────────────────────────

function IslamicPattern({ opacity = 0.07 }: { opacity?: number }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full absolute inset-0 pointer-events-none"
      style={{ opacity }}
    >
      <defs>
        <pattern id="geo" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <polygon points="25,2 32,18 48,18 36,28 40,44 25,34 10,44 14,28 2,18 18,18" fill="none" stroke="white" strokeWidth="0.8" />
          <polygon points="25,10 29,20 40,20 32,26 35,37 25,31 15,37 18,26 10,20 21,20" fill="white" strokeWidth="0" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#geo)" />
    </svg>
  );
}

function MosqueSvg() {
  return (
    <svg viewBox="0 0 300 140" className="w-full h-full" fill="white">
      <ellipse cx="150" cy="78" rx="42" ry="38" />
      <rect x="108" y="78" width="84" height="60" />
      <rect x="72" y="48" width="12" height="90" rx="3" />
      <ellipse cx="78" cy="48" rx="8" ry="14" />
      <rect x="74" y="34" width="8" height="12" rx="1" />
      <rect x="216" y="48" width="12" height="90" rx="3" />
      <ellipse cx="222" cy="48" rx="8" ry="14" />
      <rect x="218" y="34" width="8" height="12" rx="1" />
      <rect x="36" y="80" width="72" height="58" />
      <ellipse cx="72" cy="80" rx="36" ry="24" />
      <rect x="192" y="80" width="72" height="58" />
      <ellipse cx="228" cy="80" rx="36" ry="24" />
      <rect x="0" y="135" width="300" height="5" />
    </svg>
  );
}

function StarOrnament() {
  return (
    <svg viewBox="0 0 60 60" className="w-full h-full" fill="currentColor">
      <polygon points="30,3 34,22 52,22 38,33 43,52 30,41 17,52 22,33 8,22 26,22" />
    </svg>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const prayerTimes = [
  { name: "İmsak", arabic: "الفجر", time: "04:14", icon: Moon },
  { name: "Güneş", arabic: "الشروق", time: "07:16", icon: Sun },
  { name: "Öğle",  arabic: "الظهر",  time: "13:37", icon: Sun,  active: true },
  { name: "İkindi",arabic: "العصر",  time: "17:21", icon: Sun },
  { name: "Akşam", arabic: "المغرب", time: "21:12", icon: Moon },
  { name: "Yatsı", arabic: "العشاء", time: "22:48", icon: Moon },
];

const surahs = [
  { no: 1,  name: "El-Fatiha", arabic: "الفاتحة", type: "Mekki", verses: 7 },
  { no: 2,  name: "El-Bakara", arabic: "البقرة",  type: "Medeni", verses: 286 },
  { no: 3,  name: "Al-İmran",  arabic: "آل عمران", type: "Medeni", verses: 200 },
  { no: 18, name: "El-Kehf",   arabic: "الكهف",   type: "Mekki", verses: 110 },
  { no: 36, name: "Ya-sin",    arabic: "يس",      type: "Mekki", verses: 83 },
  { no: 55, name: "Er-Rahman", arabic: "الرحمن",  type: "Mekki", verses: 78 },
  { no: 67, name: "El-Mülk",   arabic: "الملك",   type: "Mekki", verses: 30 },
  { no: 112,name: "El-İhlas",  arabic: "الإخلاص", type: "Mekki", verses: 4 },
];

const yasinVerses = [
  { no: 1, ar: "يٰسٓ",                             tr: "Yâ-Sîn." },
  { no: 2, ar: "وَالْقُرْآنِ الْحَكِيمِ",          tr: "Hikmet dolu Kur'an'a andolsun." },
  { no: 3, ar: "إِنَّكَ لَمِنَ الْمُرْسَلِينَ",   tr: "Gerçekten sen, gönderilen peygamberlerdensin." },
  { no: 4, ar: "عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ",     tr: "Dosdoğru bir yol üzerindesin." },
  { no: 5, ar: "تَنزِيلَ الْعَزِيزِ الرَّحِيمِ",  tr: "(Bu Kur'an,) güçlü ve merhametli olan tarafından indirilmiştir." },
  { no: 6, ar: "لِتُنذِرَ قَوْمًا مَّا أُنذِرَ آبَاؤُهُمْ", tr: "Babaları uyarılmamış olan ve bu yüzden gafil kalan bir kavmi uyarman için." },
];

const navItems = [
  { id: "home",     label: "Ana Sayfa", icon: Home },
  { id: "quran-list", label: "Kuran",  icon: Book },
  { id: "kible",    label: "Kıble",    icon: Compass },
  { id: "settings", label: "Ayarlar",  icon: Settings },
];

const themeColors = [
  { name: "Adaçayı",  primary: "#7A9E8A", light: "#E4EEE8", bg: "#EDE9E1" },
  { name: "Lacivert", primary: "#2E5FA3", light: "#DDEAF8", bg: "#EEF2F9" },
  { name: "Amber",    primary: "#B5813A", light: "#F7EDD8", bg: "#F5F0E8" },
  { name: "Mor",      primary: "#7C5CBF", light: "#EDE6F8", bg: "#F0ECF9" },
  { name: "Gül",      primary: "#C0626A", light: "#F9E2E3", bg: "#F8F0F0" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function PrayerHeroCard({ theme }: { theme: typeof themeColors[0] }) {
  const [countdown, setCountdown] = useState("01:23:45");

  useEffect(() => {
    const timer = setInterval(() => {
      const parts = countdown.split(":").map(Number);
      let [h, m, s] = parts;
      s--;
      if (s < 0) { s = 59; m--; }
      if (m < 0) { m = 59; h--; }
      if (h < 0) { h = 0; m = 0; s = 0; }
      setCountdown(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="px-5 mt-5">
      <div
        className="rounded-[28px] overflow-hidden shadow-2xl relative"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}DD 0%, ${theme.primary} 60%, ${theme.primary}BB 100%)`,
        }}
      >
        <IslamicPattern opacity={0.08} />

        {/* Mosque silhouette at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 opacity-10 pointer-events-none">
          <MosqueSvg />
        </div>

        <div className="relative z-10 p-5">
          {/* Top row */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3 h-3 text-white/80" />
                <span className="text-[11px] text-white/90 font-semibold tracking-wide">İstanbul, Türkiye</span>
              </div>
              <p className="text-white/60 text-[9px] uppercase tracking-[0.18em] font-bold">
                14 Zilhicce 1447 · 3 Temmuz
              </p>
            </div>
            <div className="text-right bg-white/10 backdrop-blur-sm rounded-2xl px-3 py-2">
              <p className="text-white/70 text-[9px] font-bold uppercase tracking-wide mb-0.5">Öğle'ye Kalan</p>
              <p className="text-white text-[20px] font-black tracking-tight leading-none">{countdown}</p>
            </div>
          </div>

          {/* Prayer times row */}
          <div className="flex gap-1">
            {prayerTimes.map((p) => (
              <div
                key={p.name}
                className={`flex-1 flex flex-col items-center py-2.5 rounded-2xl transition-all ${
                  p.active
                    ? "bg-white shadow-lg"
                    : "bg-white/10"
                }`}
              >
                <p
                  className={`text-[7.5px] font-black uppercase tracking-tight leading-none mb-1.5 ${
                    p.active ? "text-[" + theme.primary + "]" : "text-white/60"
                  }`}
                  style={{ color: p.active ? theme.primary : undefined }}
                >
                  {p.name}
                </p>
                <p
                  className={`text-[11px] font-extrabold leading-none ${
                    p.active ? "" : "text-white"
                  }`}
                  style={{ color: p.active ? theme.primary : undefined }}
                >
                  {p.time}
                </p>
                {p.active && (
                  <div className="mt-1.5 w-1 h-1 rounded-full" style={{ backgroundColor: theme.primary }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActions({ onNavigate, theme }: { onNavigate: (s: Screen) => void; theme: typeof themeColors[0] }) {
  const items = [
    { label: "Kuran", icon: Book,    color: theme.primary, bg: theme.light, screen: "quran-list" as Screen },
    { label: "Kıble", icon: Compass, color: "#D97706", bg: "#FEF3C7", screen: "kible" as Screen },
    { label: "Dualar",icon: Star,    color: "#7C3AED", bg: "#EDE9FE", screen: null },
    { label: "Tesbih",icon: RotateCcw, color: "#DB2777", bg: "#FCE7F3", screen: null },
  ];

  return (
    <div className="px-5 mt-7">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-black text-[#1C1C2E]">Hızlı Erişim</h3>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => item.screen && onNavigate(item.screen)}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="w-full aspect-square rounded-[22px] flex items-center justify-center shadow-sm border border-white/80 transition-transform active:scale-95"
                style={{ backgroundColor: item.bg }}
              >
                <Icon className="w-6 h-6" style={{ color: item.color }} />
              </div>
              <span className="text-[10.5px] text-[#374151] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HabitTracker({ theme }: { theme: typeof themeColors[0] }) {
  const [checked, setChecked] = useState([true, true, false, false, false]);
  const prayers = ["Sabah", "Öğle", "İkindi", "Akşam", "Yatsı"];
  const short = ["S", "Ö", "İ", "A", "Y"];
  const done = checked.filter(Boolean).length;

  const toggle = (i: number) => {
    const next = [...checked];
    next[i] = !next[i];
    setChecked(next);
  };

  return (
    <div className="px-5 mt-7">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-black text-[#1C1C2E]">Namaz Takibi</h3>
        <div className="flex items-center gap-1.5 bg-amber-50 rounded-full px-3 py-1">
          <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-[10.5px] font-black text-amber-500">12 Gün Seri</span>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          {prayers.map((p, i) => (
            <button
              key={p}
              onClick={() => toggle(i)}
              className="flex flex-col items-center gap-1.5 transition-transform active:scale-90"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center border-[2.5px] transition-all"
                style={{
                  backgroundColor: checked[i] ? theme.light : "#F9FAFB",
                  borderColor: checked[i] ? theme.primary : "#E5E7EB",
                }}
              >
                {checked[i] ? (
                  <Check className="w-5 h-5 stroke-[3px]" style={{ color: theme.primary }} />
                ) : (
                  <span className="text-[11px] font-black text-gray-300">{short[i]}</span>
                )}
              </div>
              <span className="text-[9px] font-bold" style={{ color: checked[i] ? theme.primary : "#9CA3AF" }}>
                {p}
              </span>
            </button>
          ))}
        </div>

        <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ backgroundColor: theme.primary }}
            animate={{ width: `${(done / 5) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] text-gray-400 font-bold mt-2 text-right">{done}/5 tamamlandı</p>
      </div>
    </div>
  );
}

function DailyVerse({ theme }: { theme: typeof themeColors[0] }) {
  return (
    <div className="px-5 mt-7">
      <div
        className="rounded-[28px] p-5 relative overflow-hidden border"
        style={{ backgroundColor: theme.light, borderColor: theme.primary + "20" }}
      >
        {/* decorative star */}
        <div className="absolute top-4 right-4 w-10 h-10 opacity-10" style={{ color: theme.primary }}>
          <StarOrnament />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.primary }}
          >
            <Book className="w-3.5 h-3.5 text-white" />
          </div>
          <span
            className="text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ color: theme.primary }}
          >
            Günün Ayeti
          </span>
        </div>

        <p
          className="text-[22px] text-[#1C1C2E] text-right leading-relaxed mb-4"
          dir="rtl"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ
        </p>

        <p className="text-[13px] text-[#374151] leading-relaxed italic mb-4" style={{ fontFamily: "Georgia, serif" }}>
          "Öyleyse siz beni anın ki ben de sizi anayım. Bana şükredin; sakın nankörlük etmeyin."
        </p>

        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: theme.primary + "20" }}>
          <span className="text-[11px] font-bold" style={{ color: theme.primary + "AA" }}>
            Bakara Suresi · 152. Ayet
          </span>
          <button
            className="flex items-center gap-1.5 text-[11px] font-black"
            style={{ color: theme.primary }}
          >
            <Share2 className="w-3.5 h-3.5" />
            Paylaş
          </button>
        </div>
      </div>
    </div>
  );
}

function FeaturedSurah({ onNavigate, theme }: { onNavigate: (s: Screen) => void; theme: typeof themeColors[0] }) {
  return (
    <div className="px-5 mt-5 mb-8">
      <h3 className="text-[15px] font-black text-[#1C1C2E] mb-3">Önerilen</h3>
      <button
        onClick={() => onNavigate("quran-reader")}
        className="w-full bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform active:scale-[0.98]"
      >
        <div
          className="w-16 h-16 rounded-[18px] flex items-center justify-center flex-shrink-0 relative"
          style={{ backgroundColor: theme.light }}
        >
          <Book className="w-7 h-7" style={{ color: theme.primary }} />
          <div
            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
            style={{ backgroundColor: theme.primary }}
          >
            <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
          </div>
        </div>
        <div className="flex-1 text-left">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Mülk Suresi · يس</p>
          <p className="text-[15px] font-black text-[#1C1C2E]">Ya-sin Suresi</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Nasser Al Qatami · 12:45</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
      </button>
    </div>
  );
}

// ─── Screens ──────────────────────────────────────────────────────────────────

function HomeScreen({ onNavigate, theme }: { onNavigate: (s: Screen) => void; theme: typeof themeColors[0] }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none">
      {/* Header */}
      <div className="px-5 pt-3 pb-1 flex justify-between items-center">
        <div>
          <p className="text-[11px] font-bold tracking-wider uppercase" style={{ color: theme.primary }}>
            Selamün Aleyküm
          </p>
          <h1 className="text-[24px] font-black text-[#1C1C2E]" style={{ fontFamily: "Georgia, serif" }}>
            Ahmet Bey 👋
          </h1>
        </div>
        <button className="w-11 h-11 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center">
          <Bell className="w-5 h-5 text-[#374151]" />
        </button>
      </div>

      <PrayerHeroCard theme={theme} />
      <QuickActions onNavigate={onNavigate} theme={theme} />
      <HabitTracker theme={theme} />
      <DailyVerse theme={theme} />
      <FeaturedSurah onNavigate={onNavigate} theme={theme} />
    </div>
  );
}

function QuranListScreen({ onNavigate, theme }: { onNavigate: (s: Screen) => void; theme: typeof themeColors[0] }) {
  const [query, setQuery] = useState("");
  const filtered = surahs.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.arabic.includes(query)
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-3 pb-4">
        <h1 className="text-[24px] font-black text-[#1C1C2E] mb-4" style={{ fontFamily: "Georgia, serif" }}>
          Kur'an-ı Kerim
        </h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sure ara..."
            className="w-full bg-white border border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-[13px] text-[#1C1C2E] placeholder:text-gray-400 shadow-sm outline-none focus:border-gray-200"
          />
        </div>
      </div>

      {/* Bismillah banner */}
      <div
        className="mx-5 mb-4 rounded-[22px] px-5 py-4 text-center"
        style={{ background: `linear-gradient(135deg, ${theme.primary}CC, ${theme.primary})` }}
      >
        <p className="text-white text-[22px]" dir="rtl" style={{ fontFamily: "Georgia, serif" }}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
      </div>

      {/* Surah list */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-5 space-y-2 pb-6">
        {filtered.map((surah) => (
          <button
            key={surah.no}
            onClick={() => onNavigate("quran-reader")}
            className="w-full bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm border border-gray-100 transition-transform active:scale-[0.98]"
          >
            <div
              className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: theme.light }}
            >
              <span className="text-[12px] font-black" style={{ color: theme.primary }}>
                {surah.no}
              </span>
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-black text-[#1C1C2E]">{surah.name}</p>
                <span className="text-[9px] font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                  {surah.type}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">{surah.verses} ayet</p>
            </div>
            <p className="text-[18px] text-[#1C1C2E]" dir="rtl" style={{ fontFamily: "Georgia, serif" }}>
              {surah.arabic}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuranReaderScreen({ onNavigate, theme }: { onNavigate: (s: Screen) => void; theme: typeof themeColors[0] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState(26);
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={() => onNavigate("quran-list")}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-[#374151]" />
        </button>
        <div className="text-center">
          <p className="text-[15px] font-black text-[#1C1C2E]">Ya-sin Suresi</p>
          <p className="text-[10px] text-gray-400 font-bold">يس · Mekki · 83 Ayet</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <Bookmark
              className="w-4 h-4"
              style={{ color: bookmarked ? theme.primary : "#9CA3AF", fill: bookmarked ? theme.primary : "transparent" }}
            />
          </button>
          <button
            onClick={() => setShowControls(!showControls)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <Sliders className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Font controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-gray-100 px-5 overflow-hidden flex-shrink-0"
          >
            <div className="py-3 flex items-center justify-between">
              <span className="text-[12px] font-bold text-gray-600">Yazı Boyutu</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFontSize(Math.max(18, fontSize - 2))}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <span className="text-[14px] font-bold text-gray-600">−</span>
                </button>
                <span className="text-[13px] font-black text-[#1C1C2E] w-6 text-center">{fontSize}</span>
                <button
                  onClick={() => setFontSize(Math.min(38, fontSize + 2))}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.light }}
                >
                  <span className="text-[14px] font-bold" style={{ color: theme.primary }}>+</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verses */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-5 py-5">
        {/* Bismillah */}
        <div className="text-center mb-8 py-4 rounded-[20px]" style={{ backgroundColor: theme.light }}>
          <p
            className="text-[20px]"
            dir="rtl"
            style={{ fontFamily: "Georgia, serif", color: theme.primary }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>

        <div className="space-y-7">
          {yasinVerses.map((verse) => (
            <div key={verse.no} className="group">
              {/* Arabic */}
              <div className="flex items-start gap-3 mb-3" dir="rtl">
                <p
                  className="flex-1 leading-[1.9] text-[#1C1C2E]"
                  style={{ fontFamily: "Georgia, serif", fontSize: `${fontSize}px` }}
                >
                  {verse.ar}
                </p>
                <div
                  className="mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-black"
                  style={{ backgroundColor: theme.light, color: theme.primary }}
                >
                  {verse.no}
                </div>
              </div>
              {/* Turkish */}
              <p className="text-[13px] text-[#4B5563] leading-relaxed border-l-[3px] pl-4" style={{ borderColor: theme.primary + "40" }}>
                {verse.tr}
              </p>
            </div>
          ))}
        </div>

        <div className="h-8" />
      </div>

      {/* Audio bar */}
      <div className="bg-white border-t border-gray-100 px-5 py-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
          <div className="flex-1 h-1 bg-gray-100 rounded-full relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/3 rounded-full" style={{ backgroundColor: theme.primary }} />
          </div>
          <span className="text-[10px] text-gray-400 font-bold">12:45</span>
        </div>
        <div className="flex justify-between items-center">
          <button>
            <SkipBack className="w-5 h-5 text-[#374151]" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-90"
            style={{ backgroundColor: theme.primary, boxShadow: `0 8px 24px ${theme.primary}50` }}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white fill-white" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            )}
          </button>
          <button>
            <SkipForward className="w-5 h-5 text-[#374151]" />
          </button>
          <button onClick={() => setLiked(!liked)}>
            <Heart
              className="w-5 h-5"
              style={{
                color: liked ? "#E11D48" : "#D1D5DB",
                fill: liked ? "#E11D48" : "transparent",
              }}
            />
          </button>
          <button>
            <Volume2 className="w-5 h-5 text-[#D1D5DB]" />
          </button>
        </div>
      </div>
    </div>
  );
}

function KibleScreen({ theme }: { theme: typeof themeColors[0] }) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    // Simulate compass pointing to Mecca (SE direction ~135° for Istanbul)
    const target = 135;
    let current = angle;
    const interval = setInterval(() => {
      const diff = ((target - current + 540) % 360) - 180;
      if (Math.abs(diff) < 1) {
        setAngle(target);
        clearInterval(interval);
      } else {
        current += diff * 0.08;
        setAngle(current % 360);
      }
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-3 pb-4">
        <h1 className="text-[24px] font-black text-[#1C1C2E]" style={{ fontFamily: "Georgia, serif" }}>
          Kıble Yönü
        </h1>
        <p className="text-[12px] text-gray-400 font-medium mt-0.5">Kabe'ye olan yönünüzü bulun</p>
      </div>

      {/* Location card */}
      <div className="mx-5 mb-6 bg-white rounded-[20px] px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: theme.light }}>
          <MapPin className="w-4 h-4" style={{ color: theme.primary }} />
        </div>
        <div>
          <p className="text-[13px] font-black text-[#1C1C2E]">İstanbul, Türkiye</p>
          <p className="text-[10px] text-gray-400 font-medium">41.0082° K, 28.9784° D</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[11px] font-black" style={{ color: theme.primary }}>Kabe'ye</p>
          <p className="text-[10px] text-gray-400">~3,400 km</p>
        </div>
      </div>

      {/* Compass */}
      <div className="flex-1 flex items-center justify-center flex-col gap-8 px-5">
        <div className="relative w-64 h-64">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full border-[3px] shadow-2xl"
            style={{
              borderColor: theme.primary + "30",
              background: `radial-gradient(circle at 30% 30%, white, ${theme.light})`,
              boxShadow: `0 20px 60px ${theme.primary}25, inset 0 1px 1px white`,
            }}
          />

          {/* Cardinal directions */}
          {[
            { label: "K", deg: 0 },
            { label: "D", deg: 90 },
            { label: "G", deg: 180 },
            { label: "B", deg: 270 },
          ].map(({ label, deg }) => {
            const rad = ((deg - angle) * Math.PI) / 180;
            const r = 100;
            const x = 128 + r * Math.sin(rad);
            const y = 128 - r * Math.cos(rad);
            return (
              <div
                key={label}
                className="absolute w-6 h-6 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                style={{ left: x, top: y }}
              >
                <span
                  className="text-[11px] font-black"
                  style={{ color: label === "K" ? theme.primary : "#9CA3AF" }}
                >
                  {label}
                </span>
              </div>
            );
          })}

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: theme.primary }} />
          </div>

          {/* Needle */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 0 }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Kaaba needle pointing to Mecca */}
              <div
                className="absolute"
                style={{
                  width: 4,
                  height: 90,
                  bottom: "50%",
                  left: "calc(50% - 2px)",
                  transformOrigin: "50% 100%",
                  rotate: `${angle}deg`,
                }}
              >
                <div className="w-full h-1/2 rounded-t-full" style={{ backgroundColor: theme.primary }} />
                <div className="w-full h-1/2 rounded-b-full bg-gray-300" />
              </div>
            </div>
          </motion.div>

          {/* Kaaba icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: theme.primary }}
            >
              <span className="text-[10px] font-black">🕋</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="w-full bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div className="text-center flex-1">
              <p className="text-[22px] font-black" style={{ color: theme.primary }}>135°</p>
              <p className="text-[10px] text-gray-400 font-bold mt-1">Kıble Açısı</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="text-center flex-1">
              <p className="text-[22px] font-black text-[#1C1C2E]">GD</p>
              <p className="text-[10px] text-gray-400 font-bold mt-1">Yön</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="text-center flex-1">
              <p className="text-[22px] font-black text-amber-500">Cuma</p>
              <p className="text-[10px] text-gray-400 font-bold mt-1">Bugün</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsScreen({ theme, onThemeChange }: { theme: typeof themeColors[0]; onThemeChange: (t: typeof themeColors[0]) => void }) {
  const [notifications, setNotifications] = useState(true);
  const [darkPrayer, setDarkPrayer] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none pb-8">
      <div className="px-5 pt-3 pb-4">
        <h1 className="text-[24px] font-black text-[#1C1C2E]" style={{ fontFamily: "Georgia, serif" }}>
          Ayarlar
        </h1>
      </div>

      {/* Profile card */}
      <div
        className="mx-5 mb-5 rounded-[24px] p-5 flex items-center gap-4"
        style={{ background: `linear-gradient(135deg, ${theme.primary}CC, ${theme.primary})` }}
      >
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-[22px]">
          🕌
        </div>
        <div className="flex-1">
          <p className="text-white font-black text-[16px]">Ahmet Bey</p>
          <p className="text-white/70 text-[11px] font-medium">İstanbul · Türkiye</p>
        </div>
        <ChevronRight className="w-5 h-5 text-white/60" />
      </div>

      {/* Theme colors */}
      <div className="mx-5 mb-4 bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
        <p className="text-[13px] font-black text-[#1C1C2E] mb-4">Tema Rengi</p>
        <div className="flex gap-3">
          {themeColors.map((t) => (
            <button
              key={t.name}
              onClick={() => onThemeChange(t)}
              className="flex flex-col items-center gap-1.5 flex-1"
            >
              <div
                className="w-10 h-10 rounded-full border-[3px] transition-all"
                style={{
                  backgroundColor: t.primary,
                  borderColor: theme.primary === t.primary ? "#1C1C2E" : "transparent",
                }}
              />
              <span className="text-[8px] font-bold text-gray-500">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggle settings */}
      <div className="mx-5 mb-4 bg-white rounded-[24px] p-2 shadow-sm border border-gray-100">
        {[
          { label: "Namaz Hatırlatıcıları", sub: "Tüm vakitlerde bildirim", state: notifications, toggle: () => setNotifications(!notifications) },
          { label: "Kuran Türkçe Meal", sub: "Ayetlerin altında göster", state: true, toggle: () => {} },
          { label: "Karanlık Mod", sub: "Sistem temasını kullan", state: darkPrayer, toggle: () => setDarkPrayer(!darkPrayer) },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-3.5">
            <div>
              <p className="text-[13px] font-bold text-[#1C1C2E]">{item.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
            </div>
            <button
              onClick={item.toggle}
              className="w-12 h-6 rounded-full p-0.5 transition-all flex items-center"
              style={{ backgroundColor: item.state ? theme.primary : "#E5E7EB" }}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: item.state ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Links */}
      <div className="mx-5 bg-white rounded-[24px] p-2 shadow-sm border border-gray-100">
        {[
          { label: "Konum Ayarları", icon: MapPin, color: "#EF4444" },
          { label: "Bildirim Sesleri", icon: Bell, color: "#F59E0B" },
          { label: "Gizlilik Politikası", icon: ChevronRight, color: "#6B7280" },
          { label: "Hakkında", icon: Star, color: theme.primary },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl transition-colors active:bg-gray-50"
            >
              <div
                className="w-9 h-9 rounded-[12px] flex items-center justify-center"
                style={{ backgroundColor: item.color + "15" }}
              >
                <Icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <span className="flex-1 text-left text-[13px] font-bold text-[#1C1C2E]">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export function IslamicAppLayout() {
  const [screen, setScreen] = useState<Screen>("home");
  const [theme, setTheme] = useState(themeColors[0]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeNav =
    screen === "home" ? "home"
    : screen === "quran-list" || screen === "quran-reader" ? "quran-list"
    : screen === "kible" ? "kible"
    : "settings";

  const navigate = (s: Screen) => setScreen(s);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: "#C8C3BB" }}
    >
      {/* Phone shell */}
      <div
        className="relative flex flex-col rounded-[52px] overflow-hidden shadow-[0_40px_80px_-10px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.08)]"
        style={{
          width: 390,
          height: 844,
          backgroundColor: theme.bg,
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Status bar */}
        <div className="flex justify-between items-center px-9 pt-4 pb-1 flex-shrink-0">
          <span className="text-[13px] font-black text-[#1C1C2E]">
            {time.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <div className="flex gap-1.5 items-center">
            <div className="flex gap-[2px] items-end h-3">
              {[40, 60, 80, 100].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-[1px]"
                  style={{
                    height: `${h}%`,
                    backgroundColor: i < 3 ? "#1C1C2E" : "#1C1C2E30",
                  }}
                />
              ))}
            </div>
            <svg viewBox="0 0 24 16" className="w-5 h-3.5" fill="#1C1C2E">
              <path d="M12 4C8.5 4 5.3 5.7 3 8.3L1 6.2C3.9 3 7.7 1 12 1s8.1 2 11 5.2l-2 2.1C18.7 5.7 15.5 4 12 4z" />
              <path d="M12 9c-2 0-3.8 1-5 2.6L5 9.5C6.7 7.4 9.2 6 12 6s5.3 1.4 7 3.5l-2 2.1C15.8 10 14 9 12 9z" />
              <circle cx="12" cy="15" r="2" />
            </svg>
            <div className="w-6 h-3 rounded-sm border border-[#1C1C2E]/40 p-[2px]">
              <div className="w-3/4 h-full rounded-[1px]" style={{ backgroundColor: theme.primary }} />
            </div>
          </div>
        </div>

        {/* Screen content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {screen === "home" && <HomeScreen onNavigate={navigate} theme={theme} />}
            {screen === "quran-list" && <QuranListScreen onNavigate={navigate} theme={theme} />}
            {screen === "quran-reader" && <QuranReaderScreen onNavigate={navigate} theme={theme} />}
            {screen === "kible" && <KibleScreen theme={theme} />}
            {screen === "settings" && <SettingsScreen theme={theme} onThemeChange={setTheme} />}
          </motion.div>
        </AnimatePresence>

        {/* Bottom nav */}
        <div
          className="flex-shrink-0 border-t border-white/60 flex px-3 pb-7 pt-2 z-50"
          style={{ backgroundColor: `${theme.bg}F0`, backdropFilter: "blur(16px)" }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id as Screen)}
                className="flex-1 flex flex-col items-center py-1.5 gap-1 transition-transform active:scale-90"
              >
                <div
                  className="w-12 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{ backgroundColor: active ? theme.primary + "18" : "transparent" }}
                >
                  <Icon
                    className="w-5 h-5 transition-all"
                    style={{
                      color: active ? theme.primary : "#9CA3AF",
                      strokeWidth: active ? 2.5 : 2,
                    }}
                  />
                </div>
                <span
                  className="text-[9.5px] font-black tracking-tight"
                  style={{ color: active ? theme.primary : "#9CA3AF" }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
