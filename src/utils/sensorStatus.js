export function getSensorStatus(index, temp, online) {
  if (!online || !Number.isFinite(temp)) {
    return { text: 'MẤT TÍN HIỆU', className: 'status-error' };
  }

  if (index === 2) {
    return { text: 'ĐANG ĐO GAS HỒI', className: 'status-normal' };
  }

  if (index === 0) {
    if (temp <= -20) return { text: 'KHO ĐÔNG', className: 'status-optimal' };
    if (temp <= 5) return { text: 'KHO MÁT', className: 'status-normal' };
    return { text: 'NHIỆT ĐỘ CAO', className: 'status-warning' };
  }

  if (index === 1) {
    if (temp < -20) return { text: 'KHÍ RA LẠNH', className: 'status-optimal' };
    if (temp <= 10) return { text: 'ĐANG LÀM LẠNH', className: 'status-normal' };
    return { text: 'KHÍ RA ẤM', className: 'status-warning' };
  }

  return { text: 'ĐANG HOẠT ĐỘNG', className: 'status-normal' };
}
