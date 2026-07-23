#!/usr/bin/env python3
"""
용어사전 JSON → 스타일 HTML 변환기 (glossary-builder 스킬용).

JSON은 이 스킬의 데이터 저장소(source of truth)다. 용어를 추가·수정할 땐
이 JSON 파일을 갱신한 뒤, 이 스크립트로 HTML을 다시 생성한다.

JSON 스키마:
{
  "title": "개발·CS·AI 용어사전",        # 문서 제목
  "lede": "한 줄 소개",                  # 문서 소개 문단
  "groups": ["그룹1", "그룹2", ...],      # 색인·섹션이 나열될 순서
  "terms": [
    {
      "term": "CSS",                     # 필수 — 이름표이자 앵커(#CSS)
      "original": "Cascading Style Sheets",  # 선택 — 원어/약어 풀이
      "group": "웹 기초",                  # 필수 — groups 목록의 값과 일치해야 그 섹션에 묶임
      "definition": "웹페이지를 꾸미는 언어(색·글꼴·배치).",  # 필수
      "analogy": {"emoji": "🎨", "text": "..."},            # 선택 — 없으면 비유 박스 생략
      "details": [                                          # 선택 — 표/코드/추가 설명
        {"type": "paragraph", "text": "..."},
        {"type": "table", "rows": [["헤더1","헤더2"], ["a","b"]]},
        {"type": "code", "text": "..."}
      ],
      "related": ["HTML", "DOM"],                            # 선택 — 다른 term 이름으로 참조
      "references": [{"text": "MDN — CSS", "url": "https://..."}]  # 선택
    }
  ]
}

인라인 텍스트(definition/analogy.text/paragraph/table 셀)에서 **굵게**, `코드`,
[[다른용어]](→ 그 용어로 점프), [텍스트](url) 마크다운 문법을 그대로 쓸 수 있다.

사용법:
  python3 json_to_glossary.py <입력.json> <출력.html> [--title "탭 제목"]
                              [--shortcut <경로> | --no-shortcut]

기본적으로 출력 파일과 같은 폴더에 "용어사전.html"이라는 심링크(바로가기)를
만들거나 갱신한다. 파일명이 뭐든 이 고정된 이름 하나만 기억하면 항상 최신
용어사전을 열 수 있다. --no-shortcut으로 끌 수 있다.
"""
import sys, re, html, json, argparse, os

