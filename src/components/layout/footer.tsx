import Link from "next/link";

import { Container } from "@/components/layout/container";
import { legalLinks, site } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-paper/12 bg-darkroom border-t py-14">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="font-display text-h3 text-paper font-semibold">{site.name}</p>
            <p className="text-paper/60 text-sm">{site.address}</p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <a href={`mailto:${site.email}`} className="text-paper hover:text-glow">
              {site.email}
            </a>
            <a href={`tel:${site.phone}`} className="text-paper hover:text-glow">
              {site.phoneLabel}
            </a>
            <a
              href={site.telegram}
              className="text-paper hover:text-glow"
              rel="noopener noreferrer"
              target="_blank"
            >
              Telegram
            </a>
          </div>

          <nav aria-label="Правовая информация" className="flex flex-col gap-2 text-sm">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-paper/60 hover:text-glow"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="border-paper/12 text-paper/60 mt-12 border-t pt-8 text-sm">
          {site.disclaimer}
        </p>
      </Container>
    </footer>
  );
}
