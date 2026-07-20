-- 수제 디저트 쇼핑몰 — Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 그대로 붙여넣고 실행한다.

-- 1. 상품 테이블 (읽기 전용, 관리자가 대시보드에서 직접 입력/수정)
create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  price integer not null,
  category text not null check (category in ('케이크', '쿠키', '음료')),
  image text not null,
  sold_out boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. 장바구니 테이블 (사용자별로 담은 상품, 로그인 화면 없이 익명 인증 사용자 기준으로 구분)
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id bigint not null references products (id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- 3. RLS(행 단위 보안) 켜기 — 반드시 켜야 한다
alter table products enable row level security;
alter table cart_items enable row level security;

-- 4. products 정책: 누구나(anon 포함) 읽기만 가능, 쓰기는 불가
--    (상품 등록/수정은 지금 단계에서 대시보드 Table Editor로 직접 처리 = Out of scope)
create policy "products are publicly readable"
  on products for select
  using (true);

-- 5. cart_items 정책: 본인(auth.uid())의 장바구니만 조회/추가/수정/삭제 가능
create policy "users can read their own cart"
  on cart_items for select
  using (auth.uid() = user_id);

create policy "users can insert into their own cart"
  on cart_items for insert
  with check (auth.uid() = user_id);

create policy "users can update their own cart"
  on cart_items for update
  using (auth.uid() = user_id);

create policy "users can delete from their own cart"
  on cart_items for delete
  using (auth.uid() = user_id);

-- 6. 목업 데이터를 실제 상품 데이터로 이관 (PRD의 목업 6개와 동일)
insert into products (name, price, category, image, sold_out) values
  ('딸기 생크림 케이크', 32000, '케이크', '생크림 위에 신선한 딸기를 가득 올린 4호 케이크', false),
  ('초콜릿 가나슈 케이크', 35000, '케이크', '진한 다크 초콜릿 가나슈로 코팅한 케이크', false),
  ('수제 버터쿠키 (10입)', 12000, '쿠키', '고소한 버터 향이 나는 수제 쿠키 10개 세트', false),
  ('초코칩 쿠키 (5입)', 9000, '쿠키', '진한 초코칩이 듬뿍 박힌 쿠키 5개 세트', true),
  ('콜드브루 라떼', 6000, '음료', '부드러운 우유와 어우러진 콜드브루 라떼', false),
  ('얼그레이 밀크티', 6500, '음료', '은은한 얼그레이 향이 나는 밀크티', false)
on conflict do nothing;

-- 7. Authentication > Providers 에서 "Anonymous Sign-ins"를 켜야 이 스키마가 동작한다.
--    (로그인 화면 없이 auth.uid()로 장바구니를 구분하기 위함)
