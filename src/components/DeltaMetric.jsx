import React from 'react';

export function DeltaMetric({ t1, t2, deltaT }) {
  const isValid = t1 !== null && t2 !== null && deltaT !== undefined && deltaT !== null;
  const delta = isValid ? Number(deltaT).toFixed(1) : '--.-';

  const getEvaluation = () => {
    if (!isValid) return { text: 'Chưa đủ dữ liệu tính toán', color: 'var(--text-muted)' };
    const val = Number(deltaT);
    if (val >= 10 && val <= 65) {
      return { text: 'Trao đổi nhiệt dàn lạnh hoạt động hiệu quả', color: 'var(--color-optimal)' };
    } else if (val < 10) {
      return { text: 'Chênh nhiệt thấp (Dàn lạnh có thể bị bám tuyết hoặc thiếu gas)', color: 'var(--color-warning)' };
    } else {
      return { text: 'Chênh nhiệt cao bất thường (Cần kiểm tra tải nhiệt)', color: 'var(--color-danger)' };
    }
  };

  const evalResult = getEvaluation();

  return (
    <div className="glass-panel delta-container">
      <div className="delta-left">
        <div className="delta-icon">⚡</div>
        <div>
          <span className="delta-label">HIỆU SUẤT DÀN LẠNH • ĐỘ CHÊNH NHIỆT ĐỘ</span>
          <h2 className="delta-formula">ΔT = T2 (Khí ra) - T1 (Khí vào)</h2>
          <p className="delta-eval" style={{ color: evalResult.color }}>
            {evalResult.text}
          </p>
        </div>
      </div>

      <div className="delta-right">
        <div className="delta-badge">
          <span className="delta-val">{delta}</span>
          <span className="delta-unit">°C</span>
        </div>
      </div>
    </div>
  );
}
