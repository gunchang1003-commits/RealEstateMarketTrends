import { useEffect, useRef } from 'react';

export default function PanoramaView({ position, onClose }) {
    const panoRef = useRef(null);
    const panoInstanceRef = useRef(null);

    useEffect(() => {
        if (!window.naver || !window.naver.maps || !panoRef.current) return;

        const panoPosition = new window.naver.maps.LatLng(position.lat, position.lng);

        panoInstanceRef.current = new window.naver.maps.Panorama(panoRef.current, {
            position: panoPosition,
            pov: {
                pan: 0,
                tilt: 0,
                fov: 100,
            },
            flightSpot: true,
            aroundControl: true,
            zoomControl: true,
        });

        return () => {
            if (panoInstanceRef.current) {
                panoInstanceRef.current.destroy();
                panoInstanceRef.current = null;
            }
        };
    }, [position.lat, position.lng]);

    return (
        <div className="panorama-overlay">
            <div className="panorama-header">
                <span>📷 거리뷰</span>
                <button className="panorama-close-btn" onClick={onClose}>✕</button>
            </div>
            <div ref={panoRef} className="panorama-container" />
        </div>
    );
}
