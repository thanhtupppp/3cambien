# Implementation Tracker

Updated: 2026-09-22

Status values: Not Started / In Progress / Blocked / In Review / Done

| ID | Work item | Owner | Status | Start date | Completion date | Blocker | Evidence |
|---|---|---|---|---|---|---|---|
| C-01 | Sửa công thức ΔT thành T1 - T2 | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | src/utils/temperatureMetrics.js; App/useTemperatures/vite bridge |
| C-02 | Chuẩn hóa tên metric ΔTair | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | ΔTair naming in data/UI |
| C-03 | Sửa ngưỡng đánh giá ΔT | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | evaluateDeltaAir() centralized ranges |
| C-04 | Viết test logic ΔT | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | test/temperatureMetrics.test.js |
| H-01 | Chống polling overlap | thanhtupppp | In Progress | 2026-09-22 |  |  |  |
| H-02 | Hủy request khi component unmount | thanhtupppp | Not Started |  |  |  |  |
| H-03 | Validate API payload | thanhtupppp | Not Started |  |  |  |  |
| H-04 | Sửa điều kiện undefined !== null | thanhtupppp | Not Started |  |  |  |  |
| H-05 | Thêm sensor TTL / lastSeen | thanhtupppp | Not Started |  |  |  |  |
| H-06 | Sửa semantics trạng thái system online | thanhtupppp | Not Started |  |  |  |  |
| H-07 | Reset stale ΔT khi sensor offline | thanhtupppp | Not Started |  |  |  |  |
| H-08 | Sửa initial demo history | thanhtupppp | Not Started |  |  |  |  |
| H-09 | Test connection state transitions | thanhtupppp | Not Started |  |  |  |  |
| M-01 | Tạo status evaluator riêng cho T1/T2/T3 | thanhtupppp | Not Started |  |  |  |  |
| M-02 | Tách semantics T3 khỏi nhiệt độ tuyệt đối | thanhtupppp | Not Started |  |  |  |  |
| M-03 | Xử lý thresholdType dead code | thanhtupppp | Not Started |  |  |  |  |
| M-04 | Ổn định polling effect dependencies | thanhtupppp | Not Started |  |  |  |  |
| M-05 | Chuẩn hóa cách truyền isOnline | thanhtupppp | Not Started |  |  |  |  |
| M-06 | Tách rõ connection mode enum | thanhtupppp | Not Started |  |  |  |  |
| M-07 | Đưa API endpoint sang env config | thanhtupppp | Not Started |  |  |  |  |
| M-08 | Tách Wokwi bridge khỏi vite.config.js | thanhtupppp | Not Started |  |  |  |  |
| M-09 | Chuẩn hóa error handling | thanhtupppp | Not Started |  |  |  |  |
| M-10 | Test sensor semantics | thanhtupppp | Not Started |  |  |  |  |
| L-01 | Persist theme | thanhtupppp | Not Started |  |  |  |  |
| L-02 | Sửa uptime = 0 | thanhtupppp | Not Started |  |  |  |  |
| L-03 | Thêm ESLint | thanhtupppp | Not Started |  |  |  |  |
| L-04 | Thêm unit test framework | thanhtupppp | Not Started |  |  |  |  |
| L-05 | Thêm responsive E2E tests | thanhtupppp | Not Started |  |  |  |  |
| L-06 | Thêm CI cho build/lint/test | thanhtupppp | Not Started |  |  |  |  |
| L-07 | Gom magic numbers thành constants | thanhtupppp | Not Started |  |  |  |  |
| L-08 | Viết documentation cho sensor/data model | thanhtupppp | Not Started |  |  |  |  |

## Definition of Done
- T1=-23°C, T2=-28°C => ΔTair=+5K xuyên suốt hệ thống.
- Sensor stale tự offline dù socket còn kết nối.
- Không có polling request chồng nhau.
- Payload lỗi không được đưa vào state.
- Demo/live/reconnecting/offline được phân biệt rõ.
- T1/T2/T3 có status semantics riêng.
- Build, lint, unit test và responsive E2E đều PASS.
