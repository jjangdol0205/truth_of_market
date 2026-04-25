-- Allow anonymous inserts to allow the node script to upsert blog posts
create policy "Allow anonymous inserts to blog_posts"
    on public.blog_posts for insert
    with check (true);

-- Allow anonymous updates to allow upserting on conflict
create policy "Allow anonymous updates to blog_posts"
    on public.blog_posts for update
    using (true);
