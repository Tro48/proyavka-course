import { expect, test } from "@playwright/test";

/**
 * Лайтбокс контрольного листа.
 *
 * Клик по бэкдропу проверяется отдельно и намеренно: пока `Dialog.Content` был
 * растянут на весь экран, клик мимо снимка попадал внутрь контента, radix не
 * считал его кликом снаружи, и модалка не закрывалась. Глазами баг незаметен —
 * крестик и Esc продолжали работать.
 */
test.describe("лайтбокс", () => {
  test("открывается по кадру и закрывается кликом по бэкдропу", async ({ page }) => {
    await page.goto("/");

    const frame = page.getByRole("button", { name: /Пустой двор-колодец/ });
    await frame.scrollIntoViewIfNeeded();
    await frame.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Верхний левый угол: снимок отцентрован, значит здесь только бэкдроп.
    await page.mouse.click(8, 8);
    await expect(dialog).toBeHidden();
  });

  test("закрывается по Esc", async ({ page }) => {
    await page.goto("/");

    const frame = page.getByRole("button", { name: /Пустой двор-колодец/ });
    await frame.scrollIntoViewIfNeeded();
    await frame.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
