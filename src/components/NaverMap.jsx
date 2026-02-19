import { useEffect, useRef, useState } from 'react';
import { formatPriceShort } from '../utils/format';
import { getMarkerColorByPrice } from '../utils/colors';

export default function NaverMap({ center, zoom, apartments, selectedApt, onSelectApt, onShowPanorama }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const [mapType, setMapType] = useState('normal');
    const [cadastralEnabled, setCadastralEnabled] = useState(false);
    const cadastralLayerRef = useRef(null);

    // Initialize map
    useEffect(() => {
        if (!window.naver || !window.naver.maps) {
            console.error('Naver Maps SDK not loaded');
            return;
        }

        const map = new window.naver.maps.Map(mapRef.current, {
            center: new window.naver.maps.LatLng(center.lat, center.lng),
            zoom: zoom,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: window.naver.maps.MapTypeControlStyle.BUTTON,
                position: window.naver.maps.Position.TOP_RIGHT,
            },
            zoomControl: true,
            zoomControlOptions: {
                style: window.naver.maps.ZoomControlStyle.SMALL,
                position: window.naver.maps.Position.RIGHT_CENTER,
            },
            scaleControl: true,
            mapDataControl: false,
            logoControlOptions: {
                position: window.naver.maps.Position.BOTTOM_LEFT,
            },
        });

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.destroy();
            }
        };
    }, []);

    // Update center and zoom
    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(new window.naver.maps.LatLng(center.lat, center.lng));
            mapInstanceRef.current.setZoom(zoom);
        }
    }, [center.lat, center.lng, zoom]);

    // Cadastral (지적도) layer toggle
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        if (cadastralEnabled) {
            if (!cadastralLayerRef.current) {
                cadastralLayerRef.current = new window.naver.maps.CadastralLayer();
            }
            cadastralLayerRef.current.setMap(mapInstanceRef.current);
        } else {
            if (cadastralLayerRef.current) {
                cadastralLayerRef.current.setMap(null);
            }
        }
    }, [cadastralEnabled]);

    // Update markers
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        if (!apartments || apartments.length === 0) return;

        apartments.forEach((apt) => {
            if (!apt.lat || !apt.lng) return;

            const bgColor = getMarkerColorByPrice(apt.avgPrice);
            const isSelected = selectedApt?.aptName === apt.aptName && selectedApt?.dong === apt.dong;

            const markerHtml = `
        <div class="apt-marker">
          <div class="marker-bubble ${isSelected ? 'selected' : ''}" style="background: ${bgColor};">
            <span class="marker-name">${apt.aptName.length > 8 ? apt.aptName.slice(0, 8) + '…' : apt.aptName}</span>
            ${formatPriceShort(apt.avgPrice)}
          </div>
          <div class="marker-tail" style="border-top: 6px solid ${bgColor};"></div>
        </div>
      `;

            const marker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(apt.lat, apt.lng),
                map: mapInstanceRef.current,
                icon: {
                    content: markerHtml,
                    anchor: new window.naver.maps.Point(0, 0),
                },
                zIndex: isSelected ? 100 : 1,
            });

            window.naver.maps.Event.addListener(marker, 'click', () => {
                onSelectApt(apt);
            });

            markersRef.current.push(marker);
        });
    }, [apartments, selectedApt]);

    const handleToggleCadastral = () => {
        setCadastralEnabled(!cadastralEnabled);
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

            {/* Custom Controls Overlay */}
            <div className="map-controls-overlay">
                <button
                    className={`map-control-btn ${cadastralEnabled ? 'active' : ''}`}
                    onClick={handleToggleCadastral}
                >
                    🗺️ 지적도 {cadastralEnabled ? 'ON' : 'OFF'}
                </button>

                {selectedApt?.lat && selectedApt?.lng && (
                    <button
                        className="map-control-btn"
                        onClick={() => onShowPanorama(selectedApt.lat, selectedApt.lng)}
                    >
                        📷 거리뷰
                    </button>
                )}
            </div>
        </div>
    );
}
