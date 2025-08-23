
-- 1) Adiciona o nome da automação/campanha na tabela de posts
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS name text;
