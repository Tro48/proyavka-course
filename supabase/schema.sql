-- Таблица заявок. Выполняется в SQL-редакторе Supabase.
--
-- Запись идёт только через Route Handler с service-role ключом. Политик для
-- `anon` нет вообще: с анонимным ключом и insert-политикой любой посетитель
-- писал бы в таблицу прямо из консоли браузера, в цикле.

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null check (char_length(name) between 2 and 60),
  email text not null check (position('@' in email) > 1),
  phone text,

  plan text not null check (plan in ('base', 'pro', 'mentor')),
  cohort_id text not null,

  -- Метки из URL. На реальном проекте это первое, что спросит маркетолог.
  utm jsonb,

  -- Идемпотентность на уровне БД: повторная отправка той же формы вернёт
  -- ошибку 23505, которую Route Handler превращает в честный ответ
  -- «вы уже забронировали место», а не в 500.
  constraint leads_email_cohort_unique unique (email, cohort_id)
);

alter table public.leads enable row level security;

-- Ни select, ни insert для anon. Ни одной политики — значит доступа нет.
-- RLS без политик закрывает таблицу для всех ролей, кроме service_role,
-- который RLS обходит по определению.

create index leads_cohort_id_created_at_idx on public.leads (cohort_id, created_at desc);
