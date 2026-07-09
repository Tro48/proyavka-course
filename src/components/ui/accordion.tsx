"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Accordion as RadixAccordion } from "radix-ui";
import type { ReactNode } from "react";
import { useState } from "react";

import { cn } from "@/lib/cn";

/**
 * Аккордеон на radix-ui: клавиатура (↑ ↓ Home End) и ARIA — из коробки,
 * переписывать это руками в портфолио-проекте нечего доказывать.
 *
 * Высоту анимируем через `motion`. Content держим `forceMount`: тогда Radix
 * не выставит `hidden` посреди анимации закрытия, и AnimatePresence успеет
 * доиграть свёртывание до нуля.
 */
export type AccordionEntry = {
  id: string;
  trigger: ReactNode;
  content: ReactNode;
};

type AccordionProps = {
  items: readonly AccordionEntry[];
  /** Раскрытый по умолчанию элемент. */
  defaultOpen?: string;
  className?: string;
};

const DURATION = 0.25;
const EASE = [0.32, 0.72, 0, 1] as const;

export function Accordion({ items, defaultOpen = "", className }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();

  // `motion` анимирует через JS, поэтому media-запрос из globals.css его не
  // касается: reduced-motion приходится уважать здесь руками.
  const duration = reduceMotion ? 0 : DURATION;

  return (
    <RadixAccordion.Root
      type="single"
      collapsible
      value={open}
      onValueChange={setOpen}
      className={cn("border-paper/12 border-t", className)}
    >
      {items.map((item) => {
        const isOpen = open === item.id;

        return (
          <RadixAccordion.Item
            key={item.id}
            value={item.id}
            className="border-paper/12 border-b"
          >
            <RadixAccordion.Header>
              <RadixAccordion.Trigger
                className={cn(
                  "group flex w-full cursor-pointer items-start justify-between gap-6",
                  "hover:text-glow py-5 text-left transition-colors",
                )}
              >
                {item.trigger}
                <Chevron open={isOpen} duration={duration} />
              </RadixAccordion.Trigger>
            </RadixAccordion.Header>

            <AnimatePresence initial={false}>
              {isOpen && (
                <RadixAccordion.Content forceMount asChild>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6">{item.content}</div>
                  </motion.div>
                </RadixAccordion.Content>
              )}
            </AnimatePresence>
          </RadixAccordion.Item>
        );
      })}
    </RadixAccordion.Root>
  );
}

function Chevron({ open, duration }: { open: boolean; duration: number }) {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="text-paper/60 mt-1.5 size-4 shrink-0"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration, ease: EASE }}
    >
      <path
        d="M3 6l5 5 5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </motion.svg>
  );
}
