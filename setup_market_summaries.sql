-- Create the market_summaries table for the Daily Briefing feature
create table public.market_summaries (
    id uuid default gen_random_uuid() primary key,
    date date not null unique,
    title text not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for security
alter table public.market_summaries enable row level security;

-- Allow anonymous read access so the homepage can display the daily briefing freely
create policy "Allow anonymous select on market_summaries"
    on public.market_summaries for select
    using (true);

-- Allow anonymous inserts to allow the Vercel Cron (or edge functions without service roles) to upsert
create policy "Allow anonymous inserts to market_summaries"
    on public.market_summaries for insert
    with check (true);

-- Allow anonymous updates to allow upserting on conflict
create policy "Allow anonymous updates to market_summaries"
    on public.market_summaries for update
    using (true);
