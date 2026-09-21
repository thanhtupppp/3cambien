import React from 'react';

export function TempCard({ index, name, temp, online }) {
  // Cấu hình icon và đặc tính theo cảm biến
  const config = [
    {
      role: 'Khí vào dàn lạnh',
      icon: '❄️',
      colorClass: 'card-t1',
      thresholdType: 'cold', // càng lạnh càng tốt
    },
    {
      role: 'Khí ra dàn lạnh',
      icon: '💨',
      colorClass: 'card-t2',
      thresholdType: 'medium',
    },
    {
      role: 'Ống gas hồi về',
      icon: '🌡️',
      colorClass: 'card-t3',
      thresholdType: 'gas',
    }
  ][index] || { role: 'Cảm biến nhiệt', icon: '🌡️', colorClass: 'card-t1' };

  const getStatusLabel = () => {
    if (!online || temp === null) return { text: 'MẤT TÍN HIỆU', class: 'status-error' };
    if (temp < 0) return { text: 'LẠNH SÂU', class: 'status-cold' };
    if (temp <= 15) return { text: 'ĐẠT CHUẨN', class: 'status-optimal' };
    if (temp <= 35) return { text: 'BÌNH THƯỜNG', class: 'status-normal' };
    return { text: 'QUÁ NHIỆT', class: 'status-warning' };
  };

  const status = getStatusLabel();

  return (
    <div className={`glass-panel temp-card ${config.colorClass} ${!online ? 'card-offline' : ''}`}>
      <div className="card-header">
        <div className="card-icon">{config.icon}</div>
        <div className="card-titles">
          <span className="card-tag">SENSOR #{index + 1}</span>
          <h3 className="card-name">{name || `Cảm biến ${index + 1}`}</h3>
        </div>
      </div>

      <div className="card-body">
        {online && temp !== null ? (
          <div className="temp-display">
            <span className="temp-number">{temp.toFixed(1)}</span>
            <span className="temp-unit">°C</span>
          </div>
        ) : (
          <div className="temp-display error">
            <span className="temp-number">--.-</span>
            <span className="temp-unit">°C</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className={`badge-status ${status.class}`}>{status.text}</span>
        <span className="card-role">{config.role}</span>
      </div>
    </div>
  );
}
