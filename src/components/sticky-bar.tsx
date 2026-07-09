"use client";

import { useEffect, useState } from "react";

import { BookingTrigger } from "@/components/booking-trigger";
import { formatPrice, getPlan } from "@/content/plans";
import { useCourseStore } from "@/lib/store/course";

/**
 * Липкая панель на мобильном: цена выбранного тарифа и кнопка.
 *
 * Это то место, где `selectedPlan` из стора окупается: панель живёт вне секции
 * тарифов, и прокидывать выбор пропсами пришлось бы через всю страницу.
 */
export function StickyBar() {
  const selectedPlan = useCourseStore((state) => state.selectedPlan);
  const visible = useVisibleAfterPlans();
  const plan = getPlan(selectedPlan);

  return (
    <div
      // Панель есть в разметке всегда, но `hidden` убирает её из дерева
      // доступности, пока она не видна.
      hidden={!visible}
      className="border-paper/12 bg-surface/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-sm md:hidden"
    >
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        <div className="flex flex-col">
          <span className="text-paper/60 font-mono text-[0.6875rem] tracking-wide uppercase">
            {plan.name}
          </span>
          <span className="text-paper font-mono text-lg">{formatPrice(plan.price)}</span>
        </div>

        <BookingTrigger label="Забронировать" className="px-5 py-2.5" />
      </div>
    </div>
  );
}

/**
 * Корень наблюдателя, растянутый вверх далеко за экран, и порог 1.
 *
 * Вместе это означает: «секция целиком выше нижней кромки экрана», то есть
 * тарифы дочитаны до конца. Ждать, пока секция уедет за верхнюю кромку, нельзя:
 * на телефоне FAQ ниже экрана (756 px против 844), и между «тарифы ушли вверх»
 * и «показался футер» не остаётся ни одной позиции скролла — панель не появится
 * никогда.
 *
 * Растянутый корень нужен ещё и потому, что IntersectionObserver зовёт колбэк
 * только на пересечении порога. При переходе по якорю секция успевает уйти из
 * «ниже экрана» сразу в «выше экрана», ни разу не пересёкшись, и наивная
 * проверка `boundingClientRect` тихо промолчала бы.
 */
const ABOVE_THE_FOLD = "100000px 0px 0px 0px";

/** Показываем, когда тарифы прочитаны, и прячем, едва покажется футер. */
function useVisibleAfterPlans(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const plans = document.getElementById("plans");
    const footer = document.querySelector("footer");
    if (!plans || !footer) return;

    let plansRead = false;
    let footerVisible = false;
    const update = () => setVisible(plansRead && !footerVisible);

    const plansObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        plansRead = entry.isIntersecting;
        update();
      },
      { rootMargin: ABOVE_THE_FOLD, threshold: 1 },
    );

    // Панель не должна перекрывать контакты и дисклеймер.
    const footerObserver = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      footerVisible = entry.isIntersecting;
      update();
    });

    plansObserver.observe(plans);
    footerObserver.observe(footer);

    return () => {
      plansObserver.disconnect();
      footerObserver.disconnect();
    };
  }, []);

  return visible;
}
