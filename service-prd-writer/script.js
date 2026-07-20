const STORAGE_KEY = 'service-prd-writer:v1';

const QUESTIONS = [
  {
    id: 'title',
    section: '기본 정보',
    title: '이 서비스(기능)의 이름은 무엇인가요?',
    help: '기획서 제목으로 사용됩니다.',
    placeholder: '예) 우리 동네 중고거래 키워드 알림',
    rows: 2,
    format: 'title'
  },
  {
    id: 'background',
    section: '배경',
    title: '왜 이걸 만들어야 하나요?',
    help: '어떤 문제나 불편함에서 이 기획이 시작됐는지 적어주세요.',
    placeholder: '예) 원하는 조건의 매물이 올라와도 놓치는 경우가 많아 이탈이 발생하고 있음',
    format: 'paragraph',
    heading: '기획 의도'
  },
  {
    id: 'goal',
    section: '목표',
    title: '이 기획을 통해 무엇을 이루고 싶나요?',
    help: '목적과, 가능하다면 구체적인 목표 수치도 함께 적어주세요.',
    placeholder: '예) 재방문율을 높이고, 알림 클릭률 15%를 달성한다',
    format: 'paragraph',
    heading: '목적 및 목표'
  },
  {
    id: 'target',
    section: '사용자',
    title: '누가 이 서비스(기능)를 사용하나요?',
    help: '주요 타겟 사용자와 사용 상황을 적어주세요.',
    placeholder: '예) 특정 키워드의 중고 물품을 자주 검색하는 활성 사용자',
    format: 'paragraph',
    heading: '타겟 사용자'
  },
  {
    id: 'coreFeature',
    section: '기능',
    title: '핵심적으로 어떤 기능을 제공하나요?',
    help: '한두 문장으로 이 기능의 핵심을 요약해주세요.',
    placeholder: '예) 원하는 키워드를 등록하면 조건에 맞는 매물이 올라올 때 푸시 알림을 보낸다',
    format: 'paragraph',
    heading: '핵심 기능'
  },
  {
    id: 'userStories',
    section: '요구항목',
    title: '핵심 기능을 유저 스토리로 풀어보면 어떻게 되나요?',
    help: '"~한 유저가 ~하고 싶어서 ~를 할 수 있어야 한다" 형태로, 한 줄에 하나씩 적어주세요.',
    placeholder: '키워드 매물을 놓치는 사용자가 새 매물을 바로 알고 싶어서, 키워드를 등록하면 알림을 받을 수 있어야 한다\n외출 중인 사용자가 알림을 확인하고 싶어서, 알림을 탭하면 바로 매물 상세로 이동할 수 있어야 한다',
    format: 'bulletList',
    heading: '요구항목'
  },
  {
    id: 'scenario',
    section: '기능',
    title: '사용자가 처음부터 끝까지 어떻게 이용하나요?',
    help: '한 줄에 한 단계씩 적어주세요. 자동으로 순서 목록이 됩니다.',
    placeholder: '검색 화면에서 키워드를 등록한다\n조건에 맞는 매물이 올라오면 푸시 알림이 온다\n알림을 누르면 매물 상세로 이동한다',
    format: 'orderedList',
    heading: '사용자 시나리오'
  },
  {
    id: 'uxFlow',
    section: '프로세스',
    title: '화면들이 어떤 흐름으로 이어지나요?',
    help: '"화면 A → 화면 B → 화면 C" 형태로 적어주세요. 기본 흐름 말고 예외 흐름도 있다면 한 줄에 하나씩 더 적으면 됩니다.',
    placeholder: '홈 화면 → 키워드 등록 화면 → 알림함 → 매물 상세 화면',
    format: 'flow',
    heading: '주요 프로세스'
  },
  {
    id: 'screens',
    section: '화면',
    title: '어떤 화면이나 구성 요소가 필요한가요?',
    help: '한 줄에 하나씩, "이름: 설명" 형태로 적어주세요.',
    placeholder: '키워드 등록 화면: 알림받을 키워드를 추가/삭제한다\n알림함: 도착한 알림 목록을 모아 보여준다',
    format: 'keyValueList',
    heading: '화면 요소'
  },
  {
    id: 'metrics',
    section: '목표',
    title: '무엇으로 성공을 판단하나요?',
    help: '측정 가능한 지표(KPI)를 적어주세요.',
    placeholder: '예) 키워드 알림 클릭률, 알림을 통한 거래 성사 건수',
    format: 'paragraph',
    heading: '성공 지표'
  },
  {
    id: 'exceptions',
    section: '예외',
    title: '예상되는 예외 상황이나 에러 케이스는?',
    help: '한 줄에 하나씩, "상황 → 동작" 형태로 적어주세요. 표로 정리됩니다.',
    placeholder: '등록한 키워드가 20개를 넘으면? → 더 이상 추가할 수 없다는 안내를 표시한다\n알림 권한이 꺼져있으면? → 인앱 배지로만 알림을 보여준다',
    format: 'table',
    heading: '예외 상황'
  },
  {
    id: 'outOfScope',
    section: '범위',
    title: '이번에는 하지 않을 것은 무엇인가요?',
    help: '범위를 명확히 하기 위한 항목입니다. (Out of scope)',
    placeholder: '키워드 알림의 우선순위 설정 기능은 이번 범위에서 제외한다',
    format: 'bulletList',
    heading: '이번 범위에서 제외'
  },
  {
    id: 'milestones',
    section: '일정',
    title: '주요 일정이나 마일스톤이 있나요?',
    help: '한 줄에 하나씩, "단계: 날짜/기간" 형태로 적어주세요.',
    placeholder: '기획 완료: 2026-08-01\n개발 착수: 2026-08-15\n베타 오픈: 2026-09-30',
    format: 'keyValueList',
    heading: '일정 / 마일스톤'
  }
];

