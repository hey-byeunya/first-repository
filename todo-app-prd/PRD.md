# 로컬 Todo 앱 — 서비스 기획서

## 기획 의도

내 컴퓨터에서 가볍게 돌아가는 할 일 관리 도구가 필요함. 외부 서비스에 데이터를 맡기지 않고, 무료 도구만으로 껐다 켜도 기록이 남는 로컬 앱을 원함.

## 목적 및 목표

추가/수정/목록 보기/완료 표시/삭제의 기본 CRUD를 안정적으로 제공하고, 검색·상태별 필터·자주 하는 일 빠른 추가·마감일 D-day 표시·카테고리(태그)·오늘 할 일만 보기로 실사용 편의성을 높인다. 무료 도구만 사용해 유지 비용 없이 운영한다.

## 타겟 사용자

로컬 환경에서 혼자 할 일을 관리하는 1인 사용자(본인). 로그인이나 다중 사용자 지원은 필요하지 않음.

## 핵심 기능

할 일을 추가/수정/완료 표시/삭제하는 기본 CRUD에 더해, 검색과 상태별 필터, 자주 쓰는 할 일을 프리셋으로 저장해 빠르게 추가하는 기능을 제공한다. 여기에 마감일을 D-1 같은 D-day 형식으로 표시하고, 할 일에 카테고리(태그)를 붙여 분류하며, 마감일이 오늘인 할 일만 따로 모아 보는 기능을 더한다. 데이터는 로컬 SQLite DB에 저장되어 앱을 껐다 켜도 유지된다.

## 요구항목

- 할 일을 관리하고 싶은 사용자가 새 할 일을 빠르게 등록하고 싶어서, 제목(및 설명)을 입력해 할 일을 추가할 수 있어야 한다.
- 계획이 바뀐 사용자가 내용을 최신 상태로 유지하고 싶어서, 등록된 할 일의 제목/설명을 수정할 수 있어야 한다.
- 전체 할 일을 파악하고 싶은 사용자가 한눈에 확인하고 싶어서, 할 일 목록을 조회할 수 있어야 한다.
- 일을 끝낸 사용자가 진행 상황을 표시하고 싶어서, 할 일을 완료 상태로 표시할 수 있어야 한다.
- 더 이상 필요 없는 사용자가 목록을 깔끔하게 유지하고 싶어서, 할 일을 삭제할 수 있어야 한다.
- 특정 할 일을 찾는 사용자가 목록을 일일이 스크롤하고 싶지 않아서, 제목/설명으로 검색할 수 있어야 한다.
- 완료/미완료를 구분해 보고 싶은 사용자가 집중해야 할 일만 보고 싶어서, 상태별로 목록을 필터링할 수 있어야 한다.
- 반복적으로 같은 일을 등록하는 사용자가 매번 다시 입력하고 싶지 않아서, 자주 하는 일을 프리셋으로 저장해두고 한 번에 추가할 수 있어야 한다.
- 마감이 임박한 할 일을 놓치고 싶지 않은 사용자가 남은 기간을 한눈에 보고 싶어서, 마감일을 설정하고 D-1 같은 D-day 형식으로 표시할 수 있어야 한다.
- 여러 종류의 할 일을 구분하고 싶은 사용자가 관련 있는 일끼리 묶어 보고 싶어서, 할 일에 카테고리(태그)를 지정하고 태그별로 모아 볼 수 있어야 한다.
- 오늘 처리할 일에만 집중하고 싶은 사용자가 전체 목록에 흩어진 할 일을 다 보고 싶지 않아서, 마감일이 오늘인 할 일만 따로 볼 수 있어야 한다.
- 데이터를 안전하게 보관하고 싶은 사용자가 앱을 껐다 켜도 기록이 남기를 원해서, 모든 데이터가 로컬 DB에 영구 저장되어야 한다.

## 사용자 시나리오

1. 앱을 실행하면 전체 할 일 목록이 보인다.
2. 할 일 추가 버튼을 눌러 제목(및 설명), 마감일, 태그를 입력하고 등록한다.
3. 자주 하는 일이면, 프리셋 목록에서 선택해 한 번에 추가할 수도 있다.
4. 목록의 각 항목에서 마감일이 D-1, D-day처럼 남은(또는 지난) 기간으로 표시된다.
5. 목록에서 완료한 항목을 체크해 완료 상태로 표시한다.
6. 검색창에 키워드를 입력해 원하는 할 일을 빠르게 찾는다.
7. 상태 필터, 태그 필터, 오늘 할 일만 보기 필터를 선택해 원하는 항목만 골라 본다.
8. 필요 없어진 항목은 삭제한다.
9. 앱을 껐다 다시 켜도 이전 목록과 상태가 그대로 남아있다.

