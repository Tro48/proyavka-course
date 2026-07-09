import { BookingDialog } from "@/components/booking/booking-dialog";
import { Footer } from "@/components/layout/footer";
import { Author } from "@/components/sections/author";
import { Deliverables } from "@/components/sections/deliverables";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Plans } from "@/components/sections/plans";
import { Program } from "@/components/sections/program";
import { Segments } from "@/components/sections/segments";
import { Works } from "@/components/sections/works";
import { StickyBar } from "@/components/sticky-bar";
import { cohorts } from "@/content/cohorts";
import { getCohortCopy } from "@/lib/cohort-copy";
import { resolveCohortState } from "@/lib/cohort";
import { env } from "@/lib/env";
import { courseJsonLd } from "@/lib/json-ld";

/**
 * Состояние потока зависит от времени, поэтому страница не может быть
 * статической навсегда: она перегенерируется раз в минуту. Сам таймер при этом
 * точен до секунды — он спрашивает время у `/api/time`, а не у этой разметки.
 */
export const revalidate = 60;

export default function Page() {
  const state = resolveCohortState(new Date(), cohorts);
  const copy = getCohortCopy(state);

  const jsonLd = JSON.stringify(courseJsonLd(env.NEXT_PUBLIC_SITE_URL, cohorts)).replace(
    /</g,
    "\\u003c",
  );

  return (
    <>
      <script
        type="application/ld+json"
        // Строка собрана нами и экранирована выше.
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <main className="flex-1">
        <Hero copy={copy} />
        <Deliverables />
        <Program />
        <Segments />
        <Works />
        <Author />
        <Plans />
        <Faq />
      </main>

      <Footer />
      <StickyBar />
      <BookingDialog copy={copy} />
    </>
  );
}
