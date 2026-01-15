-- 1. Leads Table (If not already existing from your other apps)
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  source text default 'netsellersheet',
  created_at timestamptz default now()
);

-- 2. Seller Sheets Table (Stores the actual calculation)
create table if not exists seller_sheets (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references leads(id),
  email text not null,
  
  -- Core Inputs
  sale_price numeric,
  mortgage_balance numeric,
  zip_code text,
  
  -- Mode & State
  mode text default 'basic', -- 'basic' or 'advanced'
  is_paid boolean default false,
  
  -- Results Snapshot (So you know what they saw)
  net_proceeds_snapshot numeric,
  commission_snapshot numeric,
  
  -- Full JSON dump of inputs (for advanced re-hydration)
  input_data jsonb,
  
  created_at timestamptz default now()
);

-- 3. RLS Policies (Security)
alter table leads enable row level security;
alter table seller_sheets enable row level security;

-- Allow public insert (for the API to work purely via Service Role, 
-- OR allow anon insert if using client side. 
-- We will use Server Actions / API Routes typically, so strict RLS is best).
-- For simplicity in this "lead gen" context:

create policy "Enable insert for anon users" on leads for insert with check (true);
create policy "Enable insert for anon users" on seller_sheets for insert with check (true);

-- 4. Site Traffic Counter (Social Proof)
create table if not exists site_traffic (
  id int primary key generated always as identity,
  count int default 100, -- Seed with 100
  updated_at timestamptz default now()
);

-- Enable RLS
alter table site_traffic enable row level security;

-- Policy: Allow Anon to UPDATE (increment) row 1
create policy "Allow anon update traffic" on site_traffic for update using (true) with check (true);
create policy "Allow anon select traffic" on site_traffic for select using (true);

-- Initial Seed (RUN THIS ONCE IN DASHBOARD SQL EDITOR)
-- insert into site_traffic (count) values (100);
