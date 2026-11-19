import { useState } from 'react';
import { Calendar, Check, Circle, Edit2, Heart, Info, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { storageService } from '../../../services/storageService';
import '../../../styles/PracticePages.css';

const DUA_CATEGORIES = [
  { id: 'health', name: 'Sağlık', icon: '💚' },
  { id: 'exam', name: 'Sınav', icon: '📚' },
  { id: 'work', name: 'İş', icon: '💼' },
  { id: 'family', name: 'Aile', icon: '👨‍👩‍👧' },
  { id: 'marriage', name: 'Evlilik', icon: '💍' },
  { id: 'children', name: 'Çocuk', icon: '👶' },
  { id: 'travel', name: 'Seyahat', icon: '✈️' },
  { id: 'forgiveness', name: 'Af', icon: '🙏' },
  { id: 'general', name: 'Genel', icon: '🤲' },
];

const SUGGESTED_DUAS = [
  { text: 'Allah’ım, bana hayırlı bir eş nasip et.', category: 'marriage' },
  { text: 'Allah’ım, sınavımda hayırlı sonuçlar ve başarı nasip et.', category: 'exam' },
  { text: 'Allah’ım, bana şifa ver ve sıkıntımı hafiflet.', category: 'health' },
  { text: 'Allah’ım, işime hayır, bereket ve kolaylık ver.', category: 'work' },
  { text: 'Allah’ım, ailemi koru, bağışla ve aramıza huzur ver.', category: 'family' },
];

const STORAGE_KEY = 'huzur_dua_tracker';

export function DuaTracker({ onClose }) {
  const { t, i18n } = useTranslation();
  const [newDua, setNewDua] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDua, setEditingDua] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('all');
  const [data] = useState(() => {
    const initial = storageService.getItem(STORAGE_KEY, null);
    return {
      duas: Array.isArray(initial?.duas) ? initial.duas : [],
      stats: initial?.stats || { total: 0, completed: 0, streak: 0 },
    };
  });
  const [duas, setDuas] = useState(data.duas);
  const [stats, setStats] = useState(data.stats);

  const saveDuas = (nextDuas, nextStats) => storageService.setItem(STORAGE_KEY, {
    duas: nextDuas,
    stats: nextStats,
    lastUpdated: new Date().toISOString(),
  });

  const addDua = () => {
    if (!newDua.trim()) return;
    const nextDuas = [{ id: Date.now().toString(), text: newDua.trim(), category: selectedCategory, completed: false, completedAt: null, createdAt: new Date().toISOString() }, ...duas];
    const nextStats = { ...stats, total: nextDuas.length };
    setDuas(nextDuas);
    setStats(nextStats);
    saveDuas(nextDuas, nextStats);
    setNewDua('');
    setShowAddForm(false);
  };

  const toggleDua = (id) => {
    const nextDuas = duas.map((dua) => dua.id === id
      ? { ...dua, completed: !dua.completed, completedAt: !dua.completed ? new Date().toISOString() : null }
      : dua);
    const completed = nextDuas.filter((dua) => dua.completed).length;
    const nextStats = { ...stats, completed };
    setDuas(nextDuas);
    setStats(nextStats);
    saveDuas(nextDuas, nextStats);
  };

  const deleteDua = (id) => {
    const nextDuas = duas.filter((dua) => dua.id !== id);
    const nextStats = { ...stats, total: nextDuas.length, completed: nextDuas.filter((dua) => dua.completed).length };
    setDuas(nextDuas);
    setStats(nextStats);
    saveDuas(nextDuas, nextStats);
  };

  const updateDua = (id) => {
    if (!editText.trim()) return;
    const nextDuas = duas.map((dua) => dua.id === id ? { ...dua, text: editText.trim() } : dua);
    setDuas(nextDuas);
    saveDuas(nextDuas, stats);
    setEditingDua(null);
    setEditText('');
  };

  const filteredDuas = duas.filter((dua) => filter === 'all' || (filter === 'completed' ? dua.completed : !dua.completed));
  const getCategoryInfo = (id) => DUA_CATEGORIES.find((category) => category.id === id) || DUA_CATEGORIES.at(-1);
  const categoryName = (category) => t(`dua.categories.${category.id}`, category.name);
  const dateLocale = i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'id' ? 'id-ID' : 'en-US';

  return (
    <main className="practice-page">
      <header className="practice-header">
        <IslamicBackButton onClick={onClose} size="medium" />
        <div className="practice-header__copy">
          <h1 className="practice-title">{t('dua.tracker_title', 'Dua Takipçisi')}</h1>
          <p className="practice-subtitle">{t('dua.tracker_subtitle', 'Dualarınızı kaydedin ve takip edin')}</p>
        </div>
      </header>

      <section className="practice-summary" aria-label={t('duaTracker.summaryLabel', 'Dua özeti')}>
        <div className="practice-summary__top">
          <div><div className="practice-summary__value">{stats.completed}</div><div className="practice-summary__label">{t('duaTracker.prayed', 'Dua edildi')}</div></div>
          <Heart size={22} color="var(--primary)" />
        </div>
        <div className="practice-metrics">
          <div className="practice-metric"><strong>{stats.completed}</strong><span>{t('duaTracker.prayedPersonal', 'Kişisel kayıtta dua edildi')}</span></div>
          <div className="practice-metric"><strong>{stats.total}</strong><span>{t('duaTracker.totalRecords', 'Toplam kayıt')}</span></div>
        </div>
      </section>

      <div className="practice-info" style={{ marginTop: 14 }}>
        <Info size={18} /><div>{t('duaTracker.prayedNote', '“Dua edildi” işareti yalnızca kişisel kayıttır; kabul edildiği anlamına gelmez.')}</div>
      </div>

      <div className="practice-segments" role="tablist" aria-label="Dua filtresi">
        {[['all', t('common.all', 'Tümü')], ['pending', t('dua.filters.pending', 'Henüz dua edilmedi')], ['completed', t('dua.filters.accepted', 'Dua edildi')]].map(([id, label]) => (
          <button type="button" role="tab" aria-selected={filter === id} className={`practice-segment ${filter === id ? 'practice-segment--active' : ''}`} key={id} onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>

      <button type="button" className="practice-primary-button practice-wide" onClick={() => setShowAddForm((value) => !value)}>
        <Plus size={18} /> {t('dua.addNew', 'Yeni Dua Ekle')}
      </button>

      {showAddForm && (
        <section className="practice-panel" aria-label="Yeni dua formu">
          <textarea className="practice-field" value={newDua} onChange={(event) => setNewDua(event.target.value)} placeholder={t('dua.placeholder', 'Duanızı yazın...')} />
          <div className="practice-chip-list" style={{ marginTop: 10 }}>
            {DUA_CATEGORIES.map((category) => (
              <button type="button" className={`practice-chip ${selectedCategory === category.id ? 'practice-chip--active' : ''}`} key={category.id} onClick={() => setSelectedCategory(category.id)}>
                {category.icon} {categoryName(category)}
              </button>
            ))}
          </div>
          <p className="practice-section-title" style={{ marginTop: 10 }}>{t('duaTracker.suggestions', 'Önerilenler')}</p>
          <p className="practice-row__text">{t('duaTracker.suggestionNote', 'Genel dua örneği — Kur’an/hadis alıntısı değildir')}</p>
          <div className="practice-chip-list">
            {SUGGESTED_DUAS.map((suggestion, index) => (
              <button type="button" className="practice-chip" key={suggestion.text} onClick={() => { setNewDua(t(`dua.suggestions.${suggestion.category}_${index}`, suggestion.text)); setSelectedCategory(suggestion.category); }}>{t(`dua.suggestions.${suggestion.category}_${index}`, suggestion.text)}</button>
            ))}
          </div>
          <div className="practice-actions">
            <button type="button" className="practice-secondary-button" onClick={() => setShowAddForm(false)}>{t('common.cancel', 'İptal')}</button>
            <button type="button" className="practice-primary-button" disabled={!newDua.trim()} onClick={addDua}>{t('common.save', 'Kaydet')}</button>
          </div>
        </section>
      )}

      <section className="practice-section">
        <h2 className="practice-section-title">{t('dua.listTitle', 'DUA LİSTESİ')}</h2>
        {filteredDuas.length === 0 ? (
          <div className="practice-empty"><Heart size={30} /><p>{t('dua.empty', 'Henüz dua bulunmuyor')}</p></div>
        ) : (
          <div className="practice-list">
            {filteredDuas.map((dua) => {
              const category = getCategoryInfo(dua.category);
              return (
                <div className={`practice-row ${dua.completed ? 'practice-row--done' : ''}`} key={dua.id}>
                  {editingDua === dua.id ? (
                    <div className="practice-row__body">
                      <textarea className="practice-field" value={editText} onChange={(event) => setEditText(event.target.value)} />
                      <div className="practice-actions"><button type="button" className="practice-secondary-button" onClick={() => setEditingDua(null)}>{t('common.cancel', 'İptal')}</button><button type="button" className="practice-primary-button" onClick={() => updateDua(dua.id)}>{t('common.save', 'Kaydet')}</button></div>
                    </div>
                  ) : (
                    <>
                      <button type="button" className={`practice-check ${dua.completed ? 'practice-check--done' : ''}`} aria-label={dua.completed ? 'Duayı henüz dua edilmedi olarak işaretle' : 'Dua edildi olarak işaretle'} onClick={() => toggleDua(dua.id)}>{dua.completed ? <Check size={19} /> : <Circle size={18} />}</button>
                      <div className="practice-row__body">
                        <p className="practice-row__title" style={{ textDecoration: dua.completed ? 'line-through' : 'none' }}>{dua.text}</p>
                        <div className="practice-row__meta">
                          <span className="practice-pill">{category.icon} {categoryName(category)}</span>
                          {dua.completedAt && <span className="practice-pill"><Calendar size={11} /> {new Date(dua.completedAt).toLocaleDateString(dateLocale)}</span>}
                        </div>
                      </div>
                      <button type="button" className="practice-row-action" aria-label={t('duaTracker.edit', 'Duayı düzenle')} onClick={() => { setEditingDua(dua.id); setEditText(dua.text); }}><Edit2 size={16} /></button>
                      <button type="button" className="practice-row-action" aria-label={t('duaTracker.delete', 'Duayı sil')} onClick={() => deleteDua(dua.id)}><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="practice-info" style={{ marginTop: 18 }}>
        <Info size={18} /><div><strong>{t('dua.etiquette.title', 'Dua Adabı')}</strong>{t('dua.etiquette.desc', 'Dualarınızı ihlasla ve düzenli olarak tekrarlayın.')}</div>
      </div>
    </main>
  );
}

export default DuaTracker;
