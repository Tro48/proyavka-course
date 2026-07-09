import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/section-heading";
import { Accordion } from "@/components/ui/accordion";
import { faq } from "@/content/faq";

export function Faq() {
  const items = faq.map((item) => ({
    id: item.id,
    trigger: (
      <span className="font-display text-h3 text-paper font-semibold">
        {item.question}
      </span>
    ),
    content: <p className="text-paper/70 max-w-3xl">{item.answer}</p>,
  }));

  return (
    <section id="faq" className="bg-darkroom py-24 md:py-28">
      <Container>
        <SectionHeading eyebrow="Вопросы" title="Что спрашивают перед записью" />

        <div className="mt-14">
          <Accordion items={items} />
        </div>
      </Container>
    </section>
  );
}
