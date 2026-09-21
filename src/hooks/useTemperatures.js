import { useState, useEffect, useCallback, useRef } from 'react';
import { getTemperatures } from '../services/api';

/**
 * Custom Hook quản lý dữ liệu nhiệt độ, lịch sử và trạng thái kết nối với ESP32
 * @param {number} [initialInterval=1500] Chu kỳ polling (ms)
 */
export function useTemperatures(initialInterval = 1500) {
  // Tạo trước dữ liệu lịch sử mẫu để đồ thị hiển thị ngay khi mở trang
  const initialHistory = (() => {
    const pts = [];
    const now = Date.now();
    for (let i = 15; i >= 0; i--) {
      const t = new Date(now - i * 1500).toLocaleTimeString('vi-VN', { hour12: false });
      const t1 = Number((38.5 + Math.sin(i * 0.5) * 1.2).toFixed(2));
      const t2 = Number((-12.2 + Math.cos(i * 0.4) * 1.5).toFixed(2));
      const t3 = Number((19.5 + Math.sin(i * 0.3) * 0.8).toFixed(2));
      pts.push({ time: t, t1, t2, t3, deltaT: Number((t2 - t1).toFixed(2)) });
    }
    return pts;
  })();

  const [data, setData] = useState({
    status: 'demo',
    uptime: 125000,
    deltaT: -50.7,
    sensors: [
      { id: 0, name: 'T1 Khi vao dan lanh', temp: 38.69, online: true },
      { id: 1, name: 'T2 Khi ra dan lanh', temp: -12.31, online: true },
      { id: 2, name: 'T3 Ong gas hoi ve', temp: 19.62, online: true }
    ]
  });
  const [history, setHistory] = useState(initialHistory);
  const [connectionStatus, setConnectionStatus] = useState('demo'); // 'connecting' | 'connected' | 'reconnecting' | 'offline' | 'demo'
  const [pollingInterval, setPollingInterval] = useState(initialInterval);
  const [logs, setLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString('vi-VN', { hour12: false }), type: 'info', message: 'Khởi chạy giao diện Neumorphism (Soft UI)' },
    { id: 2, time: new Date().toLocaleTimeString('vi-VN', { hour12: false }), type: 'success', message: 'Hệ thống giám sát 3 cảm biến DS18B20 sẵn sàng' }
  ]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isAutoSim, setIsAutoSim] = useState(true);

  // Giá trị thủ công khi chỉnh slider
  const manualTempsRef = useRef({ t1: 38.69, t2: -12.31, t3: 19.62 });
  const failCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const addLog = useCallback((type, message) => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    setLogs((prev) => [
      { id: Date.now() + Math.random(), time, type, message },
      ...prev.slice(0, 24)
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

    const deltaT = Number((t2 - t1).toFixed(2));

    const demoPayload = {
      status: 'demo',
      uptime: Date.now() % 10000000,
      deltaT,
      sensors: [
        { id: 0, name: 'T1 Khi vao dan lanh', temp: t1, online: true },
        { id: 1, name: 'T2 Khi ra dan lanh', temp: t2, online: true },
        { id: 2, name: 'T3 Ong gas hoi ve', temp: t3, online: true }
      ]
    };

    setData(demoPayload);
    setConnectionStatus('demo');
    setLastUpdated(now);
    setHistory((prev) => [
      ...prev.slice(-29),
      { time: timeStr, t1, t2, t3, deltaT }
    ]);
  }, [isAutoSim]);

  const fetchData = useCallback(async () => {
    if (isDemoMode) {
      generateDemoData();
      return;
    }

    try {
      const res = await getTemperatures();

      if (!isMountedRef.current) return;

      setData(res);
      setLastUpdated(new Date());

      if (failCountRef.current > 0 || connectionStatus !== 'connected') {
        addLog('success', 'Kết nối thành công với ESP32');
      }

      failCountRef.current = 0;
      setConnectionStatus('connected');

      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour12: false });
      const t1 = res.sensors?.[0]?.online ? res.sensors[0].temp : null;
      const t2 = res.sensors?.[1]?.online ? res.sensors[1].temp : null;
      const t3 = res.sensors?.[2]?.online ? res.sensors[2].temp : null;

      setHistory((prev) => [
        ...prev.slice(-29),
        { time: timeStr, t1, t2, t3, deltaT: res.deltaT }
      ]);

      res.sensors?.forEach((s) => {
        if (!s.online) {
          addLog('warning', `Cảm biến [${s.name}] mất tín hiệu hoặc lỗi đọc`);
        }
      });

    } catch {
      if (!isMountedRef.current) return;

      failCountRef.current += 1;

      if (failCountRef.current >= 3) {
        setConnectionStatus('offline');
      } else {
        setConnectionStatus('reconnecting');
      }

      if (failCountRef.current === 1) {
        addLog('error', `Chưa nhận được tín hiệu từ ESP32. Đang tự động kết nối lại...`);
      }
    }
  }, [isDemoMode, connectionStatus, addLog, generateDemoData]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    const timer = setInterval(() => {
      fetchData();
    }, pollingInterval);

    return () => {
      isMountedRef.current = false;
      clearInterval(timer);
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
