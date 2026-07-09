import Image from "next/image";

import heroImage from "@/images/hero.webp";

import { Countdown } from "@/components/countdown";
import { BookingTrigger } from "@/components/booking-trigger";
import { Grain } from "@/components/grain";
import { Container } from "@/components/layout/container";
import { site } from "@/content/site";
import type { CohortCopy } from "@/lib/cohort-copy";
import { SEATS, pluralize } from "@/lib/plural";

export function Hero({ copy }: { copy: CohortCopy }) {
  return (
    <section className="bg-darkroom relative isolate overflow-hidden">
      {/* LCP-картинка: единственная с `priority` на странице. */}
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-35"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-darkroom)_72%,transparent),var(--color-darkroom))]"
      />
      <Grain />

      <Container className="relative py-24 md:py-32">
        <div className="max-w-3xl">
          <p className="text-mono text-paper/60 font-mono tracking-widest uppercase">
            {site.name} · {site.tagline}
          </p>

          <h1 className="font-display text-hero text-paper mt-6 font-semibold text-balance">
            {site.promise}
          </h1>

          <p className="text-paper/70 mt-6 max-w-2xl">{site.lede}</p>

          <div className="mt-12 flex flex-col gap-2">
            <p className="text-mono text-glow font-mono tracking-widest uppercase">
              {copy.title}
            </p>
            <p className="text-paper/60 text-sm">{copy.note}</p>
          </div>

          {copy.countdown && (
            <div className="mt-8">
              <Countdown
                deadline={copy.countdown.deadline}
                caption={copy.countdown.caption}
                urgent={copy.countdown.urgent}
              />
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <BookingTrigger label={copy.cta.label} />

            {copy.seats && <Seats left={copy.seats.left} total={copy.seats.total} />}
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Мест физически мало: лаборатория одна. Полоса показывает это без слова
 * «спешите» — она просто заполнена почти целиком.
 */
function Seats({ left, total }: { left: number; total: number }) {
  const taken = total - left;

  return (
    <p className="text-paper/60 flex items-center gap-3 text-sm">
      <span
        aria-hidden="true"
        className="rounded-sheet bg-paper/15 flex h-1 w-24 overflow-hidden"
      >
        <span
          className="bg-safelight h-full"
          style={{ width: `${(taken / total) * 100}%` }}
        />
      </span>
      <span>
        {pluralize(left, SEATS)} из {total}
      </span>
    </p>
  );
}
