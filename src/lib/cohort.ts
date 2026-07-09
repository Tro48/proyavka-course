import type { Cohort } from "@/content/cohorts";

/**
 * Всё состояние лендинга, зависящее от времени, считается здесь — одной чистой
 * функцией. Время приходит аргументом: обращение к `Date.now()` внутри сделало
 * бы функцию непроверяемой, а ошибку в ней — незаметной до продакшена.
 */

/** Меньше 48 часов до закрытия набора — это «последний вызов». */
export const LAST_CALL_HOURS = 48;

/** Три места и меньше — тоже «последний вызов», при любом сроке. */
export const LAST_CALL_SEATS = 3;

const HOUR_MS = 60 * 60 * 1000;

export type CohortState =
  /** Набор идёт. */
  | { kind: "enrolling"; cohort: Cohort; deadline: string }
  /** Набор идёт, но заканчивается: мало времени или мало мест. */
  | { kind: "lastCall"; cohort: Cohort; deadline: string }
  /** Набор на текущий поток закрыт, но есть следующий. */
  | { kind: "closed"; current: Cohort; next: Cohort; deadline: string }
  /** Потоков в конфиге не осталось. Спасает лендинг через год после деплоя. */
  | { kind: "waitlist" };

const WAITLIST: CohortState = { kind: "waitlist" };

export function resolveCohortState(now: Date, list: readonly Cohort[]): CohortState {
  const nowMs = now.getTime();

  const sorted = [...list].sort(
    (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt),
  );

  // Текущий поток — первый, который ещё не завершился. Уже идущий поток
  // остаётся текущим: показать по нему «набор закрыт» честнее, чем waitlist.
  const index = sorted.findIndex((cohort) => nowMs < Date.parse(cohort.endsAt));
  const current = index === -1 ? undefined : sorted[index];
  if (!current) return WAITLIST;

  const closesAt = Date.parse(current.enrollmentClosesAt);
  const seatsLeft = Math.max(0, current.seatsLeft);

  // Распроданный поток закрыт, даже если формально срок ещё не вышел.
  if (nowMs < closesAt && seatsLeft > 0) {
    const isLastCall =
      seatsLeft <= LAST_CALL_SEATS || closesAt - nowMs < LAST_CALL_HOURS * HOUR_MS;

    return {
      kind: isLastCall ? "lastCall" : "enrolling",
      cohort: current,
      deadline: current.enrollmentClosesAt,
    };
  }

  const next = sorted[index + 1];
  if (!next) return WAITLIST;

  return { kind: "closed", current, next, deadline: next.startsAt };
}
