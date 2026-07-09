import { describe, expect, it } from "vitest";

import type { Cohort } from "@/content/cohorts";

import { getCohortCopy } from "./cohort-copy";

const cohort: Cohort = {
  id: "cohort-4",
  number: 4,
  startsAt: "2026-09-15T16:00:00Z",
  endsAt: "2026-11-10T16:00:00Z",
  seatsTotal: 12,
  seatsLeft: 8,
  enrollmentClosesAt: "2026-09-11T20:59:00Z",
};

const next: Cohort = {
  ...cohort,
  id: "cohort-5",
  number: 5,
  startsAt: "2026-11-24T16:00:00Z",
  endsAt: "2027-01-19T16:00:00Z",
  seatsLeft: 12,
  enrollmentClosesAt: "2026-11-20T20:59:00Z",
};

describe("getCohortCopy", () => {
  it("enrolling: дата старта, таймер до закрытия набора, спокойная кнопка", () => {
    const copy = getCohortCopy({
      kind: "enrolling",
      cohort,
      deadline: cohort.enrollmentClosesAt,
    });

    expect(copy.title).toBe("Старт 15 сентября");
    expect(copy.countdown).toMatchObject({
      deadline: cohort.enrollmentClosesAt,
      urgent: false,
    });
    expect(copy.cta).toEqual({ label: "Забронировать место", kind: "booking" });
    expect(copy.target).toBe(cohort);
  });

  it("lastCall: считает места и красит таймер", () => {
    const copy = getCohortCopy({
      kind: "lastCall",
      cohort: { ...cohort, seatsLeft: 3 },
      deadline: cohort.enrollmentClosesAt,
    });

    expect(copy.title).toBe("Осталось 3 места");
    expect(copy.countdown?.urgent).toBe(true);
    expect(copy.cta.label).toBe("Успеть записаться");
  });

  it("closed: таймер до старта следующего, бронируем следующий", () => {
    const copy = getCohortCopy({
      kind: "closed",
      current: cohort,
      next,
      deadline: next.startsAt,
    });

    expect(copy.title).toBe("Набор на поток 4 закрыт");
    expect(copy.countdown).toMatchObject({ deadline: next.startsAt, urgent: false });
    expect(copy.cta.label).toBe("Записаться на поток 5");
    expect(copy.target).toBe(next);
  });

  it("waitlist: таймера нет — отрицательному отсчёту неоткуда взяться", () => {
    const copy = getCohortCopy({ kind: "waitlist" });

    expect(copy.countdown).toBeNull();
    expect(copy.target).toBeNull();
    expect(copy.seats).toBeNull();
    expect(copy.cta).toEqual({ label: "В лист ожидания", kind: "waitlist" });
  });

  it("места показываются только пока их можно занять", () => {
    const enrolling = getCohortCopy({
      kind: "enrolling",
      cohort,
      deadline: cohort.enrollmentClosesAt,
    });
    const closed = getCohortCopy({
      kind: "closed",
      current: cohort,
      next,
      deadline: next.startsAt,
    });

    expect(enrolling.seats).toEqual({ left: 8, total: 12 });
    expect(closed.seats).toBeNull();
  });
});
