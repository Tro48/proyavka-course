import { describe, expect, it } from "vitest";

import type { LeadInput } from "./lead";
import { leadSchema, normalizePhone } from "./lead";

function valid(overrides: Partial<LeadInput> = {}): LeadInput {
  return {
    name: "Марина",
    email: "marina@example.com",
    plan: "pro",
    cohortId: "cohort-4",
    consent: true,
    renderedAt: 1_700_000_000_000,
    ...overrides,
  };
}

/** Сообщение об ошибке по конкретному полю. */
function errorFor(input: unknown, field: string): string | undefined {
  const result = leadSchema.safeParse(input);
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

describe("leadSchema", () => {
  it("пропускает корректную заявку", () => {
    expect(leadSchema.safeParse(valid()).success).toBe(true);
  });

  it("отклоняет невалидный email", () => {
    expect(errorFor(valid({ email: "марина собака почта" }), "email")).toBe(
      "Проверьте адрес почты",
    );
    expect(errorFor(valid({ email: "no-at-sign.com" }), "email")).toBeDefined();
    expect(errorFor(valid({ email: "" }), "email")).toBeDefined();
  });

  it("не отправляется без согласия на обработку данных", () => {
    expect(errorFor(valid({ consent: false as unknown as true }), "consent")).toBe(
      "Нужно согласие на обработку данных",
    );
    expect(errorFor({ ...valid(), consent: undefined }, "consent")).toBeDefined();
  });

  it("honeypot проходит валидацию: его судьбу решает Route Handler", () => {
    // Ошибка валидации на этом поле подсказала бы боту, где ловушка.
    // Сервер отвечает на заполненный honeypot молчаливым успехом — см. route.test.ts.
    expect(leadSchema.safeParse(valid({ website: "http://spam.example" })).success).toBe(
      true,
    );
    expect(leadSchema.safeParse(valid({ website: "" })).success).toBe(true);
    expect(leadSchema.safeParse(valid()).success).toBe(true);
  });

  it("имя короче двух символов не проходит", () => {
    expect(errorFor(valid({ name: "М" }), "name")).toBe("Слишком короткое имя");
    // Пробелы по краям не считаются за длину.
    expect(errorFor(valid({ name: "  М  " }), "name")).toBe("Слишком короткое имя");
  });

  it("телефон необязателен, но если есть — нормализуется", () => {
    expect(leadSchema.safeParse(valid()).success).toBe(true);
    expect(leadSchema.safeParse(valid({ phone: "" })).success).toBe(true);

    const parsed = leadSchema.parse(valid({ phone: "8 (999) 123-45-67" }));
    expect(parsed.phone).toBe("+79991234567");
  });

  it("телефон неверной длины отклоняется", () => {
    expect(errorFor(valid({ phone: "12345" }), "phone")).toBe("Формат: +7 XXX XXX-XX-XX");
  });

  it("тариф ограничен известными значениями", () => {
    expect(
      leadSchema.safeParse(valid({ plan: "free" as unknown as "pro" })).success,
    ).toBe(false);
  });

  it("renderedAt обязателен: без него не проверить time-trap", () => {
    expect(errorFor({ ...valid(), renderedAt: undefined }, "renderedAt")).toBeDefined();
  });
});

describe("normalizePhone", () => {
  it.each([
    ["+7 (999) 123-45-67", "+79991234567"],
    ["8 999 123 45 67", "+79991234567"],
    ["79991234567", "+79991234567"],
    ["9991234567", "+79991234567"],
    ["", ""],
  ])("%s → %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });
});
