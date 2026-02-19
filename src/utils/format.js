/**
 * 가격 포맷 (만원 → 억/만원)
 */
export function formatPrice(priceInManwon) {
    const num = parseInt(priceInManwon, 10);
    if (isNaN(num)) return '–';
    if (num >= 10000) {
        const eok = Math.floor(num / 10000);
        const man = num % 10000;
        return man > 0 ? `${eok}억 ${man.toLocaleString()}만` : `${eok}억`;
    }
    return `${num.toLocaleString()}만`;
}

/**
 * 간략 가격 포맷 (마커용)
 */
export function formatPriceShort(priceInManwon) {
    const num = parseInt(priceInManwon, 10);
    if (isNaN(num)) return '–';
    if (num >= 10000) {
        const eok = (num / 10000).toFixed(1);
        return `${eok}억`;
    }
    return `${(num / 1000).toFixed(1)}천`;
}

/**
 * 면적 변환 (㎡ → 평)
 */
export function sqmToPyeong(sqm) {
    return (sqm / 3.305785).toFixed(1);
}

/**
 * 날짜 포맷
 */
export function formatDealDate(year, month, day) {
    return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
}

/**
 * 년월 생성 (최근 N개월)
 */
export function getRecentYearMonths(count = 12) {
    const result = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        result.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return result;
}

/**
 * 변동률 계산
 */
export function calcChangeRate(currentPrice, previousPrice) {
    if (!previousPrice || previousPrice === 0) return null;
    return ((currentPrice - previousPrice) / previousPrice * 100).toFixed(1);
}
