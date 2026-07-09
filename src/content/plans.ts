export const PLAN_IDS = ["base", "pro", "mentor"] as const;

export type PlanId = (typeof PLAN_IDS)[number];

export type Plan = {
  id: PlanId;
  name: string;
  /** Одна строка: кому этот тариф. */
  tagline: string;
  price: number;
  /** Что входит. Формулировки предметные: плёнка, бумага, часы. */
  includes: readonly string[];
  /** Чего в тарифе нет. Честно и коротко — иначе спросят на первом занятии. */
  excludes?: readonly string[];
  featured?: boolean;
  /** Появляется только у выделенного тарифа. Это факт о продукте, не давление. */
  featuredNote?: string;
};

export const plans: readonly Plan[] = [
  {
    id: "base",
    name: "Базовый",
    tagline: "Восемь занятий в группе и своя проявленная плёнка",
    price: 34_000,
    includes: [
      "8 занятий по 3 часа в лаборатории",
      "3 катушки плёнки и химия",
      "Доступ в лабораторию в часы занятий",
      "Контрольные листы всех отснятых плёнок",
    ],
    excludes: ["Баритовая бумага для финальной печати", "Разбор работ между занятиями"],
  },
  {
    id: "pro",
    name: "Про",
    tagline: "То же самое плюс материалы на печать и разбор кадров между занятиями",
    price: 52_000,
    includes: [
      "Всё из «Базового»",
      "6 катушек плёнки вместо трёх",
      "Баритовая бумага 18×24 на всю серию",
      "Разбор ваших кадров в чате между занятиями",
      "Свободный доступ в лабораторию по субботам",
    ],
    featured: true,
    featuredNote: "Что выбирают 7 из 10",
  },
  {
    id: "mentor",
    name: "С наставником",
    tagline: "Курс плюс четыре личные встречи и собранное портфолио",
    price: 89_000,
    includes: [
      "Всё из «Про»",
      "4 личные встречи с автором курса по часу",
      "Индивидуальная тема серии вместо общей",
      "Помощь с портфолио и подачей на выставку",
      "Печать финальной серии в двух экземплярах",
    ],
  },
];

export const DEFAULT_PLAN_ID: PlanId = "pro";

export function getPlan(id: PlanId): Plan {
  const plan = plans.find((item) => item.id === id);
  if (!plan) throw new Error(`Неизвестный тариф: ${id}`);
  return plan;
}

const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

/** «52 000 ₽» */
export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}
