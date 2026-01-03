import { ChevronLeft } from 'lucide-react';

function TermsOfService({ onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(-45deg, #fff0e6, #ffe5d9, #ffd1b3, #fff5f0)',
            backgroundSize: '400% 400%',
            animation: 'gradientBG 15s ease infinite',
            zIndex: 1000,
            overflowY: 'auto',
            padding: '20px',
            paddingBottom: '80px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
                gap: '12px'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(120, 120, 128, 0.16)',
                        backdropFilter: 'blur(10px)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <ChevronLeft size={24} color="#1d1d1f" />
                </button>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#1d1d1f', flex: 1 }}>
                    Kullanım Koşulları
                </h2>
            </div>

            {/* Content */}
            <div className="glass-card">
                <div style={{ lineHeight: '1.8', color: '#2c3e50' }}>
                    <h3 style={{ color: '#d35400', marginTop: 0 }}>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</h3>
                    
                    <p>
                        <strong>Huzur</strong> uygulamasını kullanarak, aşağıdaki kullanım koşullarını 
                        kabul etmiş sayılırsınız. Lütfen bu koşulları dikkatle okuyun.
                    </p>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>1. Kullanım Lisansı</h3>
                    <p>
                        Bu uygulama, kişisel ve ticari olmayan kullanım için ücretsiz olarak sunulmaktadır. 
                        Uygulamayı değiştirmek, kopyalamak veya dağıtmak yasaktır.
                    </p>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>2. Hizmet Açıklaması</h3>
                    <p>
                        Huzur uygulaması, namaz vakitleri, Kuran-ı Kerim, dualar ve dini içerikler 
                        sağlayan bir mobil uygulamadır. Uygulama, üçüncü taraf API'ler kullanarak 
                        veri sağlar ve bu verilerin doğruluğu garanti edilmez.
                    </p>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>3. Kullanıcı Sorumlulukları</h3>
                    <p>
                        Kullanıcılar:
                    </p>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li>Uygulamayı yasalara uygun şekilde kullanmalıdır</li>
                        <li>Uygulamanın içeriğini kötüye kullanmamalıdır</li>
                        <li>Uygulamayı başkalarının zararına kullanmamalıdır</li>
                        <li>Uygulamanın güvenliğini tehlikeye atmamalıdır</li>
                    </ul>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>4. Sorumluluk Reddi</h3>
                    <p>
                        Uygulama "olduğu gibi" sunulmaktadır. Namaz vakitleri ve diğer bilgilerin 
                        doğruluğu için garanti verilmez. Kullanıcılar, önemli dini uygulamalar için 
                        resmi kaynaklara başvurmalıdır.
                    </p>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>5. Fikri Mülkiyet</h3>
                    <p>
                        Uygulamanın tüm içeriği, tasarımı ve kodları telif hakkı ile korunmaktadır. 
                        Kuran-ı Kerim metinleri ve dualar kamu malıdır, ancak uygulamanın kendisi 
                        telif hakkı altındadır.
                    </p>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>6. Hizmet Değişiklikleri</h3>
                    <p>
                        Uygulama, önceden haber vermeksizin değiştirilebilir, güncellenebilir veya 
                        durdurulabilir. Kullanıcılar bu değişikliklerden haberdar olmalıdır.
                    </p>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>7. İptal ve Fesih</h3>
                    <p>
                        Uygulama kullanımı, herhangi bir zamanda ve herhangi bir nedenle 
                        iptal edilebilir. Kullanıcılar, uygulama koşullarını ihlal ettiklerinde 
                        erişimleri sonlandırılabilir.
                    </p>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>8. Değişiklikler</h3>
                    <p>
                        Bu kullanım koşulları zaman zaman güncellenebilir. 
                        Önemli değişiklikler uygulama içinde bildirilecektir.
                    </p>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>9. İletişim</h3>
                    <p>
                        Kullanım koşulları hakkında sorularınız için lütfen bizimle iletişime geçin.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default TermsOfService;



