# 수제 디저트 쇼핑몰 — Supabase 연동 앱

목업 데이터로 만든 화면에 Supabase 백엔드(DB + 익명 인증)를 붙인 버전. 상품은 DB에서 읽어오고, 장바구니는 새로고침해도 남는다.

## 1. Supabase 프로젝트 준비 (직접 해야 하는 부분)

1. [supabase.com](https://supabase.com)에서 무료 계정으로 로그인하고 새 프로젝트를 만든다.
2. 프로젝트가 생성되면 **SQL Editor**를 열고 [`supabase/schema.sql`](supabase/schema.sql) 내용을 그대로 붙여넣어 실행한다. (테이블 생성 + RLS 정책 + 목업 상품 6개 삽입까지 한 번에 처리됨)
3. **Authentication → Providers**에서 **Anonymous Sign-ins**를 켠다. (로그인 화면 없이 장바구니를 사용자별로 구분하기 위해 필요)
4. **Project Settings → API**에서 `Project URL`과 `anon public` 키를 확인한다.

## 2. 로컬 설정

```bash
cp config.example.js config.js
```

`config.js`를 열어 위에서 확인한 URL과 anon key를 채운다. `config.js`는 `.gitignore`에 등록되어 있어 커밋되지 않는다.

## 3. 로컬 실행

```bash
python3 -m http.server 8938
```

`http://localhost:8938`에서 확인한다. 상품 목록 → 상세 → 장바구니 담기 → 새로고침해도 장바구니가 그대로 남아있는지 확인하면 이번 과제의 핵심 동작 확인 끝.

## 4. 배포

Node 빌드가 필요 없는 순수 정적 사이트(HTML/CSS/JS)라서 GitHub Pages로 바로 배포 가능하다.

1. 이 폴더를 GitHub 저장소에 푸시한다 (`config.js`는 `.gitignore` 덕분에 올라가지 않는다).
2. 저장소 Settings → Pages에서 배포할 브랜치/폴더를 지정한다.
3. **주의**: GitHub Pages는 `config.js`를 커밋하지 않으므로, 배포된 사이트에도 `config.js`를 올려야 한다. 로컬에서 만든 `config.js`만 별도로 저장소에 추가하거나(anon key는 공개돼도 안전하도록 설계된 값이라 커밋해도 보안상 치명적이지 않음), GitHub Actions로 배포 시점에 값을 주입한다.

## 왜 이렇게 만들었나

- **로그인 화면 없이 장바구니 구분**: Supabase의 "익명 인증(Anonymous Sign-in)"을 사용해 로그인 UI 없이도 `auth.uid()`를 발급받고, 이 값으로 RLS가 "내 장바구니만 보이게" 강제한다.
- **anon key를 코드에 그대로 넣는 이유**: Supabase의 anon key는 원래 클라이언트(브라우저)에 노출되는 것을 전제로 설계된 값이며, 실제 방어선은 RLS 정책이다. 반드시 숨겨야 하는 값은 `service_role` key인데, 이 앱은 그 키를 아예 쓰지 않는다.
- **정적 사이트(Next.js 아님)**: 이번 과제 범위(목업 → DB 연동 → 배포)에 필요한 최소 구성만 넣어 빠르게 동작 확인이 가능하도록 했다. PRD에서 추천한 Next.js는 SEO(SSR)가 필요해지는 다음 단계에서 다시 고려한다.

자세한 설계 배경은 [../dessert-shop/BACKEND-DESIGN.md](../dessert-shop/BACKEND-DESIGN.md) 참고.
