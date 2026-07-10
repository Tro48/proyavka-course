# Проявка — лендинг курса плёночной фотографии

**[proyavka-course.vercel.app](https://proyavka-course.vercel.app)**

Лендинг офлайн-курса плёночной фотографии: съёмка, ручная проявка, печать. Цель
страницы — бронь места в потоке до закрытия набора.

Ключевое: состояние потока (`enrolling` / `lastCall` / `closed` / `waitlist`)
выводится из конфига и текущего времени, из него — все тексты, таймер и цель
формы. Таймер сверяет часы с сервером. Бронь пишется в Supabase через Route
Handler с honeypot, time-trap и rate limit по IP.

> Демонстрационный проект: курс, лаборатория, автор, работы выпускников и отзывы
> вымышлены. Фотографии сгенерированы нейросетью, см. [`CREDITS.md`](CREDITS.md).

## Стек

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS 4 · Motion · Zustand ·
React Hook Form · Zod 4 · radix-ui · Supabase · Vitest · Playwright · Vercel

## Как запустить

```bash
pnpm install
cp .env.example .env.local   # и заполнить
pnpm dev
```

Проверки (все блокирующие в CI):

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
pnpm build
```

Таблица лидов создаётся SQL-скриптом [`supabase/schema.sql`](supabase/schema.sql).

## Метрики

Lighthouse, мобильный пресет, продовый билд:

| Метрика        | Цель  | Факт   |
| -------------- | ----- | ------ |
| Performance    | ≥ 90  | 91–94  |
| Accessibility  | = 100 | 100    |
| Best Practices | ≥ 95  | 100    |
| SEO            | = 100 | 100    |
| CLS            | 0     | 0      |
| LCP (observed) | —     | ~0.1 с |
