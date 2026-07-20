---
name: write-prd
description: Runs a one-question-at-a-time interview with a service planner and compiles the answers into a structured Markdown service PRD (기획서), ending with a fixed framework-recommendation table. Use this whenever the user asks Claude to write a PRD, 기획서, service spec, or feature spec through a guided Q&A/interview — trigger phrases include "PRD 써줘", "기획서 작성해줘", "서비스 기획서 문답으로 작성해줘", "질문 하나씩 물어보면서 기획서 만들어줘", "/write-prd", or any request to build a product/service planning document interactively rather than in one shot. Also trigger when the user asks generically for help writing a PRD/기획서 and hasn't already dumped all the content — a guided interview is the better fit than freeform writing. Do not use this for pure brainstorming with no intent to produce a document, or when the user has already pasted all the PRD content and just wants it reformatted (no interview needed there).
---

# 서비스 기획서 문답 작성기 (write-prd)

## 왜 한 번에 하나씩 묻는가

기획서를 빈 화면에서 바로 쓰려고 하면 어디서부터 시작할지 막막해지기 쉽다. 질문을 하나씩 던지고 답을 받은 뒤 다음으로 넘어가면, 사용자는 한 번에 한 가지만 생각하면 되고, 답변도 더 구체적으로 나온다. 그리고 항상 같은 13개 질문 + 같은 문서 포맷을 쓰면, 이 스킬로 만든 기획서끼리는 서로 비교하거나 훑어보기도 쉬워진다.

## 진행 방법

1. 아래 "질문 목록"을 순서대로, **한 번에 질문 하나씩만** 던진다. 여러 질문을 한 메시지에 몰아서 묻지 않는다 — 몰아 물으면 사용자가 대충 한 번에 답하게 되어 이 스킬을 쓰는 의미가 없어진다.
2. 질문을 던질 때는 질문 문장, 짧은 도움말, 예시 답변을 함께 보여준다 (아래 질문 목록에 각각 정리돼 있다).
3. 사용자의 답을 받을 때까지 기다린 후 다음 질문으로 넘어간다.
4. 답이 비어 있거나("-", "없음"), 한 단어짜리 답인데 원래 여러 줄이 필요한 질문(시나리오, 화면 요소, 예외 상황 등)이거나, "몰라요"처럼 판단하기 어려운 답이면 그냥 넘어가지 말고 한 번 더 구체화를 요청한다. 사용자가 "그냥 넘어가줘"라고 명시적으로 말하면 그때는 다음 질문으로 넘어가되, 문서에는 "아직 정리되지 않음"이라고 표시한다.
5. 13개 질문에 모두 답하고 나면, 아래 "답변을 문서 형식으로 바꾸는 규칙"에 따라 내용을 정리한 뒤, "최종 결과물: HTML 문서로 퍼블리시"에 있는 템플릿에 채워 넣어 완성된 기획서를 만든다. 문서 마지막에는 사용자에게 묻지 않고 "구현 프레임워크 추천" 섹션을 고정으로 붙인다.
6. 완성된 기획서는 **채팅에 마크다운이나 텍스트로 그대로 붙여넣지 않는다.** 반드시 HTML 파일로 저장한 뒤 Artifact 도구로 퍼블리시해서, 보기 좋게 렌더링된 문서로 전달한다.
7. 사용자가 특정 답변을 고치고 싶어 하면 해당 항목만 다시 묻고, 같은 file_path로 Artifact를 다시 퍼블리시해 URL을 유지한 채 문서를 갱신한다.

## 질문 목록 (순서대로)

### 1. 서비스/기능 이름
- 질문: "이 서비스(기능)의 이름은 무엇인가요?"
- 도움말: 기획서 제목으로 사용됩니다.
- 예시: 우리 동네 중고거래 키워드 알림

### 2. 기획 의도
- 질문: "왜 이걸 만들어야 하나요?"
- 도움말: 어떤 문제나 불편함에서 이 기획이 시작됐는지 적어주세요.
- 예시: 원하는 조건의 매물이 올라와도 놓치는 경우가 많아 이탈이 발생하고 있음

### 3. 목적 및 목표
- 질문: "이 기획을 통해 무엇을 이루고 싶나요?"
- 도움말: 목적과, 가능하다면 구체적인 목표 수치도 함께 적어주세요.
- 예시: 재방문율을 높이고, 알림 클릭률 15%를 달성한다

