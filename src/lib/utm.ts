import type { Utm } from "@/lib/schemas/lead";

const TRACKED = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "yclid",
] as const;

/**
 * Метки из URL. Читаем на клиенте из `location.search`, а не через
 * `useSearchParams()`: последний увёл бы всю страницу из статики в динамику
 * ради строки, которая нужна одной форме.
 */
export function readUtm(search: string): Utm | undefined {
  const params = new URLSearchParams(search);
  const utm: Utm = {};

  for (const key of TRACKED) {
    const value = params.get(key);
    if (value) utm[key] = value.slice(0, 200);
  }

  return Object.keys(utm).length > 0 ? utm : undefined;
}
