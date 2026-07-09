"use client";

import type { PlanId } from "@/content/plans";
import { useCourseStore } from "@/lib/store/course";

import type { ButtonProps } from "./ui/button";
import { Button } from "./ui/button";

type BookingTriggerProps = Omit<ButtonProps, "onClick"> & {
  label: string;
  /** Клик по карточке тарифа открывает форму уже с этим тарифом. */
  plan?: PlanId;
};

export function BookingTrigger({ label, plan, ...props }: BookingTriggerProps) {
  // Срез, а не весь стор: подписка на `openBooking` не перерисует кнопку,
  // когда изменится выбранный тариф.
  const openBooking = useCourseStore((state) => state.openBooking);

  return (
    <Button onClick={() => openBooking(plan)} {...props}>
      {label}
    </Button>
  );
}
