import React from 'react';
import { DANFOSS_TXV_MODELS } from '../data/danfossData';

// Constants
const DEFAULT_SENSITIVITY = 1.0;
const DEFAULT_VALVE_INDEX = 0;

// Helper function
const getSafeValve = (currentValve) => {
  if (currentValve && typeof currentValve === 'object') {
    return currentValve;
  }
  return DANFOSS_TXV_MODELS[DEFAULT_VALVE_INDEX] || {};
};

function ValveSelectorComponent({ 
  selectedValveId, 
  setSelectedValveId, 
  currentValve = {} 
}) {
  const safeValve = getSafeValve(currentValve);
  const valveDesc = safeValve.desc || 'Van tiết lưu Danfoss';
  const sensitivity = typeof safeValve.sensitivity === 'number' 
    ? safeValve.sensitivity 
    : DEFAULT_SENSITIVITY;

  const handleSelectValve = React.useCallback((id) => {
    if (typeof setSelectedValveId === 'function') {
      setSelectedValveId(id);
    }
  }, [setSelectedValveId]);

  return (
    <div className="txv-section">
      <div className="txv-section-header">
        <span className="txv-section-title">2. CHỌN DÒNG VAN DANFOSS TXV:</span>
        <span className="txv-selected-info">
          {valveDesc} (Độ nhạy: ~{sensitivity.toFixed(1)} K/vòng)
        </span>
      </div>
      
      <div className="valve-chips-grid">
        {DANFOSS_TXV_MODELS.map((valve) => {
          const isSelected = selectedValveId === valve.id;
          
          return (
            <button
              type="button"
              key={valve.id}
              className={`valve-chip ${isSelected ? 'active' : ''}`}
              onClick={() => handleSelectValve(valve.id)}
              aria-pressed={isSelected}
              title={`${valve.desc} - Socket: ${valve.socketType || 'N/A'}`}
            >
              <span className="valve-chip-name">{valve.name}</span>
              <span className="valve-chip-sub">
                ~{typeof valve.sensitivity === 'number' ? valve.sensitivity.toFixed(1) : 'N/A'} K / vòng
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const ValveSelector = React.memo(ValveSelectorComponent);
export default ValveSelector;