### 4. 타겟 사용자
- 질문: "누가 이 서비스(기능)를 사용하나요?"
- 도움말: 주요 타겟 사용자와 사용 상황을 적어주세요.
- 예시: 특정 키워드의 중고 물품을 자주 검색하는 활성 사용자

### 5. 핵심 기능
- 질문: "핵심적으로 어떤 기능을 제공하나요?"
- 도움말: 한두 문장으로 이 기능의 핵심을 요약해주세요.
- 예시: 원하는 키워드를 등록하면 조건에 맞는 매물이 올라올 때 푸시 알림을 보낸다

### 6. 요구항목
- 질문: "핵심 기능을 유저 스토리로 풀어보면 어떻게 되나요?"
- 도움말: "~한 유저가 ~하고 싶어서 ~를 할 수 있어야 한다" 형태로, 한 줄에 하나씩 적어주세요.
- 예시: 키워드 매물을 놓치는 사용자가 새 매물을 바로 알고 싶어서, 키워드를 등록하면 알림을 받을 수 있어야 한다

### 7. 사용자 시나리오
- 질문: "사용자가 처음부터 끝까지 어떻게 이용하나요?"
- 도움말: 단계별로 적어주세요. 한 줄에 한 단계씩 써도 되고, 이어서 말해도 됩니다 — 정리는 이쪽에서 합니다.
- 예시: 검색 화면에서 키워드를 등록한다 → 조건에 맞는 매물이 올라오면 푸시 알림이 온다 → 알림을 누르면 매물 상세로 이동한다

### 8. 주요 프로세스
- 질문: "화면들이 어떤 흐름으로 이어지나요?"
- 도움말: "화면 A → 화면 B → 화면 C" 형태로 적어주세요. 기본 흐름 말고 예외 흐름도 있다면 한 줄에 하나씩 더 적으면 됩니다. 진짜 픽셀 단위 와이어프레임이 아니라, 화면이 어떤 순서로 연결되는지 보여주는 흐름도라는 점을 사용자가 헷갈리면 알려준다.
- 예시: 홈 화면 → 키워드 등록 화면 → 알림함 → 매물 상세 화면

### 9. 화면 요소
- 질문: "어떤 화면이나 구성 요소가 필요한가요?"
- 도움말: 화면(또는 구성 요소) 이름과 그 화면이 하는 일을 같이 알려주세요.
- 예시: 키워드 등록 화면(알림받을 키워드를 추가/삭제한다), 알림함(도착한 알림 목록을 모아 보여준다)

### 10. 성공 지표
- 질문: "무엇으로 성공을 판단하나요?"
- 도움말: 측정 가능한 지표(KPI)를 적어주세요.
- 예시: 키워드 알림 클릭률, 알림을 통한 거래 성사 건수

### 11. 예외 상황
- 질문: "예상되는 예외 상황이나 에러 케이스는?"
- 도움말: 어떤 상황에서 어떻게 동작해야 하는지 짝으로 알려주세요.
- 예시: 등록한 키워드가 20개를 넘으면 → 더 이상 추가할 수 없다는 안내를 표시한다

### 12. 이번 범위에서 제외
- 질문: "이번에는 하지 않을 것은 무엇인가요?"
- 도움말: 범위를 명확히 하기 위한 항목입니다 (Out of scope).
- 예시: 키워드 알림의 우선순위 설정 기능은 이번 범위에서 제외한다

### 13. 일정 / 마일스톤
- 질문: "주요 일정이나 마일스톤이 있나요?"
- 도움말: "단계: 날짜/기간" 형태로, 한 줄에 하나씩 적어주세요.
- 예시: 기획 완료: 2026-08-01, 개발 착수: 2026-08-15, 베타 오픈: 2026-09-30

## 답변을 문서 형식으로 바꾸는 규칙

사용자는 자유롭게 답하지만(줄바꿈으로 나열하든, 문장으로 이어 말하든), 문서에는 아래 형식으로 정리해서 넣는다. 사용자가 말하지 않은 내용을 지어내지 말고, 표현만 다듬는다.

