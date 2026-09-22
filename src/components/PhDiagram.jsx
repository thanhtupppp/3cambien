import React, { useMemo } from "react";
import { REFRIGERANTS, tempToPressure } from "../data/danfossData";
import '../styles/PhDiagram.css';

const DIAGRAM_WIDTH = 700;
const DIAGRAM_HEIGHT = 450;

const PADDING = {
  top: 40,
  right: 40,
  bottom: 60,
  left: 80,
};

const DEFAULT_CRITICAL_PROPS = {
  criticalTemp: 72.1,
  criticalPressure: 37.3,
};

const DEFAULTS = {
  refrigerant: "R404A",
  evapTemp: -30,
  condTemp: 40,
  suctionTemp: -24,
  subcooling: 3,
  dischargeTempOffset: 25,
};

const COLORS = {
  cycle: "#3b82f6",
  evap: "#0284c7",
  cond: "#ea580c",
  saturation: "#9ca3af",
  critical: "#ef4444",
  expansion: "#7c3aed",
  compression: "#64748b",
  shLow: "#f59e0b",
  shOptimal: "#10b981",
  shHigh: "#ef4444",
};

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

const safeNumber = (value, fallback) =>
  isFiniteNumber(value) ? value : fallback;

const formatNumber = (value, decimals = 1) =>
  isFiniteNumber(value) ? value.toFixed(decimals) : "--";

const getSuperheatStatus = (superheat) => {
  if (superheat < 4) {
    return {
      color: COLORS.shLow,
      title: "Quá nhiệt thấp — cần kiểm tra nguy cơ hồi lỏng.",
    };
  }

  if (superheat <= 8) {
    return {
      color: COLORS.shOptimal,
      title: "Quá nhiệt trong vùng mục tiêu.",
    };
  }

  return {
    color: COLORS.shHigh,
    title: "Quá nhiệt cao — dàn có thể bị thiếu cấp môi chất.",
  };
};

function createPath(points, close = false) {
  if (!points.length) return "";

  const path = points.reduce(
    (result, point, index) =>
      index === 0
        ? `M ${point.x} ${point.y}`
        : `${result} L ${point.x} ${point.y}`,
    "",
  );

  return close ? `${path} Z` : path;
}

