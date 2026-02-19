import { useEffect, useRef } from 'react';
import { kakaoMapsReady } from '../utils/api';

export default function PanoramaView({ position, onClose }) {
    const roadviewRef = useRef(null);
    const roadviewInstanceRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        kakaoMapsReady.then(() => {
            if (cancelled || !roadviewRef.current) return;

            const roadviewContainer = roadviewRef.current;
            const roadview = new window.kakao.maps.Roadview(roadviewContainer);
            const roadviewClient = new window.kakao.maps.RoadviewClient();

            const targetPosition = new window.kakao.maps.LatLng(position.lat, position.lng);

            // Find nearest roadview pano within 50m radius
            roadviewClient.getNearestPanoId(targetPosition, 50, (panoId) => {
                if (panoId) {
                    roadview.setPanoId(panoId, targetPosition);
                } else {
                    // If no roadview available within 50m, try 200m
                    roadviewClient.getNearestPanoId(targetPosition, 200, (panoId2) => {
                        if (panoId2) {
                            roadview.setPanoId(panoId2, targetPosition);
                        }
                    });
                }
            });

            roadviewInstanceRef.current = roadview;
        });

        return () => {
            cancelled = true;
            roadviewInstanceRef.current = null;
        };
    }, [position.lat, position.lng]);

    return (
        <div className="panorama-overlay">
            <div className="panorama-header">
                <span>📷 거리뷰</span>
                <button className="panorama-close-btn" onClick={onClose}>✕</button>
            </div>
            <div ref={roadviewRef} className="panorama-container" />
        </div>
    );
}
