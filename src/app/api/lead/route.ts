import type { NextRequest } from "next/server";

import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import type { LeadResponse } from "@/lib/schemas/lead";
import { TIME_TRAP_MS, leadRequestSchema } from "@/lib/schemas/lead";
import { UNIQUE_VIOLATION, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function json(body: LeadResponse, status: number): Response {
  return Response.json(body, { status });
}

/**
 * Порядок проверок: валидация → honeypot → time-trap → rate limit → вставка.
 *
 * Ботам на honeypot и time-trap отвечаем `ok: true`. Честное «вы бот» научило
 * бы автора бота обходить ловушку; молчаливый успех — нет.
 */
export async function POST(request: NextRequest): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "Не удалось разобрать запрос" }, 400);
  }

  const parsed = leadRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "");
      fieldErrors[field] ??= issue.message;
    }

    return json({ ok: false, message: "Проверьте поля формы", fieldErrors }, 422);
  }

  const lead = parsed.data;

  if (lead.website) return json({ ok: true }, 200);

  if (Date.now() - lead.renderedAt < TIME_TRAP_MS) return json({ ok: true }, 200);

  const allowed = await checkRateLimit(clientIp(request));
  if (!allowed) {
    return json(
      { ok: false, message: "Слишком много заявок с одного адреса. Попробуйте позже." },
      429,
    );
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("leads").insert({
    name: lead.name,
    email: lead.email,
    phone: lead.phone ?? null,
    plan: lead.plan,
    cohort_id: lead.cohortId,
    utm: lead.utm ?? null,
  });

  if (error) {
    // Идемпотентность на уровне БД: `unique (email, cohort_id)`. Повтор — это
    // не ошибка сервера, а сообщение, которое человек должен прочитать.
    if (error.code === UNIQUE_VIOLATION) {
      return json(
        {
          ok: false,
          message: "Вы уже забронировали место на этот поток. Мы напишем на почту.",
        },
        409,
      );
    }

    console.error("Не удалось записать заявку", error);
    return json(
      { ok: false, message: "Не получилось отправить. Попробуйте ещё раз." },
      500,
    );
  }

  return json({ ok: true }, 201);
}
