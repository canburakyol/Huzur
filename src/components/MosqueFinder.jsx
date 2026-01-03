import { useState, useEffect, useCallback } from 'react';
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

    const getLocation = useCallback(() => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Tarayıcınız konum servisini desteklemiyor');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation([latitude, longitude]);
                searchMosques(latitude, longitude);
            },
            (err) => {
                console.error('Konum hatası:', err);
                setLoading(false);
                if (err.code === 1) {
                    setError('Konum izni reddedildi. Yakındaki camileri görmek için lütfen konum iznini verin.');
                } else if (err.code === 2) {
                    setError('Konum alınamadı. Lütfen GPS\'inizi kontrol edin.');
                } else {
                    setError('Konum alınamadı. Lütfen tekrar deneyin.');
                }
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    }, [searchMosques]);

    useEffect(() => {
        getLocation();
    }, [getLocation]);

    const openInMaps = (lat, lng) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
        window.open(url, '_blank');
    };

    return (
        <div className="glass-card" style={{
            position: 'relative',
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '0',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={24} />
                    <h2 style={{ margin: 0, fontSize: '20px' }}>En Yakın Camiler</h2>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={getLocation} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RefreshCw size={18} color="white" />
                    </button>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={28} color="white" />
                    </button>
                </div>
            </div>

            {/* Harita */}
            <div style={{ flex: 1, position: 'relative' }}>
                {loading && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <Loader size={40} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                        <div style={{ marginTop: '16px', color: 'var(--text-color)' }}>Konumunuz alınıyor...</div>
                    </div>
                )}

                {/* Konum Hatası Ekranı */}
                {!loading && error && !location && (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px',
                        textAlign: 'center',
                        background: 'var(--card-bg)'
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📍</div>
                        <div style={{ fontSize: '16px', color: 'var(--text-color)', marginBottom: '12px', fontWeight: '600' }}>
                            Konum Gerekli
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-color-light)', marginBottom: '24px', maxWidth: '280px' }}>
                            {error}
                        </div>
                        <button
                            onClick={getLocation}
                            style={{
                                padding: '14px 28px',
                                background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)'
                            }}
                        >
                            <MapPin size={20} /> Konum İzni Ver
                        </button>
                        <div style={{ fontSize: '12px', color: 'var(--text-color-light)', marginTop: '16px' }}>
                            Tarayıcınızın konum iznini onaylamanız gerekiyor
                        </div>
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

            {/* Cami Listesi */}
            <div style={{
                maxHeight: '35%',
                overflowY: 'auto',
                background: 'var(--card-bg)',
                borderTop: '1px solid var(--glass-border)'
            }}>
                {mosques.length === 0 && !loading && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-color-light)' }}>
                        Yakında cami bulunamadı
                    </div>
                )}
                {mosques.map(mosque => (
                    <div
                        key={mosque.id}
                        onClick={() => setSelectedMosque(mosque)}
                        style={{
                            padding: '14px 20px',
                            borderBottom: '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            background: selectedMosque?.id === mosque.id ? 'rgba(46, 125, 50, 0.1)' : 'transparent'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '24px' }}>🕌</span>
                            <div>
                                <div style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '14px' }}>{mosque.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-color-light)' }}>
                                    {mosque.distance.toFixed(1)} km
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); openInMaps(mosque.lat, mosque.lng, mosque.name); }}
                            style={{
                                background: 'var(--primary-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <Navigation size={14} /> Git
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
