import { memo } from 'react';
import { BookOpenText, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FALLBACK_VERSE = {
  reference: "Ra'd, 28",
  text: "Kalpler ancak Allah'ı anmakla huzur bulur.",
  arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
};

const CLEAN_REFERENCES = {
  'Ã„Â°nÃ…Å¸irah, 5-6': 'İnşirah, 5-6',
  'Ä°nÅŸirah, 5-6': 'İnşirah, 5-6',
  'Raâ€™d, 28': "Ra'd, 28",
};

const CLEAN_VERSE_TEXT = {
  'Bakara, 153': 'Allah sabredenlerle beraberdir.',
  "Ra'd, 28": "Kalpler ancak Allah'ı anmakla huzur bulur.",
  'İnşirah, 5-6': 'Şüphesiz güçlükle beraber bir kolaylık vardır.',
  'Taha, 114': 'Rabbim! İlmimi artır.',
  'Talak, 3': "Kim Allah'a tevekkül ederse O, ona yeter.",
};

const CLEAN_VERSE_ARABIC = {
  'Bakara, 153': 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
  "Ra'd, 28": 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
  'İnşirah, 5-6': 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا * إِنَّ مَعَ الْعُسْرِ يُسْرًا',
  'Taha, 114': 'رَبِّ زِدْنِي عِلْمًا',
  'Talak, 3': 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
};

const HomeDailyVerseCard = memo(function HomeDailyVerseCard({ dailyContent }) {
  const { t } = useTranslation();
  const verse = dailyContent?.verse || FALLBACK_VERSE;
  const rawReference = verse.reference || FALLBACK_VERSE.reference;
  const reference = CLEAN_REFERENCES[rawReference] || rawReference;
  const verseText = CLEAN_VERSE_TEXT[reference] || verse.translation || verse.text || FALLBACK_VERSE.text;
  const ARABIC_TEXT = verse.arabic || CLEAN_VERSE_ARABIC[reference] || FALLBACK_VERSE.arabic;

  return (
    <section className="bg-bg-sage-light/40 rounded-premium p-6 relative overflow-hidden group mt-3">
      <div className="absolute top-[-10px] right-[-10px] opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
        <span className="material-symbols-outlined text-[100px] text-primary">auto_stories</span>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-0.5 bg-white/60 rounded-full text-[9px] font-bold text-primary uppercase tracking-wider">
            {t('dailyContent.verseOfDay', 'Günün Ayeti')}
          </span>
          <span className="material-symbols-outlined text-primary/40 text-lg">format_quote</span>
        </div>

        <h3 className="font-playfair text-xl font-bold text-primary mb-2 leading-tight italic tracking-wide">
          {reference}
        </h3>
        
        <p className="text-base font-medium leading-relaxed font-outfit mb-4 text-primary font-semibold">
          "{verseText}"
        </p>

        <div className="flex gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 text-primary shadow-sm border-none cursor-pointer">
            <span className="material-symbols-outlined text-lg">share</span>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 text-primary shadow-sm border-none cursor-pointer">
            <span className="material-symbols-outlined text-lg">favorite</span>
          </button>
        </div>
      </div>
    </section>
  );
});

export default HomeDailyVerseCard;
