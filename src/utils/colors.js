/**
 * 가격 변동률에 따른 마커 색상 반환
 */
export function getMarkerColor(changeRate) {
    if (changeRate === null || changeRate === undefined) return '#6b7085'; // neutral
    const rate = parseFloat(changeRate);
    if (rate > 5) return '#ef4444';       // 급등 - red
    if (rate > 2) return '#f97316';       // 상승 - orange
    if (rate > 0) return '#f59e0b';       // 소폭상승 - amber
    if (rate === 0) return '#6b7085';     // 보합 - gray
    if (rate > -2) return '#06b6d4';      // 소폭하락 - cyan
    if (rate > -5) return '#3b82f6';      // 하락 - blue
    return '#8b5cf6';                      // 급락 - purple
}

/**
 * 가격 레벨에 따른 마커 색상 반환
 */
export function getMarkerColorByPrice(priceInManwon) {
    const num = parseInt(priceInManwon, 10);
    if (num >= 200000) return '#ef4444';   // 20억 이상
    if (num >= 150000) return '#f97316';   // 15억 이상
    if (num >= 100000) return '#f59e0b';   // 10억 이상
    if (num >= 70000) return '#22c55e';    // 7억 이상
    if (num >= 50000) return '#06b6d4';    // 5억 이상
    if (num >= 30000) return '#3b82f6';    // 3억 이상
    return '#8b5cf6';                       // 3억 미만
}

/**
 * 가격 레벨에 따른 배경색(투명)
 */
export function getMarkerBgColor(priceInManwon) {
    const color = getMarkerColorByPrice(priceInManwon);
    return color + '25'; // 15% opacity
}
