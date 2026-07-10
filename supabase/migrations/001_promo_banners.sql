-- Promo banners (admin-managed homepage carousel)
-- Wire getPromoBanners() to this table in a future pass.

create table if not exists public.promo_banners (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  is_published boolean not null default false,
  eyebrow text not null,
  headline text not null,
  headline_accent text,
  body text not null,
  offer_percent integer,
  offer_prefix text default 'Up to',
  cta_label text not null,
  cta_href text not null,
  image_url text not null,
  image_alt text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists promo_banners_sort_order_idx
  on public.promo_banners (sort_order);

alter table public.promo_banners enable row level security;

-- Public read for published banners only
create policy "Public can read published promo banners"
  on public.promo_banners
  for select
  using (is_published = true);

-- Admin write policies to be added when auth is wired
