import React, { useMemo } from 'react';
import '../styles/TxvHistoryChart.css';

// Constants
const CHART_WIDTH = 800;
const CHART_HEIGHT = 400;
const PADDING = { top: 40, right: 30, bottom: 60, left: 60 };
const MAX_DATA_POINTS = 20;

// Màu sắc đồ thị
const COLORS = {
  line: '#3b82f6',
  lineGradient: 'rgba(59, 130, 246, 0.1)',
  targetLine: '#10b981',
  grid: '#e5e7eb',
  text: '#6b7280',
  optimal: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444'
};

function TxvHistoryChartComponent({ 
  historyData = [], // [{ timestamp, actualSh, targetSh, action }]
  targetSh = 6
}) {
  // Memoized calculations
  const chartData = useMemo(() => {
    if (!historyData || historyData.length === 0) return { data: [], minSh: 0, maxSh: 12 };
    
    // Limit data points
    const data = historyData.slice(-MAX_DATA_POINTS);
    
    // Calculate min/max SH
    const allSh = data.flatMap(d => [d.actualSh, d.targetSh].filter(v => typeof v === 'number' && !isNaN(v)));
    const minSh = Math.max(0, (allSh.length > 0 ? Math.min(...allSh) : 0) - 2);
    const maxSh = Math.max(targetSh + 4, (allSh.length > 0 ? Math.max(...allSh) : 10) + 2);
    
    return { data, minSh, maxSh };
  }, [historyData, targetSh]);

  const { data, minSh, maxSh } = chartData;

  // Dimensions
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const shRange = (maxSh - minSh) || 1;

  // Scale functions
  const xScale = (index) => PADDING.left + (index / Math.max(1, data.length - 1)) * innerWidth;
  const yScale = (sh) => PADDING.top + innerHeight - ((sh - minSh) / shRange) * innerHeight;

  // Generate path
  const linePath = useMemo(() => {
    if (data.length === 0) return '';
    
    return data.reduce((path, point, index) => {
      const x = xScale(index);
      const y = yScale(point.actualSh);
      return index === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, '');
  }, [data, innerWidth, innerHeight, minSh, maxSh, shRange]);

  // Generate area path
  const areaPath = useMemo(() => {
    if (data.length === 0) return '';
    
    const firstX = xScale(0);
    const lastX = xScale(data.length - 1);
    const baseline = yScale(minSh);
    
    return `${linePath} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
  }, [linePath, minSh, data]);

  // Target line
  const targetY = yScale(targetSh);
  const targetLinePath = `M ${PADDING.left} ${targetY} L ${PADDING.left + innerWidth} ${targetY}`;

  // Optimal zone (4-8K)
  const optimalY1 = yScale(4);
  const optimalY2 = yScale(8);
  const optimalRect = `M ${PADDING.left} ${optimalY1} L ${PADDING.left + innerWidth} ${optimalY1} L ${PADDING.left + innerWidth} ${optimalY2} L ${PADDING.left} ${optimalY2} Z`;

  // Grid lines
  const gridLines = useMemo(() => {
    const lines = [];
    const step = shRange > 10 ? 2 : 1;
    
    for (let sh = Math.ceil(minSh); sh <= Math.floor(maxSh); sh += step) {
      const y = yScale(sh);
      lines.push({ y, value: sh });
    }
    return lines;
  }, [minSh, maxSh, shRange]);

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Get status color
  const getStatusColor = (sh) => {
    if (sh < 4) return COLORS.warning;
    if (sh <= 8) return COLORS.optimal;
    return COLORS.danger;
  };

  return (
    <div className="txv-chart-container">
      <div className="txv-chart-header">
        <h3 className="txv-chart-title">📈 LỊCH SỬ ĐIỀU CHỈNH ĐỘ QUÁ NHIỆT (SUPERHEAT TREND)</h3>
        <div className="txv-chart-legend">
          <span className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: COLORS.line }}></span>
            SH thực tế
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: COLORS.targetLine }}></span>
            Mục tiêu ({targetSh}K)
          </span>
          <span className="legend-item">
            <span className="legend-box" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}></span>
            Vùng tối ưu (4-8K)
          </span>
        </div>
      </div>

      <div className="txv-chart-wrapper">
        {data.length === 0 ? (
          <div className="txv-chart-empty">
            <span className="empty-icon">📊</span>
            <p>Chưa có dữ liệu lịch sử. Thay đổi giá trị hoặc điều chỉnh van TXV để ghi nhận xu hướng.</p>
          </div>
        ) : (
          <svg 
            width={CHART_WIDTH} 
            height={CHART_HEIGHT} 
            className="txv-chart-svg"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          >
            {/* Optimal zone */}
            <path d={optimalRect} fill="rgba(16, 185, 129, 0.12)" />

            {/* Grid lines */}
            {gridLines.map((line, i) => (
              <g key={i}>
                <line
                  x1={PADDING.left}
                  y1={line.y}
                  x2={PADDING.left + innerWidth}
                  y2={line.y}
                  stroke={COLORS.grid}
                  strokeDasharray="4,4"
                />
                <text
                  x={PADDING.left - 10}
                  y={line.y + 4}
                  textAnchor="end"
                  fill={COLORS.text}
                  fontSize="12"
                >
                  {line.value}K
                </text>
              </g>
            ))}

            {/* Target line */}
            <line
              d={targetLinePath}
              x1={PADDING.left}
              y1={targetY}
              x2={PADDING.left + innerWidth}
              y2={targetY}
              stroke={COLORS.targetLine}
              strokeWidth="2"
              strokeDasharray="6,4"
            />
            <text
              x={PADDING.left + innerWidth + 5}
              y={targetY + 4}
              fill={COLORS.targetLine}
              fontSize="12"
              fontWeight="600"
            >
              {targetSh}K
            </text>

            {/* Area fill */}
            <path d={areaPath} fill={COLORS.lineGradient} />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={COLORS.line}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {data.map((point, i) => {
              const x = xScale(i);
              const y = yScale(point.actualSh);
              const color = getStatusColor(point.actualSh);
              
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="white"
                    stroke={color}
                    strokeWidth="3"
                  />
                  {i % 2 === 0 && (
                    <text
                      x={x}
                      y={CHART_HEIGHT - 20}
                      textAnchor="middle"
                      fill={COLORS.text}
                      fontSize="10"
                    >
                      {formatTime(point.timestamp)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Axis labels */}
            <text
              x={PADDING.left + innerWidth / 2}
              y={CHART_HEIGHT - 5}
              textAnchor="middle"
              fill={COLORS.text}
              fontSize="12"
              fontWeight="600"
            >
              Thời gian
            </text>
            <text
              x={15}
              y={PADDING.top + innerHeight / 2}
              textAnchor="middle"
              fill={COLORS.text}
              fontSize="12"
              fontWeight="600"
              transform={`rotate(-90, 15, ${PADDING.top + innerHeight / 2})`}
            >
              Độ quá nhiệt SH (K)
            </text>
          </svg>
        )}
      </div>

      {/* Stats summary */}
      {data.length > 0 && (
        <div className="txv-chart-stats">
          <div className="stat-item">
            <span className="stat-label">Số lần ghi nhận:</span>
            <span className="stat-value">{data.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">SH trung bình:</span>
            <span className="stat-value">
              {(data.reduce((sum, d) => sum + d.actualSh, 0) / data.length).toFixed(1)}K
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">SH hiện tại:</span>
            <span className="stat-value" style={{ color: getStatusColor(data[data.length - 1].actualSh) }}>
              {data[data.length - 1].actualSh}K
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Độ lệch mục tiêu:</span>
            <span className="stat-value">
              {(data[data.length - 1].actualSh - targetSh).toFixed(1)}K
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export const TxvHistoryChart = React.memo(TxvHistoryChartComponent);
export default TxvHistoryChart;
