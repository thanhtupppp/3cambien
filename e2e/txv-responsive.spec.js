import { test, expect } from '@playwright/test';

const responsiveComponents = [
  '.txv-header',
  '.txv-inputs-grid',
  '.txv-result-panel',
  '.txv-chart-container',
  '.ph-diagram-container'
];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /BỘ ĐIỀU CHỈNH QUÁ NHIỆT TXV/i })).toBeVisible();
});

test('TXV workspace does not create page-level horizontal overflow', async ({ page }) => {
  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    pageWidth: document.documentElement.scrollWidth
  }));

  expect(metrics.pageWidth).toBeLessThanOrEqual(metrics.viewport + 1);
});

test('core TXV components remain inside the viewport', async ({ page }) => {
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  for (const selector of responsiveComponents) {
    const component = page.locator(selector).first();
    await expect(component).toBeVisible();

    const box = await component.boundingBox();
    expect(box, selector).not.toBeNull();
    expect(box.x, selector).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width, selector).toBeLessThanOrEqual(viewport.width + 1);
  }
});

test('controls and key content remain usable at every breakpoint', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Theo Nhiệt Độ Kho Mong Muốn/i })).toBeVisible();
  await expect(page.getByText(/KẾT QUẢ ĐỘ QUÁ NHIỆT HIỆN TẠI/i)).toBeVisible();
  await expect(page.getByText(/LỊCH SỬ ĐIỀU CHỈNH ĐỘ QUÁ NHIỆT/i)).toBeVisible();
  await expect(page.getByText(/SƠ ĐỒ CHU TRÌNH LẠNH P–h/i)).toBeVisible();
});

test('result panel collapses to one column on narrow layouts', async ({ page }) => {
  const viewport = page.viewportSize();
  const columns = await page.locator('.txv-result-panel').evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length
  );

  if (viewport.width <= 768) {
    expect(columns).toBe(1);
  } else {
    expect(columns).toBeGreaterThanOrEqual(2);
  }
});