- **기획 의도 / 목적 및 목표 / 타겟 사용자 / 핵심 기능 / 성공 지표**: 자연스러운 문단(`<p>`)으로 정리.
- **요구항목 / 이번 범위에서 제외**: 불릿 목록(`<ul><li>`)으로 정리. 유저 스토리는 "~한 유저가 ~하고 싶어서 ~를 할 수 있어야 한다" 문형을 최대한 유지한다.
- **사용자 시나리오**: 단계를 순서 목록(`<ol><li>`)으로 정리.
- **주요 프로세스**: 각 줄을 "A → B → C" 화살표 흐름으로 보고, "최종 결과물" 템플릿의 `.flow-diagram` 박스+화살표 컴포넌트로 정리한다. 줄이 여러 개면 흐름 다이어그램도 여러 개(기본 흐름, 대안 흐름 등) 세로로 나열한다.
- **화면 요소 / 일정 / 마일스톤**: 각 항목을 `<li><strong>이름</strong> — 설명</li>` 형태로 정리. 이름과 설명(또는 날짜)이 뚜렷이 구분 안 되면 그냥 `<li>설명</li>`으로 적는다.
- **예외 상황**: `상황 / 동작` 2열 `<table>`로 정리.

## 최종 결과물: HTML 문서로 퍼블리시

완성된 기획서는 채팅에 텍스트로 붙여넣지 말고, 아래 템플릿을 채운 HTML 파일을 만들어 **Artifact 도구로 퍼블리시**한다. 이렇게 하면 사용자가 읽기 좋은 문서 형태(제목 스타일, 표, 라이트/다크 모드 대응)로 바로 확인할 수 있다. 이 템플릿은 이 저장소의 다른 기획서 페이지(`rock-paper-scissors-prd/index.html`, `service-prd-writer`)와 같은 CSS 변수를 써서, 어떤 방식으로 만든 기획서든 톤이 일치하도록 맞췄다.

