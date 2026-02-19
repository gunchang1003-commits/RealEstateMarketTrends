import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 20000,
});

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
 * Geocoding - 주소를 좌표로 변환
 * @param {string} query - 주소 문자열
 */
export async function geocodeAddress(query) {
    const { data } = await api.get('/geocode', { params: { query } });
    return data;
}

export default api;
