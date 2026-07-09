import { cn } from "@/lib/cn";

/**
 * Плёночное зерно. Один инлайновый SVG, не картинка: килобайт разметки вместо
 * сотни килобайт текстуры.
 *
 * `pointer-events: none` обязателен — иначе слой поверх секции съест все клики
 * по кнопке под ним. `id` параметризован: зерно лежит на странице дважды, а
 * два одинаковых идентификатора — невалидная разметка.
 */
export function Grain({
  id = "film-grain",
  className,
}: {
  id?: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn(
        "pointer-events-none absolute inset-0 size-full opacity-[0.04] mix-blend-screen",
        className,
      )}
    >
      <filter id={id}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}
