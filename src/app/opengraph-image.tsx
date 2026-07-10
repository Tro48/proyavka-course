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

/**
 * Встроенный шрифт `next/og` кириллицу не покрывает: без своего файла весь
 * русский текст на картинке вышел бы «квадратами». Подгружаем Inter из Google
 * Fonts прямо при генерации. Файл в репозитории не храним — как и остальные
 * шрифты (см. CREDITS.md), а `text` отдаёт крохотный субсет ровно под нужные
 * глифы. Запрос делается на сборке/ревалидации (revalidate = 60), не на
 * открытии страницы.
 */
const GLYPHS =
  "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" +
  "0123456789 ·—–,.:;%()«»/№-!?";

async function loadInter(): Promise<ArrayBuffer | null> {
  try {
    // Без браузерного User-Agent Google Fonts отдаёт TTF, а не woff2, —
    // именно то, что умеет разбирать satori под капотом `ImageResponse`.
    const cssUrl = `https://fonts.googleapis.com/css2?family=Inter:wght@400&text=${encodeURIComponent(GLYPHS)}`;
    const css = await fetch(cssUrl).then((res) => res.text());
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!src) throw new Error("в ответе Google Fonts нет TTF");

    return await fetch(src).then((res) => res.arrayBuffer());
  } catch (error) {
    // OG-картинка некритична: пусть лучше выйдет без кириллицы, чем упадёт весь
    // роут. При ошибке ISR всё равно отдаст прошлую удачную версию.
    console.error("Не удалось загрузить шрифт для OG-картинки", error);
    return null;
  }
}

export default async function Image() {
  const copy = getCohortCopy(resolveCohortState(new Date(), cohorts));
  const inter = await loadInter();

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "72px",
        fontFamily: "Inter",
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
    {
      ...size,
      fonts: inter ? [{ name: "Inter", data: inter, style: "normal", weight: 400 }] : [],
    },
  );
}
