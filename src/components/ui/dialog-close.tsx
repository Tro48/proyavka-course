"use client";

import { Dialog } from "radix-ui";

import { cn } from "@/lib/cn";

/**
 * Крестик в углу диалога: одинаковый в лайтбоксе и в модалке брони.
 *
 * `p-3` вокруг иконки 20×20 даёт цель нажатия 44×44 — минимум, ниже которого
 * в неё не попадают пальцем.
 */
export function DialogCloseButton({ className }: { className?: string }) {
  return (
    <Dialog.Close
      aria-label="Закрыть"
      className={cn(
        "text-paper/60 hover:text-paper absolute top-4 right-4 cursor-pointer p-3",
        className,
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-5">
        <path
          d="M3 3l10 10M13 3L3 13"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </Dialog.Close>
  );
}