let state = { answers: {}, step: 0 };
let currentMarkdown = '';

const el = (id) => document.getElementById(id);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        state.answers = parsed.answers || {};
        state.step = Number.isInteger(parsed.step) ? parsed.step : 0;
      }
    }
  } catch (e) {
    state = { answers: {}, step: 0 };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hasAnyAnswer() {
  return Object.values(state.answers).some((v) => (v || '').trim().length > 0);
}

function showScreen(id) {
  ['intro', 'wizard', 'result'].forEach((s) => {
    el(s).classList.toggle('hidden', s !== id);
  });
}

function clampStep() {
  state.step = Math.max(0, Math.min(state.step, QUESTIONS.length - 1));
}

function renderStep() {
  clampStep();
  const q = QUESTIONS[state.step];
  const percent = ((state.step + 1) / QUESTIONS.length) * 100;

  el('progressFill').style.width = percent + '%';
  el('stepCount').textContent = `${state.step + 1} / ${QUESTIONS.length}`;
  el('stepSection').textContent = q.section;
  el('questionTitle').textContent = q.title;
  el('questionHelp').textContent = q.help;

  const input = el('answerInput');
  input.placeholder = q.placeholder;
  input.value = state.answers[q.id] || '';
  input.rows = q.rows || 5;

  el('prevBtn').disabled = state.step === 0;
  el('nextBtn').textContent = state.step === QUESTIONS.length - 1 ? '완료하기 →' : '다음 →';

  input.focus();
}

function saveCurrentAnswer() {
  const q = QUESTIONS[state.step];
  state.answers[q.id] = el('answerInput').value;
  saveState();
}

function parseLines(text) {
  return (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildSection(q, rawAnswer) {
  const answer = (rawAnswer || '').trim();
  const empty = answer.length === 0;

  let mdBody, htmlBody;

  if (empty) {
    mdBody = '_아직 작성되지 않았습니다._';
    htmlBody = '<p class="empty-note">아직 작성되지 않았습니다.</p>';
  } else if (q.format === 'paragraph') {
    mdBody = answer;
    htmlBody = `<p>${escapeHtml(answer)}</p>`;
  } else if (q.format === 'orderedList') {
    const lines = parseLines(answer);
    mdBody = lines.map((l, i) => `${i + 1}. ${l}`).join('\n');
    htmlBody = `<ol>${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ol>`;
  } else if (q.format === 'bulletList') {
    const lines = parseLines(answer);
    mdBody = lines.map((l) => `- ${l}`).join('\n');
    htmlBody = `<ul>${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`;
  } else if (q.format === 'keyValueList') {
    const lines = parseLines(answer);
    const pairs = lines.map((l) => {
      const idx = l.indexOf(':');
      if (idx === -1) return { name: null, desc: l };
      return { name: l.slice(0, idx).trim(), desc: l.slice(idx + 1).trim() };
    });
    mdBody = pairs
      .map((p) => (p.name ? `- **${p.name}** — ${p.desc}` : `- ${p.desc}`))
      .join('\n');
    htmlBody = `<ul>${pairs
      .map((p) => (p.name ? `<li><strong>${escapeHtml(p.name)}</strong> — ${escapeHtml(p.desc)}</li>` : `<li>${escapeHtml(p.desc)}</li>`))
      .join('')}</ul>`;
  } else if (q.format === 'table') {
    const lines = parseLines(answer);
    const rows = lines.map((l) => {
      const idx = l.indexOf('→');
      if (idx === -1) return [l, ''];
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    });
    mdBody = '| 상황 | 동작 |\n|------|------|\n' + rows.map((r) => `| ${r[0]} | ${r[1]} |`).join('\n');
    htmlBody =
      '<table><thead><tr><th>상황</th><th>동작</th></tr></thead><tbody>' +
      rows.map((r) => `<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(r[1])}</td></tr>`).join('') +
      '</tbody></table>';
  } else if (q.format === 'flow') {
    const flows = parseLines(answer).map((l) =>
      l
        .split('→')
        .map((s) => s.trim())
        .filter(Boolean)
    );
    mdBody = flows.map((steps) => steps.join(' → ')).join('\n');
    htmlBody = flows
      .map(
        (steps) =>
          `<div class="flow-diagram">${steps
            .map((s, i) => (i === 0 ? `<span class="flow-step">${escapeHtml(s)}</span>` : `<span class="flow-arrow">→</span><span class="flow-step">${escapeHtml(s)}</span>`))
            .join('')}</div>`
      )
      .join('');
  }

  return {
    markdown: `## ${q.heading}\n\n${mdBody}\n`,
    html: `<h2>${escapeHtml(q.heading)}</h2>${htmlBody}`
  };
}

const FRAMEWORK_OPTIONS = [
  {
    name: 'Next.js (React)',
    recommended: true,
    pros: 'React 기반이라 생태계·레퍼런스·구인이 가장 풍부하다. SSR/SEO에 강하고 Vercel 등으로 배포가 간단하다.',
    cons: 'React 자체의 학습 곡선이 있고, 초기 프로젝트 설정이 상대적으로 복잡하다.',
    fit: '검색 유입이 중요하거나, 서비스가 빠르게 커질 가능성이 있는 경우'
  },
  {
    name: 'Nuxt.js (Vue)',
    pros: '문법이 직관적이라 러닝커브가 낮고, 공식 문서와 컨벤션이 친절하다.',
    cons: 'React 대비 생태계와 채용 풀(개발자 수)이 작다.',
    fit: '프론트엔드 인력이 적거나, 빠르게 학습하며 개발해야 하는 팀'
  },
  {
    name: 'SvelteKit',
    pros: '번들 크기가 작고 실행 속도가 빠르며, 코드가 간결해 유지보수가 쉽다.',
    cons: '상대적으로 최신 기술이라 레퍼런스와 서드파티 라이브러리가 적다.',
    fit: '퍼포먼스가 중요한 가벼운 서비스, 실험적인 시도가 가능한 팀'
  },
  {
    name: 'No-code (Bubble, Webflow+Xano 등)',
    pros: '개발자 없이도 빠르게 MVP를 만들어 가설을 검증할 수 있다.',
    cons: '커스터마이징과 트래픽 확장에 한계가 있고, 서비스가 커지면 재구축 비용이 발생할 수 있다.',
    fit: '정식 개발 전에 수요부터 먼저 검증하고 싶은 초기 단계'
  }
];

function buildFrameworkSection() {
  const intro =
    '아래는 이 기획을 실제로 구현할 때 참고할 수 있는 대표적인 선택지입니다. 정답이 아니라 출발점이며, 팀의 인력·일정·트래픽 규모에 따라 담당 개발자와 함께 최종 결정하는 것을 권장합니다.';

  const mdRows = FRAMEWORK_OPTIONS.map(
    (f) => `| ${f.recommended ? `⭐ ${f.name} (추천)` : f.name} | ${f.pros} | ${f.cons} | ${f.fit} |`
  ).join('\n');
  const markdown =
    `## 구현 프레임워크 추천\n\n${intro}\n\n` +
    '| 프레임워크 | 장점 | 단점 | 이런 상황에 적합 |\n|---|---|---|---|\n' +
    mdRows +
    '\n';

  const htmlRows = FRAMEWORK_OPTIONS.map(
    (f) =>
      `<tr><td>${f.recommended ? `⭐ <strong>${escapeHtml(f.name)}</strong> (추천)` : escapeHtml(f.name)}</td><td>${escapeHtml(
        f.pros
      )}</td><td>${escapeHtml(f.cons)}</td><td>${escapeHtml(f.fit)}</td></tr>`
  ).join('');
  const html =
    `<h2>구현 프레임워크 추천</h2><p>${escapeHtml(intro)}</p>` +
    '<table><thead><tr><th>프레임워크</th><th>장점</th><th>단점</th><th>이런 상황에 적합</th></tr></thead><tbody>' +
    htmlRows +
    '</tbody></table>';

  return { markdown, html };
}

function buildPRD() {
  const title = (state.answers.title || '').trim() || '(제목 없음)';
  const dateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const sections = QUESTIONS.filter((q) => q.format !== 'title').map((q) => buildSection(q, state.answers[q.id]));
  const frameworkSection = buildFrameworkSection();

  const markdown =
    `# ${title} — 서비스 기획서\n\n` +
    sections.map((s) => s.markdown).join('\n') +
    '\n' +
    frameworkSection.markdown +
    `\n> ${dateStr}에 서비스 기획서 작성기로 생성됨\n`;

  const html = sections.map((s) => s.html).join('') + frameworkSection.html;

  return { title, markdown, html };
}

function showResult() {
  const { title, markdown, html } = buildPRD();
  currentMarkdown = markdown;
  el('resultTitle').textContent = `${title} — 서비스 기획서`;
  el('prdPreview').innerHTML = html;
  showScreen('result');
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}

function sanitizeFilename(name) {
  return (name || 'service').replace(/[\\/:*?"<>|]/g, '').trim().replace(/\s+/g, '-') || 'service';
}

function init() {
  loadState();

  if (hasAnyAnswer()) {
    el('resumeBtn').classList.remove('hidden');
  }

  el('startBtn').addEventListener('click', () => {
    state = { answers: {}, step: 0 };
    saveState();
    renderStep();
    showScreen('wizard');
  });

  el('resumeBtn').addEventListener('click', () => {
    renderStep();
    showScreen('wizard');
  });

  el('prevBtn').addEventListener('click', () => {
    saveCurrentAnswer();
    if (state.step > 0) {
      state.step -= 1;
      renderStep();
    }
  });

  el('nextBtn').addEventListener('click', () => {
    saveCurrentAnswer();
    if (state.step < QUESTIONS.length - 1) {
      state.step += 1;
      renderStep();
    } else {
      showResult();
    }
  });

  el('answerInput').addEventListener('input', () => {
    saveCurrentAnswer();
  });

  el('copyBtn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentMarkdown);
      showToast('마크다운이 복사되었습니다!');
    } catch (e) {
      showToast('복사에 실패했습니다. 직접 선택해 복사해주세요.');
    }
  });

  el('downloadBtn').addEventListener('click', () => {
    const title = (state.answers.title || 'service').trim();
    const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(title)}-PRD.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  el('editBtn').addEventListener('click', () => {
    state.step = 0;
    renderStep();
    showScreen('wizard');
  });

  el('restartBtn').addEventListener('click', () => {
    if (confirm('작성한 모든 답변이 초기화됩니다. 계속할까요?')) {
      state = { answers: {}, step: 0 };
      saveState();
      el('resumeBtn').classList.add('hidden');
      showScreen('intro');
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
