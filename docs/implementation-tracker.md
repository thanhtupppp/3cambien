# Implementation Tracker

Updated: 2026-09-22

Status values: Not Started / In Progress / Blocked / In Review / Done / Skipped

| ID | Work item | Owner | Status | Start date | Completion date | Blocker | Evidence |
|---|---|---|---|---|---|---|---|
| C-01 | Sửa công thức ΔT thành T1 - T2 | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | src/utils/temperatureMetrics.js; App/useTemperatures/vite bridge |
| C-02 | Chuẩn hóa tên metric ΔTair | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | ΔTair naming in data/UI |
| C-03 | Sửa ngưỡng đánh giá ΔT | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | evaluateDeltaAir() centralized ranges |
| C-04 | Viết test logic ΔT | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | test/temperatureMetrics.test.js |
| H-01 | Chống polling overlap | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | useTemperatures requestControllerRef |
| H-02 | Hủy request khi component unmount | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | AbortController cleanup in useTemperatures |
| H-03 | Validate API payload | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | validateTemperaturePayload() + test/apiValidation.test.js |
| H-04 | Sửa điều kiện undefined !== null | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | Number.isFinite sensor validation |
| H-05 | Thêm sensor TTL / lastSeen | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | SENSOR_TTL_MS + sensorLastSeen |
| H-06 | Sửa semantics trạng thái system online | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | bridge connecting until valid telemetry |
| H-07 | Reset stale ΔT khi sensor offline | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | deltaAir reset when T1/T2 stale |
| H-08 | Sửa initial demo history | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | cold-room demo baseline around -23°C |
| H-09 | Test connection state transitions | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | test/connectionTransitions.test.js + src/utils/connectionTransitions.js |
| M-01 | Tạo status evaluator riêng cho T1/T2/T3 | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | src/utils/sensorStatus.js |
| M-02 | Tách semantics T3 khỏi nhiệt độ tuyệt đối | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | T3 status no longer based on absolute sub-zero temp |
| M-03 | Xử lý thresholdType dead code | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | removed unused thresholdType |
| M-04 | Ổn định polling effect dependencies | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | connectionStatus removed from fetchData dependency |
| M-05 | Chuẩn hóa cách truyền isOnline | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | App passes online only for connected/demo |
| M-06 | Tách rõ connection mode enum | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | src/constants/connectionStatus.js + shared enum usage across hook/App/Header/API/bridge |
| M-07 | Đưa API endpoint sang env config | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | VITE_TEMPERATURE_API_URL fallback endpoint |
| M-08 | Tách Wokwi bridge khỏi vite.config.js | thanhtupppp | Skipped |  | 2026-09-22 | Bỏ Wokwi khỏi scope theo quyết định hiện tại | Không triển khai |
| M-09 | Chuẩn hóa error handling | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | src/utils/telemetryError.js + API/hook normalization + test/telemetryError.test.js |
| M-10 | Test sensor semantics | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | test/sensorStatus.test.js |
| L-01 | Persist theme | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | localStorage + prefers-color-scheme |
| L-02 | Sửa uptime = 0 | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | Header zero uptime guard |
| L-03 | Thêm ESLint | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | eslint.config.js + npm run lint |
| L-04 | Thêm unit test framework | thanhtupppp | Done | 2026-09-22 | 2026-09-22 |  | Node.js node:test + npm test + 5 test suites |
| L-05 | Thêm responsive E2E tests | thanhtupppp | In Review | 2026-09-22 |  | Chờ CI chạy Playwright | e2e/txv-responsive.spec.js + playwright.config.js + mobile CSS hardening |
| L-06 | Thêm CI cho build/lint/test | thanhtupppp | In Review | 2026-09-22 |  | Chờ GitHub Actions xác nhận | .github/workflows/ci.yml: build + lint + unit + responsive E2E |
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
