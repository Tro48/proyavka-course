import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "@/lib/env";

/**
 * Пять заявок в час на IP. Капчу не ставим: она портит конверсию, а для
 * лендинга с трафиком в десятки визитов honeypot, time-trap и этот лимит
 * закрывают вопрос.
 *
 * Локально Upstash не нужен: без переменных окружения лимит не применяется,
 * и форму можно отлаживать. На проде переменные заданы.
 */
const limiter =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: env.UPSTASH_REDIS_REST_URL,
          token: env.UPSTASH_REDIS_REST_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(5, "1 h"),
        prefix: "proyavka:lead",
      })
    : null;

export const isRateLimitEnabled = limiter !== null;

export async function checkRateLimit(ip: string): Promise<boolean> {
  if (!limiter) return true;

  const { success } = await limiter.limit(ip);
  return success;
}

/** За обратным прокси реальный адрес приходит заголовком. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();

  return first || request.headers.get("x-real-ip") || "unknown";
}
