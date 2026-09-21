import React, { useMemo } from 'react';

export function RealtimeChart({ history }) {
  const width = 1000;
  const height = 240;
  const padding = { top: 25, right: 30, bottom: 35, left: 50 };

  const chartData = useMemo(() => {
    if (!history || history.length === 0) return { pointsT1: '', pointsT2: '', pointsT3: '', minTemp: 0, maxTemp: 60 };

    const validTemps = history
      .flatMap((h) => [h.t1, h.t2, h.t3])
      .filter((v) => v !== null && v !== undefined && !isNaN(v));

    let min = validTemps.length ? Math.min(...validTemps) : -10;
    let max = validTemps.length ? Math.max(...validTemps) : 60;

    // Thêm padding cho khoảng nhiệt độ
    min = Math.floor(min - 5);
    max = Math.ceil(max + 5);
    if (max - min < 20) max = min + 20;

    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const getX = (index, total) => {
      if (total <= 1) return padding.left;
      return padding.left + (index / (total - 1)) * innerW;
    };

    const getY = (val) => {
      if (val === null || val === undefined || isNaN(val)) return null;
      const ratio = (val - min) / (max - min);
      return padding.top + innerH - ratio * innerH;
    };

    const createPath = (key) => {
      const pts = history
        .map((h, i) => {
          const y = getY(h[key]);
          if (y === null) return null;
          return `${getX(i, history.length)},${y.toFixed(1)}`;
        })
        .filter(Boolean);

      return pts.length ? `M ${pts.join(' L ')}` : '';
    };

    return {
      pointsT1: createPath('t1'),
      pointsT2: createPath('t2'),
      pointsT3: createPath('t3'),
      minTemp: min,
      maxTemp: max,
      count: history.length
    };
  }, [history]);

  // Các mốc nhiệt độ trục Y
  const yTicks = useMemo(() => {
    const { minTemp, maxTemp } = chartData;
    const step = (maxTemp - minTemp) / 4;
    return [0, 1, 2, 3, 4].map((i) => {
      const val = minTemp + step * i;
      const y = padding.top + (height - padding.top - padding.bottom) * (1 - i / 4);
      return { val: Math.round(val), y };
    });
  }, [chartData]);

  return (
    <div className="glass-panel chart-container">
      <div className="chart-header">
        <div className="chart-title-box">
          <span className="chart-icon">📈</span>
          <h3>BIẾN THIÊN NHIỆT ĐỘ THỜI GIAN THỰC</h3>
          <span className="chart-subtitle">({history.length} mẫu đo gần nhất)</span>
        </div>

        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color t1"></span>
            <span>T1: Vào dàn lạnh</span>
          </div>
          <div className="legend-item">
            <span className="legend-color t2"></span>
            <span>T2: Ra dàn lạnh</span>
          </div>
          <div className="legend-item">
            <span className="legend-color t3"></span>
            <span>T3: Gas hồi về</span>
          </div>
        </div>
      </div>

      <div className="svg-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="realtime-svg">
          {/* Lưới trục Y */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="var(--neu-ink-muted)"
                strokeOpacity="0.2"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                fill="var(--neu-ink-muted)"
                fontSize="11"
                textAnchor="end"
                fontFamily="var(--font-mono)"
              >
                {tick.val}°C
              </text>
            </g>
          ))}

          {/* Đường T3: Gas hồi về (Tím) */}
          {chartData.pointsT3 && (
            <path
              d={chartData.pointsT3}
              fill="none"
              stroke="var(--color-purple)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Đường T2: Ra dàn lạnh (Cam) */}
          {chartData.pointsT2 && (
            <path
              d={chartData.pointsT2}
              fill="none"
              stroke="var(--color-warning)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Đường T1: Vào dàn lạnh (Xanh lam) */}
          {chartData.pointsT1 && (
            <path
              d={chartData.pointsT1}
              fill="none"
              stroke="var(--color-cold)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
