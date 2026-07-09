import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Countdown } from "@/components/countdown";
import { DEFAULT_PLAN_ID } from "@/content/plans";
import { resetServerOffsetCache } from "@/lib/use-server-offset";

import { useCourseStore } from "./course";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe("стор курса", () => {
  beforeEach(() => {
    useCourseStore.setState({ selectedPlan: DEFAULT_PLAN_ID, isBookingOpen: false });
  });

  it("хранит ровно два состояния", () => {
    const state = useCourseStore.getState();
    const values = Object.entries(state).filter(
      ([, value]) => typeof value !== "function",
    );

    expect(values.map(([key]) => key).sort()).toEqual(["isBookingOpen", "selectedPlan"]);
  });

  it("openBooking с тарифом открывает форму с предвыбранным тарифом", () => {
    useCourseStore.getState().openBooking("mentor");

    expect(useCourseStore.getState()).toMatchObject({
      isBookingOpen: true,
      selectedPlan: "mentor",
    });
  });

  it("openBooking без тарифа не сбрасывает выбор", () => {
    useCourseStore.getState().setPlan("base");
    useCourseStore.getState().openBooking();

    expect(useCourseStore.getState().selectedPlan).toBe("base");
  });
});

describe("подписки на срезы", () => {
  it("нигде нет useCourseStore() без селектора", () => {
    const files = walk(resolve(process.cwd(), "src")).filter(
      (file) => /\.tsx?$/.test(file) && !file.endsWith(".test.tsx"),
    );

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      // `useCourseStore()` без аргумента подписал бы компонент на весь стор:
      // любое изменение перерисовало бы всех, кто его тронул.
      expect(source, file).not.toMatch(/useCourseStore\(\s*\)/);
    }
  });
});

describe("смена тарифа не трогает таймер", () => {
  beforeEach(() => {
    resetServerOffsetCache();
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse("2026-09-01T00:00:00Z"));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ now: Date.parse("2026-09-01T00:00:00Z") })),
    );
    useCourseStore.setState({ selectedPlan: DEFAULT_PLAN_ID, isBookingOpen: false });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("Countdown не перерисовывается при смене selectedPlan", async () => {
    let renders = 0;

    function CountedCountdown() {
      renders += 1;
      return <Countdown deadline="2026-09-11T20:59:00Z" caption="До закрытия набора" />;
    }

    render(<CountedCountdown />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const before = renders;

    // То, что в React DevTools Profiler делают руками.
    act(() => {
      useCourseStore.getState().setPlan("mentor");
    });

    expect(useCourseStore.getState().selectedPlan).toBe("mentor");
    expect(renders).toBe(before);
  });
});
