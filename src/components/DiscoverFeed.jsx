import { useTranslation } from 'react-i18next';
import { PlayCircle, ArrowRight, MessageCircle } from 'lucide-react';
import './ModernHomeFeed.css';

const DiscoverFeed = () => {
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
             <div className="section-header" style={{ padding: '0 4px 12px 4px' }}>
                <span className="section-title">Keşfet</span>
            </div>
            
            {feedItems.map((item) => (
                <div key={item.id} className="feed-card">
                    <div className="feed-image" style={{ background: item.image, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.type === 'video' && <PlayCircle size={48} color="white" style={{ opacity: 0.8 }} />}
                        {item.type === 'community' && <MessageCircle size={48} color="white" style={{ opacity: 0.8 }} />}
                    </div>
                    <div className="feed-content">
                        <div className="feed-tag">{item.tag}</div>
                        <div className="feed-title">{item.title}</div>
                        <div className="feed-desc">{item.desc}</div>
                        <div className="feed-cta">
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                {item.cta} <ArrowRight size={14} />
                            </span>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Bottom Spacer for Tab Bar */}
            <div style={{ height: '80px' }}></div>
        </div>
    );
};

export default DiscoverFeed;
