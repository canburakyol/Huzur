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
            <div className="reveal-stagger" style={{ '--delay': '0s' }}>
                <StoryBar onSelectFeature={onSelectFeature} />
            </div>

            {/* 2. Hero Prayer Card */}
            <div className="reveal-stagger" style={{ '--delay': '0.2s' }}>
                <HeroPrayerCard 
                    timings={timings} 
                    nextPrayer={nextPrayer} 
                    onShowPrayers={onShowPrayers} 
                    locationName={locationName}
                />
            </div>

            {/* 3. Dynamic Content (e.g. Daily Quests) */}
            <div className="reveal-stagger" style={{ '--delay': '0.4s' }}>
                {children}
            </div>

            {/* 4. Quick Features */}
            <div className="reveal-stagger" style={{ '--delay': '0.6s' }}>
                <div className="gazette-section-header">
                    <div className="section-title-wrapper">
                        <span className="gazette-title premium-text">
                            {t('home.features')}
                        </span>
                        <div className="badge-new" style={{ marginLeft: '10px' }}>PRO</div>
                    </div>
                </div>
                
                <FeatureSlider onSelectFeature={onSelectFeature} />
            </div>

            {/* 5. Vertical Feed */}
            <div className="reveal-stagger" style={{ '--delay': '0.8s' }}>
                <DiscoverFeed />
            </div>
        </div>
    );
});

export default ModernHomeFeed;
