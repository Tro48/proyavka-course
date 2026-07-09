/**
 * Даты в конфиге — UTC, а зритель лендинга живёт в Москве или считает от неё.
 * Форматируем в `Europe/Moscow` и всегда подписываем «(мск)».
 */

const MOSCOW = "Europe/Moscow";

const dayMonth = new Intl.DateTimeFormat("ru-RU", {
  timeZone: MOSCOW,
  day: "numeric",
  month: "long",
});

const dayMonthYear = new Intl.DateTimeFormat("ru-RU", {
  timeZone: MOSCOW,
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeOnly = new Intl.DateTimeFormat("ru-RU", {
  timeZone: MOSCOW,
  hour: "2-digit",
  minute: "2-digit",
});

/** «15 сентября» */
export function formatDay(iso: string): string {
  return dayMonth.format(new Date(iso));
}

/** «15 сентября 2026 г.» */
export function formatDayYear(iso: string): string {
  return dayMonthYear.format(new Date(iso));
}

/** «11 сентября, 23:59 (мск)» */
export function formatDayTimeMsk(iso: string): string {
  const date = new Date(iso);
  return `${dayMonth.format(date)}, ${timeOnly.format(date)} (мск)`;
}

/** «15 сентября — 10 ноября» */
export function formatRange(fromIso: string, toIso: string): string {
  return `${formatDay(fromIso)} — ${formatDay(toIso)}`;
}
