import { Container } from "@/components/layout/container";
import { PhotoReveal } from "@/components/photo-reveal";
import { SectionHeading } from "@/components/section-heading";
import { Photo } from "@/components/ui/photo";
import { author } from "@/content/author";

export function Author() {
  return (
    <section className="bg-darkroom py-24 md:py-28">
      <Container>
        <div className="grid items-start gap-12 md:grid-cols-[2fr_3fr] md:gap-16">
          <PhotoReveal>
            <Photo
              src={author.portrait.src}
              alt={author.portrait.alt}
              sizes="(min-width: 768px) 34vw, 100vw"
              className="rounded-sheet w-full object-cover"
              // Портрет лежит на darkroom: скелетон светлый, иначе его не видно.
              boxClassName="rounded-sheet overflow-hidden"
              skeletonClassName="bg-paper/10"
            />
          </PhotoReveal>

          <div>
            <SectionHeading eyebrow={author.role} title={author.name} />

            <div className="text-paper/70 mt-6 flex flex-col gap-4">
              {author.bio.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <dl className="border-paper/12 mt-10 grid grid-cols-3 gap-6 border-t pt-8">
              {author.facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-1">
                  {/* tabular-nums наследуется от .font-mono: цифры в колонке не пляшут. */}
                  <dt className="text-paper font-mono text-3xl">{fact.value}</dt>
                  <dd className="text-paper/60 text-sm">{fact.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
