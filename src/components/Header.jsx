import React from 'react';
import { CONNECTION_STATUS } from '../constants/connectionStatus';

export function Header({
  connectionStatus,
  pollingInterval,
  setPollingInterval,
  uptime,
  isDemoMode,
  toggleDemoMode,
  refetch,
  theme,
  toggleTheme
}) {
  const formatUptime = (ms) => {
    if (ms === null || ms === undefined || !Number.isFinite(Number(ms))) return '--:--:--';
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const getStatusBadge = () => {
    if (isDemoMode) {
      return (
        <div className="status-badge demo" role="status" aria-live="polite">
          <span className="status-dot"></span>
          <span>CHẾ ĐỘ DEMO</span>
        </div>
      );
    }

    switch (connectionStatus) {
      case CONNECTION_STATUS.CONNECTED:
        return (
          <div className="status-badge connected" role="status" aria-live="polite">
            <span className="status-dot"></span>
            <span>ESP32 ONLINE</span>
          </div>
        );
      case CONNECTION_STATUS.RECONNECTING:
        return (
          <div className="status-badge reconnecting" role="status" aria-live="polite">
            <span className="status-dot"></span>
            <span>ĐANG KẾT NỐI LẠI...</span>
          </div>
        );
      default:
        return (
          <div className="status-badge offline" role="status" aria-live="polite">
            <span className="status-dot"></span>
            <span>ESP32 OFFLINE</span>
          </div>
        );
    }
  };

  return (
    <header className="neu-panel header-container">
      <div className="header-left">
        <div className="header-logo" aria-hidden="true">❄️</div>
        <div>
          <h1 className="header-title">HỆ THỐNG GIÁM SÁT DÀN LẠNH</h1>
          <p className="header-subtitle">Neumorphism Design • Giám sát nhiệt độ thời gian thực</p>
        </div>
      </div>

      <div className="header-right">
        {getStatusBadge()}

        <button
          onClick={toggleDemoMode}
          className={`btn-demo ${isDemoMode ? 'active' : ''}`}
          aria-pressed={isDemoMode}
          title="Bật/Tắt dữ liệu mẫu thử nghiệm giao diện"
        >
          {isDemoMode ? '⚡ Tắt Demo' : '🧪 Thử Demo'}
        </button>

        <button
          onClick={toggleTheme}
          className="btn-theme"
          title={`Chuyển sang giao diện Neumorphism ${theme === 'dark' ? 'Sáng' : 'Tối'}`}
          aria-label={`Chuyển theme sang ${theme === 'dark' ? 'Sáng' : 'Tối'}`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="uptime-box" title="Thời gian hệ thống hoạt động">
          <span className="uptime-label">Uptime:</span>
          <span className="uptime-val">{formatUptime(uptime)}</span>
        </div>

        <div className="interval-selector">
          <label htmlFor="poll-interval" className="interval-label">Chu kỳ:</label>
          <select
            id="poll-interval"
            value={pollingInterval}
            onChange={(e) => setPollingInterval(Number(e.target.value))}
            className="interval-select"
          >
            <option value={1000}>1.0s</option>
            <option value={1500}>1.5s</option>
            <option value={3000}>3.0s</option>
            <option value={5000}>5.0s</option>
          </select>
        </div>

        <button onClick={refetch} className="btn-refresh" title="Làm mới ngay" aria-label="Làm mới dữ liệu">
          🔄
        </button>
      </div>
    </header>
  );
}
