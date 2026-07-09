import { ImageResponse } from "next/og";

import { cohorts } from "@/content/cohorts";
import { site } from "@/content/site";
import { getCohortCopy } from "@/lib/cohort-copy";
import { resolveCohortState } from "@/lib/cohort";

export const alt = `${site.name} — ${site.tagline.toLowerCase()}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Картинка живёт столько же, сколько страница: дата старта на ней настоящая. */
export const revalidate = 60;

export default async function Image() {
  const copy = getCohortCopy(resolveCohortState(new Date(), cohorts));

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "72px",
        backgroundColor: "#14100F",
        backgroundImage:
          "radial-gradient(circle at 22% 30%, rgba(140,42,34,0.45), transparent 55%)",
        color: "#FAF8F5",
      }}
    >
      <div style={{ display: "flex", fontSize: 26, color: "rgba(250,248,245,0.5)" }}>
        {site.name.toUpperCase()} · {site.tagline.toUpperCase()}
      </div>

      <div style={{ display: "flex", fontSize: 76, lineHeight: 1.05, maxWidth: 900 }}>
        {site.promise}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderTop: "1px solid rgba(250,248,245,0.15)",
          paddingTop: 32,
        }}
      >
        {/* Тот же glow, что и в теме: #C4402F на darkroom читается плохо. */}
        <div style={{ display: "flex", fontSize: 34, color: "#E0603F" }}>
          {copy.title}
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "rgba(250,248,245,0.5)" }}>
          {site.address}
        </div>
      </div>
    </div>,
    size,
  );
}
