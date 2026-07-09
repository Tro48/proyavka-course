import { cn } from "@/lib/cn";

/**
 * Прямоугольник на месте ещё не загруженного содержимого.
 *
 * Пульсацию гасит глобальное правило `prefers-reduced-motion` в globals.css:
 * при `reduce` скелетон становится ровным блоком, и это ровно то, что нужно —
 * место он держит по-прежнему.
 *
 * Цвет задаётся снаружи: на белых полях отпечатка скелетон тёмный, на
 * `darkroom` — светлый. Значения по умолчанию нет намеренно, иначе на одном из
 * двух фонов он окажется невидимым.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse", className)} />;
}
