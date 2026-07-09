import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetServerOffsetCache } from "@/lib/use-server-offset";

import { Countdown } from "./countdown";

const DEADLINE = "2026-09-11T20:59:00Z";
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Серверное время: ровно двое суток до дедлайна. */
const SERVER_NOW = Date.parse(DEADLINE) - 2 * DAY;

function mockTimeEndpoint(serverNow: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ now: serverNow })),
  );
}

/** Значения ячеек таймера: [дни, часы, минуты, секунды]. */
function cells(): string[] {
  return screen
    .getAllByText(/^(\d{2,}|--)$/)
    .map((node) => node.textContent ?? "")
    .slice(0, 4);
}

async function flushOffset() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

beforeEach(() => {
  resetServerOffsetCache();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Countdown", () => {
  it("до монтирования показывает прочерки, а не цифры", () => {
    vi.setSystemTime(SERVER_NOW);
    mockTimeEndpoint(SERVER_NOW);

    render(<Countdown deadline={DEADLINE} caption="До закрытия набора" />);

    // Разметка та же, что придёт с сервера: hydration mismatch неоткуда взяться.
    expect(cells()).toEqual(["--", "--", "--", "--"]);
  });

  it("после ответа /api/time показывает оставшееся время", async () => {
    vi.setSystemTime(SERVER_NOW);
    mockTimeEndpoint(SERVER_NOW);

    render(<Countdown deadline={DEADLINE} caption="До закрытия набора" />);
    await flushOffset();

    expect(cells()).toEqual(["02", "00", "00", "00"]);
  });

  it("перевод системных часов на день вперёд не меняет таймер", async () => {
    // Часы клиента спешат на сутки. Сервер говорит правду.
    vi.setSystemTime(SERVER_NOW + DAY);
    mockTimeEndpoint(SERVER_NOW);

    render(<Countdown deadline={DEADLINE} caption="До закрытия набора" />);
    await flushOffset();

    // Не «01 день», как показали бы часы клиента.
    expect(cells()).toEqual(["02", "00", "00", "00"]);
  });

  it("после десяти минут в фоновой вкладке показывает верное время", async () => {
    vi.setSystemTime(SERVER_NOW);
    mockTimeEndpoint(SERVER_NOW);

    render(<Countdown deadline={DEADLINE} caption="До закрытия набора" />);
    await flushOffset();
    expect(cells()).toEqual(["02", "00", "00", "00"]);

    // Браузер троттлит фоновую вкладку: время идёт, тики не приходят.
    vi.setSystemTime(SERVER_NOW + 10 * MINUTE);

    // Вернулись на вкладку — сработал один-единственный тик.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SECOND);
    });

    // Декремент показал бы 01:23:59:59 — отставание на десять минут.
    expect(cells()).toEqual(["01", "23", "49", "59"]);
  });

  it("истёкший дедлайн показывает нули, а не отрицательные числа", async () => {
    vi.setSystemTime(Date.parse(DEADLINE) + 5 * DAY);
    mockTimeEndpoint(Date.parse(DEADLINE) + 5 * DAY);

    render(<Countdown deadline={DEADLINE} caption="До закрытия набора" />);
    await flushOffset();

    expect(cells()).toEqual(["00", "00", "00", "00"]);
  });

  it("упавший /api/time не ломает таймер: работаем по часам клиента", async () => {
    vi.setSystemTime(SERVER_NOW);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("сеть недоступна");
      }),
    );

    render(<Countdown deadline={DEADLINE} caption="До закрытия набора" />);
    await flushOffset();

    expect(cells()).toEqual(["02", "00", "00", "00"]);
  });
});
