"use client";

import { BookingTrigger } from "@/components/booking-trigger";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/section-heading";
import { formatPrice, plans } from "@/content/plans";
import { cn } from "@/lib/cn";
import { useCourseStore } from "@/lib/store/course";

export function Plans() {
  // Срез, а не весь стор. Подписка на весь стор перерисовала бы секцию
  // на каждое открытие модалки.
  const selectedPlan = useCourseStore((state) => state.selectedPlan);
  const setPlan = useCourseStore((state) => state.setPlan);

  return (
    <section id="plans" className="bg-darkroom py-24 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Тарифы"
          title="Три способа пройти курс"
          lede="Разница не в объёме знаний, а в количестве плёнки, бумаги и внимания к вашим кадрам."
        />

        {/* Радиогруппа, а не набор кнопок: стрелки переключают тариф сами. */}
        {/* Без `items-start`: колонки тянутся до высоты самой длинной карточки,
            и `mt-auto` у кнопки прижимает её к низу. Иначе «Про» с пятью
            пунктами короче «Базового» с шестью, и три кнопки стоят вразнобой. */}
        <div
          role="radiogroup"
          aria-label="Выбор тарифа"
          className="mt-14 grid gap-6 lg:grid-cols-3"
        >
          {plans.map((plan) => {
            const selected = plan.id === selectedPlan;

            return (
              <label
                key={plan.id}
                className={cn(
                  "rounded-sheet relative flex cursor-pointer flex-col gap-6 border p-8",
                  // Подсветка границы. Никакого scale: карточка не должна прыгать.
                  "transition-colors duration-200",
                  // Сам radio — sr-only, поэтому фокус показывает карточка.
                  // Иначе клавиатурный пользователь не видит, где находится.
                  "has-focus-visible:outline-glow has-focus-visible:outline-2 has-focus-visible:outline-offset-2",
                  selected
                    ? "border-glow bg-surface"
                    : "border-paper/15 hover:border-paper/35 bg-transparent",
                  plan.featured && !selected && "border-paper/30",
                )}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={selected}
                  onChange={() => setPlan(plan.id)}
                  className="sr-only"
                />

                {plan.featuredNote && (
                  <span className="bg-terracotta text-paper absolute -top-3 left-8 px-2.5 py-1 font-mono text-[0.6875rem] tracking-wide uppercase">
                    {plan.featuredNote}
                  </span>
                )}

                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-h3 text-paper font-semibold">
                    {plan.name}
                  </h3>
                  <p className="text-paper/60 text-sm">{plan.tagline}</p>
                </div>

                <p className="text-paper font-mono text-3xl">{formatPrice(plan.price)}</p>

                <ul className="flex flex-col gap-2.5">
                  {plan.includes.map((item) => (
                    <li key={item} className="text-paper/70 flex gap-3 text-sm">
                      <span aria-hidden="true" className="bg-glow mt-2 size-1 shrink-0" />
                      {item}
                    </li>
                  ))}

                  {plan.excludes?.map((item) => (
                    <li
                      key={item}
                      className="text-paper/60 flex gap-3 text-sm line-through"
                    >
                      <span
                        aria-hidden="true"
                        className="bg-paper/30 mt-2 size-1 shrink-0"
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <BookingTrigger
                  className="mt-auto w-full"
                  label="Забронировать место"
                  plan={plan.id}
                  variant={selected ? "primary" : "secondary"}
                />
              </label>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