1. 아래 HTML을 그대로 사용하고, `{...}` 자리만 정리된 내용으로 채운다. CSS나 구조는 바꾸지 않는다.
2. Write 도구로 이 HTML을 파일로 저장한다 (스크래치패드 디렉토리가 있으면 그곳에, 없으면 적절한 임시 경로에 `.html`로 저장).
3. Artifact 도구로 퍼블리시한다. `favicon`은 📋로 고정해서 쓰고, `description`은 이 기획서가 어떤 서비스에 대한 것인지 한 문장으로 쓴다.
4. 답변을 수정해 문서를 다시 만들 때는 같은 `file_path`로 Write와 Artifact를 다시 호출해 같은 URL을 유지한다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{서비스명} — 서비스 기획서</title>
  <style>
    :root {
      --bg: #faf9f7;
      --surface: #ffffff;
      --border: #e8e5e0;
      --text: #1a1a1a;
      --text-secondary: #555;
      --text-muted: #888;
      --accent: #d97706;
      --accent-bg: rgba(217,119,6,0.06);
      --code-bg: #f3f0eb;
      --table-stripe: #faf8f5;
      --shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #111114;
        --surface: #1a1a1f;
        --border: #2a2a30;
        --text: #e4e4e7;
        --text-secondary: #a1a1aa;
        --text-muted: #71717a;
        --accent: #f59e0b;
        --accent-bg: rgba(245,158,11,0.08);
        --code-bg: #1e1e24;
        --table-stripe: #16161a;
        --shadow: 0 1px 4px rgba(0,0,0,0.3);
      }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper { max-width: 680px; margin: 0 auto; padding: 48px 24px 80px; }
    h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 40px; padding-bottom: 16px; border-bottom: 2px solid var(--border); }
    h2 { font-size: 20px; font-weight: 700; margin-top: 48px; margin-bottom: 16px; color: var(--accent); }
    h2:first-of-type { margin-top: 0; }
    p { margin-bottom: 14px; color: var(--text-secondary); }
    ul, ol { margin-bottom: 16px; padding-left: 20px; }
    li { margin-bottom: 8px; color: var(--text-secondary); }
    li strong { color: var(--text); }
    .tag { display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    thead th { text-align: left; padding: 10px 14px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); border-bottom: 2px solid var(--border); }
    tbody td { padding: 12px 14px; border-bottom: 1px solid var(--border); color: var(--text-secondary); vertical-align: top; }
    tbody tr:nth-child(odd) { background: var(--table-stripe); }
    .flow-diagram { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 10px 0; }
    .flow-step { background: var(--code-bg); border: 1px solid var(--border); border-radius: 8px; padding: 7px 14px; font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; }
    .flow-arrow { color: var(--text-muted); font-size: 15px; }
    .footnote { color: var(--text-muted); font-size: 13px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <span class="tag">Service PRD</span>
    <h1>{서비스명} — 서비스 기획서</h1>

    <h2>기획 의도</h2>
    <p>{문단}</p>

    <h2>목적 및 목표</h2>
    <p>{문단}</p>

    <h2>타겟 사용자</h2>
    <p>{문단}</p>

    <h2>핵심 기능</h2>
    <p>{문단}</p>

    <h2>요구항목</h2>
    <ul>
      <li>{~한 유저가 ~하고 싶어서 ~를 할 수 있어야 한다}</li>
      <!-- 항목 수만큼 반복 -->
    </ul>

    <h2>사용자 시나리오</h2>
    <ol>
      <li>{단계}</li>
      <!-- 단계 수만큼 반복 -->
    </ol>

    <h2>주요 프로세스</h2>
    <div class="flow-diagram">
      <span class="flow-step">{화면 A}</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">{화면 B}</span>
      <!-- 화면 수만큼 반복, 흐름이 여러 개면 .flow-diagram 자체를 반복 -->
    </div>

    <h2>화면 요소</h2>
    <ul>
      <li><strong>{이름}</strong> — {설명}</li>
      <!-- 항목 수만큼 반복 -->
    </ul>

    <h2>성공 지표</h2>
    <p>{문단}</p>

    <h2>예외 상황</h2>
    <table>
      <thead><tr><th>상황</th><th>동작</th></tr></thead>
      <tbody>
        <tr><td>{상황}</td><td>{동작}</td></tr>
        <!-- 행 수만큼 반복 -->
      </tbody>
    </table>

    <h2>이번 범위에서 제외</h2>
    <ul>
      <li>{항목}</li>
      <!-- 항목 수만큼 반복 -->
    </ul>

    <h2>일정 / 마일스톤</h2>
    <ul>
      <li><strong>{단계}</strong> — {날짜/기간}</li>
      <!-- 항목 수만큼 반복 -->
    </ul>

    <h2>구현 프레임워크 추천</h2>
    <p>아래는 이 기획을 실제로 구현할 때 참고할 수 있는 대표적인 선택지입니다. 정답이 아니라 출발점이며, 팀의 인력·일정·트래픽 규모에 따라 담당 개발자와 함께 최종 결정하는 것을 권장합니다.</p>
    <table>
      <thead><tr><th>프레임워크</th><th>장점</th><th>단점</th><th>이런 상황에 적합</th></tr></thead>
      <tbody>
        <tr><td>⭐ <strong>Next.js (React)</strong> (추천)</td><td>React 기반이라 생태계·레퍼런스·구인이 가장 풍부하다. SSR/SEO에 강하고 Vercel 등으로 배포가 간단하다.</td><td>React 자체의 학습 곡선이 있고, 초기 프로젝트 설정이 상대적으로 복잡하다.</td><td>검색 유입이 중요하거나, 서비스가 빠르게 커질 가능성이 있는 경우</td></tr>
        <tr><td>Nuxt.js (Vue)</td><td>문법이 직관적이라 러닝커브가 낮고, 공식 문서와 컨벤션이 친절하다.</td><td>React 대비 생태계와 채용 풀(개발자 수)이 작다.</td><td>프론트엔드 인력이 적거나, 빠르게 학습하며 개발해야 하는 팀</td></tr>
        <tr><td>SvelteKit</td><td>번들 크기가 작고 실행 속도가 빠르며, 코드가 간결해 유지보수가 쉽다.</td><td>상대적으로 최신 기술이라 레퍼런스와 서드파티 라이브러리가 적다.</td><td>퍼포먼스가 중요한 가벼운 서비스, 실험적인 시도가 가능한 팀</td></tr>
        <tr><td>No-code (Bubble, Webflow+Xano 등)</td><td>개발자 없이도 빠르게 MVP를 만들어 가설을 검증할 수 있다.</td><td>커스터마이징과 트래픽 확장에 한계가 있고, 서비스가 커지면 재구축 비용이 발생할 수 있다.</td><td>정식 개발 전에 수요부터 먼저 검증하고 싶은 초기 단계</td></tr>
      </tbody>
    </table>

    <p class="footnote">{오늘 날짜}에 서비스 기획서 작성기로 생성됨</p>
  </div>
</body>
</html>
```

"구현 프레임워크 추천" 표는 사용자의 답변 내용과 무관하게 항상 위 4행 그대로 붙인다 — 즉석에서 다른 프레임워크를 지어내거나 순서를 바꾸지 않는다. 이 표는 [service-prd-writer](../../../service-prd-writer/script.js)의 `FRAMEWORK_OPTIONS`와 동일한 내용으로, 웹 버전과 스킬 버전이 같은 결과를 내도록 맞춘 것이다.
