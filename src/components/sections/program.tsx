import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/section-heading";
import { Accordion } from "@/components/ui/accordion";
import { program } from "@/content/program";

export function Program() {
  const items = program.map((lesson) => ({
    id: `lesson-${lesson.number}`,
    trigger: (
      <span className="flex items-baseline gap-4 sm:gap-6">
        <span className="text-mono text-glow font-mono">
          {String(lesson.number).padStart(2, "0")}
        </span>
        <span className="font-display text-h3 text-paper font-semibold">
          {lesson.title}
        </span>
      </span>
    ),
    content: (
      <div className="flex flex-col gap-6 pl-0 sm:pl-14">
        <p className="text-paper/70 max-w-2xl">{lesson.summary}</p>

        <ul className="flex max-w-2xl flex-col gap-2">
          {lesson.topics.map((topic) => (
            <li key={topic} className="text-paper/60 flex gap-3 text-sm">
              <span aria-hidden="true" className="bg-safelight mt-2.5 size-1 shrink-0" />
              {topic}
            </li>
          ))}
        </ul>

        <p className="text-mono text-paper/60 font-mono">
          На руках: <span className="text-paper/75">{lesson.outcome}</span>
        </p>
      </div>
    ),
  }));

  return (
    <section id="program" className="bg-darkroom py-24 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Программа"
          title="Восемь недель, восемь результатов"
          lede="Заголовок модуля — не тема занятия, а то, что вы умеете к концу недели."
        />

        <div className="mt-14">
          <Accordion items={items} defaultOpen="lesson-1" />
        </div>
      </Container>
    </section>
  );
}
