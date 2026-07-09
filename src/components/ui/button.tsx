"use client";

import { Slot } from "radix-ui";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> & {
  variant?: Variant;
  /** Запрос в полёте: клики игнорируются, но фокус остаётся на кнопке. */
  pending?: boolean;
  disabled?: boolean;
  asChild?: boolean;
  children?: ReactNode;
};

// Tailwind v4 убрал `cursor: pointer` у `<button>` в preflight — курсор
// приходится возвращать руками. `pending` гасит клик через `aria-disabled`,
// а не через `disabled`, поэтому «нельзя» показываем по обоим признакам.
const base =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-sheet px-6 py-3 " +
  "text-[0.9375rem] font-medium tracking-tight transition-colors duration-200 " +
  "disabled:cursor-not-allowed disabled:opacity-55 " +
  "aria-disabled:cursor-not-allowed aria-disabled:opacity-55";

const variants: Record<Variant, string> = {
  // Ховер светлее, а не темнее: текст на кнопке — darkroom, и затемнение
  // фона съело бы контраст.
  primary: "bg-glow text-darkroom hover:bg-[#e97a5c]",
  secondary: "border border-paper/25 bg-transparent text-paper hover:bg-paper/10",
  ghost: "bg-transparent text-paper/70 hover:text-paper",
};

export function Button({
  variant = "primary",
  pending = false,
  disabled = false,
  asChild = false,
  className,
  children,
  onClick,
  type = "button",
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot.Root : "button";
  const inert = pending || disabled;

  return (
    <Component
      type={asChild ? undefined : type}
      // `disabled` уводит фокус и глушит скринридер, поэтому в состоянии
      // pending кнопка остаётся живой, а клик перехватывается ниже.
      disabled={asChild ? undefined : disabled}
      aria-disabled={inert || undefined}
      aria-busy={pending || undefined}
      data-pending={pending || undefined}
      className={cn(base, variants[variant], className)}
      onClick={(event) => {
        if (inert) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
