import { memo } from 'react';
import { PlayCircle, ArrowRight, MessageCircle, Clock, BookOpen, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './ModernHomeFeed.css';

const DiscoverFeed = memo(() => {
    const { t } = useTranslation();
    const feedItems = [
        {
            id: 1,
            type: 'video',
            tag: "Günün Sohbeti",
            title: "Merhametin İyileştirici Gücü: Kalbinizi Nasıl Arındırırsınız?",
            desc: "Bu kısa sohbette, merhamet etmenin sadece karşıdakine değil, aslında kendi ruhunuza nasıl şifa olduğunu konuşuyoruz.",
            image: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", // Placeholder gradient
            cta: "İzle"
        },
        {
            id: 2,
            type: 'article',
            tag: "Ramazan Hazırlığı",
            title: "Ramazan'a 3 Adımda Manevi Hazırlık Rehberi",
            desc: "Mübarek aya girmeden önce ruhunuzu ve zihninizi arındırmak için uygulayabileceğiniz pratik adımlar.",
            image: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            cta: "Oku"
        },
        {
            id: 3,
            type: 'community',
            tag: "Dua Halkası",
            title: "Şu an 1.250 Kişi Yatsı Namazı Sonrası Dua Ediyor",
            desc: "Sen de bu manevi halkaya katıl ve ismen dua al.",
            image: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            cta: "Katıl"
        }
    ];

    return (
        <div className="discover-feed">
             <div className="gazette-section-header">
                <span className="gazette-title premium-text">{t('home.discover', 'Keşfet')}</span>
            </div>
            
            {feedItems.map((item, idx) => (
                <div key={item.id} className="gazette-card reveal-stagger premium-glass hover-lift" style={{ '--delay': `${0.2 * idx}s` }}>
                    <div className="gazette-image-area" style={{ background: item.image, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="gazette-floating-tag">
                            {item.tag}
                        </div>
                        {item.type === 'video' && <PlayCircle size={48} color="white" style={{ opacity: 0.8 }} />}
                        {item.type === 'community' && <MessageCircle size={48} color="white" style={{ opacity: 0.8 }} />}
                        {item.type === 'article' && <BookOpen size={48} color="white" style={{ opacity: 0.8 }} />}
                    </div>
                    <div className="gazette-body">
                        <span className="gazette-category">{item.tag}</span>
                        <h3 className="gazette-headline premium-text">{item.title}</h3>
                        <p className="gazette-excerpt">{item.desc}</p>
                        
                        <div className="gazette-footer">
                            <div className="gazette-meta">
                                <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                5 {t('common.minutes', 'dk')}
                            </div>
                            <div className="gazette-btn-read">
                                {item.cta} <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Bottom Spacer for Tab Bar */}
            <div style={{ height: '80px' }}></div>
        </div>
    );
});

export default DiscoverFeed;
