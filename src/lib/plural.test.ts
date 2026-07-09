import { describe, expect, it } from "vitest";

import { SEATS, plural, pluralize } from "./plural";

describe("plural", () => {
  it.each([
    [1, "место"],
    [2, "места"],
    [3, "места"],
    [4, "места"],
    [5, "мест"],
    [11, "мест"],
    [21, "место"],
    [0, "мест"],
  ])("%i → %s", (count, expected) => {
    expect(plural(count, SEATS)).toBe(expected);
  });

  it("pluralize приклеивает число", () => {
    expect(pluralize(3, SEATS)).toBe("3 места");
  });
});
