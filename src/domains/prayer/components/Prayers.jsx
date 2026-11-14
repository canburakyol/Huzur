import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sunrise,
  Coins,
  Home,
  Shield,
  Hand,
  MoonStar,
  Moon,
  Bird,
  Heart,
  Book,
  ChevronRight,
} from 'lucide-react';
import { prayerCategories, prayers } from '../../../data/prayers';
import PageHeader from '../../../components/shared/PageHeader';
import './Prayers.css';

const CATEGORY_ICONS = {
  Sunrise,
  Coins,
  Home,
  Shield,
  Hand,
  MoonStar,
  Moon,
  Dove: Bird,
  Mosque: Book,
  Heart,
};

const CategoryIcon = ({ iconName, size = 22 }) => {
    const IconComponent = CATEGORY_ICONS[iconName] || Book;
    return <IconComponent size={size} strokeWidth={1.75} aria-hidden="true" />;
};

function Prayers({ onClose }) {
    const { t } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedPrayer, setSelectedPrayer] = useState(null);
    // Aliases preserve legacy IDs in the catalog but are not separate visible prayers.
    // Archived records are incomplete texts for which the audit supplied no verified completion.
    const visiblePrayers = prayers.filter((prayer) => !prayer.canonicalId && !prayer.archived);
    const countLabel = (n) => `${n} ${t('prayers.prayer')}`;

    // Each view gets its own key so its scroll container remounts at the top.
    if (selectedPrayer) {
        return (
            <div key={`prayer-${selectedPrayer.id}`} className="hz-root dua-screen">
                <PageHeader title={t('prayers.prayerDetail')} onBack={() => setSelectedPrayer(null)} />
                <div className="dua-body">
                    <article className="hz-card dua-detail">
                        <h2 className="dua-detail__title">{t(selectedPrayer.title)}</h2>
                        <p className="dua-detail__arabic" lang="ar">{selectedPrayer.arabic}</p>

                        {/* Transliteration: only reviewed, full text is shown. */}
                        {selectedPrayer.transliteration && (
                            <section className="dua-detail__section">
                                <h3 className="hz-overline">{t('prayers.pronunciation')}</h3>
                                <p className="hz-body dua-detail__reading">{selectedPrayer.transliteration}</p>
                            </section>
                        )}

                        <section className="dua-detail__section">
                            <h3 className="hz-overline">{t('prayers.meaning')}</h3>
                            <p className="hz-body">{t(selectedPrayer.meaning)}</p>
                        </section>

                        {/* Source status: never imply that a general wording is a canonical report. */}
                        <p className="hz-label dua-detail__source">
                            <strong>{t('prayers.sourceStatus', 'Kaynak durumu')}: </strong>
                            {t(`prayers.sourceTypes.${selectedPrayer.sourceType}`)}
                            {selectedPrayer.citation ? ` — ${selectedPrayer.citation}` : ''}
                        </p>
                    </article>
                </div>
            </div>
        );
    }

    if (selectedCategory) {
        const category = prayerCategories.find(c => c.id === selectedCategory);
        const categoryPrayers = visiblePrayers.filter((prayer) => prayer.category === selectedCategory);

        return (
            <div key={`category-${selectedCategory}`} className="hz-root dua-screen">
                <PageHeader
                    title={t(category.name)}
                    subtitle={countLabel(categoryPrayers.length)}
                    onBack={() => setSelectedCategory(null)}
                />
                <div className="dua-body">
                    <div className="hz-card dua-list">
                        {categoryPrayers.map((prayer) => (
                            <button key={prayer.id} type="button" className="dua-item" onClick={() => setSelectedPrayer(prayer)}>
                                <span className="dua-item__text">
                                    <span className="dua-item__title">{t(prayer.title)}</span>
                                    <span className="dua-item__meaning">{t(prayer.meaning)}</span>
                                </span>
                                <ChevronRight className="dua-item__chevron" size={18} strokeWidth={1.75} aria-hidden="true" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div key="categories" className="hz-root dua-screen">
            <PageHeader
                title={t('prayers.title')}
                subtitle={`${prayerCategories.length} ${t('prayers.categories')}, ${countLabel(visiblePrayers.length)}`}
                onBack={onClose}
            />
            <div className="dua-body">
                <figure className="hz-card dua-quote">
                    <blockquote className="dua-quote__text">{t('prayers.quote')}</blockquote>
                    <figcaption className="hz-ref">{t('prayers.quoteAuthor')}</figcaption>
                </figure>

                <div className="dua-grid">
                    {prayerCategories.map((category) => {
                        const count = visiblePrayers.filter((prayer) => prayer.category === category.id).length;
                        return (
                            <button key={category.id} type="button" className="hz-card dua-cat" onClick={() => setSelectedCategory(category.id)}>
                                <span className="hz-row__icon"><CategoryIcon iconName={category.icon} /></span>
                                <span className="dua-cat__name">{t(category.name)}</span>
                                <span className="dua-cat__meta">{countLabel(count)}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Prayers;
