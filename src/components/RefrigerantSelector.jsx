import React from 'react';
import { REFRIGERANTS, tempToPressure } from '../data/danfossData';

// Constants
const KELVIN_OFFSET = 273.15;
const DEFAULT_REF_INDEX = 0;

// Pure Helper functions
const cleanFormulaText = (formula, fallbackKey) => {
  if (!formula) return fallbackKey || '';
  return formula.replace(/_\{(\d+)\}/g, '$1').replace(/[\{\}]/g, '');
};

const getSafeRef = (currentRef) => {
  if (currentRef && typeof currentRef === 'object' && currentRef.id) {
    return currentRef;
  }
  return REFRIGERANTS[DEFAULT_REF_INDEX] || {};
};

const formatCriticalTemp = (Tc) => {
  return typeof Tc === 'number' && !isNaN(Tc) ? (Tc - KELVIN_OFFSET).toFixed(1) : '--';
};

const formatCriticalPressure = (Pc) => {
  return typeof Pc === 'number' && !isNaN(Pc) ? Pc.toFixed(1) : '--';
};

function RefrigerantSelectorComponent({
  selectedRefId,
  setSelectedRefId,
  currentRef = {},
  evapTemp,
  setEvapPressure
}) {
  const safeRef = getSafeRef(currentRef);
  const refId = safeRef.id || 'R404A';
  const refFormula = safeRef.formula ? `(${cleanFormulaText(safeRef.formula)})` : '';
  const refDesc = safeRef.desc || 'Môi chất lạnh';
  const criticalTemp = formatCriticalTemp(safeRef.Tc);
  const criticalPressure = formatCriticalPressure(safeRef.Pc);

  const handleSelectRef = React.useCallback((id) => {
    if (typeof setSelectedRefId === 'function') {
      setSelectedRefId(id);
    }
    if (typeof setEvapPressure === 'function') {
      try {
        const pBar = tempToPressure(evapTemp ?? -27.0, id);
        setEvapPressure(pBar);
      } catch (err) {
        console.error('Lỗi tính áp suất khi đổi môi chất lạnh:', err);
      }
    }
  }, [setSelectedRefId, setEvapPressure, evapTemp]);

  return (
    <div className="txv-section">
      <div className="txv-section-header">
        <span className="txv-section-title">1. CHỌN MÔI CHẤT LẠNH (COOLPROP DATABASE - 13 LOẠI GAS):</span>
        <span className="txv-selected-info">
          {refId} {refFormula} • {refDesc} • Tc: {criticalTemp}°C, Pc: {criticalPressure} bar
        </span>
      </div>
      <div className="ref-chips-grid">
        {REFRIGERANTS.map((ref) => {
          const cleanFormula = cleanFormulaText(ref.formula, ref.coolpropKey);
          const isSelected = selectedRefId === ref.id;
          const tc = formatCriticalTemp(ref.Tc);
          const pc = formatCriticalPressure(ref.Pc);

          return (
            <button
              type="button"
              key={ref.id}
              className={`ref-chip ${isSelected ? 'active' : ''}`}
              onClick={() => handleSelectRef(ref.id)}
              aria-pressed={isSelected}
              title={`${ref.desc} - Tc: ${tc}°C, Pc: ${pc} bar`}
            >
              <span className="ref-chip-name">{ref.id}</span>
              <span className="ref-chip-type">{cleanFormula}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const RefrigerantSelector = React.memo(RefrigerantSelectorComponent);
export default RefrigerantSelector;
