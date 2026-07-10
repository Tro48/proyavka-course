import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/section-heading";
import { segments } from "@/content/segments";

export function Segments() {
  return (
    <section className="bg-darkroom py-24 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Кому подходит"
          title="Три ситуации, в которых сюда приходят"
        />

        <ul className="mt-14 grid gap-6 md:grid-cols-3 md:grid-rows-[auto_1fr_auto] md:gap-y-5">
          {segments.map((segment) => (
            <li
              key={segment.id}
              className="rounded-sheet border-paper/12 flex flex-col gap-5 border p-8 md:row-span-3 md:grid md:grid-rows-subgrid"
            >
              <blockquote className="font-display text-h3 text-paper font-semibold text-balance">
                «{segment.quote}»
              </blockquote>

              <p className="text-paper/60 text-sm">{segment.body}</p>

              <p className="border-paper/12 text-paper/75 border-t pt-5 text-sm">
                {segment.shift}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
