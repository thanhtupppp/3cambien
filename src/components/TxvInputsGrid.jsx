import React from 'react';
import '../styles/TxvInputsGrid.css';

// Constants cho các mốc quá nhiệt mục tiêu phổ biến của Danfoss
const TARGET_SH_PRESETS = [4.0, 6.0, 8.0];
const DEFAULT_TARGET_SH = 6.0;

function TxvInputsGridComponent({
  opMode,
  evapTemp,
  evapPressure,
  suctionTemp,
  targetSh,
  setTargetSh,
  setSuctionTemp,
  handleEvapTempChange,
  handleEvapPressureChange,
  isAutoSyncSensors,
  setIsAutoSyncSensors,
  targetRoomTemp,
  tdValue,
  liveT1,
  liveT2,
  liveT3,
  evapSource = 't2',
  setEvapSource
}) {
  // Safe defaults
  const safeEvapTemp = typeof evapTemp === 'number' && !isNaN(evapTemp) ? evapTemp : 0;
  const safeEvapPressure = typeof evapPressure === 'number' && !isNaN(evapPressure) ? evapPressure : 0;
  const safeSuctionTemp = typeof suctionTemp === 'number' && !isNaN(suctionTemp) ? suctionTemp : 0;
  const safeTargetSh = typeof targetSh === 'number' && !isNaN(targetSh) ? targetSh : DEFAULT_TARGET_SH;

  // Defensive handlers
  const onEvapTempInput = (e) => {
    if (typeof handleEvapTempChange === 'function') {
      handleEvapTempChange(e.target.value);
    }
  };

  const onEvapPressureInput = (e) => {
    if (typeof handleEvapPressureChange === 'function') {
      handleEvapPressureChange(e.target.value);
    }
  };

  const onSuctionTempInput = (e) => {
    if (typeof setIsAutoSyncSensors === 'function') {
      setIsAutoSyncSensors(false);
    }
    if (typeof setSuctionTemp === 'function') {
      setSuctionTemp(parseFloat(e.target.value) || 0);
    }
  };

  const onQuickSuctionClick = (val) => {
    if (typeof setSuctionTemp === 'function') {
      setSuctionTemp(val);
    }
  };

  const onTargetShChange = (val) => {
    if (typeof setTargetSh === 'function') {
      setTargetSh(val);
    }
  };

  const isLiveT3Valid = liveT3 !== null && liveT3 !== undefined && !isNaN(liveT3);

  return (
    <div className="txv-inputs-grid">
      {/* Khối 1: Nhiệt độ / Áp suất bay hơi (T_evap & P_e) */}
      <div className="txv-input-card">
        <div className="txv-card-header">
          <span className="txv-card-icon">❄️</span>
          <div>
            <div className="txv-card-tag">BAY HƠI BÃO HÒA (EVAPORATING)</div>
            <h4 className="txv-card-title">Điểm Bay Hơi Dàn Lạnh</h4>
          </div>
        </div>

        {/* Lựa chọn nguồn tính T_evap khi ở chế độ live */}
        {opMode === 'live' && (
          <div className="evap-source-group">
            <span className="evap-source-label">Nguồn tính T_evap:</span>
            <div className="evap-source-chips">
              <button
                type="button"
                className={`btn-source-chip ${evapSource === 't2' ? 'active' : ''}`}
                onClick={() => typeof setEvapSource === 'function' && setEvapSource('t2')}
                title="Dùng trực tiếp nhiệt độ T2 đo tại khí ra dàn lạnh"
              >
                🎯 T2 Ra Dàn ({typeof liveT2 === 'number' && !isNaN(liveT2) ? `${Number(liveT2).toFixed(1)}°C` : '--'})
              </button>
              <button
                type="button"
                className={`btn-source-chip ${evapSource === 't1_td' ? 'active' : ''}`}
                onClick={() => typeof setEvapSource === 'function' && setEvapSource('t1_td')}
                title="Tính theo nhiệt độ kho T1 trừ độ chênh thiết kế TD"
              >
                📐 T1 - TD ({typeof liveT1 === 'number' && !isNaN(liveT1) ? `${(liveT1 - (tdValue ?? 7)).toFixed(1)}°C` : '--'})
              </button>
              <button
                type="button"
                className={`btn-source-chip ${evapSource === 'pressure' ? 'active' : ''}`}
                onClick={() => typeof setEvapSource === 'function' && setEvapSource('pressure')}
                title="Tính từ áp suất hút thực tế Pe theo CoolProp (Khuyến nghị chuẩn kỹ thuật Danfoss)"
              >
                🎛️ Áp suất hút Pe (Chuẩn)
              </button>
            </div>
          </div>
        )}

        <div className="txv-card-body">
          <div className="input-group">
            <label className="input-label">Nhiệt độ bay hơi T_evap (°C):</label>
            <div className="neu-well-input">
              <input
                type="number"
                step="0.5"
                value={safeEvapTemp}
                disabled={opMode !== 'manual'}
                onChange={onEvapTempInput}
                className="txv-number-input"
              />
              <span className="input-unit">°C</span>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Áp suất bay hơi Pe (bar):</label>
            <div className="neu-well-input">
              <input
                type="number"
                step="0.1"
                value={safeEvapPressure}
                disabled={opMode !== 'manual' && evapSource !== 'pressure'}
                onChange={onEvapPressureInput}
                className="txv-number-input"
              />
              <span className="input-unit">bar</span>
            </div>
          </div>
        </div>

        {opMode === 'live' && evapSource === 't2' && (
          <span className="sync-footnote">🎯 T_evap lấy trực tiếp từ cảm biến T2 khí ra dàn lạnh</span>
        )}
        {opMode === 'live' && evapSource === 't1_td' && (
          <span className="sync-footnote">
            📐 T_evap = T1 ({typeof liveT1 === 'number' ? `${Number(liveT1).toFixed(1)}°C` : '--'}) - TD ({tdValue ?? 7}K)
          </span>
        )}
        {opMode === 'live' && evapSource === 'pressure' && (
          <span className="sync-footnote">
            🎛️ T_evap tính từ áp suất hút Pe ({safeEvapPressure} bar) theo CoolProp
          </span>
        )}
        {opMode === 'target_room' && (
          <span className="sync-footnote">
            🎯 Tự động tính từ T_kho ({targetRoomTemp ?? -20}°C) - TD ({tdValue ?? 7}K)
          </span>
        )}
      </div>

      {/* Khối 2: Nhiệt độ hơi hút / Bầu cảm nhiệt (T_suction / T_bulb) */}
      <div className="txv-input-card">
        <div className="txv-card-header">
          <span className="txv-card-icon">🌡️</span>
          <div>
            <div className="txv-card-tag">HƠI HÚT VỀ / BẦU CẢM NHIỆT</div>
            <h4 className="txv-card-title">Nhiệt Độ Hơi Hút (Ts)</h4>
          </div>
        </div>

        <div className="txv-card-body">
          <div className="input-group">
            <div className="input-label-row">
              <label className="input-label">Nhiệt độ đo tại ngõ ra dàn lạnh (Ts):</label>
              {isAutoSyncSensors && isLiveT3Valid && (
                <span className="badge-live-sensor" title="Đang tự động lấy từ cảm biến T3">
                  🟢 T3: {Number(liveT3).toFixed(1)}°C
                </span>
              )}
            </div>
            <div className="neu-well-input">
              <input
                type="number"
                step="0.5"
                value={safeSuctionTemp}
                disabled={opMode === 'live'}
                onChange={onSuctionTempInput}
                className="txv-number-input"
              />
              <span className="input-unit">°C</span>
            </div>
          </div>

          <div className="quick-presets">
            <span className="presets-hint">Thử nghiệm:</span>
            <button
              type="button"
              className="btn-quick"
              disabled={opMode === 'live'}
              onClick={() => onQuickSuctionClick(-6.0)}
            >
              -6°C (Thấp)
            </button>
            <button
              type="button"
              className="btn-quick"
              disabled={opMode === 'live'}
              onClick={() => onQuickSuctionClick(Number((safeEvapTemp + safeTargetSh).toFixed(1)))}
            >
              +{safeTargetSh.toFixed(0)}K (Chuẩn)
            </button>
            <button
              type="button"
              className="btn-quick"
              disabled={opMode === 'live'}
              onClick={() => onQuickSuctionClick(18.0)}
            >
              +18°C (Cao)
            </button>
          </div>
        </div>

        {opMode === 'live' && (
          <span className="sync-footnote">⚡ Tự động lấy từ cảm biến T3 ống gas hồi</span>
        )}
        {opMode === 'target_room' && (
          <span className="sync-footnote">🎯 Tự động lấy từ cảm biến T3 khi kéo thanh trượt</span>
        )}
      </div>

      {/* Khối 3: Độ quá nhiệt mục tiêu (Target Superheat) */}
      <div className="txv-input-card">
        <div className="txv-card-header">
          <span className="txv-card-icon">🎯</span>
          <div>
            <div className="txv-card-tag">MỤC TIÊU VẬN HÀNH (TARGET)</div>
            <h4 className="txv-card-title">Độ Quá Nhiệt Mục Tiêu</h4>
          </div>
        </div>

        <div className="txv-card-body">
          <div className="input-group">
            <label className="input-label">Độ quá nhiệt mục tiêu SH_target (K):</label>
            <div className="neu-well-input">
              <input
                type="number"
                step="0.5"
                min="2"
                max="15"
                value={safeTargetSh}
                onChange={(e) => onTargetShChange(parseFloat(e.target.value) || DEFAULT_TARGET_SH)}
                className="txv-number-input"
              />
              <span className="input-unit">K</span>
            </div>
          </div>

          <div className="quick-targets">
            {TARGET_SH_PRESETS.map((t) => (
              <button
                type="button"
                key={t}
                className={`btn-target ${safeTargetSh === t ? 'active' : ''}`}
                onClick={() => onTargetShChange(t)}
              >
                {t} K {t === 6.0 ? '(Chuẩn)' : ''}
              </button>
            ))}
          </div>
        </div>
        <span className="sync-footnote">💡 Danfoss khuyến nghị 5.0 - 8.0 K cho kho lạnh</span>
      </div>
    </div>
  );
}

export const TxvInputsGrid = React.memo(TxvInputsGridComponent);
export default TxvInputsGrid;
