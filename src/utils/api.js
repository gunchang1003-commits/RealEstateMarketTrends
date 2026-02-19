import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 20000,
});

// Kakao Maps SDK load promise
const kakaoMapsReady = new Promise((resolve) => {
    const check = () => {
        if (typeof window !== 'undefined' && window.kakao && window.kakao.maps && window.kakao.maps.Map) {
            resolve();
        } else {
            setTimeout(check, 100);
        }
    };
    check();
});

export { kakaoMapsReady };

/**
 * 실거래가 데이터 조회
 * @param {string} regionCode - 법정동 코드 (5자리)
 * @param {string} yearMonth - 조회 년월 (YYYYMM)
 */
export async function fetchApartments(regionCode, yearMonth) {
    const { data } = await api.get('/apartments', {
        params: { regionCode, yearMonth },
    });
    return data;
}

/**
 * 아파트 거래 이력 조회
 * @param {string} regionCode - 법정동 코드
 * @param {string} aptName - 아파트명
 * @param {number} months - 조회 개월 수
 */
export async function fetchApartmentHistory(regionCode, aptName, months = 12) {
    const { data } = await api.get('/apartments/history', {
        params: { regionCode, aptName, months },
    });
    return data;
}

/**
 * Geocoding - 주소를 좌표로 변환 (카카오 지도 SDK 사용)
 * @param {string} query - 주소 문자열
 */
export async function geocodeAddress(query) {
    await kakaoMapsReady;
    return new Promise((resolve, reject) => {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(query, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
                const addresses = result.map(item => ({
                    x: item.x,  // longitude
                    y: item.y,  // latitude
                }));
                resolve({ addresses });
            } else {
                resolve({ addresses: [] });
            }
        });
    });
}

export default api;
