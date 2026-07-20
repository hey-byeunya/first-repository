# 수제 디저트 쇼핑몰 — 코드 리뷰 (PRD 대비)

---

## 1. 주어진 문제를 해결하는 완성된 코드가 제출되었나요?

**✅ 예 — PRD의 핵심 기능 6개 중 6개 구현 완료**

| PRD 요구사항 | 구현 여부 | 근거 |
|---|---|---|
| 1. 상품 목록 카테고리 필터링 | ✅ | `script.js:85-92` — 전체/케이크/쿠키/음료 필터 |
| 2. 목록·상세 모두에서 품절 여부 표시 | ✅ | 목록: `.sold-out-badge` (line 75), 상세: 버튼 비활성화 (line 103-104) |
| 3. 상품 상세에서 사진·설명·가격 확인 | ✅ | `openDetail()` (line 95-107) |
| 4. 장바구니 수량 조절 + 합계 금액 | ✅ | `changeQty()` (line 187-195), `renderCart()` 합계 계산 (line 158-184) |
| 5. 장바구니 상품 삭제 | ✅ | `removeFromCart()` (line 197-201) |
| 6. SEO (서버 렌더링) | ⚠️ 부분 | 순수 HTML 파일이라 SSR 불가. Supabase 연동은 되지만 SEO 미적용 |

**핵심 화면 3개 모두 존재:**
- 상품 목록 (`#view-list`) — `index.html:19-27`
- 상품 상세 (`#view-detail`) — `index.html:30-37`
- 장바구니 (`#view-cart`) — `index.html:40-49`

---

## 2. 핵심 코드 이해도

**✅ 충분히 이해 가능**

### 주요 코드 분석

**1. Supabase 연결** (`script.js:21-23`)
```js
const supabaseClient = window.SUPABASE_CONFIG
  ? window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey)
  : null;
```
- `config.js`에서 URL/anon key를 읽어 클라이언트 생성
- 설정 없을 시 null 처리로 graceful degradation

**2. 장바구니 경쟁 상태 방지** (`script.js:119-131`)
- `add_to_cart` RPC 사용 — DB 레벨에서 `ON CONFLICT DO UPDATE`로 원자적 처리
- 빠른 연타 시 duplicate key 에러 방지

**3. 익명 인증** (`script.js:42-52`)
- `signInAnonymously()`로 로그인 없이 장바구니 사용 가능
- 사용자별 장바구니 분리 지원

### 주석 품질
- 파일 상단에 전체 구조 설명 주석 존재 (line 1-4)
- `config.js` 파일에 설정 방법 상세 설명 (config.example.js)
- **개선점**: 개별 함수에 JSDoc 주석 없음

---

## 3. 디버깅 기록 및 새로운 시도

**✅ 기록 존재**

1. **duplicate key 에러 해결** — `script.js:119-123`에 주석으로 원인 및 해결 과정 기록
   > "select로 기존 행 유무를 먼저 확인하고 insert/update를 나눠서 하면...unique (user_id, product_id) 제약을 어겨 duplicate key 에러가 날 수 있다. add_to_cart RPC가 DB에서 원자적으로 처리하므로 이 경쟁 상태가 없다."

2. **익명 인증 도입** — 로그인 화면 없이 장바구니를 사용자별로 구분하는 새로운 시도

3. **CDN 기반 Supabase 사용** — npm이 아닌 CDN으로 라이브러리 로드, 별도 빌드 없이 동작

---

## 4. 회고

### PRD 대비 구현 수준
- **이번에 할 것 4개 중 4개 완료** ✅
- **이번에 안 할 것 5개 중 0개 구현** (Out of scope 준수) ✅

### 아쉬운 점
- PRD에서 "Next.js + Supabase"를 추천했지만, 실제 구현은 **순수 HTML + JS + Supabase CDN**으로 진행
  - 장점: 빌드 없이 바로 실행 가능
  - 단점: SEO 미적용 (PRD 요구사항 6번 미충족)
- 상품 상세에서 `detail-desc`에 `product.image` 텍스트가 표시됨 (`script.js:100`) — 설명 대신 이미지 설명이 들어감
- 장바구니 썸네일이 빈 배경으로 표시됨 (`styles.css:232-238`) — 실제 이미지 미연동

### 잘한 점
- 보안: `config.js`를 `.gitignore`로 제외하여 키 유출 방지
- 경쟁 상태 해결: RPC로 DB 레벨 원자적 처리
- 다크모드 지원 (`styles.css:14-27`)
- 깔끔한 컴포넌트 분리 (HTML 섹션별 구분)

---

## 5. 코드 품질

### 좋은 점
- **CSS 변수 시스템**: `:root`에 컬러 토큰 정의, 다크모드 대응
- **반응형**: `max-width: 480px` 모바일 우선 레이아웃
- **에러 처리**: 모든 API 호출에 `.error` 체크 + 사용자 안내 메시지
- **상태 관리**: `currentFilter`, `currentDetailProduct` 등 필요한 상태만 최소 관리

### 개선 가능한 부분
| 항목 | 현재 | 개선안 |
|------|------|--------|
| 함수 주석 | 파일 상단만 | 개별 함수에 JSDoc 추가 |
| 상품 설명 | `product.image` 텍스트 표시 | `product.description` 필드 추가 필요 |
| 장바구니 이미지 | 빈 배경 | 상품 이미지 표시 |
| 빌드 | 없음 | Vercel 배포 시 HTML 파일 그대로 서빙 |
| 테스트 | 없음 | E2E 테스트 추가 권장 |

### PEP8 대응
- 이 프로젝트는 **JavaScript** 프로젝트이므로 PEP8 미적용
- **ESLint**: `.gitignore`에 `config.js`만 있고 ESLint 설정 없음 — 추가 권장

---

# 참고 링크 및 코드 개선

## 참고 링크
- **Supabase 설정**: `config.example.js` 참조
- **배포**: GitHub Pages 또는 Vercel에 배포 가능

## 코드 구조
```
dessert-shop-app/
├── index.html          # 메인 HTML (3개 화면 섹션)
├── script.js           # 비즈니스 로직 + Supabase 연동
├── styles.css          # 스타일 (다크모드 지원)
├── config.js           # Supabase 설정 (.gitignore 제외)
├── config.example.js   # 설정 템플릿
└── .gitignore          # config.js 제외
```

## 종합 평가
PRD의 핵심 요구사항을 충실히 구현한 프로젝트입니다. Supabase 연동, 장바구니 경쟁 상태 해결, 다크모드 등 추가적인 기능도 잘 구현되어 있습니다. SEO 미적용과 상세 페이지 설명 표시 개선이 필요합니다.
