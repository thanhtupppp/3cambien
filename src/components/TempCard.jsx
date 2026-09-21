import React from 'react';
import { getSensorStatus } from '../utils/sensorStatus';

export function TempCard({ index, name, temp, online }) {
  // Cấu hình icon và đặc tính theo cảm biến
  const config = [
    {
      role: 'Khí vào dàn lạnh',
      icon: '❄️',
      colorClass: 'card-t1',
    },
    {
      role: 'Khí ra dàn lạnh',
      icon: '💨',
      colorClass: 'card-t2',
    },
    {
      role: 'Ống gas hồi về',
      icon: '🌡️',
      colorClass: 'card-t3',
    }
  ][index] || { role: 'Cảm biến nhiệt', icon: '🌡️', colorClass: 'card-t1' };

  const status = getSensorStatus(index, temp, online);

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
        <span className={`badge-status ${status.className}`}>{status.text}</span>
        <span className="card-role">{config.role}</span>
      </div>
    </div>
  );
}