CSS = r"""
:root{--bg:#f5f7fa;--surface:#fff;--surface-2:#eef2f7;--ink:#171c26;--ink-soft:#3d4759;--muted:#6b7686;--border:#dde3ec;--accent:#0d7a86;--accent-soft:#e0f0f1;--warm:#c9761b;--shadow:0 1px 2px rgba(23,28,38,.04),0 8px 24px rgba(23,28,38,.06);--mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,monospace;--sans:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Segoe UI",Roboto,"Noto Sans KR",sans-serif;}
@media (prefers-color-scheme:dark){:root{--bg:#0f1319;--surface:#171d27;--surface-2:#1e2632;--ink:#eef2f8;--ink-soft:#c3ccda;--muted:#8a95a6;--border:#2a3340;--accent:#3fb8c4;--accent-soft:#113237;--warm:#e0a24e;--shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px rgba(0,0,0,.35);}}
:root[data-theme="light"]{--bg:#f5f7fa;--surface:#fff;--surface-2:#eef2f7;--ink:#171c26;--ink-soft:#3d4759;--muted:#6b7686;--border:#dde3ec;--accent:#0d7a86;--accent-soft:#e0f0f1;--warm:#c9761b;--shadow:0 1px 2px rgba(23,28,38,.04),0 8px 24px rgba(23,28,38,.06);}
:root[data-theme="dark"]{--bg:#0f1319;--surface:#171d27;--surface-2:#1e2632;--ink:#eef2f8;--ink-soft:#c3ccda;--muted:#8a95a6;--border:#2a3340;--accent:#3fb8c4;--accent-soft:#113237;--warm:#e0a24e;--shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px rgba(0,0,0,.35);}
*{box-sizing:border-box;}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);line-height:1.65;-webkit-font-smoothing:antialiased;}
.wrap{max-width:820px;margin:0 auto;padding:clamp(24px,5vw,60px) clamp(18px,4vw,36px) 96px;}
.eyebrow{font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:700;margin:0 0 12px;}
h1{font-size:clamp(26px,5vw,38px);line-height:1.15;margin:0 0 14px;letter-spacing:-.02em;text-wrap:balance;font-weight:800;}
.lede{font-size:clamp(15px,2.4vw,17px);color:var(--ink-soft);margin:0;max-width:60ch;}
.index{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px 22px;box-shadow:var(--shadow);margin:32px 0 8px;}
.index h2{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 14px;font-weight:700;}
.igroup{margin-bottom:14px;}.igroup:last-child{margin-bottom:0;}
.igroup .glabel{font-size:12.5px;color:var(--warm);font-weight:700;margin-bottom:7px;}
.chips{display:flex;flex-wrap:wrap;gap:7px;}
.chips a{font-size:13px;color:var(--ink-soft);background:var(--surface-2);border:1px solid var(--border);padding:4px 11px;border-radius:20px;text-decoration:none;transition:all .12s;}
.chips a:hover{background:var(--accent-soft);color:var(--accent);border-color:var(--accent);}
h2.section{font-size:clamp(18px,3vw,22px);margin:48px 0 4px;letter-spacing:-.01em;font-weight:800;}
.term{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:22px 24px;box-shadow:var(--shadow);margin:16px 0;border-left:4px solid var(--accent);scroll-margin-top:20px;}
.term h3{margin:0 0 4px;font-size:19px;letter-spacing:-.01em;}
.term h3 .orig{font-size:14px;color:var(--muted);font-weight:500;}
.oneline{font-size:15px;color:var(--ink-soft);margin:8px 0;}
.analogy{background:var(--accent-soft);border-radius:10px;padding:11px 14px;font-size:14px;color:var(--ink-soft);margin:12px 0;}
.term p{margin:0 0 12px;}.term p:last-child{margin-bottom:0;}
.xref{color:var(--accent);text-decoration:none;border-bottom:1px dotted var(--accent);}
.xref:hover{border-bottom-style:solid;}
.related{font-size:13.5px;color:var(--muted);margin-top:12px;}
.related .xref{font-weight:600;}
.cite{font-size:12.5px;color:var(--muted);margin-top:8px;}.cite a{color:var(--muted);}
code{font-family:var(--mono);font-size:.9em;background:var(--surface-2);padding:1px 6px;border-radius:5px;}
pre{background:var(--surface-2);border-radius:10px;padding:13px 15px;overflow-x:auto;margin:12px 0;}
pre code{background:none;padding:0;font-size:12.5px;}
.tablewrap{overflow-x:auto;border:1px solid var(--border);border-radius:12px;margin:12px 0;}
table{border-collapse:collapse;width:100%;font-size:13.5px;background:var(--surface);min-width:360px;}
th,td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--border);vertical-align:top;}
th{background:var(--surface-2);font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);font-weight:700;}
tr:last-child td{border-bottom:0;}
.foot{margin-top:44px;padding-top:18px;border-top:1px solid var(--border);color:var(--muted);font-size:13px;}
.updated{font-size:12.5px;color:var(--muted);}
"""


def inline(text):
    """인라인 마크다운(굵게/코드/[[용어]]/[링크]) → HTML. text는 원본(이스케이프 전) 문자열."""
    text = html.escape(str(text))
    text = re.sub(r'\[\[([^\]]+)\]\]',
                  lambda m: f'<a class="xref" href="#{slug(m.group(1))}">{m.group(1)}</a>', text)
    text = re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)', r'<a href="\2">\1</a>', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    return text


def slug(name):
    return name.strip()


def render_table(rows):
    out = ['<div class="tablewrap"><table>']
    for ri, r in enumerate(rows):
        tag = 'th' if ri == 0 else 'td'
        out.append('<tr>' + ''.join(f'<{tag}>{inline(c)}</{tag}>' for c in r) + '</tr>')
    out.append('</table></div>')
    return '\n'.join(out)