## 주요 프로세스

- 기본 흐름: 할 일 목록 화면 → 할 일 추가/수정 화면(제목·마감일·태그 입력) → 할 일 목록 화면
- 자주 하는 일 흐름: 할 일 목록 화면 → 자주 하는 일 프리셋 선택 → 할 일 목록 화면(추가됨)
- 검색/필터 흐름: 할 일 목록 화면 → 검색어 입력 또는 상태·태그·오늘 할 일만 보기 필터 선택 → 필터링된 목록 화면

## 화면 요소

- **할 일 목록 화면** — 전체/필터링된 할 일을 목록으로 보여주고, 각 항목에서 완료 체크와 삭제가 가능하다.
- **할 일 추가/수정 화면(또는 인라인 폼)** — 제목·설명·마감일·태그를 입력해 새 할 일을 만들거나 기존 항목을 수정한다.
- **검색 바** — 목록 화면 상단에서 제목/설명 키워드로 실시간 검색한다.
- **상태 필터** — 전체/진행중/완료 등 상태별로 목록을 걸러 보여준다.
- **마감일 표시(D-day 뱃지)** — 각 항목에 D-1, D-day, D+2처럼 남은/지난 기간을 뱃지로 보여준다.
- **태그 관리(인라인 태그 선택/필터)** — 할 일에 태그를 붙이거나 새 태그를 만들고, 태그별로 목록을 걸러 볼 수 있다.
- **오늘 할 일만 보기 필터** — 마감일이 오늘인 할 일만 따로 모아 보여준다.
- **자주 하는 일 프리셋 목록** — 저장된 프리셋을 보여주고, 선택 시 즉시 새 할 일로 추가하며 사용 횟수를 갱신한다.

## DB 구조 (기술 설계)

로컬 무료 DB인 SQLite를 사용한다. 로그인 기능이 없으므로 사용자 테이블은 두지 않는다.

**`tasks`** — 핵심 CRUD 대상 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INTEGER, PK | 자동 증가 |
| title | TEXT, NOT NULL | 할 일 제목 |
| description | TEXT | 상세 설명(선택) |
| status | TEXT ('todo' \| 'done') | 상태별 필터에 사용 |
| due_date | DATE, nullable | 마감일. D-day 표시·오늘 할 일만 보기 필터에 사용 |
| template_id | INTEGER, FK, nullable | 어떤 프리셋에서 생성됐는지 (직접 입력 시 NULL) |
| created_at / updated_at | DATETIME | 생성/수정 시각 |
| completed_at | DATETIME, nullable | 완료 처리 시각 |

**`task_templates`** — 자주 하는 일 프리셋 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INTEGER, PK | 자동 증가 |
| title | TEXT, UNIQUE, NOT NULL | 프리셋 제목 |
| description | TEXT | 상세 설명(선택) |
| use_count | INTEGER, DEFAULT 0 | 사용 횟수 (자주 하는 순 정렬에 사용) |
| last_used_at | DATETIME | 마지막 사용 시각 |
| created_at | DATETIME | 생성 시각 |

**`tags`** — 카테고리(태그) 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INTEGER, PK | 자동 증가 |
| name | TEXT, UNIQUE, NOT NULL | 태그 이름 |
| color | TEXT, nullable | 태그 뱃지 색상(선택, UI 표시용) |

**`task_tags`** — 할 일과 태그를 잇는 다대다 조인 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| task_id | INTEGER, FK, PK(복합) | `tasks.id` 참조 |
| tag_id | INTEGER, FK, PK(복합) | `tags.id` 참조 |

**관계**
- `task_templates (1) --- (N) tasks`, nullable — 프리셋 하나로 여러 할 일을 만들 수 있고, 프리셋 없이 만든 할 일도 허용한다.
- `tasks (N) --- (N) tags` — `task_tags` 조인 테이블을 통해 다대다 관계. 할 일 하나에 태그를 여러 개 붙일 수 있고, 태그 하나가 여러 할 일에 쓰일 수 있다.

