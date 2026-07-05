import { useEffect } from 'react';
import { Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const mosqueIcon = new L.DivIcon({
    html: '<div style="font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">ğŸ•Œ</div>',
    className: 'mosque-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const userIcon = new L.DivIcon({
    html: '<div style="width: 20px; height: 20px; background: #2e7d32; border: 4px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
    className: 'user-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const FlyToLocation = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 15, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
};

const MosqueFinderMap = ({ location, mosques, onSelectMosque, onOpenInMaps }) => (
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

        <Marker position={location} icon={userIcon}>
            <Popup>ğŸ“ Konumunuz</Popup>
        </Marker>

        {mosques.map((mosque) => (
            <Marker
                key={mosque.id}
                position={[mosque.lat, mosque.lng]}
                icon={mosqueIcon}
                eventHandlers={{
                    click: () => onSelectMosque(mosque)
                }}
            >
                <Popup>
                    <div style={{ minWidth: '150px' }}>
                        <strong>{mosque.name}</strong>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            {mosque.distance.toFixed(1)} km uzaklÄ±kta
                        </div>
                        <button
                            onClick={() => onOpenInMaps(mosque.lat, mosque.lng, mosque.name)}
                            style={{
                                marginTop: '8px',
                                padding: '6px 12px',
                                background: 'var(--primary)',
                                color: 'var(--on-primary)',
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
);

export default MosqueFinderMap;
