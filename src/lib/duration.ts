export type Duration = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Сколько осталось всего. Ноль означает, что дедлайн уже прошёл. */
  totalMs: number;
};

const SECOND = 1000;
const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Разница в миллисекундах → человеческая длительность.
 *
 * Отрицательная разница схлопывается в нули: истёкший дедлайн должен показать
 * `00:00:00:00`, а не `-1` день. Отрицательный отсчёт на лендинге — это первое,
 * что заметит человек, открывший ссылку через год.
 */
export function toDuration(ms: number): Duration {
  const totalMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  const totalSeconds = Math.floor(totalMs / SECOND);

  return {
    days: Math.floor(totalSeconds / DAY),
    hours: Math.floor(totalSeconds / HOUR) % 24,
    minutes: Math.floor(totalSeconds / MINUTE) % 60,
    seconds: totalSeconds % 60,
    totalMs,
  };
}

export function isExpired(duration: Duration): boolean {
  return duration.totalMs === 0;
}
