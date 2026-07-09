import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const MOBILE = { width: 390, height: 844 };

function stickyBar(page: Page) {
  return page.locator("div.fixed.bottom-0").filter({ hasText: "Забронировать" });
}

/**
 * Прокручиваем ровно до момента, когда низ секции тарифов вошёл в экран, —
 * это и есть «тарифы дочитаны». Дальше начинается зона видимости панели,
 * которая заканчивается на футере.
 */
async function scrollToEndOfPlans(page: Page) {
  await page.evaluate(() => {
    const plans = document.getElementById("plans");
    if (!plans) throw new Error("нет секции тарифов");
    const bottom = plans.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo({ top: bottom - window.innerHeight + 80, behavior: "instant" });
  });
  // Даём IntersectionObserver дойти до колбэка.
  await page.waitForTimeout(300);
}

test.describe("липкая панель", () => {
  test("на мобильном появляется после тарифов и не перекрывает футер", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");

    const bar = stickyBar(page);

    // Вверху страницы панели нет: человек ещё не видел цен.
    await expect(bar).toBeHidden();

    await scrollToEndOfPlans(page);
    await expect(bar).toBeVisible();
    await expect(bar).toContainText("Про");

    // У футера панель уходит: перекрывать контакты она не должна.
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    );
    await page.waitForTimeout(300);
    await expect(bar).toBeHidden();
  });

  test("панель показывает цену выбранного тарифа", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");

    await page
      .locator('#plans label:has(input[value="mentor"])')
      .getByRole("heading")
      .click();

    await scrollToEndOfPlans(page);

    const bar = stickyBar(page);
    await expect(bar).toBeVisible();
    await expect(bar).toContainText("С наставником");
    await expect(bar).toContainText("89");
  });

  test("на десктопе панели нет никогда", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    await scrollToEndOfPlans(page);
    await expect(stickyBar(page)).toBeHidden();
  });
});
