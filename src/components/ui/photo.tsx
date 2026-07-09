"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { Skeleton } from "./skeleton";

type PhotoProps = ImageProps & {
  /** Класс обёртки: она позиционирует скелетон и клипует его по форме кадра. */
  boxClassName?: string;
  /** Цвет скелетона под фон секции. См. комментарий в `Skeleton`. */
  skeletonClassName: string;
};

/**
 * Снимок со скелетоном на время загрузки.
 *
 * Скелетон лежит под изображением, а не вместо него: `<img>` занимает место с
 * первого кадра (размеры приходят из статического импорта), поэтому подменять
 * нечего — непрозрачный снимок просто закрывает скелетон, когда допишется.
 * Отсюда же нулевой CLS: макет не двигается ни разу.
 */
// `alt` вынут из спреда намеренно: внутри `{...props}` его не видит ни
// jsx-a11y, ни человек.
export function Photo({ alt, boxClassName, skeletonClassName, ...props }: PhotoProps) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Снимок из кеша дорисовывается до гидратации, и `onLoad` уже не выстрелит:
  // спрашиваем сам <img>, иначе скелетон останется под ним навсегда.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <span className={cn("relative block", boxClassName)}>
      {!loaded && <Skeleton className={cn("absolute inset-0", skeletonClassName)} />}
      <Image alt={alt} ref={ref} onLoad={() => setLoaded(true)} {...props} />
    </span>
  );
}
