import React from 'react';
import { useTxvCalculator } from '../hooks/useTxvCalculator';
import { calculateTxvRecommendation } from '../utils/txvRecommendation';
import { tempToPressure } from '../data/danfossData';
import { TxvHeader } from './TxvHeader';
import { TxvTelemetryBar } from './TxvTelemetryBar';
import { RefrigerantSelector } from './RefrigerantSelector';
import { ValveSelector } from './ValveSelector';
import { RoomTargetPanel } from './RoomTargetPanel';
import { TxvInputsGrid } from './TxvInputsGrid';
import { TxvResultPanel } from './TxvResultPanel';
import { TxvHistoryChart } from './TxvHistoryChart';
import { PhDiagram } from './PhDiagram';

/**
 * Component chính: Bộ Điều Chỉnh Quá Nhiệt Van Tiết Lưu Danfoss TXV (Ref Tools)
 * Refactored theo nguyên lý Single Responsibility & Modular Architecture
 */
export function TxvTuner({ liveT1, liveT2, liveT3, isOnline }) {
  const {
    selectedRefId,
    setSelectedRefId,
    selectedValveId,
    setSelectedValveId,
    opMode,
    setOpMode,
    isAutoSyncSensors,
    setIsAutoSyncSensors,
    evapSource,
    setEvapSource,
    targetRoomTemp,
    targetSh,
    setTargetSh,
    tdValue,
    applyRoomTempTarget,
    evapTemp,
    evapPressure,
    suctionTemp,
    setSuctionTemp,
    handleEvapTempChange,
    handleEvapPressureChange,
    currentRef,
    currentValve,
    actualSh,
    deltaSh
  } = useTxvCalculator(liveT1, liveT2, liveT3, isOnline);

  // Lưu lịch sử biến thiên superheat
  const [shHistory, setShHistory] = React.useState([]);

  // Nhiệt độ ngưng tụ dàn nóng giả lập (mặc định 40°C - độc lập với cảm biến dàn lạnh)
  const [condTemp, setCondTemp] = React.useState(40.0);

  // Tính toán khuyến nghị vặn vít Danfoss
  const recommendation = calculateTxvRecommendation(actualSh, targetSh, currentValve);

  // Cập nhật lịch sử superheat khi có sự thay đổi đáng kể
  React.useEffect(() => {
    if (typeof actualSh === 'number' && !isNaN(actualSh)) {
      setShHistory((prev) => {
        const last = prev[prev.length - 1];
        // Tránh ghi đè trùng nếu chênh lệch < 0.05K
        if (last && Math.abs(last.actualSh - actualSh) < 0.05 && last.targetSh === targetSh) {
          return prev;
        }
        return [
          ...prev.slice(-19),
          {
            timestamp: Date.now(),
            actualSh,
            targetSh,
            action: recommendation.direction
          }
        ];
      });
    }
  }, [actualSh, targetSh, recommendation.direction]);

  return (
    <div className="neu-panel txv-container">
      {/* 1. Tiêu đề và chuyển đổi chế độ vận hành */}
      <TxvHeader
        opMode={opMode}
        setOpMode={setOpMode}
        targetRoomTemp={targetRoomTemp}
        tdValue={tdValue}
        applyRoomTempTarget={applyRoomTempTarget}
      />

      {/* 2. Thanh hiển thị tín hiệu cảm biến thời gian thực */}
      <TxvTelemetryBar
        liveT1={liveT1}
        liveT2={liveT2}
        liveT3={liveT3}
        isOnline={isOnline}
        isAutoSyncSensors={isAutoSyncSensors}
        setIsAutoSyncSensors={setIsAutoSyncSensors}
      />

      {/* 3. Dải chọn 13 loại môi chất lạnh CoolProp */}
      <RefrigerantSelector
        selectedRefId={selectedRefId}
        setSelectedRefId={setSelectedRefId}
        currentRef={currentRef}
        evapTemp={evapTemp}
        setEvapPressure={handleEvapPressureChange}
      />

      {/* 4. Dải chọn dòng van Danfoss TXV */}
      <ValveSelector
        selectedValveId={selectedValveId}
        setSelectedValveId={setSelectedValveId}
        currentValve={currentValve}
      />

      {/* 5. Khối cài đặt theo nhiệt độ kho mong muốn (chỉ hiển thị khi ở chế độ target_room) */}
      {opMode === 'target_room' && (
        <RoomTargetPanel
          targetRoomTemp={targetRoomTemp}
          tdValue={tdValue}
          liveT1={liveT1}
          applyRoomTempTarget={applyRoomTempTarget}
          evapTemp={evapTemp}
          evapPressure={evapPressure}
          targetSh={targetSh}
          currentRef={currentRef}
        />
      )}

      {/* 6. Lưới nhập liệu thông số vận hành (P - T) */}
      <TxvInputsGrid
        opMode={opMode}
        evapTemp={evapTemp}
        evapPressure={evapPressure}
        suctionTemp={suctionTemp}
        targetSh={targetSh}
        setTargetSh={setTargetSh}
        setSuctionTemp={setSuctionTemp}
        handleEvapTempChange={handleEvapTempChange}
        handleEvapPressureChange={handleEvapPressureChange}
        isAutoSyncSensors={isAutoSyncSensors}
        setIsAutoSyncSensors={setIsAutoSyncSensors}
        targetRoomTemp={targetRoomTemp}
        tdValue={tdValue}
        liveT1={liveT1}
        liveT2={liveT2}
        liveT3={liveT3}
        evapSource={evapSource}
        setEvapSource={setEvapSource}
      />

      {/* 7. Khối kết quả độ quá nhiệt & hướng dẫn vặn vít 3D */}
      <TxvResultPanel
        actualSh={actualSh}
        deltaSh={deltaSh}
        suctionTemp={suctionTemp}
        evapTemp={evapTemp}
        targetSh={targetSh}
        recommendation={recommendation}
        currentValve={currentValve}
        evapSource={evapSource}
      />

      {/* 8. Biểu đồ lịch sử điều chỉnh Superheat qua thời gian */}
      <TxvHistoryChart
        historyData={shHistory}
        targetSh={targetSh}
      />

      {/* 9. Điều khiển T_cond và Giản đồ P-h (Mollier) mô phỏng chu trình lạnh thực tế */}
      <div className="sim-cond-card">
        <div className="sim-cond-header">
          <label htmlFor="sim-cond-temp" className="sim-cond-label">
            🔥 Nhiệt độ ngưng tụ dàn nóng (T_cond): <strong>{condTemp.toFixed(1)}°C</strong>
            <span className="sim-cond-pressure">
              (~{typeof tempToPressure === 'function' ? tempToPressure(condTemp, currentRef?.id || 'R404A').toFixed(2) : '--'} bar)
            </span>
          </label>
          <span className="sim-cond-sub">
            💡 T_cond dàn ngưng độc lập với cảm biến T1/T2/T3 phía dàn lạnh. Chuẩn giải nhiệt gió: 35°C - 45°C.
          </span>
        </div>
        <div className="sim-cond-slider-row">
          <span className="slider-bound">20°C</span>
          <input
            id="sim-cond-temp"
            type="range"
            min="20"
            max="65"
            step="0.5"
            value={condTemp}
            onChange={(e) => setCondTemp(parseFloat(e.target.value) || 40)}
            className="neu-range-slider"
          />
          <span className="slider-bound">65°C</span>
        </div>
      </div>

      <PhDiagram
        refrigerant={currentRef?.id || 'R404A'}
        evapTemp={evapTemp}
        condTemp={condTemp}
        suctionTemp={suctionTemp}
        subcooling={3}
        showCycle={true}
      />
    </div>
  );
}
