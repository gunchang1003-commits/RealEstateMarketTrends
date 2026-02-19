import { useState } from 'react';
import { REGIONS, DISTRICTS } from '../utils/regions';
import { getRecentYearMonths } from '../utils/format';

export default function SearchPanel({ onSearch, loading }) {
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedYearMonth, setSelectedYearMonth] = useState('');

    const yearMonths = getRecentYearMonths(24);
    const districts = selectedRegion ? (DISTRICTS[selectedRegion] || []) : [];

    const handleRegionChange = (e) => {
        setSelectedRegion(e.target.value);
        setSelectedDistrict('');
    };

    const handleSearch = () => {
        if (!selectedDistrict || !selectedYearMonth) return;
        const region = REGIONS.find((r) => r.code === selectedRegion);
        const district = districts.find((d) => d.code === selectedDistrict);
        onSearch(
            selectedDistrict,
            selectedYearMonth,
            region?.name || '',
            district?.name || ''
        );
    };

    const formatYM = (ym) => {
        return `${ym.slice(0, 4)}년 ${parseInt(ym.slice(4), 10)}월`;
    };

    return (
        <div className="search-panel">
            <h3>🔍 지역 검색</h3>

            <div className="search-row">
                <select
                    className="search-select"
                    value={selectedRegion}
                    onChange={handleRegionChange}
                >
                    <option value="">시/도 선택</option>
                    {REGIONS.map((r) => (
                        <option key={r.code} value={r.code}>{r.name}</option>
                    ))}
                </select>
            </div>

            <div className="search-row">
                <select
                    className="search-select"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedRegion}
                >
                    <option value="">시/군/구 선택</option>
                    {districts.map((d) => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                </select>
            </div>

            <div className="search-row">
                <select
                    className="search-select"
                    value={selectedYearMonth}
                    onChange={(e) => setSelectedYearMonth(e.target.value)}
                >
                    <option value="">거래 년월 선택</option>
                    {yearMonths.map((ym) => (
                        <option key={ym} value={ym}>{formatYM(ym)}</option>
                    ))}
                </select>
            </div>

            <button
                className="search-btn"
                onClick={handleSearch}
                disabled={!selectedDistrict || !selectedYearMonth || loading}
            >
                {loading ? (
                    <>
                        <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span>
                        조회중...
                    </>
                ) : (
                    <>🔎 실거래가 조회</>
                )}
            </button>
        </div>
    );
}
