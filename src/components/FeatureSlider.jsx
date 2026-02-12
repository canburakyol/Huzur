import { useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, Calculator, Users, Calendar, Radio, Map } from 'lucide-react';
import './ModernHomeFeed.css';

const FeatureSlider = memo(({ onSelectFeature }) => {
    const { t } = useTranslation();
    const scrollRef = useRef(null);

    const features = [
        { id: 'qibla', icon: <Compass size={20} color="#2ecc71" />, label: t('home.qibla'), action: 'qibla' },
        { id: 'zikir', icon: <Calculator size={20} color="#3498db" />, label: t('home.dhikr'), action: 'zikirmatik' },
        { id: 'community', icon: <Users size={20} color="#9b59b6" />, label: t('home.community'), action: 'community' },
        { id: 'imsakiye', icon: <Calendar size={20} color="#e67e22" />, label: t('home.imsakiye'), action: 'imsakiye' },
        { id: 'radio', icon: <Radio size={20} color="#e74c3c" />, label: "Radyo", action: 'radio' },
        { id: 'mosques', icon: <Map size={20} color="#1abc9c" />, label: t('home.mosques', 'Camiler'), action: 'mosques' },
    ];

    return (
        <div className="feature-slider" ref={scrollRef}>
            {features.map((feature) => (
                <div 
                    key={feature.id} 
                    className="feature-chip" 
                    onClick={() => onSelectFeature && onSelectFeature(feature.action)}
                >
                    {feature.icon}
                    <span>{feature.label}</span>
                </div>
            ))}
        </div>
    );
});

export default FeatureSlider;
