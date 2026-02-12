import { useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, BookOpen, Heart, Quote } from 'lucide-react';
import './ModernHomeFeed.css';

const StoryBar = memo(({ onSelectFeature }) => {
    const { t } = useTranslation();
    const scrollRef = useRef(null);

    const stories = [
        { id: 'verse', icon: <BookOpen size={24} color="#d4af37" />, label: t('home.dailyVerse'), action: 'quran' },
        { id: 'esma', icon: <Sparkles size={24} color="#f39c12" />, label: t('home.dailyName'), action: 'esma' },
        { id: 'dua', icon: <Heart size={24} color="#e74c3c" />, label: t('home.dailyPrayer'), action: 'dua-share' },
        { id: 'hadith', icon: <Quote size={24} color="#3498db" />, label: t('home.dailyHadith'), action: 'hadis' },
    ];

    return (
        <div className="story-bar" ref={scrollRef}>
            {stories.map((story) => (
                <div 
                    key={story.id} 
                    className="story-item" 
                    onClick={() => onSelectFeature && onSelectFeature(story.action)}
                >
                    <div className="story-circle">
                        {story.icon}
                    </div>
                    <span className="story-label">{story.label}</span>
                </div>
            ))}
        </div>
    );
});

export default StoryBar;
