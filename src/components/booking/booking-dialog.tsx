"use client";

import dynamic from "next/dynamic";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { DialogCloseButton } from "@/components/ui/dialog-close";
import type { CohortCopy } from "@/lib/cohort-copy";
import { useCourseStore } from "@/lib/store/course";

import { BookingSuccess } from "./booking-success";

/**
 * Форма тянет за собой React Hook Form, Zod и резолвер. В закрытой модалке
 * этот код не нужен, а в первом бандле он удлиняет путь до интерактивности —
 * и вместе с ним симулированный LCP. Грузим по открытию.
 */
const BookingForm = dynamic(
  () => import("./booking-form").then((mod) => mod.BookingForm),
  {
    ssr: false,
    loading: () => <p className="text-paper/60 py-10 text-sm">Загружаем форму…</p>,
  },
);

export function BookingDialog({ copy }: { copy: CohortCopy }) {
  const isOpen = useCourseStore((state) => state.isBookingOpen);
  const closeBooking = useCourseStore((state) => state.closeBooking);

  const [done, setDone] = useState(false);

  // Ни один компонент не смотрит на `state.kind` — только на производный copy.
  const waitlist = copy.cta.kind === "waitlist";
  const cohortId = copy.target?.id ?? "waitlist";

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (open) return;
        closeBooking();
        // Успех сбрасываем после закрытия: иначе форма мигнёт на пути наружу.
        setTimeout(() => setDone(false), 200);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="bg-darkroom/85 fixed inset-0 z-50" />

        <Dialog.Content
          aria-describedby={undefined}
          className="rounded-t-sheet bg-surface ring-paper/10 sm:rounded-sheet fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto p-6 ring-1 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-lg sm:p-8"
        >
          {done ? (
            <BookingSuccess waitlist={waitlist} />
          ) : (
            <>
              <Dialog.Title className="font-display text-h2 text-paper font-semibold">
                {waitlist ? "Лист ожидания" : "Бронь места"}
              </Dialog.Title>
              <p className="text-paper/60 mt-3 mb-7 text-sm">{copy.note}</p>

              <BookingForm
                cohortId={cohortId}
                waitlist={waitlist}
                onSuccess={() => setDone(true)}
              />
            </>
          )}

          <DialogCloseButton />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
