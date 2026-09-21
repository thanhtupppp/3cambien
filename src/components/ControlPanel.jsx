import React from 'react';

export function ControlPanel({ manualTemps, setManualTemp, isAutoSim, setIsAutoSim }) {
  const setPreset = (t1, t2, t3) => {
    setManualTemp('t1', t1);
    setManualTemp('t2', t2);
    setManualTemp('t3', t3);
  };

  return (
    <div className="glass-panel control-panel">
      <div className="control-header">
        <div className="control-title-box">
          <span className="control-icon">🎛️</span>
          <div>
            <h4>BẢNG ĐIỀU KHIỂN GIẢ LẬP NHIỆT ĐỘ</h4>
            <p className="control-subtitle">Kéo thanh trượt để thử nghiệm biến thiên nhiệt độ và kiểm tra phản ứng của Dashboard</p>
          </div>
        </div>

        <div className="control-actions">
          <button
            className={`btn-toggle-sim ${isAutoSim ? 'active' : ''}`}
            onClick={() => setIsAutoSim(!isAutoSim)}
          >
            {isAutoSim ? '⏸ Tạm dừng dao động' : '▶ Tự động dao động'}
          </button>
        </div>
      </div>

      <div className="sliders-grid">
        {/* Slider T1 */}
        <div className="slider-item">
          <div className="slider-label-row">
            <span className="slider-name">❄️ T1 (Khí vào dàn lạnh / Kho):</span>
            <span className="slider-val t1">{manualTemps.t1}°C</span>
          </div>
          <input
            type="range"
            min="-55"
            max="85"
            step="0.5"
            value={manualTemps.t1}
            onChange={(e) => setManualTemp('t1', parseFloat(e.target.value))}
            className="slider-input t1"
          />
          <div className="slider-range-labels">
            <span>-55°C (Min)</span>
            <span>0°C</span>
            <span>+85°C (Max)</span>
          </div>
        </div>

        {/* Slider T2 */}
        <div className="slider-item">
          <div className="slider-label-row">
            <span className="slider-name">💨 T2 (Khí ra dàn lạnh):</span>
            <span className="slider-val t2">{manualTemps.t2}°C</span>
          </div>
          <input
            type="range"
            min="-55"
            max="85"
            step="0.5"
            value={manualTemps.t2}
            onChange={(e) => setManualTemp('t2', parseFloat(e.target.value))}
            className="slider-input t2"
          />
          <div className="slider-range-labels">
            <span>-55°C (Min)</span>
            <span>0°C</span>
            <span>+85°C (Max)</span>
          </div>
        </div>

        {/* Slider T3 */}
        <div className="slider-item">
          <div className="slider-label-row">
            <span className="slider-name">🌡️ T3 (Ống gas hồi về / Bầu van):</span>
            <span className="slider-val t3">{manualTemps.t3}°C</span>
          </div>
          <input
            type="range"
            min="-55"
            max="85"
            step="0.5"
            value={manualTemps.t3}
            onChange={(e) => setManualTemp('t3', parseFloat(e.target.value))}
            className="slider-input t3"
          />
          <div className="slider-range-labels">
            <span>-55°C (Min)</span>
            <span>0°C</span>
            <span>+85°C (Max)</span>
          </div>
        </div>
      </div>

      <div className="presets-row">
        <span className="presets-label">Kịch bản mẫu chuẩn dải đo DS18B20:</span>
        <button type="button" onClick={() => setPreset(-45.0, -38.0, -32.0)} className="btn-preset">
          🥶 Cấp đông âm sâu (-45°C / -32°C)
        </button>
        <button type="button" onClick={() => setPreset(-18.5, 12.0, 8.5)} className="btn-preset">
          🧊 Dàn lạnh chuẩn (-18.5°C / 8.5°C)
        </button>
        <button type="button" onClick={() => setPreset(2.0, -4.0, 6.0)} className="btn-preset">
          🍎 Kho mát bảo quản (+2°C / 6°C)
        </button>
        <button type="button" onClick={() => setPreset(65.0, 75.0, 80.0)} className="btn-preset">
          🔥 Chu trình xả đá / Quá nhiệt (+65°C / 80°C)
        </button>
      </div>
    </div>
  );
}
