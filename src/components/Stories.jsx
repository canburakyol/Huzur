import { useState, useRef, useMemo, memo } from 'react';
import { Share2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDailyContent } from '../services/contentService';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { LazyImage } from './LazyImage';
// html2canvas is dynamically imported when needed to reduce initial bundle size

const Stories = memo(() => {
    const { t, ready } = useTranslation(['translation', 'prayers']);
    const [activeStory, setActiveStory] = useState(null);
    const [isSharing, setIsSharing] = useState(false);
    const storyContentRef = useRef(null);

    const stories = useMemo(() => {
        const dailyContent = getDailyContent();
        const today = new Date().getDay();
        const isFridayTime = today === 4 || today === 5;

        const cumaImages = [
            '/stories/cuma-1.png', '/stories/cuma-2.png', '/stories/cuma-3.png',
            '/stories/cuma-4.png', '/stories/cuma-5.png', '/stories/cuma-6.png',
            '/stories/cuma-7.png', '/stories/cuma-8.png', '/stories/cuma-9.png',
            '/stories/cuma-10.png'
        ];

        const getWeekNumber = () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 1);
            const diff = now - start;
            const oneWeek = 1000 * 60 * 60 * 24 * 7;
            return Math.floor(diff / oneWeek);
        };
        const cumaImageIndex = getWeekNumber() % cumaImages.length;

        const newStories = [];

        if (isFridayTime) {
            newStories.push({
                id: 'cuma',
                titleKey: 'stories.fridayMessage',
                content: t('stories.fridayContent'),
                image: cumaImages[cumaImageIndex],
                color: '#2e7d32',
                original: { text: "Hayırlı Cumalar" }
            });
        }

        // Translate dailyDua content directly here when ready
        const dailyDuaContent = ready && dailyContent.dailyDua.text 
            ? t(dailyContent.dailyDua.text) 
            : dailyContent.dailyDua.arabic;

        newStories.push(
            {
                id: 1,
                titleKey: 'stories.dailyVerse',
                content: `${dailyContent.verse.translation} (${dailyContent.verse.reference})`,
                image: dailyContent.verse.image,
                color: '#e74c3c',
                original: dailyContent.verse
            },
            {
                id: 2,
                titleKey: 'stories.dailyHadith',
                content: `${dailyContent.hadith.text} (${dailyContent.hadith.source})`,
                image: dailyContent.hadith.image,
                color: '#27ae60',
                original: dailyContent.hadith
            },
            {
                id: 3,
                titleKey: 'stories.dailyQuote',
                content: `${dailyContent.quote.text} (${dailyContent.quote.author})`,
                image: dailyContent.quote.image,
                color: '#8e44ad',
                original: dailyContent.quote
            },
            {
                id: 4,
                titleKey: 'stories.dailyPrayer',
                content: dailyDuaContent,
                image: dailyContent.dailyDua.image,
                color: '#2980b9',
                original: dailyContent.dailyDua
            }
        );

        return newStories;
    }, [t, ready]);

    // Get translated title for a story
    const getStoryTitle = (story) => {
        return t(story.titleKey);
    };

    // Get translated content for a story
    const getStoryContent = (story) => {
        return story.content || '';
    };

    const handleShare = async (story) => {
        const storyTitle = getStoryTitle(story);
        const storyContent = getStoryContent(story);
        
        if (!storyContentRef.current) {
            // Fallback to text share if ref not available
            const shareText = `${storyTitle}\n\n${storyContent}\n\n- ${t('stories.sharedFrom')}`;
            if (navigator.share) {
                await navigator.share({ title: storyTitle, text: shareText });
            }
            return;
        }

        setIsSharing(true);

        try {
            // Dynamic import - only loads when user actually shares (saves ~194KB on initial load)
            const html2canvas = (await import('html2canvas')).default;
            
            // Create canvas from the story content element
            const canvas = await html2canvas(storyContentRef.current, {
                backgroundColor: null,
                scale: 2, // Higher quality
                useCORS: true,
                logging: false,
                allowTaint: true
            });

            // Check if we're on native platform (Android/iOS)
            if (Capacitor.isNativePlatform()) {
                // Native sharing with Capacitor Filesystem
                const base64Data = canvas.toDataURL('image/png').split(',')[1];
                const fileName = `huzur-${storyTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
                
                // Write file to cache directory
                const writeResult = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache
                });

                // Share the file
                await Share.share({
                    title: storyTitle,
                    text: t('stories.sharedWithApp'),
                    url: writeResult.uri,
                    dialogTitle: t('stories.shareAsPhoto')
                });
            } else {
                // Web sharing fallback
                const blob = await new Promise(resolve =>
                    canvas.toBlob(resolve, 'image/png', 1.0)
                );

                if (!blob) {
                    throw new Error(t('stories.imageError'));
                }

                const fileName = `huzur-${storyTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
                const file = new File([blob], fileName, { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: storyTitle,
                        text: t('stories.sharedWithApp')
                    });
                } else if (navigator.share) {
                    const shareText = `${storyTitle}\n\n${storyContent}\n\n- ${t('stories.sharedFrom')}`;
                    await navigator.share({
                        title: storyTitle,
                        text: shareText
                    });
                } else {
                    // Download as fallback
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    alert(t('stories.downloadedAlert'));
                }
            }
        } catch (err) {
            console.error('Share error:', err);
            if (err.name !== 'AbortError' && err.message !== 'Share canceled') {
                // Fallback to text share on error
                try {
                    const shareText = `${storyTitle}\n\n${storyContent}\n\n- ${t('stories.sharedFrom')}`;
                    await navigator.clipboard.writeText(shareText);
                    alert(t('stories.copiedToClipboard'));
                } catch {
                    alert(t('stories.shareError'));
                }
            }
        } finally {
            setIsSharing(false);
        }
    };

    if (stories.length === 0) return null;

    return (
        <>
            {/* Story Bubbles */}
            <div className="stories-container" style={{ display: 'flex', gap: '15px', padding: '10px 0', overflowX: 'auto', marginBottom: '10px' }}>
                {stories.map((story) => (
                    <div key={story.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px', cursor: 'pointer' }} onClick={() => setActiveStory(story)}>
                        <div style={{
                            width: '65px',
                            height: '65px',
                            borderRadius: '50%',
                            padding: '3px',
                            background: `linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)`
                        }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                border: '3px solid white',
                                overflow: 'hidden',
                                background: story.color || '#8e44ad'
                            }}>
                                <LazyImage
                                    src={story.image}
                                    alt={t(story.titleKey)}
                                    className="bubble-image"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                        <span style={{ fontSize: '11px', marginTop: '5px', fontWeight: '600', color: 'var(--text-color)' }}>{t(story.titleKey)}</span>
                    </div>
                ))}
            </div>

            {/* Full Screen Story View */}
            {activeStory && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1000,
                    background: '#000',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Close Button - Outside of capture area */}
                    <button
                        onClick={() => setActiveStory(null)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(0,0,0,0.5)',
                            border: 'none',
                            color: 'white',
                            zIndex: 1002,
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '50%',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                        }}
                    >
                        <X size={28} />
                    </button>

                    {/* Shareable Content Area - This will be captured - NOW FULL HEIGHT */}
                    <div 
                        ref={storyContentRef}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            paddingBottom: '100px',
                            background: `linear-gradient(135deg, ${activeStory.color} 0%, #1a1a2e 100%)`
                        }}
                    >
                        {/* Background Image - Full Cover */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: activeStory.color,
                            overflow: 'hidden'
                        }}>
                             <LazyImage
                                src={activeStory.image}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>

                        {/* Gradient Overlay for text readability */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: '60%',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                            pointerEvents: 'none'
                        }}></div>

                        {/* Content Text */}
                        <div style={{
                            position: 'relative',
                            zIndex: 1001,
                            width: '90%',
                            textAlign: 'center',
                            padding: '20px'
                        }}>
                            <h2 style={{
                                color: 'white',
                                marginBottom: '15px',
                                fontSize: '24px',
                                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                {getStoryTitle(activeStory)}
                            </h2>
                            <div style={{
                                maxHeight: '40vh',
                                overflowY: 'auto',
                                padding: '10px',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            }}>
                                <p style={{
                                    fontSize: '18px',
                                    lineHeight: '1.6',
                                    color: 'white',
                                    marginBottom: '20px',
                                    fontStyle: 'italic',
                                    fontWeight: '500',
                                    textShadow: '0 2px 5px rgba(0,0,0,0.8)'
                                }}>
                                    "{getStoryContent(activeStory)}"
                                </p>
                            </div>

                            {/* Huzur Branding - Included in screenshot */}
                            <div style={{
                                marginTop: '20px',
                                fontSize: '12px',
                                color: 'rgba(255,255,255,0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}>
                                <span>🕌</span>
                                <span>{t('app.name')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Share Button - Overlay at bottom */}
                    <div style={{
                        position: 'absolute',
                        bottom: '30px',
                        left: 0,
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        zIndex: 1002
                    }}>
                        <button
                            onClick={() => handleShare(activeStory)}
                            disabled={isSharing}
                            style={{
                                background: isSharing ? 'rgba(100,100,100,0.8)' : 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.4)',
                                padding: '14px 50px',
                                borderRadius: '50px',
                                fontSize: '16px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: isSharing ? 'wait' : 'pointer',
                                boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
                                opacity: isSharing ? 0.7 : 1
                            }}
                        >
                            {isSharing ? (
                                <>⏳ {t('stories.preparing')}</>
                            ) : (
                                <>
                                    <Share2 size={20} />
                                    {t('stories.shareAsPhoto')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
});

export default Stories;
