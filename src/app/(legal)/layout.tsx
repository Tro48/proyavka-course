import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="bg-darkroom flex-1 py-16">
        <Container className="max-w-3xl">
          <Link href="/" className="text-mono text-paper/60 hover:text-paper font-mono">
            ← На главную
          </Link>

          <article className="text-paper/70 [&_h1]:font-display [&_h1]:text-h2 [&_h1]:text-paper [&_h2]:font-display [&_h2]:text-h3 [&_h2]:text-paper mt-10 flex flex-col gap-5 [&_h1]:font-semibold [&_h2]:mt-6 [&_h2]:font-semibold">
            {children}
          </article>
        </Container>
      </main>

      <Footer />
    </>
  );
}
