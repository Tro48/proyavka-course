import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Accordion } from "./accordion";

const items = [
  { id: "a", trigger: "Первый", content: "Ответ первый" },
  { id: "b", trigger: "Второй", content: "Ответ второй" },
  { id: "c", trigger: "Третий", content: "Ответ третий" },
];

function triggers() {
  return screen.getAllByRole("button");
}

describe("Accordion", () => {
  it("клик раскрывает и сворачивает элемент", async () => {
    render(<Accordion items={items} />);
    const [first] = triggers();
    if (!first) throw new Error("нет триггеров");

    expect(first).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "false");
  });

  it("раскрыт только один элемент за раз", async () => {
    render(<Accordion items={items} />);
    const [first, second] = triggers();
    if (!first || !second) throw new Error("нет триггеров");

    await userEvent.click(first);
    await userEvent.click(second);

    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
  });

  it("стрелки вверх и вниз переключают элементы", async () => {
    render(<Accordion items={items} />);
    const [first, second, third] = triggers();
    if (!first || !second || !third) throw new Error("нет триггеров");

    first.focus();

    await userEvent.keyboard("{ArrowDown}");
    expect(second).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    expect(third).toHaveFocus();

    await userEvent.keyboard("{ArrowUp}");
    expect(second).toHaveFocus();
  });

  it("Home и End прыгают на первый и последний", async () => {
    render(<Accordion items={items} />);
    const [first, second, third] = triggers();
    if (!first || !second || !third) throw new Error("нет триггеров");

    second.focus();

    await userEvent.keyboard("{End}");
    expect(third).toHaveFocus();

    await userEvent.keyboard("{Home}");
    expect(first).toHaveFocus();
  });

  it("содержимое раскрытого элемента доступно, свёрнутого — нет", async () => {
    render(<Accordion items={items} />);
    const [first] = triggers();
    if (!first) throw new Error("нет триггеров");

    expect(screen.queryByText("Ответ первый")).not.toBeInTheDocument();

    await userEvent.click(first);
    expect(screen.getByText("Ответ первый")).toBeInTheDocument();
  });
});
