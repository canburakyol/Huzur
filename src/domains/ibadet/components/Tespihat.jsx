import { useEffect, useState } from 'react';
import { BookOpen, Check, CheckCircle2, ChevronDown, ChevronRight, CircleDot, HandHeart, Moon, RotateCcw, Sparkles, Star } from 'lucide-react';

// Mushaf uses one line-icon set; the data file's emoji are not rendered.
const SECTION_ICONS = { istigfar: HandHeart, 'entes-selam': Sparkles, salavat: Moon, subhanallahi: CircleDot, 'ayetel-kursi': BookOpen, tevhid: Star };
import { useTranslation } from 'react-i18next';
import { OPTIONAL_QURAN_DUALAR as RAW_DUALAR, TESPIHAT_SECTIONS as RAW_SECTIONS, TESBIHLER as RAW_TESBIHLER, TEVHID as RAW_TEVHID } from '../../../data/tespihatData';
import { localizeTespihat } from '../../../data/tespihatTranslations';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { storageService } from '../../../services/storageService';
import '../../../styles/PracticePages.css';

const TESPIHAT_PROGRESS_KEY = 'tespihat_progress';
const DEFAULT_TESBIH_COUNTS = Object.freeze({ subhanallah: 0, elhamdulillah: 0, allahuekber: 0 });
const normalizeCounts = (value) => Object.fromEntries(Object.keys(DEFAULT_TESBIH_COUNTS).map((key) => {
  const parsed = Number(value?.[key]);
  return [key, Number.isFinite(parsed) ? Math.min(33, Math.max(0, Math.trunc(parsed))) : 0];
}));

