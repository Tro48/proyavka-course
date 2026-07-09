/**
 * Даты потоков — единственный источник правды о времени на лендинге.
 *
 * Все они записаны в UTC. Тип `UtcIso` требует суффикса `Z` на уровне
 * компилятора: дата в локальном времени просто не соберётся. Пользователю
 * показываем московское время с явной подписью «(мск)» — человек из
 * Владивостока не должен гадать, чей вечер имеется в виду.
 *
 * Занятия идут в 19:00 мск = 16:00 UTC. Приём заявок закрывается в 23:59 мск
 * = 20:59 UTC за четыре дня до старта: нужно успеть собрать группу.
 */

/** ISO 8601 строго в UTC. Суффикс `Z` обязателен. */
export type UtcIso = `${number}-${string}Z`;

export type Cohort = {
  id: string;
  number: number;
  startsAt: UtcIso;
  endsAt: UtcIso;
  seatsTotal: number;
  /** Мест физически мало: лаборатория одна, увеличителей шесть. */
  seatsLeft: number;
  /** Приём заявок закрывается раньше старта. */
  enrollmentClosesAt: UtcIso;
};

export const cohorts: Cohort[] = [
  {
    id: "cohort-4",
    number: 4,
    startsAt: "2026-09-15T16:00:00Z",
    endsAt: "2026-11-10T16:00:00Z",
    seatsTotal: 12,
    seatsLeft: 4,
    enrollmentClosesAt: "2026-09-11T20:59:00Z",
  },
  {
    id: "cohort-5",
    number: 5,
    startsAt: "2026-11-24T16:00:00Z",
    endsAt: "2027-01-19T16:00:00Z",
    seatsTotal: 12,
    seatsLeft: 12,
    enrollmentClosesAt: "2026-11-20T20:59:00Z",
  },
  {
    id: "cohort-6",
    number: 6,
    startsAt: "2027-02-09T16:00:00Z",
    endsAt: "2027-04-06T16:00:00Z",
    seatsTotal: 12,
    seatsLeft: 12,
    enrollmentClosesAt: "2027-02-05T20:59:00Z",
  },
  {
    id: "cohort-7",
    number: 7,
    startsAt: "2027-04-20T16:00:00Z",
    endsAt: "2027-06-15T16:00:00Z",
    seatsTotal: 12,
    seatsLeft: 12,
    enrollmentClosesAt: "2027-04-16T20:59:00Z",
  },
];
