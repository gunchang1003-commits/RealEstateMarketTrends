import { useState, useEffect } from 'react';
import { fetchNearbyPlaces } from '../utils/api';

const CATEGORIES = [
    { code: 'FD6', label: '🍽 맛집', emoji: '🍽' },
    { code: 'CE7', label: '☕ 카페', emoji: '☕' },
    { code: 'SC4', label: '🏫 학교', emoji: '🏫' },
];

export default function NearbyPlaces({ lat, lng, onPlacesLoaded }) {
    const [activeCategory, setActiveCategory] = useState('FD6');
    const [places, setPlaces] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!lat || !lng) return;

        // 이미 캐시된 데이터가 있으면 재요청하지 않음
        if (places[activeCategory]) {
            // 캐시된 데이터를 부모에게 전달
            if (onPlacesLoaded) onPlacesLoaded(places[activeCategory], activeCategory);
            return;
        }

        const loadPlaces = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchNearbyPlaces(lat, lng, activeCategory);
                const loadedPlaces = data.places || [];
                setPlaces(prev => ({ ...prev, [activeCategory]: loadedPlaces }));
                if (onPlacesLoaded) onPlacesLoaded(loadedPlaces, activeCategory);
            } catch (err) {
                setError('주변 장소를 불러오는데 실패했습니다.');
                console.error('NearbyPlaces error:', err);
            } finally {
                setLoading(false);
            }
        };

        loadPlaces();
    }, [lat, lng, activeCategory]);

    // 아파트가 변경되면 캐시 초기화
    useEffect(() => {
        setPlaces({});
        if (onPlacesLoaded) onPlacesLoaded([], null);
    }, [lat, lng]);

    if (!lat || !lng) return null;

    const currentPlaces = places[activeCategory] || [];

    return (
        <div className="nearby-places">
            <div className="section-title" style={{ marginTop: 20 }}>
                📍 주변 시설
            </div>

            {/* 카테고리 탭 */}
            <div className="nearby-tabs">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.code}
                        className={`nearby-tab-btn ${activeCategory === cat.code ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.code)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* 로딩 */}
            {loading && (
                <div className="nearby-loading">
                    <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                    <span>검색 중...</span>
                </div>
            )}

            {/* 에러 */}
            {error && <div className="nearby-error">{error}</div>}

            {/* 장소 목록 */}
            {!loading && !error && currentPlaces.length === 0 && places[activeCategory] && (
                <div className="nearby-empty">
                    근처에 검색된 장소가 없습니다.
                </div>
            )}

            {!loading && currentPlaces.length > 0 && (
                <div className="nearby-list">
                    {currentPlaces.map((place, idx) => (
                        <div key={idx} className="nearby-card">
                            <div className="nearby-card-header">
                                <a
                                    href={place.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="nearby-card-name"
                                >
                                    {place.name}
                                </a>
                                <span className="nearby-card-distance">
                                    {place.distance >= 1000
                                        ? `${(place.distance / 1000).toFixed(1)}km`
                                        : `${place.distance}m`
                                    }
                                </span>
                            </div>
                            <div className="nearby-card-category" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ 
                                    padding: '1px 5px', 
                                    borderRadius: '4px', 
                                    fontSize: '9px', 
                                    backgroundColor: place.source === 'Google' ? 'rgba(66, 133, 244, 0.15)' : 'rgba(250, 225, 0, 0.15)',
                                    color: place.source === 'Google' ? '#4285F4' : '#c2a300',
                                    border: `1px solid ${place.source === 'Google' ? 'rgba(66, 133, 244, 0.3)' : 'rgba(250, 225, 0, 0.5)'}`
                                }}>
                                    {place.source || 'Kakao'}
                                </span>
                                {place.category}
                            </div>
                            <div className="nearby-card-address">{place.address}</div>
                            {place.phone && (
                                <div className="nearby-card-phone">📞 {place.phone}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