def render_term(t):
    anchor = html.escape(slug(t['term']), quote=True)
    parts = [f'<article class="term" id="{anchor}">']
    orig = f' <span class="orig">{html.escape(t["original"])}</span>' if t.get('original') else ''
    parts.append(f'<h3>{html.escape(t["term"])}{orig}</h3>')

    if t.get('definition'):
        parts.append(f'<p class="oneline"><strong>정의</strong> — {inline(t["definition"])}</p>')

    analogy = t.get('analogy')
    if analogy and analogy.get('text'):
        emoji = analogy.get('emoji') or ''
        prefix = f'{html.escape(emoji)} ' if emoji else ''
        parts.append(f'<div class="analogy">{prefix}<strong>비유</strong> — {inline(analogy["text"])}</div>')

    for d in t.get('details', []):
        kind = d.get('type')
        if kind == 'paragraph':
            parts.append(f'<p>{inline(d.get("text", ""))}</p>')
        elif kind == 'table':
            parts.append(render_table(d.get('rows', [])))
        elif kind == 'code':
            parts.append(f'<pre><code>{html.escape(d.get("text", ""))}</code></pre>')

    related = t.get('related') or []
    if related:
        links = ', '.join(f'<a class="xref" href="#{slug(r)}">{html.escape(r)}</a>' for r in related)
        parts.append(f'<p class="related"><strong>관련 용어</strong> · {links}</p>')

    refs = t.get('references') or []
    if refs:
        joined = '; '.join(f'<a href="{html.escape(r["url"], quote=True)}">{html.escape(r["text"])}</a>' for r in refs)
        parts.append(f'<p class="cite">참고: {joined}</p>')

    parts.append('</article>')
    return '\n'.join(parts)


def render(data, tab_title=None):
    title = data.get('title', '용어사전')
    lede = data.get('lede', '')
    terms = data.get('terms', [])

    grouped = {}
    for t in terms:
        grouped.setdefault(t.get('group', '기타'), []).append(t)

    group_order = list(data.get('groups') or [])
    for g in grouped:
        if g not in group_order:
            group_order.append(g)

    index = ['<nav class="index"><h2>색인</h2>']
    for g in group_order:
        ts = grouped.get(g, [])
        if not ts:
            continue
        index.append('<div class="igroup">')
        index.append(f'<div class="glabel">{html.escape(g)}</div><div class="chips">')
        index.append(''.join(f'<a href="#{slug(t["term"])}">{html.escape(t["term"])}</a>' for t in ts))
        index.append('</div></div>')
    index.append('</nav>')

    body = []
    for g in group_order:
        ts = grouped.get(g, [])
        if not ts:
            continue
        body.append(f'<h2 class="section">{html.escape(g)}</h2>')
        body.extend(render_term(t) for t in ts)

    return f"""<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(tab_title or title)}</title>
<style>{CSS}</style></head><body>
<div class="wrap">
<p class="eyebrow">용어사전 · 입문자용 복습 노트</p>
<h1>{inline(title)}</h1>
<p class="lede">{inline(lede)}</p>
{''.join(index)}
<main id="terms">
{''.join(body)}
</main>
<p class="foot">glossary-builder로 생성 · {len(terms)}개 용어 · 입문자용 한국어 복습 노트</p>
</div></body></html>"""


def ensure_shortcut(output_path, shortcut_path):
    """output_path를 가리키는 심링크를 shortcut_path에 만들거나 갱신한다."""
    target = os.path.abspath(output_path)
    shortcut_path = os.path.abspath(shortcut_path)
    if shortcut_path == target:
        return None
    try:
        if os.path.islink(shortcut_path) or os.path.exists(shortcut_path):
            os.remove(shortcut_path)
        os.symlink(target, shortcut_path)
        return shortcut_path
    except OSError as e:
        print(f"(바로가기 생성 실패: {e})", file=sys.stderr)
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('input')
    ap.add_argument('output')
    ap.add_argument('--title', default=None)
    ap.add_argument('--shortcut', default=None,
                     help='이 경로에 바로가기(심링크)를 만든다. 기본: 출력과 같은 폴더의 "용어사전.html"')
    ap.add_argument('--no-shortcut', action='store_true')
    a = ap.parse_args()

    with open(a.input, encoding='utf-8') as f:
        data = json.load(f)

    out_html = render(data, a.title)
    with open(a.output, 'w', encoding='utf-8') as f:
        f.write(out_html)

    n = len(data.get('terms', []))
    out_abs = os.path.abspath(a.output)
    print(f"OK: {n} terms → {a.output}")
    print(f"file://{out_abs}")

    if not a.no_shortcut:
        shortcut = a.shortcut or os.path.join(os.path.dirname(out_abs), '용어사전.html')
        made = ensure_shortcut(a.output, shortcut)
        if made:
            print(f"바로가기: file://{made}")


if __name__ == '__main__':
    main()
