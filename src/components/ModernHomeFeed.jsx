import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import StoryBar from './StoryBar';
import HeroPrayerCard from './HeroPrayerCard';
import FeatureSlider from './FeatureSlider';
import DiscoverFeed from './DiscoverFeed';
import './ModernHomeFeed.css';

const ModernHomeFeed = memo(({ onSelectFeature, timings, nextPrayer, onShowPrayers, locationName, children }) => {
    const { t } = useTranslation();

    return (
        <div className="modern-home-feed">
            {/* 1. Stories */}
            <StoryBar onSelectFeature={onSelectFeature} />

            {/* 2. Hero Prayer Card */}
            <HeroPrayerCard 
                timings={timings} 
                nextPrayer={nextPrayer} 
                onShowPrayers={onShowPrayers} 
                locationName={locationName}
            />

            {/* 3. Dynamic Content (e.g. Daily Quests) */}
            {children}

            {/* 4. Quick Features */}
            <div className="section-header">
                <span className="section-title">
                    {t('home.features', 'Özellikleriniz')} 
                    <span style={{ fontSize: '10px', background: 'var(--primary-color)', color: 'white', padding: '2px 6px', borderRadius: '8px' }}>YENİ</span>
                </span>
                <span 
                    className="section-action" 
                    onClick={() => onSelectFeature && onSelectFeature('more')}
                >
                    {t('common.viewAll')}
                </span>
            </div>
            
            <FeatureSlider onSelectFeature={onSelectFeature} />

            {/* 4. Vertical Feed */}
            <DiscoverFeed />
        </div>
    );
});

export default ModernHomeFeed;
