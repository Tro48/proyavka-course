"use client";

import Image from "next/image";
import { Dialog, VisuallyHidden } from "radix-ui";
import { useCallback, useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import { PhotoReveal } from "@/components/photo-reveal";
import { SectionHeading } from "@/components/section-heading";
import { DialogCloseButton } from "@/components/ui/dialog-close";
import { Photo } from "@/components/ui/photo";
import { cn } from "@/lib/cn";
import { works } from "@/content/works";

/**
 * Работы выпускников свёрстаны как контрольный лист: плотная сетка кадров
 * одного формата 3:2, тонкие белые поля, подписи моноширинным.
 *
 * Единственное белое пятно на странице — поля отпечатков. Так и должно быть:
 * контрольный лист лежит на столе в проявочной, а не наоборот.
 */
export function Works() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="works" className="bg-darkroom py-24 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Работы выпускников"
          title="Контрольный лист седьмого потока"
          lede="Для курса по визуальному навыку работы учеников убедительнее любого отзыва. Это отпечатки, сделанные руками, в этой лаборатории."
        />

        <ul className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {works.map((work, index) => (
            <li key={work.id}>
              <PhotoReveal delay={(index % 4) * 0.05}>
                <figure className="bg-paper p-2 shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(index)}
                    className="block w-full cursor-zoom-in"
                  >
                    <Photo
                      src={work.src}
                      alt={work.alt}
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                      className="aspect-3/2 w-full object-cover"
                      // Кадр ещё не проявился: на белых полях отпечатка это
                      // серое поле, а не светлая дыра.
                      skeletonClassName="bg-graphite/25"
                    />
                  </button>

                  <figcaption className="text-graphite flex items-baseline justify-between gap-2 pt-2 font-mono text-[0.6875rem]">
                    <span>{work.frame}</span>
                    <span className="truncate">{work.meta}</span>
                  </figcaption>
                </figure>
              </PhotoReveal>
            </li>
          ))}
        </ul>
      </Container>

      <Lightbox
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </section>
  );
}

/**
 * Диалог radix-ui: ловушка фокуса, Esc и `aria-modal` — из коробки.
 * Пролистывание кадров добавляем сами: стрелки ‹ › по краям и клавиши ← →.
 */
function Lightbox({
  index,
  onClose,
  onNavigate,
}: {
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const open = index !== null;
  const work = open ? works[index] : null;

  // По модулю длины: с последнего кадра стрелка «вперёд» ведёт на первый.
  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onNavigate((index + delta + works.length) % works.length);
    },
    [index, onNavigate],
  );

  // Стрелки клавиатуры radix не разбирает — Esc и Tab берёт на себя, листание
  // за нами. Слушаем, только пока лайтбокс открыт.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        {/* Контент лежит внутри оверлея, а не рядом с ним. Растянутый на весь
            экран `Dialog.Content` сам был бы бэкдропом: клик мимо снимка
            попадал бы внутрь контента, и radix не считал бы его кликом
            снаружи — модалка не закрывалась. */}
        <Dialog.Overlay className="bg-darkroom/92 fixed inset-0 z-50 flex items-center justify-center">
          <Dialog.Content
            aria-describedby={undefined}
            className="flex max-h-full max-w-full flex-col items-center focus:outline-none"
          >
            {work && (
              <figure className="flex flex-col items-center gap-3">
                <VisuallyHidden.Root>
                  <Dialog.Title>{work.alt}</Dialog.Title>
                </VisuallyHidden.Root>

                {/* Кадры контрольного листа — всегда 3:2. Задаём фрейму
                    детерминированный размер: ширина от вьюпорта, но не выше
                    80vh по высоте. Иначе `w-auto` у `next/image` замыкается на
                    адаптивный `srcset` — браузер берёт мелкий кандидат и по нему
                    же фиксирует размер, отсюда крошечный снимок. Внутри `fill`
                    заполняет фрейм ровно, белые поля paper выходят одинаковыми. */}
                <div
                  className="bg-paper w-[min(86vw,calc(80vh*3/2))] p-2 shadow-[0_8px_40px_rgba(0,0,0,0.6)] sm:p-3"
                >
                  <div className="relative aspect-3/2 w-full">
                    <Image
                      src={work.src}
                      alt={work.alt}
                      sizes="86vw"
                      placeholder="blur"
                      className="object-cover"
                      fill
                    />
                  </div>
                </div>

                <figcaption className="text-mono text-paper/60 flex w-full flex-wrap justify-between gap-x-6 gap-y-1 px-1 font-mono">
                  <span>
                    Кадр {work.frame} · {work.meta}
                  </span>
                  <span className="text-paper/80">{work.author}</span>
                </figcaption>
              </figure>
            )}

            <NavButton side="prev" onClick={() => step(-1)} />
            <NavButton side="next" onClick={() => step(1)} />

            {/* `fixed`, а не `absolute`: контент теперь по размеру снимка,
                и крестик должен остаться в углу экрана. */}
            <DialogCloseButton className="fixed" />
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Стрелка листания у края экрана. Живёт внутри `Dialog.Content`, поэтому клик
 *  по ней radix не считает кликом «снаружи» — модалка от него не закрывается. */
function NavButton({ side, onClick }: { side: "prev" | "next"; onClick: () => void }) {
  const isPrev = side === "prev";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "Предыдущий кадр" : "Следующий кадр"}
      className={cn(
        "text-paper/60 hover:text-paper hover:bg-paper/10 fixed top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition-colors",
        isPrev ? "left-2 sm:left-4" : "right-2 sm:right-4",
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7">
        <path
          d={isPrev ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
