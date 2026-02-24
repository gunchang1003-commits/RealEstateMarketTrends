import { useState } from 'react';
import { REGIONS, DISTRICTS } from '../utils/regions';
import { getRecentYearMonths } from '../utils/format';

export default function SearchPanel({ onSearch, loading }) {
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedYearMonth, setSelectedYearMonth] = useState('');
    const [keyword, setKeyword] = useState('');

    const yearMonths = getRecentYearMonths(24);
    const districts = selectedRegion ? (DISTRICTS[selectedRegion] || []) : [];

    const handleRegionChange = (e) => {
        setSelectedRegion(e.target.value);
        setSelectedDistrict('');
    };

    const handleSearch = () => {
        if (!selectedDistrict) return;
        // Either yearMonth or keyword must be provided
        if (!selectedYearMonth && !keyword) return;

        const region = REGIONS.find((r) => r.code === selectedRegion);
        const district = districts.find((d) => d.code === selectedDistrict);
        onSearch(
            selectedDistrict,
            selectedYearMonth,
            region?.name || '',
            district?.name || '',
            keyword.trim()
        );
    };

    const formatYM = (ym) => {
        return `${ym.slice(0, 4)}년 ${parseInt(ym.slice(4), 10)}월`;
    };

    // disable search if no district is selected, or if BOTH yearMonth and keyword are empty
    const isSearchDisabled = !selectedDistrict || (!selectedYearMonth && !keyword.trim()) || loading;

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

            <div className="search-row" style={{ display: 'flex', gap: '8px' }}>
                <select
                    className="search-select"
                    value={selectedYearMonth}
                    onChange={(e) => setSelectedYearMonth(e.target.value)}
                    style={{ flex: 1 }}
                >
                    <option value="">거래 년월 선택 (선택)</option>
                    {yearMonths.map((ym) => (
                        <option key={ym} value={ym}>{formatYM(ym)}</option>
                    ))}
                </select>
                <input
                    type="text"
                    className="search-input"
                    placeholder="아파트명 (선택)"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isSearchDisabled) {
                            handleSearch();
                        }
                    }}
                    style={{ flex: 1 }}
                />
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', marginTop: '-4px', textAlign: 'right' }}>
                * 아파트명 입력 시 최근 6개월 거래 내역을 모두 검색합니다.
            </div>

            <button
                className="search-btn"
                onClick={handleSearch}
                disabled={isSearchDisabled}
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
