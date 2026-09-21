import React from 'react';
import { evaluateDeltaAir } from '../utils/temperatureMetrics';

const STATUS_COLORS = {
  optimal: 'var(--color-optimal)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  unavailable: 'var(--neu-ink-muted)'
};

export function DeltaMetric({ t1, t2, deltaAir }) {
  const isValid = Number.isFinite(t1) && Number.isFinite(t2) && Number.isFinite(deltaAir);
  const delta = isValid ? deltaAir.toFixed(1) : '--.-';
  const evaluation = evaluateDeltaAir(isValid ? deltaAir : null);

  return (
    <div className="glass-panel delta-container">
      <div className="delta-left">
        <div className="delta-icon">⚡</div>
        <div>
          <span className="delta-label">HIỆU SUẤT DÀN LẠNH • ĐỘ GIẢM NHIỆT KHÔNG KHÍ</span>
          <h2 className="delta-formula">ΔTair = T1 (Khí vào) - T2 (Khí ra)</h2>
          <p className="delta-eval" style={{ color: STATUS_COLORS[evaluation.status] }}>
            {evaluation.text}
          </p>
        </div>
      </div>

      <div className="delta-right">
        <div className="delta-badge">
          <span className="delta-val">{delta}</span>
          <span className="delta-unit">K</span>
        </div>
      </div>
    </div>
  );
}
