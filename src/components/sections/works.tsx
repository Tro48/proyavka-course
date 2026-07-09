"use client";

import Image from "next/image";
import { Dialog, VisuallyHidden } from "radix-ui";
import { useState } from "react";

import { Container } from "@/components/layout/container";
import { PhotoReveal } from "@/components/photo-reveal";
import { SectionHeading } from "@/components/section-heading";
import { DialogCloseButton } from "@/components/ui/dialog-close";
import { Photo } from "@/components/ui/photo";
import type { Work } from "@/content/works";
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
  const active = openIndex === null ? null : (works[openIndex] ?? null);

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

      <Lightbox work={active} onClose={() => setOpenIndex(null)} />
    </section>
  );
}

/** Диалог radix-ui: ловушка фокуса, Esc и `aria-modal` — из коробки. */
function Lightbox({ work, onClose }: { work: Work | null; onClose: () => void }) {
  return (
    <Dialog.Root open={work !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Контент лежит внутри оверлея, а не рядом с ним. Растянутый на весь
            экран `Dialog.Content` сам был бы бэкдропом: клик мимо снимка
            попадал бы внутрь контента, и radix не считал бы его кликом
            снаружи — модалка не закрывалась. */}
        <Dialog.Overlay className="bg-darkroom/92 fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10">
          <Dialog.Content className="max-h-full focus:outline-none">
            {work && (
              <figure className="flex max-h-full flex-col gap-3">
                <VisuallyHidden.Root>
                  <Dialog.Title>{work.alt}</Dialog.Title>
                </VisuallyHidden.Root>

                <div className="bg-paper p-3">
                  <Image
                    src={work.src}
                    alt={work.alt}
                    sizes="90vw"
                    className="max-h-[70vh] w-auto object-contain"
                  />
                </div>

                <figcaption className="text-mono text-paper/60 flex flex-wrap justify-between gap-x-6 gap-y-1 font-mono">
                  <span>
                    Кадр {work.frame} · {work.meta}
                  </span>
                  <span className="text-paper/80">{work.author}</span>
                </figcaption>
              </figure>
            )}

            {/* `fixed`, а не `absolute`: контент теперь по размеру снимка,
                и крестик должен остаться в углу экрана. */}
            <DialogCloseButton className="fixed" />
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
