-- Create a table for capturing newsletter/reporting leads
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  source text default 'website_footer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.leads enable row level security;

-- Allow anyone to insert (so public users can submit emails)
create policy "Allow anonymous inserts to leads"
  on public.leads for insert
  with check (true);

-- Only authenticated admins can view the leads (we'll keep it strict for now)
create policy "Only admins can view leads"
  on public.leads for select
  using ( 
    auth.jwt() ->> 'email' = 'beable9489@gmail.com' 
  );
