"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, getPlan, plans } from "@/content/plans";
import { reachGoal } from "@/lib/analytics";
import type { LeadInput, LeadResponse } from "@/lib/schemas/lead";
import { leadSchema } from "@/lib/schemas/lead";
import { useCourseStore } from "@/lib/store/course";
import { readUtm } from "@/lib/utm";

type BookingFormProps = {
  cohortId: string;
  waitlist: boolean;
  onSuccess: () => void;
};

export function BookingForm({ cohortId, waitlist, onSuccess }: BookingFormProps) {
  const selectedPlan = useCourseStore((state) => state.selectedPlan);
  const setPlan = useCourseStore((state) => state.setPlan);

  const [serverError, setServerError] = useState<string | null>(null);

  // Снимаем один раз при монтировании: перерисовка не должна обнулять
  // time-trap и терять метки из URL.
  const [context] = useState(() => ({
    renderedAt: Date.now(),
    utm: typeof window === "undefined" ? undefined : readUtm(window.location.search),
  }));

  // Второй страж от двойной отправки. Кнопка гасит повторный клик, но Enter
  // в поле обходит кнопку и уходит прямо в submit.
  const inFlight = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    // cohortId и renderedAt не имеют полей ввода: RHF отдаёт их из defaultValues.
    defaultValues: {
      plan: selectedPlan,
      cohortId,
      renderedAt: context.renderedAt,
      website: "",
    },
  });

  const planField = register("plan");

  async function onSubmit(values: LeadInput) {
    if (inFlight.current) return;
    inFlight.current = true;
    setServerError(null);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, utm: context.utm }),
      });

      const result = (await response.json()) as LeadResponse;

      if (!result.ok) {
        setServerError(result.message);
        return;
      }

      // Цель — после успешного ответа сервера, а не по клику: иначе в
      // статистику попадут неудачные отправки.
      reachGoal("form_submit_success");
      onSuccess();
    } catch {
      setServerError("Сеть недоступна. Проверьте соединение и попробуйте ещё раз.");
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <form
      // handleSubmit вызывается внутри обработчика, а не в рендере: иначе
      // замыкание над `inFlight` читалось бы во время рендера.
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      noValidate
      className="flex flex-col gap-5"
    >
      {/* Honeypot. Не `display: none`: часть ботов такие поля пропускает. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="website">Сайт</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      {!waitlist && (
        <fieldset>
          <legend className="text-paper mb-2 text-sm font-medium">Тариф</legend>

          <div className="flex flex-col gap-2 sm:flex-row">
            {plans.map((plan) => (
              <label
                key={plan.id}
                className="rounded-sheet border-paper/15 has-checked:border-glow has-checked:bg-surface flex flex-1 cursor-pointer items-center gap-2.5 border px-3 py-2.5 text-sm"
              >
                <input
                  type="radio"
                  value={plan.id}
                  {...planField}
                  onChange={(event) => {
                    void planField.onChange(event);
                    setPlan(plan.id);
                  }}
                  className="accent-glow"
                />
                <span className="flex flex-col">
                  <span className="text-paper">{plan.name}</span>
                  <span className="text-paper/60 font-mono text-[0.6875rem]">
                    {formatPrice(plan.price)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <Input
        label="Имя"
        autoComplete="given-name"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Почта"
        type="email"
        inputMode="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Телефон"
        optional
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+7 999 123-45-67"
        hint="Позвоним, только если что-то изменится с потоком."
        error={errors.phone?.message}
        {...register("phone")}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-paper/70 flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            {...register("consent")}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="accent-glow mt-1"
          />
          <span>
            Согласен на обработку персональных данных и принимаю{" "}
            <Link href="/privacy" className="text-glow underline">
              политику конфиденциальности
            </Link>
            .
          </span>
        </label>

        {errors.consent && (
          <p id="consent-error" role="alert" className="text-danger text-sm">
            {errors.consent.message}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="rounded-sheet bg-danger/10 text-danger p-3 text-sm">
          {serverError}
        </p>
      )}

      <Button type="submit" pending={isSubmitting} className="mt-2">
        {isSubmitting
          ? "Отправляем…"
          : waitlist
            ? "В лист ожидания"
            : `Забронировать за ${formatPrice(getPlan(selectedPlan).price)}`}
      </Button>
    </form>
  );
}
