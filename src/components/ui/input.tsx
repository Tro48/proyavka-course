"use client";

import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { useId } from "react";

import { cn } from "@/lib/cn";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  /** Текст ошибки. Его наличие само по себе включает aria-invalid. */
  error?: string | undefined;
  hint?: ReactNode;
  optional?: boolean;
  /** React Hook Form передаёт ref через `register()`. */
  ref?: Ref<HTMLInputElement>;
};

export function Input({
  label,
  error,
  hint,
  optional = false,
  className,
  ref,
  ...props
}: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  // Поле связано с описанием и ошибкой явно: без этого скринридер прочитает
  // «поле ввода» и замолчит, а человек не узнает, что именно не так.
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-paper text-sm font-medium">
        {label}
        {optional && <span className="text-paper/60 ml-1.5">— необязательно</span>}
      </label>

      {hint && (
        <p id={hintId} className="text-paper/60 text-sm">
          {hint}
        </p>
      )}

      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={cn(
          "rounded-sheet bg-surface text-paper border px-3.5 py-2.5 transition-colors",
          "placeholder:text-paper/50",
          error ? "border-danger" : "border-paper/20 focus:border-glow",
          className,
        )}
        {...props}
      />

      {error && (
        <p id={errorId} role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
