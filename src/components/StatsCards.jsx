import { formatPrice } from '../utils/format';

export default function StatsCards({ apartments, searchInfo }) {
    if (!apartments || apartments.length === 0) {
        return null;
    }

    // Calculate statistics
    const allTransactions = apartments.flatMap((a) => a.transactions);
    const totalCount = allTransactions.length;
    const aptCount = apartments.length;

    const prices = allTransactions.map((t) => t.price).filter((p) => p > 0);
    const avgPrice = prices.length > 0
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

    const areas = allTransactions.map((t) => t.area).filter((a) => a > 0);
    const avgArea = areas.length > 0
        ? (areas.reduce((a, b) => a + b, 0) / areas.length).toFixed(1)
        : 0;

    return (
        <div className="stats-cards animate-fade-in-up">
            <div className="stat-card">
                <div className="stat-label">총 거래건수</div>
                <div className="stat-value">{totalCount.toLocaleString()}</div>
                <div className="stat-sub">{aptCount}개 단지</div>
            </div>

            <div className="stat-card">
                <div className="stat-label">평균 거래가</div>
                <div className="stat-value price">{formatPrice(avgPrice)}</div>
                <div className="stat-sub">{searchInfo.districtName} 기준</div>
            </div>

            <div className="stat-card">
                <div className="stat-label">최고가</div>
                <div className="stat-value up">{formatPrice(maxPrice)}</div>
                <div className="stat-sub">해당 월 기준</div>
            </div>

            <div className="stat-card">
                <div className="stat-label">최저가</div>
                <div className="stat-value down">{formatPrice(minPrice)}</div>
                <div className="stat-sub">평균면적 {avgArea}㎡</div>
            </div>
        </div>
    );
}
