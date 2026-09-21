import React from 'react';
import { useTemperatures } from './hooks/useTemperatures';
import { Header } from './components/Header';
import { TempCard } from './components/TempCard';
import { DeltaMetric } from './components/DeltaMetric';
import { RealtimeChart } from './components/RealtimeChart';
import { EventLog } from './components/EventLog';
import { ControlPanel } from './components/ControlPanel';
import { TxvTuner } from './components/TxvTuner';
import { calculateDeltaAir } from './utils/temperatureMetrics';

export default function App() {
  const [theme, setTheme] = React.useState('light');

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const {
    data,
    history,
    connectionStatus,
    pollingInterval,
    setPollingInterval,
    logs,
    isDemoMode,
    toggleDemoMode,
    isAutoSim,
    setIsAutoSim,
    manualTemps,
    setManualTemp,
    refetch
  } = useTemperatures(1500);

  const sensors = data?.sensors || [
    { id: 0, name: 'T1 Khi vao dan lanh', temp: null, online: false },
    { id: 1, name: 'T2 Khi ra dan lanh', temp: null, online: false },
    { id: 2, name: 'T3 Ong gas hoi ve', temp: null, online: false }
  ];

  const t1 = sensors[0]?.online ? sensors[0].temp : null;
  const t2 = sensors[1]?.online ? sensors[1].temp : null;
  const t3 = sensors[2]?.online ? sensors[2].temp : null;
  const deltaAir = Number.isFinite(data?.deltaAir)
    ? data.deltaAir
    : calculateDeltaAir(t1, t2);

  const [activeTab, setActiveTab] = React.useState('txv'); // 'txv' | 'monitor' | 'all'

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        connectionStatus={connectionStatus}
        pollingInterval={pollingInterval}
        setPollingInterval={setPollingInterval}
        uptime={data?.uptime}
        isDemoMode={isDemoMode}
        toggleDemoMode={toggleDemoMode}
        refetch={refetch}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Neumorphic Navigation Tabs */}
      <nav className="neu-tabs-nav" aria-label="Bộ chọn chế độ làm việc">
        <button
          className={`neu-tab-btn ${activeTab === 'txv' ? 'active' : ''}`}
          onClick={() => setActiveTab('txv')}
          aria-pressed={activeTab === 'txv'}
        >
          <span className="tab-icon">🔧</span>
          <span>Bộ Chỉnh Quá Nhiệt TXV Danfoss (Ref Tools)</span>
        </button>

        <button
          className={`neu-tab-btn ${activeTab === 'monitor' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitor')}
          aria-pressed={activeTab === 'monitor'}
        >
          <span className="tab-icon">📊</span>
          <span>Giám Sát 3 Cảm Biến & Đồ Thị</span>
        </button>

        <button
          className={`neu-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
          aria-pressed={activeTab === 'all'}
        >
          <span className="tab-icon">⚡</span>
          <span>Xem Toàn Diện (All-in-One)</span>
        </button>
      </nav>

      {/* Guide Banner if Offline */}
      {connectionStatus === 'offline' && !isDemoMode && (
        <div className="neu-panel offline-banner">
          <div className="offline-banner-icon">⚠️</div>
          <div className="offline-banner-text">
            <h4>Chưa nhận được tín hiệu từ ESP32 Wokwi</h4>
            <p>
              Hệ thống đang chạy với dữ liệu giả lập. Bạn có thể bấm nút <strong>🧪 Thử Demo</strong> trên thanh Header để tương tác ngay với toàn bộ giao diện và thanh trượt nhiệt độ!
            </p>
          </div>
        </div>
      )}

      {/* Control Panel (Sliders) when Demo Mode is Active */}
      {isDemoMode && (
        <ControlPanel
          manualTemps={manualTemps}
          setManualTemp={setManualTemp}
          isAutoSim={isAutoSim}
          setIsAutoSim={setIsAutoSim}
        />
      )}
      {/* Tab: Bộ Điều Chỉnh Quá Nhiệt TXV Danfoss */}
      {(activeTab === 'txv' || activeTab === 'all') && (
        <TxvTuner
          liveT1={t1}
          liveT2={t2}
          liveT3={t3}
          isOnline={connectionStatus === 'connected' || connectionStatus === 'demo'}
        />
      )}

      {/* Tab: Giám Sát Cảm Biến Dàn Lạnh */}
      {(activeTab === 'monitor' || activeTab === 'all') && (
        <div className="monitor-workspace">
          {/* 3 Temperature Cards */}
          <section className="cards-grid">
            {sensors.map((sensor, idx) => (
              <TempCard
                key={sensor.id ?? idx}
                index={idx}
                name={sensor.name}
                temp={sensor.temp}
                online={sensor.online}
              />
            ))}
          </section>

          {/* Delta T Performance Metric */}
          <DeltaMetric t1={t1} t2={t2} deltaAir={deltaAir} />

          {/* Real-time Line Chart */}
          <RealtimeChart history={history} />

          {/* Event Log */}
          <EventLog logs={logs} />
        </div>
      )}
    </div>
  );
}
