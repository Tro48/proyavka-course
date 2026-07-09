import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/section-heading";
import { deliverables } from "@/content/deliverables";

export function Deliverables() {
  return (
    <section className="bg-darkroom py-24 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Что будет на руках"
          title="Не «навыки», а предметы"
          lede="Через восемь недель это лежит у вас на столе. Каждый пункт можно взять в руки и показать другому человеку."
        />

        <ul className="rounded-sheet bg-paper/12 mt-14 grid gap-px overflow-hidden sm:grid-cols-3">
          {deliverables.map((item) => (
            <li key={item.id} className="bg-darkroom flex flex-col gap-3 p-8">
              <span className="text-mono text-glow font-mono tracking-wide">
                {item.count}
              </span>
              <h3 className="font-display text-h3 text-paper font-semibold">
                {item.title}
              </h3>
              <p className="text-paper/60 text-sm">{item.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
