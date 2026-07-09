import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LeadResponse } from "@/lib/schemas/lead";
import { TIME_TRAP_MS } from "@/lib/schemas/lead";

const insert = vi.fn();
const checkRateLimit = vi.fn();

// Оба модуля помечены `server-only` и в тесте не должны исполняться по-настоящему.
vi.mock("@/lib/supabase/server", () => ({
  UNIQUE_VIOLATION: "23505",
  createServiceClient: () => ({ from: () => ({ insert }) }),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (ip: string) => checkRateLimit(ip),
  clientIp: () => "203.0.113.7",
  isRateLimitEnabled: true,
}));

const { POST } = await import("./route");

/** Заявка, отправленная человеком: форма живёт дольше time-trap. */
function body(overrides: Record<string, unknown> = {}) {
  return {
    name: "Марина",
    email: "marina@example.com",
    plan: "pro",
    cohortId: "cohort-4",
    consent: true,
    renderedAt: Date.now() - TIME_TRAP_MS - 1000,
    ...overrides,
  };
}

function post(payload: unknown): Promise<Response> {
  const request = new Request("http://localhost/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  return POST(request as NextRequest);
}

async function read(response: Response): Promise<LeadResponse> {
  return (await response.json()) as LeadResponse;
}

beforeEach(() => {
  insert.mockReset().mockResolvedValue({ error: null });
  checkRateLimit.mockReset().mockResolvedValue(true);
});

describe("POST /api/lead", () => {
  it("записывает корректную заявку", async () => {
    const response = await post(body());

    expect(response.status).toBe(201);
    expect(await read(response)).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Марина",
        email: "marina@example.com",
        plan: "pro",
        cohort_id: "cohort-4",
        phone: null,
      }),
    );
  });

  it("повторная отправка того же email на тот же поток — 409, а не 500", async () => {
    insert.mockResolvedValue({ error: { code: "23505", message: "duplicate key" } });

    const response = await post(body());

    expect(response.status).toBe(409);
    expect(response.status).not.toBe(500);

    const result = await read(response);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toContain("уже забронировали место");
  });

  it("любая другая ошибка базы — это 500", async () => {
    insert.mockResolvedValue({ error: { code: "08006", message: "connection failure" } });
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect((await post(body())).status).toBe(500);
  });

  it("заполненный honeypot: молчаливый успех и никакой записи", async () => {
    const response = await post(body({ website: "http://spam.example" }));

    expect(response.status).toBe(200);
    expect(await read(response)).toEqual({ ok: true });
    // Честное «вы бот» научило бы автора бота обходить ловушку.
    expect(insert).not.toHaveBeenCalled();
  });

  it("форма заполнена быстрее трёх секунд: тоже бот", async () => {
    const response = await post(body({ renderedAt: Date.now() }));

    expect(response.status).toBe(200);
    expect(insert).not.toHaveBeenCalled();
  });

  it("превышен лимит запросов — 429 и никакой записи", async () => {
    checkRateLimit.mockResolvedValue(false);

    const response = await post(body());

    expect(response.status).toBe(429);
    expect(checkRateLimit).toHaveBeenCalledWith("203.0.113.7");
    expect(insert).not.toHaveBeenCalled();
  });

  it("невалидные поля — 422 с адресом ошибки", async () => {
    const response = await post(body({ email: "не почта", consent: false }));
    const result = await read(response);

    expect(response.status).toBe(422);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.fieldErrors).toMatchObject({
      email: "Проверьте адрес почты",
      consent: "Нужно согласие на обработку данных",
    });
    expect(insert).not.toHaveBeenCalled();
  });

  it("серверная валидация не верит клиенту: неизвестный тариф отклонён", async () => {
    expect((await post(body({ plan: "free" }))).status).toBe(422);
    expect(insert).not.toHaveBeenCalled();
  });

  it("UTM-метки долетают до строки в БД", async () => {
    await post(body({ utm: { utm_source: "vk", utm_campaign: "autumn" } }));

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ utm: { utm_source: "vk", utm_campaign: "autumn" } }),
    );
  });

  it("телефон нормализуется перед записью", async () => {
    await post(body({ phone: "8 (999) 123-45-67" }));

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ phone: "+79991234567" }),
    );
  });

  it("сломанный JSON не роняет сервер", async () => {
    const request = new Request("http://localhost/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{не json",
    });

    expect((await POST(request as NextRequest)).status).toBe(400);
  });
});
