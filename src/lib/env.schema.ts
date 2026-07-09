import { z } from "zod";

/**
 * Схема окружения. Живёт отдельно от `env.ts` намеренно: `env.ts` помечен
 * `import "server-only"` и потому не импортируется из `next.config.ts`.
 * Схему же конфиг импортирует, чтобы билд падал на отсутствующих переменных,
 * а не прод — в рантайме.
 */

/** Пустая строка в .env — это «не задано», а не значение. */
const optional = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional(),
);

export const envSchema = z
  .object({
    NEXT_PUBLIC_SITE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

    UPSTASH_REDIS_REST_URL: optional.pipe(z.url().optional()),
    UPSTASH_REDIS_REST_TOKEN: optional,

    NEXT_PUBLIC_YM_ID: optional,
  })
  .check((ctx) => {
    const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = ctx.value;
    if (Boolean(url) !== Boolean(token)) {
      ctx.issues.push({
        code: "custom",
        input: ctx.value,
        path: ["UPSTASH_REDIS_REST_TOKEN"],
        message:
          "UPSTASH_REDIS_REST_URL и UPSTASH_REDIS_REST_TOKEN задаются вместе или не задаются вовсе",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

/**
 * Валидирует окружение и падает с читаемым списком проблем.
 * Вызывается из `next.config.ts` (на билде) и из `env.ts` (на сервере).
 */
export function parseEnv(source: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  · ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Переменные окружения не прошли валидацию:\n${problems}\n\n` +
        `Скопируйте .env.example в .env.local и заполните.`,
    );
  }

  return result.data;
}
