import { describe, expect, it } from "vitest";

import { author } from "./author";
import { deliverables } from "./deliverables";
import { faq } from "./faq";
import { PLAN_IDS, plans } from "./plans";
import { program } from "./program";
import { segments } from "./segments";
import { works } from "./works";

describe("программа", () => {
  it("восемь модулей, пронумерованных подряд", () => {
    expect(program).toHaveLength(8);
    expect(program.map((lesson) => lesson.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("заголовок модуля — результат недели, а не тема: в нём есть глагол", () => {
    // Личная форма глагола 2 лица мн. ч.: «снимаете», «видите», «проявляете».
    // \b здесь бесполезен: для JS кириллица — не «словесные» символы.
    const verb = /(?<![а-яё])[а-яё]{2,}(?:ете|ёте|ите)(?![а-яё])/i;

    for (const lesson of program) {
      expect(lesson.title, `модуль ${lesson.number}: «${lesson.title}»`).toMatch(verb);
    }
  });

  it("у каждого модуля есть предметный результат", () => {
    for (const lesson of program) {
      expect(lesson.outcome.length).toBeGreaterThan(0);
      expect(lesson.topics.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("сегменты", () => {
  it("три сегмента, каждый — прямая речь", () => {
    expect(segments).toHaveLength(3);
  });

  it("нет слов «новичок» и «продвинутый»: в ярлыках никто себя не узнаёт", () => {
    const labels = /нович|продвинут|начинающ|профессионал/i;

    for (const segment of segments) {
      const text = [segment.quote, segment.body, segment.shift].join(" ");
      expect(text, segment.id).not.toMatch(labels);
    }
  });
});

describe("тарифы", () => {
  it("три тарифа в порядке возрастания цены", () => {
    expect(plans.map((plan) => plan.id)).toEqual([...PLAN_IDS]);

    const prices = plans.map((plan) => plan.price);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });

  it("выделен ровно один тариф, и у него есть объяснение", () => {
    const featured = plans.filter((plan) => plan.featured);

    expect(featured).toHaveLength(1);
    expect(featured[0]?.id).toBe("pro");
    expect(featured[0]?.featuredNote).toBe("Что выбирают 7 из 10");
  });
});

describe("FAQ", () => {
  it("шесть вопросов", () => {
    expect(faq).toHaveLength(6);
  });

  it("обязательные вопросы на месте: пропуск, своя камера, возврат денег", () => {
    const ids = faq.map((item) => item.id);

    expect(ids).toContain("missed-class");
    expect(ids).toContain("own-camera");
    expect(ids).toContain("refund");
  });
});

describe("что будет на руках", () => {
  it("три предмета, каждый со счётным числом", () => {
    expect(deliverables).toHaveLength(3);

    for (const item of deliverables) {
      expect(item.count, item.id).toMatch(/\d/);
    }
  });
});

describe("автор", () => {
  it("два-три факта, и все они с числами", () => {
    expect(author.facts.length).toBeGreaterThanOrEqual(2);
    expect(author.facts.length).toBeLessThanOrEqual(3);

    for (const fact of author.facts) {
      expect(fact.value, fact.label).toMatch(/^\d+$/);
    }
  });
});

describe("работы выпускников", () => {
  it("двенадцать кадров контрольного листа с уникальными номерами", () => {
    expect(works).toHaveLength(12);
    expect(new Set(works.map((work) => work.frame)).size).toBe(12);
  });

  it("у каждого кадра есть осмысленный alt", () => {
    for (const work of works) {
      expect(work.alt.length, work.id).toBeGreaterThan(10);
    }
  });
});
