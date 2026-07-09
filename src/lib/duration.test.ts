import { describe, expect, it } from "vitest";

import { isExpired, toDuration } from "./duration";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("toDuration", () => {
  it("разбирает разницу на дни, часы, минуты и секунды", () => {
    const ms = 3 * DAY + 4 * HOUR + 5 * MINUTE + 6 * SECOND;

    expect(toDuration(ms)).toEqual({
      days: 3,
      hours: 4,
      minutes: 5,
      seconds: 6,
      totalMs: ms,
    });
  });

  it("ровно ноль — это нули, а не единица", () => {
    expect(toDuration(0)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
    });
  });

  it("истёкший дедлайн даёт 00:00:00:00, а не -1", () => {
    const duration = toDuration(-5 * DAY);

    expect(duration).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
    });
    expect(isExpired(duration)).toBe(true);
  });

  it("минус одна миллисекунда — уже ноль", () => {
    expect(toDuration(-1).totalMs).toBe(0);
  });

  it("больше ста дней считается без переполнения", () => {
    const duration = toDuration(365 * DAY + 23 * HOUR);

    expect(duration.days).toBe(365);
    expect(duration.hours).toBe(23);
  });

  it("остаток секунды не округляется вверх", () => {
    // 999 мс — это ещё ноль секунд: таймер не должен показывать 1, когда прошло 0.
    expect(toDuration(999).seconds).toBe(0);
    expect(toDuration(1000).seconds).toBe(1);
  });

  it("мусор на входе не роняет таймер", () => {
    expect(toDuration(Number.NaN).totalMs).toBe(0);
    expect(toDuration(Number.POSITIVE_INFINITY).totalMs).toBe(0);
  });

  it("isExpired ложен, пока остался хоть миллисекунда", () => {
    expect(isExpired(toDuration(1))).toBe(false);
  });
});
