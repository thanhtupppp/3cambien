import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import net from 'net';
import { CONNECTION_STATUS } from './src/constants/connectionStatus.js';

let currentTemps = {
  status: CONNECTION_STATUS.OFFLINE,
  uptime: 0,
  deltaAir: null,
  sensors: [
    { id: 0, name: 'T1 Khi vao dan lanh', temp: null, online: false },
    { id: 1, name: 'T2 Khi ra dan lanh', temp: null, online: false },
    { id: 2, name: 'T3 Ong gas hoi ve', temp: null, online: false }
  ]
};

let startTime = Date.now();
const SENSOR_TTL_MS = 5000;
const sensorLastSeen = [0, 0, 0];

function createWokwiBridgePlugin() {
  let client = null;
  let buffer = '';

  function connectToWokwi() {
    if (client) return;

    try {
      client = net.createConnection({ port: 4000, host: '127.0.0.1' });

      client.on('connect', () => {
        console.log('[Wokwi Bridge] ✅ Đã kết nối tới Wokwi Serial qua port 4000!');
        currentTemps.status = CONNECTION_STATUS.CONNECTING;
        startTime = Date.now();
      });

      client.on('data', (data) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // giữ lại đoạn chưa hết dòng

        for (const line of lines) {
          // Parse: T1 Khi vao dan lanh: -7.50 C
          const t1Match = line.match(/T1 Khi vao dan lanh\s*:\s*(-?[\d.]+)\s*C/);
          if (t1Match) {
            currentTemps.sensors[0].temp = parseFloat(t1Match[1]);
            currentTemps.sensors[0].online = true;
            sensorLastSeen[0] = Date.now();
            currentTemps.status = CONNECTION_STATUS.CONNECTED;
          }

          // Parse: T2 Khi ra dan lanh : 51.38 C
          const t2Match = line.match(/T2 Khi ra dan lanh\s*:\s*(-?[\d.]+)\s*C/);
          if (t2Match) {
            currentTemps.sensors[1].temp = parseFloat(t2Match[1]);
            currentTemps.sensors[1].online = true;
            sensorLastSeen[1] = Date.now();
            currentTemps.status = CONNECTION_STATUS.CONNECTED;
          }

          // Parse: T3 Ong gas hoi ve  : 48.19 C
          const t3Match = line.match(/T3 Ong gas hoi ve\s*:\s*(-?[\d.]+)\s*C/);
          if (t3Match) {
            currentTemps.sensors[2].temp = parseFloat(t3Match[1]);
            currentTemps.sensors[2].online = true;
            sensorLastSeen[2] = Date.now();
            currentTemps.status = CONNECTION_STATUS.CONNECTED;
          }

          // Tính ΔTair = T1 khí vào - T2 khí ra khi cả hai cảm biến hợp lệ
          const s1 = currentTemps.sensors[0].temp;
          const s2 = currentTemps.sensors[1].temp;
          if (currentTemps.sensors[0].online && currentTemps.sensors[1].online && s1 !== null && s2 !== null) {
            currentTemps.deltaAir = parseFloat((s1 - s2).toFixed(2));
          } else {
            currentTemps.deltaAir = null;
          }
          currentTemps.uptime = Date.now() - startTime;
        }
      });

      client.on('error', () => {
        // Wokwi chưa bật port 4000 hoặc đã dừng
        currentTemps.status = CONNECTION_STATUS.OFFLINE;
      });

      client.on('close', () => {
        client = null;
        currentTemps.status = CONNECTION_STATUS.OFFLINE;
        setTimeout(connectToWokwi, 2000);
      });
    } catch {
      client = null;
    }
  }

  // Khởi động kết nối ngầm
  connectToWokwi();
  setInterval(() => {
    if (!client) connectToWokwi();
  }, 3000);

  return {
    name: 'wokwi-bridge',
    configureServer(server) {
      server.middlewares.use('/api/temperatures', (req, res) => {
        const now = Date.now();
        currentTemps.sensors.forEach((sensor, index) => {
          if (sensorLastSeen[index] && now - sensorLastSeen[index] > SENSOR_TTL_MS) {
            sensor.online = false;
          }
        });
        if (!currentTemps.sensors.some((sensor) => sensor.online)) currentTemps.status = CONNECTION_STATUS.OFFLINE;
        if (!currentTemps.sensors[0].online || !currentTemps.sensors[1].online) currentTemps.deltaAir = null;
        currentTemps.uptime = now - startTime;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(currentTemps));
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), createWokwiBridgePlugin()],
  server: {
    port: 5173,
    host: true
  }
});
