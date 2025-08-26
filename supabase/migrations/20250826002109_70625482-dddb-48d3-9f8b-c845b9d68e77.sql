-- Add require_user_follow column to posts table
ALTER TABLE public.posts 
ADD COLUMN require_user_follow boolean NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.posts.require_user_follow IS 'When true, users must follow the page before receiving the main DM message';