function Tespihat({ onClose }) {
  const { t, i18n } = useTranslation();
  const lang = i18n?.language || 'tr';
  const TESPIHAT_SECTIONS = RAW_SECTIONS.map((item) => localizeTespihat(item, lang));
  const TESBIHLER = RAW_TESBIHLER.map((item) => localizeTespihat(item, lang));
  const TEVHID = localizeTespihat(RAW_TEVHID, lang);
  const OPTIONAL_QURAN_DUALAR = RAW_DUALAR.map((item) => localizeTespihat(item, lang));
  const sourceLabel = (type) => (type === 'hadith' ? t('tespihat.ui.sourceHadith', 'Hadis') : type === 'quran' ? t('tespihat.ui.sourceQuran', 'Kur’an') : t('tespihat.ui.sourceGeneral', 'Genel / kaynak belirtilmemiş'));
  const [activeSection, setActiveSection] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  const [tesbihCounts, setTesbihCounts] = useState(() => normalizeCounts(storageService.getItem(TESPIHAT_PROGRESS_KEY, null)?.counts));
  const [completedSections, setCompletedSections] = useState(() => {
    const completed = storageService.getItem(TESPIHAT_PROGRESS_KEY, null)?.completed;
    return Array.isArray(completed) ? completed : [];
  });

  useEffect(() => {
    storageService.setItem(TESPIHAT_PROGRESS_KEY, { counts: tesbihCounts, completed: completedSections });
  }, [tesbihCounts, completedSections]);

  const incrementTesbih = (id) => {
    setTesbihCounts((previous) => ({ ...previous, [id]: Math.min((Number(previous[id]) || 0) + 1, 33) }));
    navigator.vibrate?.(20);
  };
  const toggleComplete = (id) => setCompletedSections((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]);
  const totalProgress = Math.round(((completedSections.length + Object.values(tesbihCounts).filter((count) => count >= 33).length) / (TESPIHAT_SECTIONS.length + 4)) * 100);

  const renderExpandedContent = (item) => (
    <div className="practice-panel" style={{ marginTop: 8 }}>
      <div style={{ fontSize: '1.3rem', fontFamily: 'var(--arabic-font)', color: 'var(--on-surface)', marginBottom: 10, textAlign: 'right', direction: 'rtl', lineHeight: 1.7 }}>{item.arabic}</div>
      <div className="practice-row__text" style={{ color: 'var(--on-surface)' }}>{item.latin}</div>
      <div className="practice-row__text" style={{ marginTop: 7, fontStyle: 'italic' }}>{item.meaning}</div>
      <div className="practice-row__text" data-testid={`source-${item.id}`} style={{ marginTop: 10, fontWeight: 600 }}>
        {sourceLabel(item.sourceType)}{item.citation ? ` · ${item.citation}` : ''}
      </div>
    </div>
  );

  if (activeSection) {
    const isComplete = completedSections.includes(activeSection.id);
    return (
      <main className="practice-page">
        <header className="practice-header">
          <IslamicBackButton onClick={() => setActiveSection(null)} size="medium" />
          <div className="practice-header__copy"><h1 className="practice-title">{activeSection.title}</h1><p className="practice-subtitle">{activeSection.subtitle}</p></div>
        </header>
        <section className="practice-panel" style={{ marginTop: 0 }}>
          <div style={{ fontSize: '1.45rem', fontFamily: 'var(--arabic-font)', color: 'var(--on-surface)', textAlign: 'right', direction: 'rtl', lineHeight: 1.75 }}>{activeSection.arabic}</div>
          <p className="practice-row__text" style={{ marginTop: 14, color: 'var(--on-surface)' }}>{activeSection.latin}</p>
          <p className="practice-row__text" style={{ marginTop: 8, fontStyle: 'italic' }}>{activeSection.meaning}</p>
          <p className="practice-row__text" data-testid={`source-${activeSection.id}`} style={{ marginTop: 10, fontWeight: 600 }}>{sourceLabel(activeSection.sourceType)}{activeSection.citation ? ` · ${activeSection.citation}` : ''}</p>
          <button type="button" className={`practice-wide ${isComplete ? 'practice-secondary-button' : 'practice-primary-button'}`} style={{ marginTop: 14 }} onClick={() => { toggleComplete(activeSection.id); setActiveSection(null); }}><Check size={18} /> {isComplete ? t('tespihat.ui.completed', 'Tamamlandı') : t('tespihat.ui.complete', 'Tamamla')}</button>
        </section>
      </main>
    );
  }

  return (
    <main className="practice-page">
      <header className="practice-header">
        <IslamicBackButton onClick={onClose} size="medium" />
        <div className="practice-header__copy"><h1 className="practice-title">{t('tespihat.ui.title', 'Tespihat')}</h1><p className="practice-subtitle">{t('tespihat.ui.subtitle', 'Namaz sonrası zikir ve dualarınızı takip edin.')}</p></div>
      </header>

      <section className="practice-summary">
        <div className="practice-summary__top">
          <div><div className="practice-summary__value">{totalProgress}%</div><div className="practice-summary__label">{t('tespihat.ui.progressToday', 'Bugünkü ilerleme')}</div></div>
          <button type="button" className="practice-icon-button" aria-label={t('tespihat.ui.resetLabel', 'Tespihat ilerlemesini sıfırla')} onClick={() => { setTesbihCounts({ ...DEFAULT_TESBIH_COUNTS }); setCompletedSections([]); }}><RotateCcw size={18} /></button>
        </div>
        <div className="practice-progress"><span style={{ width: `${totalProgress}%` }} /></div>
      </section>

      <section className="practice-section">
        <h2 className="practice-section-title">{t('tespihat.ui.postPrayerDhikr', 'NAMAZ SONRASI ZİKİRLER')}</h2>
        <div className="practice-list">
          {TESPIHAT_SECTIONS.map((section) => {
            const done = completedSections.includes(section.id);
            return (
              <button type="button" className={`practice-row ${done ? 'practice-row--done' : ''}`} key={section.id} onClick={() => setActiveSection(section)}>
                <span className="practice-row__icon">{(() => { const Icon = SECTION_ICONS[section.id] || CircleDot; return <Icon size={17} aria-hidden="true" />; })()}</span>
                <span className="practice-row__body"><span className="practice-row__title">{section.title}</span><span className="practice-row__text">{section.subtitle}</span></span>
                {done ? <CheckCircle2 size={20} color="var(--primary)" /> : <ChevronRight size={19} />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="practice-section">
        <h2 className="practice-section-title">{t('tespihat.ui.tasbih33', "33'LÜK TESBİHLER")}</h2>
        <div className="tesbih-counter-grid">
          {TESBIHLER.map((tesbih) => {
            const count = tesbihCounts[tesbih.id];
            const done = count >= 33;
            return (
              <button type="button" className={`tesbih-counter ${done ? 'tesbih-counter--done' : ''}`} key={tesbih.id} onClick={() => incrementTesbih(tesbih.id)} aria-label={t('tespihat.ui.counterLabel', { name: tesbih.latin, count, defaultValue: '{{name}} sayacını artır, {{count}}/33' })}>
                <span className="tesbih-counter__arabic">{tesbih.arabic}</span>
                <strong>{count}<small>/33</small></strong>
                <span>{tesbih.latin}</span>
                <i><b style={{ width: `${(count / 33) * 100}%` }} /></i>
              </button>
            );
          })}
        </div>
      </section>

      <section className="practice-section">
        <h2 className="practice-section-title">{t('tespihat.ui.optionalQuranDuas', 'TEVHİD VE İSTEĞE BAĞLI KUR’AN DUALARI')}</h2>
        <div className="practice-list">
          <div>
            <div className="practice-row">
              <span className="practice-row__icon"><Sparkles size={17} /></span>
              <button type="button" className="tesbih-accordion-trigger" onClick={() => setExpandedItem(expandedItem === 'tevhid' ? null : 'tevhid')}><span className="practice-row__title">{TEVHID.title}</span></button>
              <button type="button" className={`practice-pill ${completedSections.includes('tevhid') ? 'practice-chip--active' : ''}`} onClick={() => toggleComplete('tevhid')}>{completedSections.includes('tevhid') ? t('tespihat.ui.markedDone', 'Tamam') : t('tespihat.ui.markDone', 'Bitti')}</button>
              <button type="button" className="tesbih-chevron-button" aria-label={t('tespihat.ui.toggleTawhid', 'Tevhid metnini aç veya kapat')} onClick={() => setExpandedItem(expandedItem === 'tevhid' ? null : 'tevhid')}>{expandedItem === 'tevhid' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>
            </div>
            {expandedItem === 'tevhid' && renderExpandedContent(TEVHID)}
          </div>
          {OPTIONAL_QURAN_DUALAR.map((dua) => (
            <div key={dua.id}>
              <button type="button" className="practice-row" onClick={() => setExpandedItem(expandedItem === dua.id ? null : dua.id)}>
                <span className="practice-row__icon"><BookOpen size={17} /></span><span className="practice-row__body"><span className="practice-row__title">{dua.title}</span><span className="practice-row__text">{t('tespihat.ui.optionalDua', 'İsteğe bağlı Kur’an duası')} · {dua.citation}</span></span>{expandedItem === dua.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              {expandedItem === dua.id && renderExpandedContent(dua)}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Tespihat;
