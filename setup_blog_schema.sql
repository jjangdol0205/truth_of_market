-- Create the blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  author text NOT NULL,
  read_time text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to blog_posts
CREATE POLICY "Allow public read access on blog_posts"
  ON public.blog_posts
  FOR SELECT
  TO public
  USING (true);

-- Allow service role to insert/update/delete (or authenticated admins if you have them)
CREATE POLICY "Allow service role full access on blog_posts"
  ON public.blog_posts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