**기능 매핑**
- 검색 → `title`, `description`에 `LIKE` 검색 (데이터가 많아지면 SQLite 내장 FTS5로 교체 가능)
- 상태별 필터 → `status` 컬럼, `idx_tasks_status` 인덱스
- 자주 하는 일 → `task_templates.use_count` 정렬, `idx_tasks_template_id` 인덱스
- 마감일 D-day 표시 → `tasks.due_date`를 저장하고, 화면에서 `due_date - 오늘 날짜`로 D-day를 계산해 표시(가공값은 DB에 저장하지 않음), `idx_tasks_due_date` 인덱스로 정렬
- 카테고리(태그) → `tags` + `task_tags` 다대다 관계로 구현
- 오늘 할 일만 보기 → `WHERE due_date = date('now','localtime')` 필터, `idx_tasks_due_date` 인덱스 활용

```sql
CREATE TABLE task_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL UNIQUE,
  description TEXT,
  use_count INTEGER NOT NULL DEFAULT 0,
  last_used_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'done')),
  due_date DATE,
  template_id INTEGER REFERENCES task_templates(id) ON DELETE SET NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  completed_at DATETIME
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT
);

CREATE TABLE task_tags (
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_template_id ON tasks(template_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);
```

## 성공 지표

데이터가 로컬 DB에 정상적으로 저장/복원되는지(재시작 후 유지), 검색·필터·프리셋 추가·태그 분류·마감일 표시 기능이 오류 없이 동작하는지를 기준으로 판단한다. 개인용 로컬 도구이므로 트래픽 지표보다는 기능 완결성과 데이터 무결성을 성공 기준으로 삼는다.

## 예외 상황

| 상황 | 동작 |
|---|---|
| 제목 없이 추가를 시도하는 경우 | 제목은 필수 입력이라는 안내를 표시하고 저장하지 않는다 |
| 검색 결과가 없는 경우 | "일치하는 할 일이 없습니다" 같은 빈 상태 메시지를 보여준다 |
| DB 파일에 접근할 수 없는 경우(권한 문제 등) | 에러 메시지를 표시하고 재시도를 안내한다 |
| 자주 하는 일 프리셋 제목이 이미 존재하는 경우 | 새로 만들지 않고 기존 프리셋의 사용 횟수만 올린다(중복 방지) |
| 마감일이 지난 할 일인 경우 | D-day 대신 D+n(경과일) 형태로 표시해 지연을 알린다 |
| 태그를 삭제하는 경우 | 해당 태그가 붙어 있던 할 일들에서 태그 연결만 제거되고, 할 일 자체는 삭제되지 않는다 |

## 이번 범위에서 제외

- 로그인/회원가입, 다중 사용자 지원은 이번 범위에서 제외한다.
- 마감일 알림/리마인더(푸시 등)는 이번 범위에서 제외한다 (마감일 표시까지만 지원한다).
- 마감일순 등 다양한 정렬 옵션은 이번 범위에서 제외한다.
- 클라우드 동기화, 여러 기기 간 데이터 공유는 이번 범위에서 제외한다.

## 일정 / 마일스톤

아직 정리되지 않음.

## 구현 프레임워크 추천

아래는 이 기획을 실제로 구현할 때 참고할 수 있는 대표적인 선택지입니다. 정답이 아니라 출발점이며, 팀의 인력·일정·트래픽 규모에 따라 담당 개발자와 함께 최종 결정하는 것을 권장합니다.

| 프레임워크 | 장점 | 단점 | 이런 상황에 적합 |
|---|---|---|---|
| ⭐ **Next.js (React)** (추천) | React 기반이라 생태계·레퍼런스·구인이 가장 풍부하다. SSR/SEO에 강하고 Vercel 등으로 배포가 간단하다. | React 자체의 학습 곡선이 있고, 초기 프로젝트 설정이 상대적으로 복잡하다. | 검색 유입이 중요하거나, 서비스가 빠르게 커질 가능성이 있는 경우 |
| Nuxt.js (Vue) | 문법이 직관적이라 러닝커브가 낮고, 공식 문서와 컨벤션이 친절하다. | React 대비 생태계와 채용 풀(개발자 수)이 작다. | 프론트엔드 인력이 적거나, 빠르게 학습하며 개발해야 하는 팀 |
| SvelteKit | 번들 크기가 작고 실행 속도가 빠르며, 코드가 간결해 유지보수가 쉽다. | 상대적으로 최신 기술이라 레퍼런스와 서드파티 라이브러리가 적다. | 퍼포먼스가 중요한 가벼운 서비스, 실험적인 시도가 가능한 팀 |
| No-code (Bubble, Webflow+Xano 등) | 개발자 없이도 빠르게 MVP를 만들어 가설을 검증할 수 있다. | 커스터마이징과 트래픽 확장에 한계가 있고, 서비스가 커지면 재구축 비용이 발생할 수 있다. | 정식 개발 전에 수요부터 먼저 검증하고 싶은 초기 단계 |
