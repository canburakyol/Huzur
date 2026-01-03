import { ChevronLeft } from 'lucide-react';

function PrivacyPolicy({ onClose }) {
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
                    Gizlilik Politikası
                </h2>
            </div>

            {/* Content */}
            <div className="glass-card">
                <div style={{ lineHeight: '1.8', color: '#2c3e50' }}>
                    <h3 style={{ color: '#d35400', marginTop: 0 }}>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</h3>
                    
                    <p>
                        <strong>Huzur</strong> uygulaması olarak, kullanıcılarımızın gizliliğine önem veriyoruz. 
                        Bu gizlilik politikası, uygulamamızın kişisel verilerinizi nasıl topladığını, 
                        kullandığını ve koruduğunu açıklamaktadır.
                    </p>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>1. Toplanan Veriler</h3>
                    <p>
                        Uygulamamız aşağıdaki verileri toplayabilir:
                    </p>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li><strong>Konum Bilgisi:</strong> Namaz vakitlerini ve hava durumunu doğru göstermek için konum bilgisi kullanılır. Bu bilgi sadece cihazınızda saklanır ve sunucularımıza gönderilmez.</li>
                        <li><strong>Cihaz Bilgileri:</strong> Uygulamanın düzgün çalışması için temel cihaz bilgileri kullanılabilir.</li>
                    </ul>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>2. Veri Kullanımı</h3>
                    <p>
                        Toplanan veriler sadece aşağıdaki amaçlar için kullanılır:
                    </p>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li>Namaz vakitlerini doğru göstermek</li>
                        <li>Hava durumu bilgisi sağlamak</li>
                        <li>Kıble yönünü belirlemek</li>
                        <li>Uygulama performansını iyileştirmek</li>
                    </ul>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>3. Veri Paylaşımı</h3>
                    <p>
                        Kişisel verileriniz üçüncü taraflarla paylaşılmaz. Uygulama, namaz vakitleri için 
                        <strong>Aladhan API</strong>, hava durumu için <strong>Open-Meteo API</strong> 
                        ve konum bilgisi için <strong>BigDataCloud API</strong> kullanır. 
                        Bu servislerin kendi gizlilik politikaları geçerlidir.
                    </p>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>4. Veri Güvenliği</h3>
                    <p>
                        Verileriniz cihazınızda güvenli bir şekilde saklanır. Uygulama, 
                        hassas bilgileri şifreleme teknolojileri ile korur.
                    </p>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>5. İzinler</h3>
                    <p>
                        Uygulama aşağıdaki izinleri talep edebilir:
                    </p>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li><strong>Konum:</strong> Namaz vakitleri ve hava durumu için</li>
                        <li><strong>Bildirimler:</strong> Namaz vakitleri hatırlatmaları için</li>
                        <li><strong>İnternet:</strong> API verilerini almak için</li>
                    </ul>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>6. Reklam ve Analiz</h3>
                    <p>
                        Uygulamamız <strong>Google AdMob</strong> reklam hizmeti ve 
                        <strong> Google Firebase Analytics</strong> kullanır. Bu hizmetler, 
                        kişiselleştirilmiş reklamlar sunmak ve uygulama kullanımını analiz etmek için 
                        cihaz tanımlayıcılarını (GAID) toplayabilir. Reklam tercihlerinizi 
                        uygulama ayarlarından veya cihaz ayarlarından yönetebilirsiniz.
                    </p>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>7. Yapay Zeka Asistan</h3>
                    <p>
                        Dini sorularınızı yanıtlamak için <strong>Pollinations AI</strong> 
                        servisi kullanılmaktadır. Sorularınız bu servise gönderilir ve 
                        cevaplar alınır. Lütfen bu servise kişisel bilgilerinizi girmekten 
                        kaçının.
                    </p>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>8. Değişiklikler</h3>
                    <p>
                        Bu gizlilik politikası zaman zaman güncellenebilir. 
                        Önemli değişiklikler uygulama içinde bildirilecektir.
                    </p>

                    <h3 style={{ color: '#d35400', marginTop: '24px' }}>9. İletişim</h3>
                    <p>
                        Gizlilik politikamız hakkında sorularınız için: 
                        <strong> huzurapp.destek@gmail.com</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy;



