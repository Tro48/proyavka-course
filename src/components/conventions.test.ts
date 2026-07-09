import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const SRC = resolve(process.cwd(), "src");

function sourceFiles(): string[] {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const path = join(dir, entry);
      return statSync(path).isDirectory() ? walk(path) : [path];
    });

  return walk(SRC).filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file));
}

describe("safelight — источник света, а не краска для букв", () => {
  it("нигде не используется как цвет текста", () => {
    // Контраст safelight на darkroom — 3.4:1. Красивый тёмно-красный в подписи
    // под заголовком на чёрном невозможно прочитать. Для текста есть glow.
    const asText = /\b(?:text|placeholder|decoration|caret)-safelight\b/;

    for (const file of sourceFiles()) {
      const source = readFileSync(file, "utf8");
      expect(source, relative(process.cwd(), file)).not.toMatch(asText);
    }
  });

  it("globals.css предупреждает об этом прямо в коде", () => {
    const css = readFileSync(join(SRC, "app", "globals.css"), "utf8");

    expect(css).toMatch(/2\.22:1/);
    expect(css).toMatch(/НЕ ИСПОЛЬЗОВАТЬ/);
  });
});

describe("blur-проявление — только к фотографиям", () => {
  it("PhotoReveal оборачивает только снимок", () => {
    const users = sourceFiles().filter((file) => {
      const source = readFileSync(file, "utf8");
      return /<PhotoReveal/.test(source);
    });

    expect(users.length).toBeGreaterThan(0);

    // `<Image` или `<Photo` (next/image со скелетоном). Разделитель после имени
    // обязателен, иначе сам `<PhotoReveal` сойдёт за совпадение.
    const photo = /<(?:Image|Photo)[\s/>]/;

    for (const file of users) {
      const source = readFileSync(file, "utf8");
      // Текст, размытый на секунду ради эффекта, — это не проявка, а помеха.
      expect(source, relative(process.cwd(), file)).toMatch(photo);
    }
  });

  it("никакой другой компонент не анимирует blur", () => {
    for (const file of sourceFiles()) {
      if (file.endsWith("photo-reveal.tsx")) continue;

      const source = readFileSync(file, "utf8");
      expect(source, relative(process.cwd(), file)).not.toMatch(/filter:\s*["']?blur\(/);
    }
  });

  it("PhotoReveal уважает prefers-reduced-motion", () => {
    const source = readFileSync(join(SRC, "components", "photo-reveal.tsx"), "utf8");

    expect(source).toMatch(/useReducedMotion/);
  });
});
