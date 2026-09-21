import React from 'react';

function TxvTelemetryBarComponent({
  liveT1,
  liveT2,
  liveT3,
  isOnline,
  isAutoSyncSensors,
  setIsAutoSyncSensors
}) {
  const toggleAutoSync = () => {
    if (typeof setIsAutoSyncSensors === 'function') {
      setIsAutoSyncSensors(!isAutoSyncSensors);
    }
  };

  // Format nhiệt độ an toàn với nullish check
  const formatTemp = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '--';
    return `${Number(val).toFixed(1)}°C`;
  };

  const statusDotClass = `telemetry-dot ${isOnline ? 'online' : 'demo'}`;
  const syncBtnClass = `btn-sync-toggle ${isAutoSyncSensors ? 'synced' : 'paused'}`;

  return (
    <div className="txv-telemetry-bar">
      <div className="telemetry-col-left">
        <div className="telemetry-live-badge">
          <span className={statusDotClass}></span>
          <span className="telemetry-label">
            {isOnline ? 'TÍN HIỆU CẢM BIẾN REAL-TIME' : 'CHẾ ĐỘ GIẢ LẬP NHIỆT ĐỘ (SLIDERS)'}
          </span>
        </div>

        <div className="telemetry-chips-row">
          <div className="telemetry-chip chip-t1" title="Khí vào dàn lạnh (Nhiệt độ phòng kho)">
            <span className="chip-name">T1 Vào Dàn:</span>
            <span className="chip-val">{formatTemp(liveT1)}</span>
          </div>

          <div className="telemetry-chip chip-t2" title="Khí ra dàn lạnh">
            <span className="chip-name">T2 Ra Dàn:</span>
            <span className="chip-val">{formatTemp(liveT2)}</span>
          </div>

          <div className="telemetry-chip chip-t3 active" title="Ống gas hồi về (Vị trí kẹp bầu cảm nhiệt Danfoss)">
            <span className="chip-name">T3 Gas Hồi (Bầu TXV):</span>
            <span className="chip-val highlight">{formatTemp(liveT3)}</span>
            <span className="chip-indicator">KẸP BẦU TXV</span>
          </div>
        </div>
      </div>

      <div className="telemetry-col-right">
        <button
          type="button"
          className={syncBtnClass}
          onClick={toggleAutoSync}
          title="Bật/Tắt tự động đồng bộ số đo cảm biến vào công cụ tính toán Danfoss"
        >
          <span className="sync-icon">{isAutoSyncSensors ? '⚡' : '⏸'}</span>
          <span>{isAutoSyncSensors ? 'Đang đồng bộ cảm biến' : 'Tạm dừng đồng bộ'}</span>
        </button>
      </div>
    </div>
  );
}

export const TxvTelemetryBar = React.memo(TxvTelemetryBarComponent);
export default TxvTelemetryBar;
