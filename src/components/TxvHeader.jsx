import React from 'react';
import '../styles/TxvHeader.css';

function TxvHeaderComponent({
  opMode,
  setOpMode,
  targetRoomTemp,
  tdValue,
  applyRoomTempTarget
}) {
  // Defensive handler an toàn khi gọi hàm
  const safeApplyRoomTemp = () => {
    if (typeof setOpMode === 'function') {
      setOpMode('target_room');
    }
    if (typeof applyRoomTempTarget === 'function') {
      applyRoomTempTarget(targetRoomTemp ?? -20.0, tdValue ?? 7.0);
    }
  };

  const handleModeChange = (mode) => {
    if (typeof setOpMode === 'function') {
      setOpMode(mode);
    }
  };

  return (
    <div className="txv-header">
      <div className="txv-title-box">
        <div className="txv-logo-badge">❄️ ⚙️</div>
        <div>
          <div className="txv-badge-tag">DANFOSS REF TOOLS • CHUẨN KỸ THUẬT LẠNH</div>
          <h2 className="txv-title">BỘ ĐIỀU CHỈNH QUÁ NHIỆT TXV (SUPERHEAT TUNER)</h2>
          <p className="txv-subtitle">
            Tính toán độ quá nhiệt SH = T_suction - T_evap và chỉ dẫn số vòng vặn vít van tiết lưu Danfoss
          </p>
        </div>
      </div>

      {/* Bộ chọn 3 chế độ tính toán */}
      <div className="txv-mode-selector">
        <button
          type="button"
          className={`btn-mode-pill ${opMode === 'target_room' ? 'active' : ''}`}
          onClick={safeApplyRoomTemp}
          title="Nhập nhiệt độ phòng kho mong muốn (-20°C, -22°C...) để tự động tính áp suất và chỉnh van"
        >
          🎯 Theo Nhiệt Độ Kho Mong Muốn
        </button>
        <button
          type="button"
          className={`btn-mode-pill ${opMode === 'live' ? 'active' : ''}`}
          onClick={() => handleModeChange('live')}
          title="Lấy trực tiếp nhiệt độ T1 vào dàn và T3 gas hồi từ cảm biến hệ thống"
        >
          🔗 Đồng Bộ Cảm Biến Thực Tế
        </button>
        <button
          type="button"
          className={`btn-mode-pill ${opMode === 'manual' ? 'active' : ''}`}
          onClick={() => handleModeChange('manual')}
          title="Nhập tay tự do nhiệt độ hoặc áp suất bay hơi"
        >
          ⌨️ Nhập Thủ Công (P - T)
        </button>
      </div>
    </div>
  );
}

export const TxvHeader = React.memo(TxvHeaderComponent);
export default TxvHeader;
