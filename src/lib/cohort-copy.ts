import type { Cohort } from "@/content/cohorts";

import type { CohortState } from "./cohort";
import { formatDay, formatDayTimeMsk } from "./date";
import { SEATS, pluralize } from "./plural";

/**
 * Единственное место, где состояние потока превращается в текст.
 *
 * Компоненты получают готовый `CohortCopy` и не знают про `state.kind`:
 * иначе условие «а если waitlist» пришлось бы дублировать в герое, в кнопке,
 * в липкой панели и в форме — и однажды они разойдутся.
 */
export type CohortCopy = {
  /** Статус потока в герое. Заголовок h1 — обещание результата, он не меняется. */
  title: string;
  /** Строка под статусом: даты, условия. */
  note: string;
  /** `null` — таймера нет. Единственное состояние без таймера — лист ожидания. */
  countdown: {
    deadline: string;
    caption: string;
    /** Красные цифры: времени или мест почти не осталось. */
    urgent: boolean;
  } | null;
  cta: {
    label: string;
    /** `waitlist` — форма собирает почту, а не бронь места. */
    kind: "booking" | "waitlist";
  };
  /** Поток, на который бронируем место. `null` в листе ожидания. */
  target: Cohort | null;
  /** Показываем, только пока места реально можно занять. */
  seats: { left: number; total: number } | null;
};

export function getCohortCopy(state: CohortState): CohortCopy {
  switch (state.kind) {
    case "enrolling":
      return {
        title: `Старт ${formatDay(state.cohort.startsAt)}`,
        note: `Набор открыт до ${formatDayTimeMsk(state.deadline)}`,
        countdown: {
          deadline: state.deadline,
          caption: "До закрытия набора",
          urgent: false,
        },
        cta: { label: "Забронировать место", kind: "booking" },
        target: state.cohort,
        seats: { left: state.cohort.seatsLeft, total: state.cohort.seatsTotal },
      };

    case "lastCall":
      return {
        title: `Осталось ${pluralize(state.cohort.seatsLeft, SEATS)}`,
        note: `Старт ${formatDay(state.cohort.startsAt)}. Набор закрывается ${formatDayTimeMsk(state.deadline)}`,
        countdown: {
          deadline: state.deadline,
          caption: "До закрытия набора",
          urgent: true,
        },
        cta: { label: "Успеть записаться", kind: "booking" },
        target: state.cohort,
        seats: { left: state.cohort.seatsLeft, total: state.cohort.seatsTotal },
      };

    case "closed":
      return {
        title: `Набор на поток ${state.current.number} закрыт`,
        note: `Следующий поток стартует ${formatDay(state.next.startsAt)}`,
        countdown: {
          deadline: state.deadline,
          caption: `До старта потока ${state.next.number}`,
          urgent: false,
        },
        cta: { label: `Записаться на поток ${state.next.number}`, kind: "booking" },
        target: state.next,
        seats: null,
      };

    case "waitlist":
      return {
        title: "Следующий поток — весной",
        note: "Дату объявим заранее. Оставьте почту — напишем первым, до открытия набора.",
        countdown: null,
        cta: { label: "В лист ожидания", kind: "waitlist" },
        target: null,
        seats: null,
      };
  }
}
