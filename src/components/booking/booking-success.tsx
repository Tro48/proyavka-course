"use client";

import { Dialog } from "radix-ui";

import { site } from "@/content/site";

/** Что дальше и когда придёт письмо. Форма заменена — отправлять больше нечего. */
export function BookingSuccess({ waitlist }: { waitlist: boolean }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-mono text-glow font-mono tracking-widest uppercase">
        Заявка принята
      </p>

      {/* Заголовок диалога — видимый. Дублировать его в sr-only значило бы
          заставить скринридер прочитать одно и то же дважды. */}
      <Dialog.Title className="font-display text-h2 text-paper font-semibold">
        {waitlist ? "Вы в листе ожидания" : "Место за вами"}
      </Dialog.Title>

      <ol className="border-paper/12 flex flex-col gap-4 border-t pt-6">
        {(waitlist
          ? [
              "Когда откроется набор на следующий поток, вы получите письмо раньше остальных.",
              "В письме будут даты, цена и ссылка на бронь. Ответьте на него, если передумали.",
            ]
          : [
              "В течение часа придёт письмо с подтверждением и реквизитами для оплаты.",
              "Место держим три дня. После оплаты пришлём список того, что взять на первое занятие.",
              "За неделю до старта напишем ещё раз — с адресом и временем.",
            ]
        ).map((step, index) => (
          <li key={step} className="text-paper/70 flex gap-4 text-sm">
            <span className="text-glow font-mono">
              {String(index + 1).padStart(2, "0")}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <p className="border-paper/12 text-paper/60 border-t pt-6 text-sm">
        Письма нет через час? Проверьте спам или напишите на{" "}
        <a href={`mailto:${site.email}`} className="text-glow underline">
          {site.email}
        </a>
        .
      </p>
    </div>
  );
}
