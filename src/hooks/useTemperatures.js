import { useState, useEffect, useCallback, useRef } from 'react';
import { getTemperatures } from '../services/api';
import { calculateDeltaAir } from '../utils/temperatureMetrics';
import { statusAfterFailure, statusAfterSuccess } from '../utils/connectionTransitions';
import { CONNECTION_STATUS } from '../constants/connectionStatus';
import { DEMO_TEMPERATURES, MONITORING_CONFIG } from '../constants/monitoringConfig';
import {
  TELEMETRY_ERROR_CODE,
  normalizeTelemetryError,
  telemetryErrorMessage
} from '../utils/telemetryError';

/**
 * Custom Hook quản lý dữ liệu nhiệt độ, lịch sử và trạng thái kết nối với ESP32
 * @param {number} [initialInterval=1500] Chu kỳ polling (ms)
 */
export function useTemperatures(initialInterval = MONITORING_CONFIG.defaultPollingMs) {
  // Tạo trước dữ liệu lịch sử mẫu để đồ thị hiển thị ngay khi mở trang
  const initialHistory = (() => {
    const pts = [];
    const now = Date.now();
    for (let i = 15; i >= 0; i--) {
      const t = new Date(now - i * MONITORING_CONFIG.historySampleMs).toLocaleTimeString('vi-VN', { hour12: false });
      const t1 = Number((DEMO_TEMPERATURES.t1 + Math.sin(i * 0.5) * 0.6).toFixed(2));
      const t2 = Number((DEMO_TEMPERATURES.t2 + Math.cos(i * 0.4) * 0.7).toFixed(2));
      const t3 = Number((DEMO_TEMPERATURES.t3 + Math.sin(i * 0.3) * 0.5).toFixed(2));
      pts.push({ time: t, t1, t2, t3, deltaAir: calculateDeltaAir(t1, t2) });
    }
    return pts;
  })();

  const [data, setData] = useState({
    status: CONNECTION_STATUS.DEMO,
    uptime: 125000,
    deltaAir: calculateDeltaAir(DEMO_TEMPERATURES.t1, DEMO_TEMPERATURES.t2),
    sensors: [
      { id: 0, name: 'T1 Khi vao dan lanh', temp: DEMO_TEMPERATURES.t1, online: true },
      { id: 1, name: 'T2 Khi ra dan lanh', temp: DEMO_TEMPERATURES.t2, online: true },
      { id: 2, name: 'T3 Ong gas hoi ve', temp: DEMO_TEMPERATURES.t3, online: true }
    ]
  });
  const [history, setHistory] = useState(initialHistory);
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.DEMO);
  const [pollingInterval, setPollingInterval] = useState(initialInterval);
  const [logs, setLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString('vi-VN', { hour12: false }), type: 'info', message: 'Khởi chạy giao diện Neumorphism (Soft UI)' },
    { id: 2, time: new Date().toLocaleTimeString('vi-VN', { hour12: false }), type: 'success', message: 'Hệ thống giám sát 3 cảm biến DS18B20 sẵn sàng' }
  ]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isAutoSim, setIsAutoSim] = useState(true);

  // Giá trị thủ công khi chỉnh slider
  const manualTempsRef = useRef({ ...DEMO_TEMPERATURES });
  const failCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const requestControllerRef = useRef(null);
  const connectionStatusRef = useRef(CONNECTION_STATUS.DEMO);
  const lastErrorCodeRef = useRef(null);

  const addLog = useCallback((type, message) => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    setLogs((prev) => [
      { id: Date.now() + Math.random(), time, type, message },
      ...prev.slice(0, MONITORING_CONFIG.logMaxItems - 1)
    ]);
  }, []);

  // Hàm cập nhật dữ liệu Demo
  const generateDemoData = useCallback(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour12: false });

    let { t1, t2, t3 } = manualTempsRef.current;

    // Nếu bật tự động dao động
    if (isAutoSim) {
      const noise1 = (Math.random() - 0.5) * 0.4;
      const noise2 = (Math.random() - 0.5) * 0.5;
      const noise3 = (Math.random() - 0.5) * 0.3;
      t1 = Number((t1 + noise1).toFixed(2));
      t2 = Number((t2 + noise2).toFixed(2));
      t3 = Number((t3 + noise3).toFixed(2));
      manualTempsRef.current = { t1, t2, t3 };
    }

    const deltaAir = calculateDeltaAir(t1, t2);

    const demoPayload = {
      status: CONNECTION_STATUS.DEMO,
      uptime: Date.now() % 10000000,
      deltaAir,
      sensors: [
        { id: 0, name: 'T1 Khi vao dan lanh', temp: t1, online: true },
        { id: 1, name: 'T2 Khi ra dan lanh', temp: t2, online: true },
        { id: 2, name: 'T3 Ong gas hoi ve', temp: t3, online: true }
      ]
    };

    setData(demoPayload);
    setConnectionStatus(CONNECTION_STATUS.DEMO);
    setLastUpdated(now);
    setHistory((prev) => [
      ...prev.slice(-(MONITORING_CONFIG.historyMaxPoints - 1)),
      { time: timeStr, t1, t2, t3, deltaAir }
    ]);
  }, [isAutoSim]);

  const fetchData = useCallback(async () => {
    if (isDemoMode) {
      generateDemoData();
      return;
    }

    if (requestControllerRef.current) return;

    const controller = new AbortController();
    requestControllerRef.current = controller;

    try {
      const res = await getTemperatures(controller.signal);

      if (!isMountedRef.current) return;

      setData(res);
      setLastUpdated(new Date());

      if (failCountRef.current > 0 || connectionStatusRef.current !== CONNECTION_STATUS.CONNECTED) {
        addLog('success', 'Kết nối thành công với ESP32');
      }

      failCountRef.current = 0;
      lastErrorCodeRef.current = null;
      const nextStatus = statusAfterSuccess();
      connectionStatusRef.current = nextStatus;
      setConnectionStatus(nextStatus);

      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour12: false });
      const t1 = res.sensors?.[0]?.online ? res.sensors[0].temp : null;
      const t2 = res.sensors?.[1]?.online ? res.sensors[1].temp : null;
      const t3 = res.sensors?.[2]?.online ? res.sensors[2].temp : null;

      setHistory((prev) => [
        ...prev.slice(-(MONITORING_CONFIG.historyMaxPoints - 1)),
        { time: timeStr, t1, t2, t3, deltaAir: res.deltaAir }
      ]);

      res.sensors?.forEach((s) => {
        if (!s.online) {
          addLog('warning', `Cảm biến [${s.name}] mất tín hiệu hoặc lỗi đọc`);
        }
      });

    } catch (error) {
      const normalizedError = normalizeTelemetryError(error);

      if (!isMountedRef.current || normalizedError.code === TELEMETRY_ERROR_CODE.ABORTED) return;

      failCountRef.current += 1;

      const nextStatus = statusAfterFailure(failCountRef.current);
      connectionStatusRef.current = nextStatus;
      setConnectionStatus(nextStatus);

      if (failCountRef.current === 1 || lastErrorCodeRef.current !== normalizedError.code) {
        addLog('error', telemetryErrorMessage(normalizedError));
      }

      lastErrorCodeRef.current = normalizedError.code;
    } finally {
      if (requestControllerRef.current === controller) requestControllerRef.current = null;
    }
  }, [isDemoMode, addLog, generateDemoData]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    const timer = setInterval(() => {
      fetchData();
    }, pollingInterval);

    return () => {
      isMountedRef.current = false;
      clearInterval(timer);
      requestControllerRef.current?.abort();
      requestControllerRef.current = null;
    };
  }, [pollingInterval, fetchData]);

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode((prev) => {
      const next = !prev;
      addLog('info', next ? 'Đã bật Chế độ Demo Giả Lập' : 'Chuyển về Chế độ Kết Nối Thực ESP32');
      return next;
    });
  }, [addLog]);

  // Điều chỉnh nhiệt độ thủ công
  const setManualTemp = useCallback((key, value) => {
    manualTempsRef.current[key] = Number(value);
    generateDemoData();
  }, [generateDemoData]);

  return {
    data,
    history,
    connectionStatus,
    pollingInterval,
    setPollingInterval,
    logs,
    lastUpdated,
    isDemoMode,
    toggleDemoMode,
    isAutoSim,
    setIsAutoSim,
    manualTemps: manualTempsRef.current,
    setManualTemp,
    refetch: fetchData
  };
}
