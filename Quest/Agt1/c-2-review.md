# AIFFEL Campus Code Peer Review Templete
- 코더 : 전대진
- 리뷰어 : AI (opencode)


# PRT(Peer Review Template)

## 1. 주어진 문제를 해결하는 완성된 코드가 제출되었나요?

**✅ 예**

README에 기술된 기능이 모두 구현되어 있습니다:

- **상품 목록** — 홈 페이지(`/`)에서 8개 상품이 반응형 그리드로 표시됨 (`src/app/page.tsx`, `src/components/ProductCard.tsx`)
- **상품 상세** — `/products/[id]`에서 상품 상세 정보 + 리뷰 표시 (`src/app/products/[id]/page.tsx`)
- **장바구니** — `/cart`에서 수량 조절, 삭제, 합계 계산 (`src/app/cart/page.tsx`, `src/lib/cart-store.ts`)
- **주문/결제** — `/checkout`에서 주문 생성, `/orders`에서 주문 내역 조회 (`src/app/checkout/page.tsx`, `src/app/orders/page.tsx`)
- **로그인/회원가입** — Supabase Auth 연동 (`src/app/login/page.tsx`, `src/app/signup/page.tsx`, `src/lib/auth-store.ts`)
- **리뷰** — Supabase DB에 실제 저장, RLS 적용 (`src/components/ReviewForm.tsx`, `src/lib/supabase/reviews.ts`)
- **모바일/PC 반응형** — Tailwind CSS v4 기반 반응형 레이아웃 적용

Vercel 배포: https://laos-coffee.vercel.app 정상 동작 확인.

---

## 2. 핵심적이거나 복잡하고 이해하기 어려운 부분에 작성된 설명을 보고 해당 코드가 잘 이해되었나요?

**✅ 예**

### 주요 코드 블록 분석

**1. Supabase 클라이언트 초기화** (`src/lib/supabase/client.ts`)
```ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```
- 환경변수에서 키를 읽어_singleton으로 인스턴스 생성
- `NEXT_PUBLIC_` 접두사로 클라이언트 사이드에서 접근 가능하도록 설정

**2. 장바구니 상태 관리** (`src/lib/cart-store.ts`)
- `useSyncExternalStore` + `localStorage`로 장바구니 상태를 관리
- `storage` 이벤트 리스너로 브라우저 탭 간 동기화 지원
- 함수형 패턴으로 상태 불변성 유지

**3. 리뷰 폼 + Supabase 삽입** (`src/components/ReviewForm.tsx`)
- 로그인 여부 확인 → 별점 선택 → 내용 입력(5자 이상) → `supabase.from("reviews").insert()` 호출
- 성공 시 `router.refresh()`로 서버 컴포넌트 재렌더링하여 즉시 반영

**4. SVG 일러스트 생성** (`src/components/ProductIllustration.tsx`)
- 상품별 시드 값으로 프로시저럴 SVG 씬 생성
- 7가지 풍경 모티프(일출-산, 리지드-석양, 강-파도 등)와 3가지 컨테이너 형태 조합
- 실제 사진 대체용으로 적절한 접근

---

## 3. 에러가 난 부분을 디버깅하여 "문제를 해결한 기록"을 남겼나요? 또는 "새로운 시도 및 추가 실험"을 해봤나요?

**✅ 예 — README에 상세 기록**

README의 "2. 과제에 대한 답" 섹션에 다음 과정이 기록되어 있습니다:

1. **Supabase 연결 검증** — `curl`로 REST API를 직접 호출하여 리뷰 데이터가 DB에 저장됨을 확인
   ```
   $ curl "https://.../rest/v1/reviews?product_id=eq.1&select=author_name,rating,created_at&order=created_at.desc&limit=1"
   [{"author_name":"전대진2","rating":4,"created_at":"2026-07-16T12:43:09.234189+00:00"}]
   ```
2. **보안 체크** — 하드코딩 검색(0건), `.gitignore` 동작 확인, RLS 정책 테스트(인증 없이 INSERT 시 401 반환 확인)
3. **DB 스키마 설계** — `docs/dev-journey/supabase-reviews-schema.sql`에 RLS 정책 포함 스키마 문서화

---

## 4. 회고를 잘 작성했나요?

**✅ 예**

README에 다음 항목이 체계적으로 기록되어 있습니다:

- **서비스 한 줄 요약**: "커피를 판매하는 것이 아니라 여행의 기억을 다시 선물한다"
- **기획 의도**: 라오스 유기농 커피를 온라인으로 판매하는 쇼핑몰
- **개발 로드맵**: Phase 1~6까지 단계별 진행 상황 표시
- **MVP 성공 기준**: 5개 항목 명시
- **보안 체크리스트**: 비밀값 관리, 백엔드 검증, RLS, 인가, 무료 티어 한도까지 상세 기록
- **호스팅 선택 이유**: Supabase(BaaS) 선택 근거 (①집 컴퓨터+터널 부적합, ②Render 과함)
- **추천 프레임워크**: Next.js + Supabase 선택 근거 3가지

---

## 5. 코드가 간결하고 효율적인가요?

**✅ 예 — 전반적으로 우수**

### 좋은 점
- **TypeScript 적용**: 전체 코드base에서 타입 정의 사용 (`src/types/` 디렉토리)
- **컴포넌트 분리**: 7개의 재사용 가능한 컴포넌트로 적절히 분리
- **상태 관리 분리**: Auth, Cart, Order를 각각 별도 스토어로 분리 (`src/lib/`)
- **환경변수 관리**: `.gitignore`로 `.env*` 제외, 코드에 키 하드코딩 없음
- **CSS**: Tailwind CSS v4 사용으로 유틸리티 클래스 기반 스타일링

### 개선 가능한 부분
- `src/lib/cart-store.ts`와 `src/lib/order-store.ts`에서 `useSyncExternalStore` 패턴이 중복 — 공통 헬퍼로 추출 가능
- `src/app/products/[id]/page.tsx`에서 서버 컴포넌트인데 일부 로직이 클라이언트 컴포넌트에 가까운 패턴 사용
- `formatWon()` 함수가 `src/lib/format.ts`에 단독 존재 — 향후 다른 포맷 유틸과 합칠 수 있음

### PEP8 대응 (Python 프로젝트가 아니므로 PEP8 미적용)
이 프로젝트는 TypeScript/React 프로젝트이므로 PEP8은 해당하지 않습니다. 대신:
- **ESLint 설정**: `eslint.config.mjs`에서 `next/core-web-vitals` + `typescript` 규칙 적용 ✅
- **TypeScript strict mode**: `tsconfig.json`에서 `strict: true` 적용 ✅


# 참고 링크 및 코드 개선

## 참고 링크
- **배포 사이트**: https://laos-coffee.vercel.app
- **Supabase 스키마**: `docs/dev-journey/supabase-reviews-schema.sql`
- **런치 가이드**: `docs/launch-guide.md`

## 코드 구조 요약
```
src/
├── app/           # 페이지 (Next.js App Router)
├── components/    # 재사용 컴포넌트 (7개)
├── data/          # 목업 데이터 + 일러스트 스펙
├── lib/           # 비즈니스 로직 + 상태 관리 + Supabase
└── types/         # TypeScript 인터페이스 (4개)
```

## 종합 평가
전반적으로 **구조가 깔끔하고, 보안 관행이 우수하며, README 문서화가 체계적**인 프로젝트입니다. 목업 데이터 기반 프론트엔드 + Supabase 리뷰 기능이라는 MVP 범위를 명확히 설정하고 그 안에서 완성도 높은 결과물을 만들었습니다.
