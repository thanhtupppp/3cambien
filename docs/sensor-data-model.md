# Sensor & Telemetry Data Model

Updated: 2026-09-22

## 1. Phạm vi

Tài liệu này định nghĩa ý nghĩa dữ liệu cho ba cảm biến nhiệt độ, metric ΔTair, dữ liệu dùng cho công cụ TXV/superheat và trạng thái kết nối của dashboard.

## 2. Vai trò cảm biến

| Sensor | Vị trí / ý nghĩa | Dùng cho |
|---|---|---|
| T1 | Khí vào dàn lạnh / khí hồi từ kho | Nhiệt độ không khí trước dàn, ΔTair, tham chiếu nhiệt độ kho |
| T2 | Khí ra dàn lạnh | Nhiệt độ không khí sau dàn, ΔTair |
| T3 | Ống gas hồi / đường hút tại vị trí đo | Nhiệt độ hơi hút thực tế, đầu vào cho tính superheat khi vị trí kẹp phù hợp |

T1 và T2 là nhiệt độ phía không khí. T3 là nhiệt độ phía môi chất trên đường hút; vì vậy T3 không được đánh giá bằng cùng ngưỡng nhiệt độ tuyệt đối của T1/T2.

## 3. ΔTair

Dashboard dùng quy ước:

```text
ΔTair = T1 - T2
```

Ví dụ chuẩn kiểm thử:

```text
T1 = -23°C
T2 = -28°C
ΔTair = +5 K
```

Chỉ tính ΔTair khi T1 và T2 đều online và có giá trị hữu hạn. Nếu một trong hai sensor mất tín hiệu/stale thì ΔTair phải trở về `null`.

## 4. Superheat

Định nghĩa nhiệt động lực học:

```text
Superheat = T_suction - T_sat
```

Trong mô hình hiện tại:

- `T_suction` có thể lấy từ T3 khi T3 được gắn đúng trên ống hút.
- `T_sat` chuẩn phải suy ra từ áp suất hút `Pe` theo môi chất đang chọn.
- Với R404A, khi cần superheat thực tế, nguồn `pressure` là nguồn phù hợp để suy ra nhiệt độ bão hòa.
- Các nguồn `T2` hoặc `T1 - TD` chỉ là ước lượng nhiệt độ bay hơi phục vụ mô phỏng/giao diện; không được xem là phép đo superheat thực nếu không có áp suất hút.

T1/T2 không được lấy trực tiếp để thay thế nhiệt độ bão hòa trong chẩn đoán superheat thực tế.

## 5. Telemetry payload

Payload tối thiểu mà frontend chấp nhận:

```json
{
  "status": "connected",
  "uptime": 125000,
  "deltaAir": 5.0,
  "sensors": [
    { "id": 0, "name": "T1 Khi vao dan lanh", "temp": -23.0, "online": true },
    { "id": 1, "name": "T2 Khi ra dan lanh", "temp": -28.0, "online": true },
    { "id": 2, "name": "T3 Ong gas hoi ve", "temp": -20.0, "online": true }
  ]
}
```

### Sensor object

| Field | Type | Quy tắc |
|---|---|---|
| `id` | number | 0=T1, 1=T2, 2=T3 |
| `name` | string | Tên hiển thị |
| `temp` | number \| null | °C; sensor online phải có số hữu hạn |
| `online` | boolean | Trạng thái dữ liệu sensor còn hợp lệ |

Sensor offline có thể có `temp: null`. Payload có ít hơn ba sensor hoặc sensor online có nhiệt độ không hữu hạn bị coi là không hợp lệ.

## 6. Trạng thái kết nối

Các trạng thái dùng chung:

| Giá trị | Ý nghĩa |
|---|---|
| `demo` | Dữ liệu giả lập nội bộ |
| `connecting` | Đang thiết lập nguồn dữ liệu |
| `connected` | Đã nhận telemetry hợp lệ |
| `reconnecting` | Lỗi tạm thời, đang thử lại |
| `offline` | Mất nguồn dữ liệu sau số lần lỗi liên tiếp |

Chỉ `connected` và `demo` được xem là online ở tầng UI.

## 7. Freshness / stale data

Mỗi sensor phải được đánh giá freshness độc lập. Kết nối tổng thể còn tồn tại không đồng nghĩa mọi sensor vẫn có dữ liệu mới.

Khi sensor vượt TTL:

1. đặt `online=false`;
2. không dùng giá trị stale cho metric dẫn xuất;
3. nếu T1 hoặc T2 stale, `deltaAir=null`;
4. UI hiển thị trạng thái mất tín hiệu thay vì giữ metric cũ.

## 8. Demo baseline

Baseline hiện dùng cho demo giám sát:

```text
T1 = -23.0°C
T2 = -28.0°C
T3 = -20.0°C
ΔTair = +5.0 K
```

Dữ liệu demo có thể dao động quanh baseline nhưng phải giữ đúng semantics T1/T2/T3.

## 9. Đơn vị

- Nhiệt độ: °C
- Chênh nhiệt / superheat: K
- Áp suất: bar theo mô hình TXV hiện tại
- Uptime / interval / TTL / timeout: ms

## 10. Luồng dữ liệu frontend

```text
Telemetry source
  -> API validation
  -> connection/error normalization
  -> useTemperatures state
  -> sensor freshness + derived metrics
  -> history/logs
  -> monitoring UI / TXV UI
```

Payload lỗi không được ghi vào state. Request chồng nhau bị chặn và request đang chạy phải được hủy khi component unmount.

## 11. Invariants để test

- T1=-23°C và T2=-28°C luôn cho ΔTair=+5K.
- Sensor online phải có nhiệt độ hữu hạn.
- Sensor stale không được tiếp tục đóng góp vào ΔTair.
- T3 không dùng evaluator nhiệt độ tuyệt đối của T1/T2.
- Superheat thực chỉ được coi là đo đúng khi T3 đại diện T_suction và T_sat được suy ra từ áp suất hút/môi chất tương ứng.
- Trạng thái `connected`, `reconnecting`, `offline`, `demo` không được trộn semantics.
