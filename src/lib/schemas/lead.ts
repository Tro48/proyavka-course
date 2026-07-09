import { z } from "zod";

import { PLAN_IDS } from "@/content/plans";

/**
 * Одна схема на клиент и сервер. Клиентская проверка — это UX, а не защита:
 * запрос в `/api/lead` может прийти откуда угодно, поэтому Route Handler
 * валидирует тем же кодом.
 */

/** Телефон храним нормализованным: `+7XXXXXXXXXX`. Маску показываем в поле. */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits === "") return "";

  const withoutCountry =
    digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))
      ? digits.slice(1)
      : digits;

  return `+7${withoutCountry}`;
}

const optionalPhone = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const normalized = normalizePhone(value);
    return normalized === "" ? undefined : normalized;
  },
  z
    .string()
    .regex(/^\+7\d{10}$/, "Формат: +7 XXX XXX-XX-XX")
    .optional(),
);

/** Секунды, за которые человек физически не заполнит форму. Бот заполнит. */
export const TIME_TRAP_MS = 3000;

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Слишком короткое имя").max(60, "Слишком длинное имя"),
  email: z.email("Проверьте адрес почты").max(120),
  phone: optionalPhone,

  plan: z.enum(PLAN_IDS),
  cohortId: z.string().min(1),

  consent: z.literal(true, { error: "Нужно согласие на обработку данных" }),

  // Honeypot: настоящий пользователь этого поля не видит и не заполняет.
  // Схема его пропускает намеренно — решение принимает Route Handler и отвечает
  // боту молчаливым успехом. Ошибка валидации подсказала бы, где ловушка.
  website: z.string().max(200).optional(),

  // Time-trap: когда форма была отрисована.
  renderedAt: z.number().int().positive(),
});

export type LeadInput = z.input<typeof leadSchema>;
export type LeadOutput = z.output<typeof leadSchema>;

/** Метки из URL. Ключи и значения ограничены, чтобы в jsonb не улетел роман. */
export const utmSchema = z.record(z.string().max(40), z.string().max(200));

export type Utm = z.infer<typeof utmSchema>;

export const leadRequestSchema = leadSchema.extend({
  utm: utmSchema.optional(),
});

export type LeadRequest = z.infer<typeof leadRequestSchema>;

export type LeadResponse =
  { ok: true } | { ok: false; message: string; fieldErrors?: Record<string, string> };
