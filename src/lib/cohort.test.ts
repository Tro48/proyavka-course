import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { Cohort } from "@/content/cohorts";

import { LAST_CALL_HOURS, LAST_CALL_SEATS, resolveCohortState } from "./cohort";

const HOUR = 60 * 60 * 1000;

/** Поток с настройками по умолчанию: набор открыт, мест много. */
function makeCohort(overrides: Partial<Cohort> = {}): Cohort {
  return {
    id: "cohort-4",
    number: 4,
    startsAt: "2026-09-15T16:00:00Z",
    endsAt: "2026-11-10T16:00:00Z",
    seatsTotal: 12,
    seatsLeft: 8,
    enrollmentClosesAt: "2026-09-11T20:59:00Z",
    ...overrides,
  };
}

const next = makeCohort({
  id: "cohort-5",
  number: 5,
  startsAt: "2026-11-24T16:00:00Z",
  endsAt: "2027-01-19T16:00:00Z",
  seatsLeft: 12,
  enrollmentClosesAt: "2026-11-20T20:59:00Z",
});

/** Момент за `hours` часов до закрытия набора первого потока. */
function hoursBeforeClose(cohort: Cohort, hours: number): Date {
  return new Date(new Date(cohort.enrollmentClosesAt).getTime() - hours * HOUR);
}

describe("resolveCohortState", () => {
  it("набор идёт: до закрытия далеко, мест хватает", () => {
    const current = makeCohort();
    const state = resolveCohortState(hoursBeforeClose(current, 30 * 24), [current, next]);

    expect(state).toEqual({
      kind: "enrolling",
      cohort: current,
      deadline: current.enrollmentClosesAt,
    });
  });

  it("до закрытия набора 47 часов — это lastCall", () => {
    const current = makeCohort();
    const state = resolveCohortState(hoursBeforeClose(current, 47), [current, next]);

    expect(state).toMatchObject({ kind: "lastCall", cohort: current });
  });

  it("ровно 48 часов до закрытия — ещё enrolling: граница не включена", () => {
    const current = makeCohort();
    const state = resolveCohortState(hoursBeforeClose(current, LAST_CALL_HOURS), [
      current,
      next,
    ]);

    expect(state.kind).toBe("enrolling");
  });

  it("осталось 3 места — lastCall при любом сроке", () => {
    const current = makeCohort({ seatsLeft: LAST_CALL_SEATS });
    const state = resolveCohortState(hoursBeforeClose(current, 30 * 24), [current, next]);

    expect(state).toMatchObject({ kind: "lastCall", cohort: current });
  });

  it("ровно момент enrollmentClosesAt — набор уже закрыт", () => {
    const current = makeCohort();
    const state = resolveCohortState(new Date(current.enrollmentClosesAt), [
      current,
      next,
    ]);

    expect(state).toEqual({
      kind: "closed",
      current,
      next,
      deadline: next.startsAt,
    });
  });

  it("набор закрыт, есть следующий поток — closed со ссылкой на next", () => {
    const current = makeCohort();
    const state = resolveCohortState(new Date("2026-09-12T00:00:00Z"), [current, next]);

    expect(state).toMatchObject({ kind: "closed", current, next });
  });

  it("поток начался, но не кончился — closed, а не waitlist", () => {
    const current = makeCohort();
    const during = new Date("2026-10-01T00:00:00Z");

    expect(during.getTime()).toBeGreaterThan(new Date(current.startsAt).getTime());
    expect(during.getTime()).toBeLessThan(new Date(current.endsAt).getTime());

    const state = resolveCohortState(during, [current, next]);

    expect(state).toMatchObject({ kind: "closed", current, next });
  });

  it("потоков в конфиге не осталось — waitlist", () => {
    const current = makeCohort();
    const afterEverything = new Date("2030-01-01T00:00:00Z");

    expect(resolveCohortState(afterEverything, [current, next])).toEqual({
      kind: "waitlist",
    });
  });

  it("пустой конфиг — waitlist, а не падение", () => {
    expect(resolveCohortState(new Date("2026-09-01T00:00:00Z"), [])).toEqual({
      kind: "waitlist",
    });
  });

  it("мест не осталось — набор закрыт, ведём на следующий поток", () => {
    const current = makeCohort({ seatsLeft: 0 });
    const state = resolveCohortState(hoursBeforeClose(current, 30 * 24), [current, next]);

    expect(state).toMatchObject({ kind: "closed", current, next });
  });

  it("последний поток идёт, следующего нет — waitlist", () => {
    const only = makeCohort();
    const during = new Date("2026-10-01T00:00:00Z");

    expect(resolveCohortState(during, [only])).toEqual({ kind: "waitlist" });
  });

  it("порядок потоков в конфиге не влияет на результат", () => {
    const current = makeCohort();
    const now = hoursBeforeClose(current, 30 * 24);

    expect(resolveCohortState(now, [next, current])).toEqual(
      resolveCohortState(now, [current, next]),
    );
  });
});

describe("чистота resolveCohortState", () => {
  it("в коде нет Date.now(): время приходит аргументом", () => {
    const source = readFileSync(resolve(process.cwd(), "src/lib/cohort.ts"), "utf8");
    // Комментарии не считаются: в них про Date.now() как раз и написано, почему его нет.
    const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

    expect(code).not.toMatch(/Date\.now\(\)/);
    expect(code).not.toMatch(/new Date\(\s*\)/);
  });
});
