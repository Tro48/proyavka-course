import { describe, expect, it } from "vitest";

import { cohorts } from "./cohorts";

const dateFields = ["startsAt", "endsAt", "enrollmentClosesAt"] as const;

describe("конфиг потоков", () => {
  it("вперёд заданы четыре потока", () => {
    expect(cohorts).toHaveLength(4);
  });

  it("ни одна дата не записана в локальном времени", () => {
    for (const cohort of cohorts) {
      for (const field of dateFields) {
        const value = cohort[field];
        expect(value, `${cohort.id}.${field}`).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
        );
        expect(Number.isNaN(Date.parse(value)), `${cohort.id}.${field}`).toBe(false);
      }
    }
  });

  it("набор закрывается раньше старта, старт раньше конца", () => {
    for (const cohort of cohorts) {
      const closes = Date.parse(cohort.enrollmentClosesAt);
      const starts = Date.parse(cohort.startsAt);
      const ends = Date.parse(cohort.endsAt);

      expect(closes, cohort.id).toBeLessThan(starts);
      expect(starts, cohort.id).toBeLessThan(ends);
    }
  });

  it("потоки идут по порядку и не накладываются на набор следующего", () => {
    for (let i = 1; i < cohorts.length; i += 1) {
      const previous = cohorts[i - 1];
      const current = cohorts[i];
      if (!previous || !current) throw new Error("недостижимо");

      expect(current.number).toBe(previous.number + 1);
      expect(Date.parse(current.startsAt)).toBeGreaterThan(Date.parse(previous.endsAt));

      // Пока идёт предыдущий поток, набор на следующий обязан быть ещё открыт,
      // иначе состояние `closed` уведёт на поток, куда уже не записаться.
      expect(Date.parse(current.enrollmentClosesAt)).toBeGreaterThan(
        Date.parse(previous.endsAt),
      );
    }
  });

  it("мест не больше, чем всего", () => {
    for (const cohort of cohorts) {
      expect(cohort.seatsLeft).toBeGreaterThanOrEqual(0);
      expect(cohort.seatsLeft).toBeLessThanOrEqual(cohort.seatsTotal);
    }
  });
});
