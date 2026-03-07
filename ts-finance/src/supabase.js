import { createClient } from '@supabase/supabase-js'

const SUPA_URL  = import.meta.env.VITE_SUPABASE_URL  || ''
const SUPA_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = SUPA_URL && SUPA_KEY
  ? createClient(SUPA_URL, SUPA_KEY)
  : null

export const hasSupabase = !!supabase

/*
──────────────────────────────────────────────
  SQL PARA EJECUTAR EN SUPABASE → SQL EDITOR
──────────────────────────────────────────────

create table if not exists incomes (
  id          text primary key,
  client      text,
  project     text,
  date        date,
  amount      numeric,
  has_iva     boolean default false,
  iva_p       numeric default 19,
  status      text,
  method      text,
  notes       text,
  created_at  timestamptz default now()
);

create table if not exists expenses (
  id          text primary key,
  date        date,
  cat         text,
  sub         text,
  description text,
  provider    text,
  amount      numeric,
  has_iva     boolean default false,
  iva_p       numeric default 19,
  method      text,
  obs         text,
  created_at  timestamptz default now()
);

create table if not exists recurring (
  id          text primary key,
  name        text,
  cat         text,
  amount      numeric,
  has_iva     boolean default false,
  iva_p       numeric default 19,
  freq        text,
  day_of_month integer,
  method      text,
  active      boolean default true,
  icon_name   text,
  notes       text,
  created_at  timestamptz default now()
);

-- Habilitar Row Level Security (permitir todo para key pública de tu proyecto)
alter table incomes  enable row level security;
alter table expenses enable row level security;
alter table recurring enable row level security;

create policy "allow all" on incomes  for all using (true) with check (true);
create policy "allow all" on expenses for all using (true) with check (true);
create policy "allow all" on recurring for all using (true) with check (true);

──────────────────────────────────────────────
*/
