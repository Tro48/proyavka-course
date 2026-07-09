/**
 * Источник времени для таймера.
 *
 * `Date.now()` в браузере — это системное время пользователя, которое он может
 * перевести. Клиент один раз спрашивает сервер и дальше корректирует свои тики
 * на разницу. Стоит один лёгкий запрос и закрывает 99 % случаев.
 */
export const dynamic = "force-dynamic";

export function GET(): Response {
  return Response.json(
    { now: Date.now() },
    { headers: { "cache-control": "no-store, max-age=0" } },
  );
}
