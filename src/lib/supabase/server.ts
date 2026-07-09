import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

/**
 * Клиент с service-role ключом. Живёт только на сервере: `server-only` ломает
 * сборку, если этот файл случайно импортируют из клиентского компонента.
 *
 * Service role обходит RLS — именно поэтому вставка идёт через Route Handler,
 * где мы контролируем rate limit, а не напрямую из браузера.
 */
export function createServiceClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Нарушение unique-ограничения в PostgreSQL. */
export const UNIQUE_VIOLATION = "23505";
