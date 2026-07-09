import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";

/**
 * Все три с `subsets: ["cyrillic", "latin"]` — без явной кириллицы браузер
 * тянет латиницу и кириллицу отдельными файлами.
 */

/** Заголовки: антиква с высоким контрастом штриха. */
export const cormorant = Cormorant_Garamond({
  subsets: ["cyrillic", "latin"],
  weight: ["600"],
  display: "swap",
  variable: "--font-cormorant",
});

/**
 * Текст: гротеск против антиквы — нужный контраст пар.
 * Веса заданы явно: вариативные файлы Inter и JetBrains Mono с кириллицей
 * весят больше, чем два статических начертания (замерено: 169 КБ против 131 КБ).
 */
export const inter = Inter({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-inter",
});

/** Цифры таймера и номера модулей. Моноширинный — обязателен, см. globals.css. */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["cyrillic", "latin"],
  weight: ["500"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const fontVariables = [
  cormorant.variable,
  inter.variable,
  jetbrainsMono.variable,
].join(" ");
