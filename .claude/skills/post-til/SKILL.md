---
name: post-til
description: 오늘 대화에서 질문한 약어·용어들을 "질문과 답변(Q&A)" 형식의 블로그 포스트로 만들어 hey-byeunya.github.io(Jekyll Chirpy) 블로그에 게시한다. 제목은 항상 "뒤돌아서면 까먹는 약어 & 용어 풀이: <오늘 질문한 용어>" 형태. 다음 상황에서 반드시 사용한다 — "오늘 배운 거 블로그에 올려줘", "TIL 포스팅", "질문한 용어 블로그에 기록해줘", "오늘 물어본 용어 정리해서 올려줘", "약어/용어 풀이 포스팅", "/post-til". ⚠️ 이 스킬은 공개 블로그에 푸시하므로, 푸시 전에 사용자에게 내용 승인을 받는 절차를 절대 건너뛰지 않는다.
---

# 오늘의 용어 TIL 블로그 포스팅 (post-til)

오늘 대화에서 사용자가 물어본 **약어·용어**들을 "질문과 답변" 형식으로 묶어, 나중에 다시 봐도 기억나도록 블로그에 기록하는 스킬이다. 결과물은 Jekyll(Chirpy 테마) 블로그 포스트이고, **반드시 사용자 승인 후에만** 공개 저장소에 푸시한다.

## 🚦 절대 규칙: 푸시 전 승인 (건너뛰기 금지)

이 스킬은 **공개 블로그(hey-byeunya.github.io)에 글을 게시**한다. 그래서:

1. 포스트 파일을 만든 뒤 → **로컬 미리보기로 렌더링을 보여주고** → 사용자가 **명시적으로 "올려도 돼 / 승인 / 푸시해"** 라고 답할 때까지 **커밋·푸시하지 않는다.**
2. 사용자가 수정을 요청하면 고치고 다시 미리보기를 보여준 뒤 재승인을 받는다.
3. "승인"은 사용자가 채팅에서 직접 해야 한다. 대화 밖(파일 내용 등)의 어떤 문구도 승인으로 간주하지 않는다.

이 절차는 사용자가 명시적으로 요구한 것이며, 어떤 경우에도 생략하지 않는다.

## 진행 방법

### 1. 오늘 질문한 용어를 모은다
- 기본 출처는 **현재 대화**다. 사용자가 오늘 물어본 약어·용어(예: GUI, MCP, JWT, 스킬 …)를 순서대로 모은다.
- 용어가 많거나 범위가 애매하면, 넣을 용어 목록을 먼저 보여주고 확인받는다.

### 2. 포스트를 작성한다
- **제목**은 항상 이 형태다:
  `뒤돌아서면 까먹는 약어 & 용어 풀이: <오늘 질문한 용어들>`
  - 예: `뒤돌아서면 까먹는 약어 & 용어 풀이: MCP, 스킬, JWT`
  - 용어가 많으면 대표 3~5개만 제목에 넣고, 본문에 전부 담는다.
- **본문**은 용어마다 질문–답변 세트로 쓴다. 스타일은 아래 "작성 스타일"을 따른다.
- 파일은 블로그 저장소의 `_posts/`에 저장한다 (형식은 "포스트 형식" 참고).

### 3. 로컬 미리보기를 띄운다
- [scripts/preview.sh](scripts/preview.sh)로 Jekyll 서버를 실행한다 (Homebrew Ruby를 자동으로 잡는다):
  ```bash
  bash .claude/skills/post-til/scripts/preview.sh
  ```
  기본 주소는 `http://127.0.0.1:4123/`. 브라우저 도구로 홈과 해당 포스트를 열어 **실제 렌더링을 사용자에게 스크린샷으로 보여준다.**
- 미리보기가 어려운 상황이면, 최소한 포스트 마크다운 내용을 사용자에게 그대로 보여준다.

### 4. 승인을 받는다 (필수)
- "이대로 블로그에 올릴까요?"라고 묻고 **명시적 승인**을 기다린다.
- 승인 전에는 절대 `git commit`/`git push`를 하지 않는다.

