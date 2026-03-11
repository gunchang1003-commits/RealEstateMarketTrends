import express from 'express';
import axios from 'axios';

const router = express.Router();

// Map Kakao categories to Google Place types
const getGoogleType = (category) => {
    switch(category) {
        case 'FD6': return 'restaurant';
        case 'CE7': return 'cafe';
        case 'SC4': return 'school';
        default: return 'point_of_interest';
    }
};

// GET /api/places?lat=37.5&lng=127.0&category=FD6
// category: FD6(음식점), CE7(카페), SC4(학교)
router.get('/', async (req, res) => {
    try {
        const { lat, lng, category = 'FD6', radius = 1000 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'lat, lng 파라미터가 필요합니다.' });
        }

        const kakaoApiKey = process.env.KAKAO_REST_API_KEY;
        const googleApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY; // Read from Vite env var

        let allPlaces = [];

        // 1. Fetch Kakao Places
        if (kakaoApiKey) {
            try {
                const kakaoResponse = await axios.get('https://dapi.kakao.com/v2/local/search/category.json', {
                    params: {
                        category_group_code: category,
                        x: lng,  // longitude
                        y: lat,  // latitude
                        radius: Math.min(Number(radius), 2000), // 최대 2km
                        sort: 'distance',
                        size: 10, // Fetch top 10 from Kakao
                    },
                    headers: { 'Authorization': `KakaoAK ${kakaoApiKey}` },
                    timeout: 5000,
                });

                const documents = kakaoResponse.data.documents || [];
                const kakaoPlaces = documents.map(doc => ({
                    id: `kakao_${doc.id}`,
                    name: doc.place_name,
                    category: doc.category_name.split(' > ').pop() || doc.category_name, // Get last category part
                    address: doc.road_address_name || doc.address_name,
                    distance: Number(doc.distance),
                    phone: doc.phone || '',
                    url: doc.place_url || '',
                    lat: Number(doc.y),
                    lng: Number(doc.x),
                    source: 'Kakao'
                }));
                allPlaces = [...allPlaces, ...kakaoPlaces];
            } catch(e) {
                console.error('Kakao Places Error:', e.message);
            }
        }

        // 2. Fetch Google Places
        if (googleApiKey) {
            try {
                const googleType = getGoogleType(category);
                const googleResponse = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
                    params: {
                        location: `${lat},${lng}`,
                        radius: Math.min(Number(radius), 2000),
                        type: googleType,
                        key: googleApiKey,
                        language: 'ko'
                    },
                    timeout: 5000,
                });

                const results = googleResponse.data.results || [];
                
                // Google Places API doesn't return exact distance, so calculate Haversine distance
                const calcDistance = (lat1, lon1, lat2, lon2) => {
                    const R = 6371e3; // metres
                    const φ1 = lat1 * Math.PI/180;
                    const φ2 = lat2 * Math.PI/180;
                    const Δφ = (lat2-lat1) * Math.PI/180;
                    const Δλ = (lon2-lon1) * Math.PI/180;
                    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                    return Math.round(R * c);
                };

                const googlePlaces = results.slice(0, 10).map(doc => {
                    const placeLat = doc.geometry.location.lat;
                    const placeLng = doc.geometry.location.lng;
                    return {
                        id: `google_${doc.place_id}`,
                        name: doc.name,
                        category: googleType === 'restaurant' ? '음식점' : googleType === 'cafe' ? '카페' : googleType === 'school' ? '학교' : '관심장소',
                        address: doc.vicinity || '',
                        distance: calcDistance(Number(lat), Number(lng), placeLat, placeLng),
                        phone: '', // Detailed place info API needed for phone/url
                        url: `https://www.google.com/maps/search/?api=1&query=${placeLat},${placeLng}&query_place_id=${doc.place_id}`,
                        lat: placeLat,
                        lng: placeLng,
                        source: 'Google'
                    };
                });
                allPlaces = [...allPlaces, ...googlePlaces];

            } catch(e) {
                console.error('Google Places Error:', e.message);
            }
        }

        // 3. Merge, Deduplicate and Sort
        // Simple deduplication based on exact name string similarity or distance could be complex. 
        // For now, we'll sort by distance and limit to top 15 results.
        
        allPlaces.sort((a, b) => a.distance - b.distance);
        
        // Remove places too far
        allPlaces = allPlaces.filter(p => p.distance <= Number(radius));

        res.json({ places: allPlaces.slice(0, 15) });
    } catch (error) {
        console.error('Places API 호출 오류:', error.message);
        res.status(500).json({ error: '주변 장소 검색 실패', detail: error.message });
    }
});

export default router;
