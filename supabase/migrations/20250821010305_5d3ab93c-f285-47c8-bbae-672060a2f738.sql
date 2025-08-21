
-- Extensões úteis
create extension if not exists pgcrypto with schema public;

-- Enum para status de mensagens
do $$ begin
  if not exists (select 1 from pg_type where typname = 'message_status') then
    create type public.message_status as enum ('SENT','ERROR','RETRY');
  end if;
end $$;

-- Função utilitária para updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Tabela de contas conectadas ao Instagram
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, -- não referencia auth.users diretamente (ver políticas RLS)
  page_id text not null,
  ig_business_id text not null,
  access_token_encrypted text not null, -- armazenado com segurança; somente funções usam
  connected_at timestamptz not null default now()
);

-- Tabela de posts (cada media_id é 1 post/campanha)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  media_id text not null unique,
  caption text,
  thumbnail_url text,
  posted_at timestamptz,
  active_bool boolean not null default false,
  dm_template text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_posts_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

-- Palavras-chave por post
create table if not exists public.keywords (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  word text not null,
  active_bool boolean not null default true,
  created_at timestamptz not null default now(),
  constraint uq_keywords_post_word unique (post_id, word)
);

-- Comentários recebidos
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  ig_user_id text not null,
  ig_username text,
  text text not null,
  commented_at timestamptz not null,
  matched_keyword_id uuid null references public.keywords(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Mensagens enviadas (DMs)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  keyword_id uuid null references public.keywords(id) on delete set null,
  ig_user_id text not null,
  ig_username text,
  status public.message_status not null default 'RETRY',
  error_text text,
  sent_at timestamptz null,
  created_at timestamptz not null default now()
);

-- Configurações por conta (template default)
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade unique,
  default_dm_template text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_settings_updated_at
before update on public.settings
for each row
execute function public.set_updated_at();

-- Índices
create index if not exists idx_posts_account_id_posted_at on public.posts(account_id, posted_at desc);
create index if not exists idx_keywords_post_id on public.keywords(post_id);
create index if not exists idx_comments_post_id_commented_at on public.comments(post_id, commented_at desc);
create index if not exists idx_messages_post_id_created_at on public.messages(post_id, created_at desc);
create index if not exists idx_messages_post_status on public.messages(post_id, status);

-- Habilitar Row Level Security
alter table public.accounts enable row level security;
alter table public.posts enable row level security;
alter table public.keywords enable row level security;
alter table public.comments enable row level security;
alter table public.messages enable row level security;
alter table public.settings enable row level security;

-- Políticas: cada usuário acessa apenas seus dados
-- Accounts
drop policy if exists "accounts_select_own" on public.accounts;
drop policy if exists "accounts_insert_own" on public.accounts;
drop policy if exists "accounts_update_own" on public.accounts;
drop policy if exists "accounts_delete_own" on public.accounts;

create policy "accounts_select_own"
on public.accounts for select
using (user_id = auth.uid());

create policy "accounts_insert_own"
on public.accounts for insert
with check (user_id = auth.uid());

create policy "accounts_update_own"
on public.accounts for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "accounts_delete_own"
on public.accounts for delete
using (user_id = auth.uid());

-- Posts (derivam da account do usuário)
drop policy if exists "posts_select_by_owner" on public.posts;
drop policy if exists "posts_insert_by_owner" on public.posts;
drop policy if exists "posts_update_by_owner" on public.posts;
drop policy if exists "posts_delete_by_owner" on public.posts;

create policy "posts_select_by_owner"
on public.posts for select
using (exists (
  select 1 from public.accounts a
  where a.id = posts.account_id
    and a.user_id = auth.uid()
));

create policy "posts_insert_by_owner"
on public.posts for insert
with check (exists (
  select 1 from public.accounts a
  where a.id = posts.account_id
    and a.user_id = auth.uid()
));

create policy "posts_update_by_owner"
on public.posts for update
using (exists (
  select 1 from public.accounts a
  where a.id = posts.account_id
    and a.user_id = auth.uid()
))
with check (exists (
  select 1 from public.accounts a
  where a.id = posts.account_id
    and a.user_id = auth.uid()
));

create policy "posts_delete_by_owner"
on public.posts for delete
using (exists (
  select 1 from public.accounts a
  where a.id = posts.account_id
    and a.user_id = auth.uid()
));

-- Keywords
drop policy if exists "keywords_select_by_owner" on public.keywords;
drop policy if exists "keywords_cud_by_owner" on public.keywords;

create policy "keywords_select_by_owner"
on public.keywords for select
using (exists (
  select 1 from public.posts p
  join public.accounts a on a.id = p.account_id
  where p.id = keywords.post_id
    and a.user_id = auth.uid()
));

create policy "keywords_cud_by_owner"
on public.keywords for all
using (exists (
  select 1 from public.posts p
  join public.accounts a on a.id = p.account_id
  where p.id = keywords.post_id
    and a.user_id = auth.uid()
))
with check (exists (
  select 1 from public.posts p
  join public.accounts a on a.id = p.account_id
  where p.id = keywords.post_id
    and a.user_id = auth.uid()
));

-- Comments
drop policy if exists "comments_select_by_owner" on public.comments;
drop policy if exists "comments_insert_by_owner" on public.comments;

create policy "comments_select_by_owner"
on public.comments for select
using (exists (
  select 1 from public.posts p
  join public.accounts a on a.id = p.account_id
  where p.id = comments.post_id
    and a.user_id = auth.uid()
));

-- Inserts de comments podem vir do frontend (para simular) ou de função com service role.
-- Mantemos a checagem pelo post -> account do usuário
create policy "comments_insert_by_owner"
on public.comments for insert
with check (exists (
  select 1 from public.posts p
  join public.accounts a on a.id = p.account_id
  where p.id = comments.post_id
    and a.user_id = auth.uid()
));

-- Messages
drop policy if exists "messages_select_by_owner" on public.messages;
drop policy if exists "messages_insert_by_owner" on public.messages;
drop policy if exists "messages_update_by_owner" on public.messages;

create policy "messages_select_by_owner"
on public.messages for select
using (exists (
  select 1 from public.posts p
  join public.accounts a on a.id = p.account_id
  where p.id = messages.post_id
    and a.user_id = auth.uid()
));

create policy "messages_insert_by_owner"
on public.messages for insert
with check (exists (
  select 1 from public.posts p
  join public.accounts a on a.id = p.account_id
  where p.id = messages.post_id
    and a.user_id = auth.uid()
));

create policy "messages_update_by_owner"
on public.messages for update
using (exists (
  select 1 from public.posts p
  join public.accounts a on a.id = p.account_id
  where p.id = messages.post_id
    and a.user_id = auth.uid()
))
with check (exists (
  select 1 from public.posts p
  join public.accounts a on a.id = p.account_id
  where p.id = messages.post_id
    and a.user_id = auth.uid()
));

-- Settings
drop policy if exists "settings_select_by_owner" on public.settings;
drop policy if exists "settings_cud_by_owner" on public.settings;

create policy "settings_select_by_owner"
on public.settings for select
using (exists (
  select 1 from public.accounts a
  where a.id = settings.account_id
    and a.user_id = auth.uid()
));

create policy "settings_cud_by_owner"
on public.settings for all
using (exists (
  select 1 from public.accounts a
  where a.id = settings.account_id
    and a.user_id = auth.uid()
))
with check (exists (
  select 1 from public.accounts a
  where a.id = settings.account_id
    and a.user_id = auth.uid()
));
