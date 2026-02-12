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
        <div className="glass-card" style={{
            position: 'relative',
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,255,240,0.95))'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <button onClick={() => setShowInfo(!showInfo)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#27ae60' }}>
                    <Info size={24} />
                </button>
                <h2 style={{ margin: 0, color: '#27ae60', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calculator size={24} /> {t('zakatCalculator.title', 'Zakat Calculator')}
                </h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                    <X size={28} />
                </button>
            </div>

            {/* Bilgi Kutusu */}
            {showInfo && (
                <div style={{
                    background: 'rgba(39, 174, 96, 0.1)',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    color: '#155724',
                    border: '1px solid rgba(39, 174, 96, 0.2)'
                }}>
                    <strong>📌 {t('zakatCalculator.whatIsZakatTitle', 'What is Zakat?')}</strong>
                    <p style={{ margin: '8px 0 0 0' }}>
                        {t('zakatCalculator.whatIsZakatBody', 'Zakat is giving 2.5% of assets that have reached nisab and remained in possession for one lunar year. Nisab equals the value of 80.18g gold or 561.2g silver.')}
                    </p>
                </div>
            )}

            {/* İçerik */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* Altın Fiyatı */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px', color: '#666', marginBottom: '6px', display: 'block' }}>
                        {t('zakatCalculator.goldPriceLabel', 'Gold Price (TL/gram)')}
                    </label>
                    <input
                        type="number"
                        value={goldPrice}
                        onChange={(e) => setGoldPrice(parseFloat(e.target.value) || 0)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid #ddd',
                            fontSize: '16px'
                        }}
                    />
                </div>

                {/* Varlıklar */}
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#27ae60', marginBottom: '12px' }}>
                    💰 {t('zakatCalculator.assetsTitle', 'Assets')}
                </div>

                {[
                    { key: 'cash', label: t('zakatCalculator.assetCash', 'Cash (TL)'), icon: '💵' },
                    { key: 'gold', label: t('zakatCalculator.assetGold', 'Gold (gram)'), icon: '🥇' },
                    { key: 'silver', label: t('zakatCalculator.assetSilver', 'Silver (gram)'), icon: '🥈' },
                    { key: 'stocks', label: t('zakatCalculator.assetStocks', 'Stocks/Investments (TL)'), icon: '📈' },
                    { key: 'receivables', label: t('zakatCalculator.assetReceivables', 'Receivables (TL)'), icon: '📋' },
                    { key: 'business', label: t('zakatCalculator.assetBusiness', 'Business Goods (TL)'), icon: '🏪' },
                ].map(item => (
                    <div key={item.key} style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {item.icon} {item.label}
                        </label>
                        <input
                            type="number"
                            value={assets[item.key] || ''}
                            onChange={(e) => updateAsset(item.key, e.target.value)}
                            placeholder="0"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '15px'
                            }}
                        />
                    </div>
                ))}

                {/* Borçlar */}
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#e74c3c', marginBottom: '12px', marginTop: '20px' }}>
                    💳 {t('zakatCalculator.debtsTitle', 'Debts')}
                </div>
                <input
                    type="number"
                    value={debts || ''}
                    onChange={(e) => setDebts(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '15px',
                        marginBottom: '20px'
                    }}
                />

                {/* Sıfırla */}
                <button
                    onClick={reset}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'rgba(0,0,0,0.05)',
                        color: '#666',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '20px'
                    }}
                >
                    <RefreshCw size={16} /> {t('zakatCalculator.reset', 'Reset')}
                </button>
            </div>

            {/* Sonuç */}
            <div style={{
                background: isNisabReached ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
                borderRadius: '16px',
                padding: '20px',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>
                    {isNisabReached
                        ? t('zakatCalculator.nisabReached', '✅ Nisab reached')
                        : t('zakatCalculator.nisabNotReached', '❌ Nisab not reached')}
                </div>
                <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '8px' }}>
                    {t('zakatCalculator.nisabLabel', 'Nisab')}: {formatCurrency(nisabValue)}
                </div>
                <div style={{ fontSize: '14px', marginBottom: '4px' }}>{t('zakatCalculator.netWealth', 'Net Wealth')}: {formatCurrency(netWealth)}</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                    {isNisabReached
                        ? `${t('zakatCalculator.zakatLabel', 'Zakat')}: ${formatCurrency(zakatAmount)}`
                        : t('zakatCalculator.noZakatRequired', 'No Zakat required')}
                </div>
                {isNisabReached && (
                    <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px' }}>
                        {t('zakatCalculator.percentNote', '(2.5% of net wealth)')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZakatCalculator;
