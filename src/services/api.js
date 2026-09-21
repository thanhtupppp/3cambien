/**
 * Lấy dữ liệu nhiệt độ từ ESP32
 * Hỗ trợ tự động cả 2 đường:
 * 1. Qua Vite Wokwi Serial Bridge (/api/temperatures) - Hoạt động miễn phí 100% qua port 4000
 * 2. Qua Wokwi HTTP Forwarding (http://localhost:8180/api/temperatures)
 * @param {AbortSignal} [signal]
 */
export async function getTemperatures(signal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    // 1. Thử qua Vite Bridge trước (/api/temperatures)
    try {
      const res = await fetch('/api/temperatures', {
        signal: signal || controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        // Nếu có dữ liệu online từ Serial Bridge, trả về luôn
        if (data.status === 'online' || data.sensors?.[0]?.temp !== null) {
          return data;
        }
      }
    } catch {
      // Tiếp tục thử cổng 8180
    }

    // 2. Thử qua HTTP Port Forwarding (8180)
    const response = await fetch('http://localhost:8180/api/temperatures', {
      signal: signal || controller.signal,
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}
