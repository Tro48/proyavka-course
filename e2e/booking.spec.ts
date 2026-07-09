import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Один smoke-сценарий: выбрать «Про» → открыть форму → тариф предвыбран →
 * отправить. Сеть замокана: E2E проверяет проводку между стором, формой и
 * экраном успеха, а не Supabase.
 *
 * Ищем карточки по `input[value=…]`, а не по тексту: слово «Про» встречается
 * и в списке тарифа «С наставником» («Всё из „Про“»).
 */
function planCard(page: Page, plan: string): Locator {
  return page.locator(`#plans label:has(input[value="${plan}"])`);
}

async function fillLead(dialog: Locator) {
  await dialog.getByLabel("Имя").fill("Марина");
  await dialog.getByLabel("Почта").fill("marina@example.com");
  await dialog.getByRole("checkbox").check();
}

test("бронь по тарифу «Про» доходит до экрана успеха", async ({ page }) => {
  const requests: unknown[] = [];

  await page.route("**/api/lead", async (route) => {
    requests.push(route.request().postDataJSON());
    // Держим ответ: иначе экран успеха придёт раньше второго клика,
    // и проверять состояние pending будет не на чем.
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.fulfill({ status: 201, json: { ok: true } });
  });

  await page.goto("/?utm_source=vk");

  const pro = planCard(page, "pro");
  await pro.scrollIntoViewIfNeeded();

  // «Про» выделен и выбран по умолчанию.
  await expect(pro.locator("input[type=radio]")).toBeChecked();

  // Выбор живёт в сторе: уходим на другой тариф и возвращаемся.
  // Кликаем по заголовку карточки: сам radio — sr-only, как и у живого человека.
  await planCard(page, "mentor").getByRole("heading").click();
  await expect(pro.locator("input[type=radio]")).not.toBeChecked();
  await pro.getByRole("heading").click();
  await expect(pro.locator("input[type=radio]")).toBeChecked();

  await pro.getByRole("button", { name: "Забронировать место" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Форма открылась с предвыбранным тарифом.
  await expect(dialog.locator('input[value="pro"]')).toBeChecked();

  await fillLead(dialog);

  // Time-trap: форма должна прожить дольше трёх секунд.
  await page.waitForTimeout(3200);

  // По type, а не по тексту: в pending подпись меняется на «Отправляем…».
  const submit = dialog.locator('button[type="submit"]');
  await expect(submit).toHaveText(/Забронировать за/);

  await submit.click();
  await expect(submit).toHaveAttribute("aria-busy", "true");

  // Повторный клик в состоянии pending не должен слать второй запрос.
  await submit.click({ force: true });

  await expect(dialog.getByText("Заявка принята")).toBeVisible();

  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({
    name: "Марина",
    email: "marina@example.com",
    plan: "pro",
    cohortId: "cohort-4",
    consent: true,
    utm: { utm_source: "vk" },
  });
});

test("повторная бронь того же email показывает текст, а не ошибку сервера", async ({
  page,
}) => {
  await page.route("**/api/lead", async (route) => {
    await route.fulfill({
      status: 409,
      json: { ok: false, message: "Вы уже забронировали место на этот поток." },
    });
  });

  await page.goto("/");

  await planCard(page, "pro").scrollIntoViewIfNeeded();
  await planCard(page, "pro")
    .getByRole("button", { name: "Забронировать место" })
    .click();

  const dialog = page.getByRole("dialog");
  await fillLead(dialog);
  await page.waitForTimeout(3200);
  await dialog.locator('button[type="submit"]').click();

  await expect(dialog.getByRole("alert")).toContainText("уже забронировали место");
  await expect(dialog.getByText("Заявка принята")).toBeHidden();
});

test("форма не отправляется без согласия на обработку данных", async ({ page }) => {
  let called = false;
  await page.route("**/api/lead", async (route) => {
    called = true;
    await route.fulfill({ status: 201, json: { ok: true } });
  });

  await page.goto("/");
  await planCard(page, "pro").scrollIntoViewIfNeeded();
  await planCard(page, "pro")
    .getByRole("button", { name: "Забронировать место" })
    .click();

  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Имя").fill("Марина");
  await dialog.getByLabel("Почта").fill("marina@example.com");
  await page.waitForTimeout(3200);
  await dialog.locator('button[type="submit"]').click();

  await expect(dialog.getByRole("alert")).toContainText("Нужно согласие");
  expect(called).toBe(false);
});
