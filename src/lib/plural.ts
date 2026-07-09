/** Формы: [1 место, 2 места, 5 мест]. */
export type PluralForms = readonly [one: string, few: string, many: string];

const rules = new Intl.PluralRules("ru-RU");

export function plural(count: number, forms: PluralForms): string {
  switch (rules.select(count)) {
    case "one":
      return forms[0];
    case "few":
      return forms[1];
    default:
      return forms[2];
  }
}

/** «3 места» */
export function pluralize(count: number, forms: PluralForms): string {
  return `${count} ${plural(count, forms)}`;
}

export const SEATS: PluralForms = ["место", "места", "мест"];
export const WEEKS: PluralForms = ["неделя", "недели", "недель"];
