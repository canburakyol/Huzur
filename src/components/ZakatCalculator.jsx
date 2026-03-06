import { useState, useEffect } from 'react';
import { X, Calculator, Info, RefreshCw, DollarSign, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Zekat nisab değerleri (gram cinsinden)
const NISAB = {
    gold: 80.18, // 20 miskal = 80.18 gram altın
    silver: 561.2 // 200 dirhem = 561.2 gram gümüş
};

const ZakatCalculator = ({ onClose }) => {
    const { t } = useTranslation();
    const [goldPrice, setGoldPrice] = useState(2500); // TL/gram
    const silverPrice = 30; // TL/gram (constant)

    const [assets, setAssets] = useState({
        cash: 0,
        gold: 0, // gram
        silver: 0, // gram
        stocks: 0,
        receivables: 0, // alacaklar
        business: 0, // ticari mal
    });

    const [debts, setDebts] = useState(0);
    const [showInfo, setShowInfo] = useState(false);

    // Altın fiyatını API'den çek (opsiyonel)
    useEffect(() => {
        // Gerçek API entegrasyonu için:
        // fetch('https://api.example.com/gold-price')
        //   .then(res => res.json())
        //   .then(data => setGoldPrice(data.price));
    }, []);

    const updateAsset = (key, value) => {
        const numValue = parseFloat(value) || 0;
        setAssets({ ...assets, [key]: numValue });
    };

    // Toplam varlık hesaplama
    const totalAssets =
        assets.cash +
        (assets.gold * goldPrice) +
        (assets.silver * silverPrice) +
        assets.stocks +
        assets.receivables +
        assets.business;

    // Net servet
    const netWealth = totalAssets - debts;

    // Nisab hesaplama (altın üzerinden)
    const nisabValue = NISAB.gold * goldPrice;

    // Zekat miktarı (%2.5)
    const zakatAmount = netWealth >= nisabValue ? netWealth * 0.025 : 0;

    // Nisab'a ulaşıldı mı?
    const isNisabReached = netWealth >= nisabValue;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
    };

    const reset = () => {
        setAssets({ cash: 0, gold: 0, silver: 0, stocks: 0, receivables: 0, business: 0 });
        setDebts(0);
    };

    return (
        <div className="settings-container reveal-stagger">
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                padding: '0 4px'
            }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h1 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    color: 'var(--nav-text)',
                    fontWeight: '900'
                }}>
                    {t('zakatCalculator.title', 'Zekat Hesapla')}
                </h1>
                <div style={{ flex: 1 }}></div>
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    style={{
                        background: 'var(--nav-hover)',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--nav-accent)',
                        padding: '10px',
                        borderRadius: '12px'
                    }}
                >
                    <Info size={20} />
                </button>
            </div>

            {/* Info Box */}
            {showInfo && (
                <div className="settings-card" style={{
                    background: 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.1)',
                    borderRadius: '24px',
                    padding: '20px',
                    marginBottom: '24px',
                    fontSize: '0.9rem',
                    color: 'var(--nav-accent)',
                    border: '1px solid var(--nav-accent)',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '8px'
                }}>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                        <Calculator size={18} /> {t('zakatCalculator.whatIsZakatTitle', 'Zekat Nedir?')}
                    </strong>
                    <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--nav-text)', fontWeight: '600' }}>
                        {t('zakatCalculator.whatIsZakatBody', 'Zekat, nisap miktarına ulaşan ve üzerinden bir hicri yıl geçen malın %2.5\'inin verilmesidir. Nisap, 80.18 gram altın veya karşılığıdır.')}
                    </p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Gold Price Card */}
                <div className="settings-card" style={{ padding: '20px', flexDirection: 'column', alignItems: 'stretch' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--nav-text-muted)', marginBottom: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        🥇 {t('zakatCalculator.goldPriceLabel', 'Güncel Altın Fiyatı (TL/gr)')}
                    </label>
                    <input
                        type="number"
                        value={goldPrice}
                        onChange={(e) => setGoldPrice(parseFloat(e.target.value) || 0)}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            background: 'var(--nav-hover)',
                            border: '1px solid var(--nav-border)',
                            fontSize: '1.25rem',
                            fontWeight: '900',
                            color: 'var(--nav-accent)',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Assets Section */}
                <div className="settings-group">
                    <div className="settings-group-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        💰 {t('zakatCalculator.assetsTitle', 'Varlıklar')}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { key: 'cash', label: t('zakatCalculator.assetCash', 'Nakit Para (TL)'), icon: '💵' },
                            { key: 'gold', label: t('zakatCalculator.assetGold', 'Altın (gram)'), icon: '🥇' },
                            { key: 'silver', label: t('zakatCalculator.assetSilver', 'Gümüş (gram)'), icon: '🥈' },
                            { key: 'stocks', label: t('zakatCalculator.assetStocks', 'Hisse / Yatırım (TL)'), icon: '📈' },
                            { key: 'receivables', label: t('zakatCalculator.assetReceivables', 'Alacaklar (TL)'), icon: '📋' },
                            { key: 'business', label: t('zakatCalculator.assetBusiness', 'Ticari Mal (TL)'), icon: '🏪' },
                        ].map(item => (
                            <div key={item.key} className="settings-card" style={{ padding: '16px', flexDirection: 'column', alignItems: 'stretch' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', marginBottom: '8px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {item.icon} {item.label}
                                </label>
                                <input
                                    type="number"
                                    value={assets[item.key] || ''}
                                    onChange={(e) => updateAsset(item.key, e.target.value)}
                                    placeholder="0"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: 'transparent',
                                        border: '1px solid var(--nav-border)',
                                        fontSize: '1.1rem',
                                        fontWeight: '800',
                                        color: 'var(--nav-text)',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Debts Section */}
                <div className="settings-card" style={{ padding: '20px', flexDirection: 'column', alignItems: 'stretch', background: 'rgba(231, 76, 60, 0.05)', border: '1px solid rgba(231, 76, 60, 0.2)' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--error-color)', marginBottom: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        💳 {t('zakatCalculator.debtsTitle', 'Borçlar')}
                    </label>
                    <input
                        type="number"
                        value={debts || ''}
                        onChange={(e) => setDebts(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            background: 'white',
                            border: '1px solid var(--error-color)',
                            fontSize: '1.25rem',
                            fontWeight: '900',
                            color: 'var(--error-color)',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Reset Button */}
                <button
                    onClick={reset}
                    className="velocity-target-btn"
                    style={{
                        padding: '16px',
                        background: 'var(--nav-hover)',
                        color: 'var(--nav-text-muted)',
                        justifyContent: 'center',
                        fontWeight: '900',
                        marginTop: '12px'
                    }}
                >
                    <RefreshCw size={18} /> {t('zakatCalculator.reset', 'Sıfırla')}
                </button>
            </div>

            {/* Result Section */}
            <div className="settings-card" style={{
                marginTop: '32px',
                padding: '32px 24px',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '20px',
                background: isNisabReached 
                    ? 'linear-gradient(135deg, var(--bg-emerald-light), var(--bg-emerald-deep))' 
                    : 'var(--nav-hover)',
                border: isNisabReached ? 'none' : '1px solid var(--nav-border)',
                borderRadius: '32px',
                color: isNisabReached ? 'white' : 'var(--nav-text)',
                boxShadow: isNisabReached ? '0 20px 40px rgba(15, 118, 110, 0.3)' : 'none'
            }}>
                <div className="hamburger-level-badge" style={{ 
                    background: isNisabReached ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', 
                    color: isNisabReached ? 'white' : 'var(--nav-text-muted)',
                    border: 'none',
                    fontWeight: '900'
                }}>
                    {isNisabReached
                        ? `✅ ${t('zakatCalculator.nisabReached', 'Nisap Miktarına Ulaşıldı')}`
                        : `❌ ${t('zakatCalculator.nisabNotReached', 'Nisap Miktarına Ulaşılamadı')}`}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: '700' }}>
                        {t('zakatCalculator.nisabLabel', 'Nisap Hesabı')} ({formatCurrency(nisabValue)})
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900' }}>
                        {t('zakatCalculator.netWealth', 'Net Servet')}: {formatCurrency(netWealth)}
                    </div>
                </div>

                <hr style={{ width: '60%', border: 'none', borderTop: isNisabReached ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--nav-border)' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ 
                        fontSize: isNisabReached ? '2.5rem' : '1.5rem', 
                        fontWeight: '950',
                        lineHeight: '1.2'
                    }}>
                        {isNisabReached
                            ? formatCurrency(zakatAmount)
                            : t('zakatCalculator.noZakatRequired', 'Zekat Gerekmiyor')}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: '800' }}>
                        {isNisabReached ? t('zakatCalculator.zakatLabel', 'Ödenmesi Gereken Zekat') : ''}
                    </div>
                </div>

                {isNisabReached && (
                    <div style={{ 
                        fontSize: '0.75rem', 
                        opacity: 0.7, 
                        fontWeight: '700',
                        background: 'rgba(0,0,0,0.1)',
                        padding: '6px 12px',
                        borderRadius: '12px'
                    }}>
                        {t('zakatCalculator.percentNote', 'Net servetin %2.5\'i hesaplanmıştır.')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZakatCalculator;
