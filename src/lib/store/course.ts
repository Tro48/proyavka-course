"use client";

import { create } from "zustand";

import type { PlanId } from "@/content/plans";
import { DEFAULT_PLAN_ID } from "@/content/plans";

/**
 * Ровно два состояния. Выбранный тариф нужен одновременно карточкам тарифов,
 * липкой панели с ценой и форме брони — прокидывать его пропсами через пять
 * уровней и есть тот случай, ради которого стор придуман.
 *
 * Чего здесь нет и почему:
 *   · тиков таймера — перерисовали бы всё дерево раз в секунду;
 *   · `CohortState` — производное от времени и конфига, хранить производное
 *     состояние значит однажды его рассинхронизировать;
 *   · значений формы — этим занимается React Hook Form.
 */
type CourseStore = {
  selectedPlan: PlanId;
  setPlan: (id: PlanId) => void;

  isBookingOpen: boolean;
  openBooking: (plan?: PlanId) => void;
  closeBooking: () => void;
};

export const useCourseStore = create<CourseStore>((set) => ({
  selectedPlan: DEFAULT_PLAN_ID,
  setPlan: (id) => set({ selectedPlan: id }),

  isBookingOpen: false,
  openBooking: (plan) =>
    set(plan ? { isBookingOpen: true, selectedPlan: plan } : { isBookingOpen: true }),
  closeBooking: () => set({ isBookingOpen: false }),
}));