function PhDiagramComponent({
  refrigerant = DEFAULTS.refrigerant,
  evapTemp = DEFAULTS.evapTemp,
  condTemp = DEFAULTS.condTemp,
  suctionTemp = DEFAULTS.suctionTemp,
  dischargeTemp,
  subcooling = DEFAULTS.subcooling,
  showCycle = true,
}) {
  const safeEvapTemp = safeNumber(evapTemp, DEFAULTS.evapTemp);
  const safeCondTemp = safeNumber(condTemp, DEFAULTS.condTemp);
  const safeSuctionTemp = safeNumber(suctionTemp, DEFAULTS.suctionTemp);
  const safeSubcooling = Math.max(
    0,
    safeNumber(subcooling, DEFAULTS.subcooling),
  );

  const safeDischargeTemp = safeNumber(
    dischargeTemp,
    safeCondTemp + DEFAULTS.dischargeTempOffset,
  );

  const refObj = useMemo(
    () => REFRIGERANTS.find((ref) => ref.id === refrigerant) ?? null,
    [refrigerant],
  );

  const criticalTemp = isFiniteNumber(refObj?.Tc)
    ? refObj.Tc - 273.15
    : DEFAULT_CRITICAL_PROPS.criticalTemp;

  const criticalPressure = isFiniteNumber(refObj?.Pc)
    ? refObj.Pc
    : DEFAULT_CRITICAL_PROPS.criticalPressure;

  const evapPressure = useMemo(
    () => tempToPressure(safeEvapTemp, refrigerant),
    [safeEvapTemp, refrigerant],
  );

  const condPressure = useMemo(
    () => tempToPressure(safeCondTemp, refrigerant),
    [safeCondTemp, refrigerant],
  );

  const superheat = useMemo(
    () => Number((safeSuctionTemp - safeEvapTemp).toFixed(1)),
    [safeSuctionTemp, safeEvapTemp],
  );

  const shStatus = useMemo(() => getSuperheatStatus(superheat), [superheat]);

  const liquidTemp = Number((safeCondTemp - safeSubcooling).toFixed(1));

  const innerWidth = DIAGRAM_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = DIAGRAM_HEIGHT - PADDING.top - PADDING.bottom;

  const saturationDome = useMemo(() => {
    const centerX = PADDING.left + innerWidth * 0.45;
    const domeHeight = innerHeight * 0.65;
    const domeWidth = innerWidth * 0.75;

    return Array.from({ length: 101 }, (_, index) => {
      const ratio = index / 100;
      const x = centerX - domeWidth / 2 + ratio * domeWidth;
      const y =
        PADDING.top + innerHeight - domeHeight * Math.sin(ratio * Math.PI);

      return { x, y };
    });
  }, [innerWidth, innerHeight]);

  const cyclePoints = useMemo(() => {
    const p1 = {
      x: PADDING.left + innerWidth * 0.35,
      y: PADDING.top + innerHeight * 0.75,
      label: "1",
      desc: "Hơi hút vào máy nén",
      temp: safeSuctionTemp,
    };

    const p2 = {
      x: PADDING.left + innerWidth * 0.85,
      y: PADDING.top + innerHeight * 0.25,
      label: "2",
      desc: "Hơi đẩy từ máy nén",
      temp: safeDischargeTemp,
    };

    const p3 = {
      x: PADDING.left + innerWidth * 0.18,
      y: PADDING.top + innerHeight * 0.25,
      label: "3",
      desc: "Lỏng sau dàn ngưng",
      temp: liquidTemp,
    };

    const p4 = {
      x: PADDING.left + innerWidth * 0.18,
      y: PADDING.top + innerHeight * 0.75,
      label: "4",
      desc: "Hỗn hợp sau TXV",
      temp: safeEvapTemp,
    };

    return [p1, p2, p3, p4];
  }, [
    innerWidth,
    innerHeight,
    safeSuctionTemp,
    safeDischargeTemp,
    liquidTemp,
    safeEvapTemp,
  ]);

  const saturationPath = useMemo(
    () => createPath(saturationDome),
    [saturationDome],
  );

  const cyclePath = useMemo(() => createPath(cyclePoints, true), [cyclePoints]);

  const evapLineY = PADDING.top + innerHeight * 0.75;
  const condLineY = PADDING.top + innerHeight * 0.25;
  const centerX = PADDING.left + innerWidth * 0.45;

  const hasInvalidCycle =
    safeCondTemp <= safeEvapTemp || condPressure <= evapPressure;

  return (
    <section className="ph-diagram-container">
      {hasInvalidCycle && (
        <div className="diagram-warning">
          ⚠️ <strong>Cảnh báo nhiệt động:</strong> Nhiệt độ/áp suất ngưng tụ dàn nóng (T_cond = {formatNumber(safeCondTemp)}°C, P_cond = {formatNumber(condPressure, 2)} bar) phải lớn hơn nhiệt độ/áp suất bay hơi (T_evap = {formatNumber(safeEvapTemp)}°C, P_evap = {formatNumber(evapPressure, 2)} bar). Vui lòng kiểm tra lại thông số nhiệt độ ngưng tụ.
        </div>
      )}
      <header className="ph-diagram-header">
        <div>
          <h3 className="ph-diagram-title">
            📊 SƠ ĐỒ CHU TRÌNH LẠNH P–h • {refObj?.id ?? refrigerant}
          </h3>
          <p className="ph-diagram-note">
            Sơ đồ minh họa trạng thái. Muốn P–h chính xác cần dữ liệu enthalpy
            thực từ CoolProp hoặc bảng môi chất.
          </p>
        </div>

        <div className="ph-diagram-params">
          <span className="param-badge">
            T_evap: {formatNumber(safeEvapTemp)}°C
          </span>

          <span className="param-badge">
            P_evap: {formatNumber(evapPressure, 2)} bar
          </span>

          <span className="param-badge">
            T_cond: {formatNumber(safeCondTemp)}°C
          </span>

          <span className="param-badge">
            P_cond: {formatNumber(condPressure, 2)} bar
          </span>

          <span className="param-badge">
            SC: {formatNumber(safeSubcooling)} K
          </span>

          <span
            className="param-badge highlight-sh"
            style={{
              backgroundColor: shStatus.color,
              color: "#ffffff",
              fontWeight: 700,
            }}
            title={shStatus.title}
          >
            SH: {formatNumber(superheat)} K
          </span>
        </div>
      </header>

      <div className="ph-diagram-wrapper">
        <svg
          width={DIAGRAM_WIDTH}
          height={DIAGRAM_HEIGHT}
          className="ph-diagram-svg"
          viewBox={`0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}`}
          role="img"
          aria-label={`Sơ đồ chu trình lạnh ${refrigerant}: nhiệt độ bay hơi ${safeEvapTemp} độ C, nhiệt độ ngưng tụ ${safeCondTemp} độ C và quá nhiệt ${superheat} K`}
        >
          <path
            d={saturationPath}
            fill="none"
            stroke={COLORS.saturation}
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          <text
            x={centerX}
            y={PADDING.top + innerHeight * 0.45}
            textAnchor="middle"
            fill={COLORS.saturation}
            fontSize="12"
          >
            Vùng bão hòa — minh họa
          </text>

          <circle
            cx={centerX}
            cy={PADDING.top + innerHeight * 0.35}
            r="5"
            fill={COLORS.critical}
          />

          <text
            x={centerX + 10}
            y={PADDING.top + innerHeight * 0.35 + 4}
            fill={COLORS.critical}
            fontSize="11"
            fontWeight="700"
          >
            Điểm tới hạn: {formatNumber(criticalTemp)}°C /{" "}
            {formatNumber(criticalPressure)} bar
          </text>

          <line
            x1={PADDING.left}
            y1={evapLineY}
            x2={PADDING.left + innerWidth}
            y2={evapLineY}
            stroke={COLORS.evap}
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          <text
            x={PADDING.left - 10}
            y={evapLineY + 4}
            textAnchor="end"
            fill={COLORS.evap}
            fontSize="12"
            fontWeight="700"
          >
            P_evap {formatNumber(evapPressure, 2)} bar
          </text>

          <line
            x1={PADDING.left}
            y1={condLineY}
            x2={PADDING.left + innerWidth}
            y2={condLineY}
            stroke={COLORS.cond}
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          <text
            x={PADDING.left - 10}
            y={condLineY + 4}
            textAnchor="end"
            fill={COLORS.cond}
            fontSize="12"
            fontWeight="700"
          >
            P_cond {formatNumber(condPressure, 2)} bar
          </text>

          {showCycle && (
            <>
              <path
                d={cyclePath}
                fill="rgba(59, 130, 246, 0.12)"
                stroke={COLORS.cycle}
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {cyclePoints.map((point) => {
                const isRightSide = point.x > PADDING.left + innerWidth * 0.5;

                return (
                  <g key={point.label}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="9"
                      fill="#ffffff"
                      stroke={COLORS.cycle}
                      strokeWidth="3"
                    />

                    <text
                      x={point.x}
                      y={point.y + 4}
                      textAnchor="middle"
                      fill="#1f2937"
                      fontSize="11"
                      fontWeight="800"
                    >
                      {point.label}
                    </text>

                    <text
                      x={point.x + (isRightSide ? 14 : -14)}
                      y={point.y - 12}
                      textAnchor={isRightSide ? "start" : "end"}
                      fill="#374151"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {point.label}. {point.desc} ({formatNumber(point.temp)}°C)
                    </text>
                  </g>
                );
              })}
            </>
          )}

          <line
            x1={PADDING.left}
            y1={PADDING.top + innerHeight}
            x2={PADDING.left + innerWidth}
            y2={PADDING.top + innerHeight}
            stroke="#475569"
            strokeWidth="2"
          />

          <line
            x1={PADDING.left}
            y1={PADDING.top}
            x2={PADDING.left}
            y2={PADDING.top + innerHeight}
            stroke="#475569"
            strokeWidth="2"
          />

          <text
            x={PADDING.left + innerWidth / 2}
            y={DIAGRAM_HEIGHT - 15}
            textAnchor="middle"
            fill="#334155"
            fontSize="13"
            fontWeight="700"
          >
            Enthalpy h [kJ/kg] — minh họa
          </text>

          <text
            x={25}
            y={PADDING.top + innerHeight / 2}
            textAnchor="middle"
            fill="#334155"
            fontSize="13"
            fontWeight="700"
            transform={`rotate(-90, 25, ${PADDING.top + innerHeight / 2})`}
          >
            Áp suất log(P) [bar] — minh họa
          </text>

          <text
            x={PADDING.left + innerWidth * 0.5}
            y={PADDING.top + innerHeight * 0.18}
            textAnchor="middle"
            fill={COLORS.cond}
            fontSize="11"
            fontWeight="600"
          >
            2 → 3: Thải nhiệt và ngưng tụ tại dàn ngưng
          </text>

          <text
            x={PADDING.left + innerWidth * 0.5}
            y={PADDING.top + innerHeight * 0.82}
            textAnchor="middle"
            fill={COLORS.evap}
            fontSize="11"
            fontWeight="600"
          >
            4 → 1: Thu nhiệt và bay hơi tại dàn lạnh
          </text>

          <text
            x={PADDING.left + innerWidth * 0.06}
            y={PADDING.top + innerHeight * 0.5}
            textAnchor="middle"
            fill={COLORS.expansion}
            fontSize="11"
            fontWeight="600"
            transform={`rotate(-90, ${PADDING.left + innerWidth * 0.06}, ${PADDING.top + innerHeight * 0.5})`}
          >
            3 → 4: Tiết lưu gần đẳng enthalpy
          </text>

          <text
            x={PADDING.left + innerWidth * 0.94}
            y={PADDING.top + innerHeight * 0.5}
            textAnchor="middle"
            fill={COLORS.compression}
            fontSize="11"
            fontWeight="600"
            transform={`rotate(90, ${PADDING.left + innerWidth * 0.94}, ${PADDING.top + innerHeight * 0.5})`}
          >
            1 → 2: Nén hơi qua máy nén
          </text>
        </svg>
      </div>

      <div className="ph-diagram-legend">
        <div className="legend-item">
          <span
            className="legend-dot"
            style={{ backgroundColor: COLORS.cycle }}
          />
          Chu trình lạnh 4 điểm
        </div>

        <div className="legend-item">
          <span
            className="legend-dot"
            style={{ backgroundColor: COLORS.cond }}
          />
          Đường áp suất ngưng tụ
        </div>

        <div className="legend-item">
          <span
            className="legend-dot"
            style={{ backgroundColor: COLORS.evap }}
          />
          Đường áp suất bay hơi
        </div>

        <div className="legend-item">
          <span
            className="legend-dot"
            style={{ backgroundColor: COLORS.saturation }}
          />
          Vòm bão hòa minh họa
        </div>
      </div>
    </section>
  );
}

export const PhDiagram = React.memo(PhDiagramComponent);
export default PhDiagram;
