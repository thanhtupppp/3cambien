import React from 'react';
import '../styles/TxvResultPanel.css';

// Constants
const GAUGE_MAX_SH = 18;
const GAUGE_MIN_PERCENT = 5;
const DEFAULT_TARGET_SH = 6.0;
const DEFAULT_VALVE_NAME = 'Van Danfoss';

// Helper functions - pure, testable
const calculateGaugeFillPercent = (actualSh) => {
  const percent = (actualSh / GAUGE_MAX_SH) * 100;
  return Math.min(Math.max(percent, GAUGE_MIN_PERCENT), 100);
};

const calculateTargetMarkerPercent = (targetSh) => {
  const percent = (targetSh / GAUGE_MAX_SH) * 100;
  return Math.min(Math.max(percent, 0), 100);
};

const getGaugeColor = (sh) => {
  if (sh < 4) return 'var(--color-cold)';
  if (sh <= 8) return 'var(--color-optimal)';
  return 'var(--color-danger)';
};

const formatDelta = (delta) => {
  if (delta === null || delta === undefined || isNaN(delta)) return '--';
  return delta > 0 ? `+${delta}` : delta;
};

const formatTemp = (temp) => {
  if (temp === null || temp === undefined || isNaN(temp)) return '--';
  return Number(temp).toFixed(1);
};

function TxvResultPanelComponent({
  actualSh,
  deltaSh,
  suctionTemp,
  evapTemp,
  targetSh,
  recommendation = {},
  currentValve = {},
  evapSource = 't2'
}) {
  // Safe defaults với type validation
  const safeActualSh = typeof actualSh === 'number' && !isNaN(actualSh) ? actualSh : 0;
  const safeTargetSh = typeof targetSh === 'number' && !isNaN(targetSh) ? targetSh : DEFAULT_TARGET_SH;
  const safeDeltaSh = typeof deltaSh === 'number' && !isNaN(deltaSh) ? deltaSh : 0;
  const safeSuction = typeof suctionTemp === 'number' && !isNaN(suctionTemp) ? suctionTemp : 0;
  const safeEvap = typeof evapTemp === 'number' && !isNaN(evapTemp) ? evapTemp : 0;

  // Tính toán dẫn xuất
  const gaugeFillPercent = calculateGaugeFillPercent(safeActualSh);
  const targetMarkerPercent = calculateTargetMarkerPercent(safeTargetSh);
  const gaugeColor = getGaugeColor(safeActualSh);

  // Safe property access với defaults
  const status = recommendation.status ?? 'optimal';
  const statusText = recommendation.statusText ?? 'ĐẠT CHUẨN DANFOSS';
  const direction = recommendation.direction ?? 'NONE';
  const turnsFraction = recommendation.turnsFraction ?? '0 vòng';
  const text = recommendation.text ?? 'Hệ thống đang hoạt động ở trạng thái ổn định.';
  const valveName = currentValve.name ?? DEFAULT_VALVE_NAME;

  // Class names
  const statusClass = `status-badge-lg ${status}`;
  const deltaClass = `sh-number ${
    safeDeltaSh > 0 ? 'delta-high' : safeDeltaSh < 0 ? 'delta-low' : ''
  }`;
  const screwDiscClass = `neu-screw-disc ${direction.toLowerCase()}`;

  return (
    <div className="txv-result-panel">
      {/* Cột trái: Đồng hồ số và đánh giá trạng thái */}
      <div className="result-metric-box">
        <div className="result-metric-header">
          <span className="result-metric-tag">KẾT QUẢ ĐỘ QUÁ NHIỆT HIỆN TẠI</span>
          <div className={statusClass}>
            {statusText}
          </div>
        </div>

        <div className="metric-displays-row">
          <div className="sh-display-well">
            <span className="sh-well-label">Độ Quá Nhiệt Thực Tế (SH)</span>
            <div className="sh-well-value">
              <span className="sh-number">{safeActualSh}</span>
              <span className="sh-unit">K (°C)</span>
            </div>
            <span className="sh-formula">
              Ts ({formatTemp(safeSuction)}°C) - Te ({formatTemp(safeEvap)}°C)
            </span>
            <span className="sh-source-tag">
              (Nguồn Te: {
                evapSource === 't2' ? 'T2 khí ra dàn' :
                evapSource === 't1_td' ? 'T1 - TD' :
                'Áp suất hút Pe'
              })
            </span>
          </div>

          <div className="sh-display-well">
            <span className="sh-well-label">Độ Lệch Mục Tiêu (ΔSH)</span>
            <div className="sh-well-value">
              <span className={deltaClass}>
                {formatDelta(safeDeltaSh)}
              </span>
              <span className="sh-unit">K</span>
            </div>
            <span className="sh-formula">
              SH ({safeActualSh}K) - Mục tiêu ({safeTargetSh}K)
            </span>
          </div>
        </div>

        <div className="sh-gauge-container">
          <div className="gauge-labels">
            <span className="g-label flood">0K (Ngập lỏng)</span>
            <span className="g-label opt">4K - 8K (Tối ưu)</span>
            <span className="g-label starve">15K+ (Thiếu gas)</span>
          </div>
          <div className="neu-gauge-track">
            <div
              className="neu-gauge-fill"
              style={{
                width: `${gaugeFillPercent}%`,
                backgroundColor: gaugeColor
              }}
            />
            <div
              className="gauge-target-marker"
              style={{ left: `${targetMarkerPercent}%` }}
              title={`Mục tiêu: ${safeTargetSh}K`}
            >
              🎯
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải: Vít vặn Danfoss 3D và Hướng Dẫn */}
      <div className="result-tuner-screw-box">
        <div className="screw-header">
          <span className="screw-tag">HƯỚNG DẪN ĐIỀU CHỈNH VÍT DANFOSS TXV</span>
          <h3 className="screw-valve-title">{valveName}</h3>
        </div>

        <div className="screw-interactive-area">
          <div className={screwDiscClass}>
            <div className="screw-center-groove">
              <div className="screw-slot-horizontal" />
              <div className="screw-slot-vertical" />
            </div>
            {direction === 'CW' && <div className="screw-arrow-cw">↻ CW</div>}
            {direction === 'CCW' && <div className="screw-arrow-ccw">↺ CCW</div>}
            {direction === 'NONE' && <div className="screw-ok-badge">✔ OK</div>}
          </div>

          <div className="screw-action-details">
            <div className="action-direction-box">
              <span className="action-label">Hành động khuyến nghị:</span>
              <div className="action-direction-text">
                {direction === 'CW' && (
                  <span className="dir-cw">
                    👉 Xoay {turnsFraction} THEO chiều kim đồng hồ (CW)
                  </span>
                )}
                {direction === 'CCW' && (
                  <span className="dir-ccw">
                    👉 Xoay {turnsFraction} NGƯỢC chiều kim đồng hồ (CCW)
                  </span>
                )}
                {direction === 'NONE' && (
                  <span className="dir-ok">
                    ✅ Giữ nguyên vị trí ốc vít hiện tại
                  </span>
                )}
              </div>
            </div>

            <p className="action-explanation">{text}</p>

            <div className="danfoss-rule-alert">
              <span className="alert-icon">⏱️</span>
              <div className="alert-text">
                <strong>Quy tắc kỹ thuật Danfoss:</strong> Luôn đợi ít nhất{' '}
                <strong>15 - 20 phút</strong> sau khi vặn vít để toàn bộ dàn lạnh
                và bầu cảm nhiệt đạt trạng thái ổn định mới đo lại.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const TxvResultPanel = React.memo(TxvResultPanelComponent);
export default TxvResultPanel;
