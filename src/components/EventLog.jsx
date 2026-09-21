import React from 'react';

export function EventLog({ logs }) {
  const getBadgeClass = (type) => {
    switch (type) {
      case 'success':
        return 'log-badge success';
      case 'warning':
        return 'log-badge warning';
      case 'error':
        return 'log-badge error';
      default:
        return 'log-badge info';
    }
  };

  return (
    <div className="glass-panel log-container">
      <div className="log-header">
        <span className="log-icon">📋</span>
        <h3>NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG</h3>
      </div>

      <div className="log-list">
        {logs && logs.length > 0 ? (
          logs.map((item) => (
            <div key={item.id} className="log-item">
              <span className="log-time">{item.time}</span>
              <span className={getBadgeClass(item.type)}>{item.type.toUpperCase()}</span>
              <span className="log-msg">{item.message}</span>
            </div>
          ))
        ) : (
          <div className="log-empty">Chưa có nhật ký nào được ghi nhận.</div>
        )}
      </div>
    </div>
  );
}
