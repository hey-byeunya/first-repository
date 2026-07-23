#!/usr/bin/env python3
"""
기존 마크다운 용어사전(구 md_to_glossary.py 포맷)을 JSON 데이터로 변환하는
일회성 마이그레이션 스크립트. glossary-builder가 JSON을 데이터 저장소로 쓰도록
바뀌면서, 그 전에 마크다운으로 쌓아둔 용어사전을 JSON으로 옮길 때 쓴다.

사용법:
  python3 migrate_md_to_json.py <입력.md> <출력.json> [--title "제목"] [--lede "소개문"]

JSON 출력 스키마는 scripts/json_to_glossary.py 상단 주석 참고.
"""
import sys, re, json, argparse


def parse(md):
    lines = md.split('\n')
    groups = []  # [(그룹명, [용어dict, ...]), ...]
    cur_group = None
    cur = None
    i = 0
    n = len(lines)

    def flush_term():
        nonlocal cur
        if cur is not None:
            cur_group[1].append(cur)
            cur = None

    while i < n:
        line = lines[i]
        if line.startswith('## '):
            flush_term()
            name = line[3:].strip()
            if name.startswith('색인'):
                cur_group = None
                i += 1
                continue
            cur_group = (name, [])
            groups.append(cur_group)
            i += 1
            continue
        if line.startswith('### ') and cur_group is not None:
            flush_term()
            head = line[4:].strip()
            m = re.match(r'^(.*?)\s*\(([^)]*)\)\s*$', head)
            if m and ' ' in head:
                term, original = m.group(1).strip(), m.group(2).strip()
            else:
                term, original = head, ''
            cur = {
                "term": term, "original": original, "group": cur_group[0],
                "definition": "", "analogy": None, "details": [],
                "related": [], "references": [],
            }
            i += 1
            continue
        if re.match(r'^\s*-{3,}\s*$', line):  # 수평선(---) 무시
            i += 1
            continue
        if cur is None:
            i += 1
            continue
        if line.strip().startswith('```'):
            code = []
            i += 1
            while i < n and not lines[i].strip().startswith('```'):
                code.append(lines[i])
                i += 1
            i += 1
            cur['details'].append({"type": "code", "text": '\n'.join(code)})
            continue
        if line.strip().startswith('|'):
            tbl = []
            while i < n and lines[i].strip().startswith('|'):
                tbl.append(lines[i])
                i += 1
            rows = []
            for r in tbl:
                if re.match(r'^\s*\|[\s:\-|]+\|\s*$', r):
                    continue
                rows.append([c.strip() for c in r.strip().strip('|').split('|')])
            cur['details'].append({"type": "table", "rows": rows})
            continue
        s = line.strip()
        if s:
            if s.startswith('**정의**'):
                cur['definition'] = re.sub(r'^\*\*정의\*\*\s*—?\s*', '', s)
            elif s.startswith('**비유**'):
                rest = re.sub(r'^\*\*비유\*\*\s*', '', s)
                m = re.match(r'^(\S*)\s*—\s*(.*)$', rest)
                if m:
                    emoji, text = m.group(1), m.group(2)
                else:
                    emoji, text = '', rest
                cur['analogy'] = {"emoji": emoji, "text": text}
            elif s.startswith('**관련 용어**'):
                cur['related'] = re.findall(r'\[\[([^\]]+)\]\]', s)
            elif s.startswith('*참고') or s.startswith('*이 '):
                for m in re.finditer(r'\[([^\]]+)\]\((https?://[^)]+)\)', s):
                    cur['references'].append({"text": m.group(1), "url": m.group(2)})
            else:
                cur['details'].append({"type": "paragraph", "text": s})
        i += 1
    flush_term()

    group_names = [g for g, _ in groups]
    terms = [t for _, ts in groups for t in ts]
    return group_names, terms


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('input')
    ap.add_argument('output')
    ap.add_argument('--title', default=None)
    ap.add_argument('--lede', default=None)
    a = ap.parse_args()

    with open(a.input, encoding='utf-8') as f:
        md = f.read()

    m = re.search(r'^#\s+(.+)$', md, re.M)
    title = a.title or (m.group(1).strip() if m else '용어사전')

    lede = a.lede
    if lede is None:
        after = md[m.end():] if m else md
        para = []
        for l in after.split('\n'):
            if l.startswith('##'):
                break
            if l.strip():
                para.append(l.strip())
        lede = ' '.join(para)

    groups, terms = parse(md)
    data = {"title": title, "lede": lede, "groups": groups, "terms": terms}

    with open(a.output, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"OK: {len(terms)} terms, {len(groups)} groups → {a.output}")


if __name__ == '__main__':
    main()
