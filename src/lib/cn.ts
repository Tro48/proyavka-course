/** Склейка классов без зависимостей: `clsx` ради этого ставить незачем. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
