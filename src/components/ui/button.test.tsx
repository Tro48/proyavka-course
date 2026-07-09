import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("обычный клик вызывает onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Забронировать</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Забронировать" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("повторный клик в pending не вызывает onClick", async () => {
    const onClick = vi.fn();
    render(
      <Button pending onClick={onClick}>
        Отправляем
      </Button>,
    );

    const button = screen.getByRole("button");
    await userEvent.click(button);
    await userEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("в pending кнопка остаётся в дереве доступности и помечена aria-busy", () => {
    render(<Button pending>Отправляем</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    // Не `disabled`: иначе фокус уедет в body посреди отправки формы.
    expect(button).not.toBeDisabled();
  });

  it("disabled глушит клик", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Нельзя
      </Button>,
    );

    await userEvent.click(screen.getByRole("button"));

    expect(onClick).not.toHaveBeenCalled();
  });
});
