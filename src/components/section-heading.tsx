import type { ReactNode } from "react";

/** Один h1 на страницу, дальше h2 на каждой секции. Дыр в порядке нет. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
}) {
  return (
    <header className="max-w-3xl">
      <p className="text-mono text-paper/60 font-mono tracking-widest uppercase">
        {eyebrow}
      </p>
      <h2 className="font-display text-h2 text-paper mt-4 font-semibold text-balance">
        {title}
      </h2>
      {lede && <p className="text-paper/70 mt-5">{lede}</p>}
    </header>
  );
}
