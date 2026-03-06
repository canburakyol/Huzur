import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MapPin, Navigation, ExternalLink, Loader, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Cami ikonu
const mosqueIcon = new L.DivIcon({
    html: '<div style="font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🕌</div>',
    className: 'mosque-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

// Kullanıcı konumu ikonu
const userIcon = new L.DivIcon({
    html: '<div style="width: 20px; height: 20px; background: #2e7d32; border: 4px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
    className: 'user-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

// Haritayı konuma taşıyan bileşen
const FlyToLocation = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 15, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
};

const MosqueFinder = ({ onClose }) => {
    const { t } = useTranslation();
    const [location, setLocation] = useState(null);
    const [mosques, setMosques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMosque, setSelectedMosque] = useState(null);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat2 || !lon2) return 999;
        const R = 6371; // Dünya yarıçapı (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const searchMosques = useCallback(async (lat, lng) => {
        try {
            // Overpass API ile yakındaki camileri ara
            const radius = 3000; // 3km
            const query = `
                [out:json][timeout:25];
                (
                  node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
                  way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
                  node["building"="mosque"](around:${radius},${lat},${lng});
                  way["building"="mosque"](around:${radius},${lat},${lng});
                );
                out center 20;
            `;

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });

            const data = await response.json();

            const mosqueList = data.elements.map((el, index) => ({
                id: el.id || index,
                name: el.tags?.name || 'Cami',
                lat: el.lat || el.center?.lat,
                lng: el.lon || el.center?.lon,
                address: el.tags?.['addr:street'] || '',
                distance: calculateDistance(lat, lng, el.lat || el.center?.lat, el.lon || el.center?.lon)
            })).filter(m => m.lat && m.lng).sort((a, b) => a.distance - b.distance);

            setMosques(mosqueList.slice(0, 15)); // En yakın 15 cami
        } catch (err) {
            console.error('Cami arama hatası:', err);
            // Hata durumunda örnek veriler
            setMosques([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const getLocation = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Capacitor Geolocation ile konum al
            const { Geolocation } = await import('@capacitor/geolocation');
            
            // Önce izin durumunu kontrol et
            const permissionStatus = await Geolocation.checkPermissions();
            
            if (permissionStatus.location !== 'granted') {
                const request = await Geolocation.requestPermissions();
                if (request.location !== 'granted') {
                    throw new Error('PERMISSION_DENIED');
                }
            }

            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000
            });

            const { latitude, longitude } = position.coords;
            setLocation([latitude, longitude]);
            searchMosques(latitude, longitude);

        } catch (err) {
            console.error('Konum hatası:', err);
            setLoading(false);
            
            if (err.message === 'PERMISSION_DENIED' || err.code === 1) {
                setError('Konum izni reddedildi. Yakındaki camileri görmek için lütfen konum iznini verin.');
            } else if (err.code === 2) {
                setError('Konum alınamadı. Lütfen GPS\'inizi kontrol edin.');
            } else {
                setError('Konum alınamadı. Lütfen tekrar deneyin.');
            }
        }
    }, [searchMosques]);

    useEffect(() => {
        getLocation();
    }, [getLocation]);

    const openInMaps = (lat, lng) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
        const win = window.open(url, '_blank', 'noopener,noreferrer');
        if (win) {
            win.opener = null;
        }
    };

    return (
        <div className="settings-container reveal-stagger" style={{ padding: 0 }}>
            {/* Header */}
            <div style={{
                padding: '24px 20px',
                background: 'linear-gradient(135deg, var(--nav-bg), var(--nav-hover))',
                borderBottom: '1px solid var(--nav-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IslamicBackButton onClick={onClose} size="medium" />
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--nav-text)', fontWeight: '900' }}>
                        {t('mosqueFinder.title', 'En Yakın Camiler')}
                    </h2>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={getLocation} 
                        style={{ 
                            background: 'var(--nav-hover)', 
                            border: '1px solid var(--nav-border)', 
                            borderRadius: '12px', 
                            width: '44px', 
                            height: '44px', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'var(--nav-accent)'
                        }}
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Harita */}
            <div style={{ flex: 1, position: 'relative' }}>
                {loading && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(var(--nav-bg-rgb, 255, 255, 255), 0.95)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(8px)'
                    }}>
                        <div className="settings-icon-box spin" style={{ 
                            width: '80px', 
                            height: '80px', 
                            background: 'var(--nav-hover)',
                            color: 'var(--nav-accent)',
                            animation: 'spin 2s linear infinite'
                        }}>
                            <Loader size={32} />
                        </div>
                        <div style={{ marginTop: '24px', color: 'var(--nav-text)', fontWeight: '800', fontSize: '1.1rem' }}>
                            Konumunuz Hesaplanıyor...
                        </div>
                    </div>
                )}

                {/* Konum Hatası Ekranı - Velocity Style */}
                {!loading && error && !location && (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px',
                        textAlign: 'center',
                        background: 'var(--nav-bg)'
                    }}>
                        <div style={{ 
                            fontSize: '4rem', 
                            marginBottom: '24px',
                            background: 'var(--nav-hover)',
                            width: '120px',
                            height: '120px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '32px'
                        }}>📍</div>
                        <div style={{ fontSize: '1.5rem', color: 'var(--nav-text)', marginBottom: '16px', fontWeight: '900' }}>
                            Konum İzni Gerekli
                        </div>
                        <div style={{ fontSize: '1rem', color: 'var(--nav-text-muted)', marginBottom: '32px', maxWidth: '300px', fontWeight: '600', lineHeight: '1.6' }}>
                            {error}
                        </div>
                        <button
                            onClick={getLocation}
                            className="velocity-target-btn"
                            style={{
                                padding: '20px 40px',
                                background: 'var(--nav-accent)',
                                color: 'white',
                                borderRadius: '20px',
                                fontSize: '1.1rem',
                                fontWeight: '900',
                                width: 'auto'
                            }}
                        >
                            <MapPin size={24} /> Konumu Etkinleştir
                        </button>
                    </div>
                )}

                {location && (
                    <MapContainer
                        center={location}
                        zoom={14}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <FlyToLocation position={location} />

                        {/* Kullanıcı konumu */}
                        <Marker position={location} icon={userIcon}>
                            <Popup>📍 Konumunuz</Popup>
                        </Marker>

                        {/* Camiler */}
                        {mosques.map(mosque => (
                            <Marker
                                key={mosque.id}
                                position={[mosque.lat, mosque.lng]}
                                icon={mosqueIcon}
                                eventHandlers={{
                                    click: () => setSelectedMosque(mosque)
                                }}
                            >
                                <Popup>
                                    <div style={{ minWidth: '150px' }}>
                                        <strong>{mosque.name}</strong>
                                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                            {mosque.distance.toFixed(1)} km uzaklıkta
                                        </div>
                                        <button
                                            onClick={() => openInMaps(mosque.lat, mosque.lng, mosque.name)}
                                            style={{
                                                marginTop: '8px',
                                                padding: '6px 12px',
                                                background: 'var(--primary-color)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <Navigation size={12} /> Yol Tarifi
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>

            {/* Cami Listesi - Velocity Style */}
            <div style={{
                maxHeight: '40%',
                overflowY: 'auto',
                background: 'var(--nav-bg)',
                borderTop: '1px solid var(--nav-border)',
                padding: '8px 0'
            }}>
                {mosques.length === 0 && !loading && (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                        Yakınınızda cami bulunamadı.
                    </div>
                )}
                {mosques.map(mosque => (
                    <div
                        key={mosque.id}
                        onClick={() => setSelectedMosque(mosque)}
                        className="settings-card reveal-stagger"
                        style={{
                            margin: '8px 12px',
                            padding: '16px',
                            cursor: 'pointer',
                            background: selectedMosque?.id === mosque.id ? 'var(--nav-hover)' : 'var(--nav-bg)',
                            border: selectedMosque?.id === mosque.id ? '1px solid var(--nav-accent)' : '1px solid var(--nav-border)',
                            borderRadius: '16px'
                        }}
                    >
                        <div className="settings-card-left">
                            <div className="settings-icon-box" style={{ 
                                width: '44px', 
                                height: '44px', 
                                background: 'var(--nav-hover)',
                                fontSize: '1.25rem'
                            }}>
                                🕌
                            </div>
                            <div className="settings-user-info">
                                <div className="settings-label" style={{ fontSize: '0.95rem' }}>
                                    {mosque.name}
                                </div>
                                <div className="settings-desc">
                                    📍 {mosque.distance.toFixed(1)} km mesafede
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); openInMaps(mosque.lat, mosque.lng, mosque.name); }}
                            className="velocity-target-btn"
                            style={{
                                width: 'auto',
                                padding: '8px 16px',
                                background: 'var(--nav-accent)',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: '900'
                            }}
                        >
                            <Navigation size={14} /> GİT
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .leaflet-container {
                    font-family: var(--font-main);
                }
                .mosque-marker, .user-marker {
                    background: none !important;
                    border: none !important;
                }
            `}</style>
        </div>
    );
};

export default MosqueFinder;
