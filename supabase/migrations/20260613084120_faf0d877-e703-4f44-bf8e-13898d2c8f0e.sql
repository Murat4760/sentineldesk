-- tenant isolation
alter table public.voice_configs
  add constraint voice_configs_assistant_id_unique unique (assistant_id);

-- billing columns (store NET; gross = net * 1.20 KDV)
alter table public.businesses
  add column if not exists is_active boolean not null default true,
  add column if not exists subscription_status text not null default 'trial',
  add column if not exists paid_until timestamptz,
  add column if not exists net_price integer;

alter table public.businesses
  add constraint businesses_subscription_status_check
  check (subscription_status in ('trial','active','past_due','cancelled'));

-- payment event log
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  amount_gross integer not null,
  net_amount integer not null,
  kdv_rate numeric not null default 0.20,
  iyzico_payment_id text,
  status text not null default 'pending' check (status in ('pending','success','failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy payments_owner_select on public.payments
  for select using (
    exists (select 1 from public.businesses b
            where b.id = payments.business_id and b.owner_id = auth.uid())
  );