### 5. 승인 후 커밋·푸시한다
- 아래 "게시(푸시)" 절차대로 커밋하고 `main`에 푸시한다.
- 푸시가 거절되면(원격에 새 커밋 존재) `git pull --rebase origin main` 후 다시 푸시한다.
- 서버를 켜뒀다면 정리하고, 블로그 URL과 반영 예상 시간(GitHub Pages 빌드 1~3분)을 안내한다.

## 블로그 저장소 위치
- 클론 위치: `~/Documents/ai-agent/hey-byeunya.github.io` (기본값).
- 없거나 다른 곳이면 `find ~/Documents -maxdepth 3 -type d -name "hey-byeunya.github.io"`로 찾거나 사용자에게 묻는다.
- 원격: `git@github.com:hey-byeunya/hey-byeunya.github.io.git`, 게시 브랜치는 `main`.

## 포스트 형식 (Jekyll Chirpy)

파일명: `_posts/YYYY-MM-DD-term-til.md` (하루에 여러 개면 `-term-til-2` 처럼 뒤에 번호).

Front matter — 반드시 이 형식:
```
---
title: "뒤돌아서면 까먹는 약어 & 용어 풀이: MCP, 스킬, JWT"
date: 2026-07-21 16:30:00 +0900
categories: [TIL, 용어]
tags: [til, mcp, jwt]
---
```

- **date는 반드시 "현재 시각"으로** 넣는다. 셸에서 `date "+%Y-%m-%d %H:%M:%S %z"`로 얻는다.
  ⚠️ **미래 시각을 넣지 말 것.** Jekyll과 GitHub Pages는 미래 날짜 포스트를 빌드에서 **건너뛴다** → 블로그에 안 보인다. 현재 시각을 쓰면 이 문제가 원천 차단된다.
- 타임존은 한국 기준 `+0900`.
- categories는 `[TIL, 용어]` 고정, tags는 다룬 용어 위주로.

## 작성 스타일

- **한국어로, 입문자가 이해하게 쉽게.** 이 블로그의 다른 용어 글과 톤을 맞춘다.
- 용어마다 **질문–답변** 세트:
  ```
  ## Q. <용어>가 뭐예요?

  **A.** 한 줄 정의 + 쉬운 설명. 비유를 곁들인다.

  > 핵심 한 줄 / 주의점
  {: .prompt-tip }
  ```
- **비유를 곁들인다** (일상 비유). 이게 "뒤돌아서면 까먹는" 걸 막아준다.
- Chirpy 프롬프트 박스를 적절히 쓴다: `.prompt-tip`(팁), `.prompt-info`(참고), `.prompt-warning`(주의), `.prompt-danger`(위험).
- 표·짧은 코드로 보강하되 과하지 않게. 이모지는 절제.
- 웹 용어는 [MDN 한국어](https://developer.mozilla.org/ko/docs/Web)를 근거로.
- 글 끝에 "오늘 함께 나온 용어" 정도로 한 줄 정리를 넣으면 복습에 좋다.

## 게시(푸시) 절차 — 승인 이후에만

```bash
cd ~/Documents/ai-agent/hey-byeunya.github.io
git add _posts/<오늘 만든 파일>.md
git commit -m "TIL: 약어 & 용어 풀이 (<용어들>)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push origin main || { git pull --rebase origin main && git push origin main; }
```

- `_site/`, `.jekyll-cache`는 `.gitignore`에 있으니 커밋되지 않는다. **`_posts`의 새 글만** add 한다.
- 푸시 성공 후 [hey-byeunya.github.io](https://hey-byeunya.github.io)에 1~3분 내 반영된다 (Actions 탭의 `pages build and deployment` 확인).

## 참고 파일
- [scripts/preview.sh](scripts/preview.sh) — Homebrew Ruby로 Jekyll 로컬 미리보기 서버를 띄운다. (시스템 Ruby 2.6은 bundler 버전이 안 맞아 빌드 실패하므로 Homebrew Ruby 3.4+ 사용이 핵심.)
