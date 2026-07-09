import "server-only";

import { parseEnv } from "./env.schema";

/**
 * Валидированное окружение. `server-only` гарантирует, что случайный импорт
 * из клиентского компонента сломает сборку, а `SUPABASE_SERVICE_ROLE_KEY`
 * не утечёт в бандл.
 */
export const env = parseEnv(process.env);
