import type { Metadata } from "next";

import { formatPrice, plans } from "@/content/plans";
import { PROGRAM_WEEKS } from "@/content/program";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Публичная оферта",
  robots: { index: false, follow: true },
};

export default function OfferPage() {
  return (
    <>
      <h1>Публичная оферта</h1>

      <p className="rounded-sheet border-paper/15 border p-4 text-sm">
        {site.disclaimer} Текст ниже — образец и не является юридическим документом.
      </p>

      <h2>Предмет</h2>
      <p>
        Исполнитель обязуется провести курс плёночной фотографии «{site.name}»
        продолжительностью {PROGRAM_WEEKS} недель по адресу {site.address}, а заказчик —
        оплатить участие по выбранному тарифу.
      </p>

      <h2>Стоимость</h2>
      <ul className="flex flex-col gap-2">
        {plans.map((plan) => (
          <li key={plan.id}>
            «{plan.name}» — {formatPrice(plan.price)}. {plan.tagline}.
          </li>
        ))}
      </ul>

      <h2>Возврат</h2>
      <p>
        До второго занятия оплата возвращается полностью. После второго — за вычетом
        стоимости проведённых занятий и израсходованных материалов (плёнка, химия,
        фотобумага). Заявление на возврат направляется письмом на{" "}
        <a href={`mailto:${site.email}`} className="text-glow underline">
          {site.email}
        </a>
        , деньги возвращаются в течение десяти рабочих дней.
      </p>

      <h2>Перенос</h2>
      <p>
        Если вы пропускаете больше двух занятий подряд, исполнитель вправе предложить
        перенос на следующий поток без доплаты. Место в текущем потоке при этом
        освобождается.
      </p>

      <h2>Акцепт</h2>
      <p>
        Отправка формы брони и оплата означают полное согласие с условиями настоящей
        оферты.
      </p>
    </>
  );
}
