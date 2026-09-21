import React from 'react';

// Constants - tách ra ngoài component để tránh tái khởi tạo mỗi lần render
const ROOM_PRESETS = [
  { label: '🧊 Kho đông -18°C', temp: -18.0 },
  { label: '❄️ Kho đông sâu -20°C', temp: -20.0 },
  { label: '🥶 Cấp đông -22°C', temp: -22.0 },
  { label: '⚡ Cấp đông sâu -25°C', temp: -25.0 },
  { label: '❄️ Cực lạnh IQF -40°C', temp: -40.0 },
  { label: '🍎 Kho mát +2°C', temp: 2.0 },
  { label: '🥬 Kho mát +4°C', temp: 4.0 }
];

const TD_OPTIONS = [
  { td: 6.0, desc: '6K (Độ ẩm cao)' },
  { td: 7.0, desc: '7K (Chuẩn Danfoss)' },
  { td: 8.0, desc: '8K (Hút ẩm nhanh)' }
];

const PSI_CONVERSION_FACTOR = 14.5038;

function RoomTargetPanelComponent({
  targetRoomTemp,
  tdValue,
  liveT1,
  applyRoomTempTarget,
  evapTemp,
  evapPressure,
  targetSh,
  currentRef
}) {
  // Memoized handler
  const safeApplyRoomTemp = React.useCallback((temp, td) => {
    if (typeof applyRoomTempTarget === 'function') {
      applyRoomTempTarget(temp, td);
    }
  }, [applyRoomTempTarget]);

  // Tính toán các giá trị phái sinh với safe defaults
  const safeEvapPressure = typeof evapPressure === 'number' ? evapPressure : 0;
  const safeEvapTemp = typeof evapTemp === 'number' ? evapTemp : 0;
  const safeTargetSh = typeof targetSh === 'number' ? targetSh : 6;
  const safeTdValue = typeof tdValue === 'number' ? tdValue : 7;
  const safeTargetRoomTemp = typeof targetRoomTemp === 'number' ? targetRoomTemp : -20;

  const evapPressurePsi = safeEvapPressure * PSI_CONVERSION_FACTOR;
  const targetSuctionTemp = (safeEvapTemp + safeTargetSh).toFixed(1);
  const cutOutPressure = Math.max(0.1, safeEvapPressure - 0.5);
  const cutInPressure = safeEvapPressure + 0.8;

  // Format số an toàn
  const formatNumber = React.useCallback((num, decimals = 1) => {
    if (num === null || num === undefined || isNaN(num)) return '--';
    return Number(num).toFixed(decimals);
  }, []);

  // Check liveT1 valid
  const hasValidLiveT1 = liveT1 !== null && 
                         liveT1 !== undefined && 
                         typeof liveT1 === 'number' && 
                         !isNaN(liveT1);

  return (
    <div className="txv-room-target-panel">
      <div className="room-target-header">
        <div className="room-target-title-box">
          <span className="room-target-icon">🎯</span>
          <div>
            <h3 className="room-target-title">CÀI ĐẶT THEO NHIỆT ĐỘ PHÒNG KHO MONG MUỐN</h3>
            <p className="room-target-subtitle">
              Chọn hoặc nhập nhiệt độ kho cần đạt. Hệ thống CoolProp sẽ tự động tính toán nhiệt độ bay hơi, áp suất đồng hồ gas và hướng dẫn vặn vít van Danfoss.
            </p>
          </div>
        </div>
      </div>

      <div className="room-presets-row">
        <span className="room-presets-label">Mốc nhiệt độ kho phổ biến:</span>
        {ROOM_PRESETS.map((p) => (
          <button
            type="button"
            key={p.temp}
            className={`btn-room-preset ${targetRoomTemp === p.temp ? 'active' : ''}`}
            onClick={() => safeApplyRoomTemp(p.temp, safeTdValue)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="room-controls-row">
        <div className="room-input-box">
          <div className="room-input-label-row">
            <label className="room-input-label">Nhiệt độ kho mong muốn (T_kho):</label>
            {hasValidLiveT1 && (
              <button
                type="button"
                className="btn-use-live-t1"
                onClick={() => safeApplyRoomTemp(Number(liveT1).toFixed(1), safeTdValue)}
                title="Lấy trực tiếp nhiệt độ T1 từ cảm biến làm nhiệt độ phòng kho"
              >
                📥 Dùng T1 ({formatNumber(liveT1)}°C)
              </button>
            )}
          </div>
          <div className="neu-well-input">
            <input
              type="number"
              step="0.5"
              value={safeTargetRoomTemp}
              onChange={(e) => safeApplyRoomTemp(parseFloat(e.target.value) || 0, safeTdValue)}
              className="txv-number-input"
            />
            <span className="input-unit">°C</span>
          </div>
        </div>

        <div className="room-input-box">
          <label className="room-input-label">Độ chênh nhiệt dàn lạnh TD (T_kho - T_bay_hơi):</label>
          <div className="td-buttons-group">
            {TD_OPTIONS.map((item) => (
              <button
                type="button"
                key={item.td}
                className={`btn-td-chip ${tdValue === item.td ? 'active' : ''}`}
                onClick={() => safeApplyRoomTemp(safeTargetRoomTemp, item.td)}
              >
                {item.desc}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="room-calc-summary">
        <div className="summary-item">
          <span className="summary-label">Nhiệt độ bay hơi cần đạt (T_evap):</span>
          <span className="summary-val highlight-cold">{formatNumber(evapTemp)}°C</span>
          <span className="summary-sub">
            T_kho ({formatNumber(safeTargetRoomTemp)}°C) - TD ({formatNumber(safeTdValue)}K)
          </span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Áp suất bay hơi bão hòa (Đồng hồ gas Pe):</span>
          <span className="summary-val highlight-pressure">{formatNumber(evapPressure)} bar</span>
          <span className="summary-sub">
            ~{formatNumber(evapPressurePsi)} psi (Gas {currentRef?.id ?? 'N/A'})
          </span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Nhiệt độ hơi hút cần đo tại bầu Danfoss:</span>
          <span className="summary-val highlight-suction">{targetSuctionTemp}°C</span>
          <span className="summary-sub">
            T_evap ({formatNumber(safeEvapTemp)}°C) + SH ({formatNumber(safeTargetSh)}K)
          </span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Gợi ý cài Rơ-le áp suất thấp Danfoss KP1:</span>
          <span className="summary-val highlight-kp">
            Cut-out: {formatNumber(cutOutPressure, 2)} bar
          </span>
          <span className="summary-sub">
            Cut-in: {formatNumber(cutInPressure, 2)} bar (Diff: 1.3 bar)
          </span>
        </div>
      </div>
    </div>
  );
}

export const RoomTargetPanel = React.memo(RoomTargetPanelComponent);
export default RoomTargetPanel;
