#!/usr/bin/env node
/**
 * Tag unnamed ``` fences in LoVe zh-CN chapters.
 * - lean / text / java / python / haskell for code
 * - unwrap PDF artifacts that fenced Chinese prose
 *
 * Usage:
 *   node scripts/tag-code-fences.mjs [--write] [--parts 1-8|9-14|all]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const zhDir = join(__dirname, '..', 'book', 'zh-CN');
const write = process.argv.includes('--write');
let parts = 'all';
const partsIdx = process.argv.indexOf('--parts');
if (partsIdx !== -1) {
  parts = process.argv[partsIdx + 1] ?? process.argv[partsIdx].split('=')[1] ?? 'all';
}

const FENCE_OPEN = /^```([A-Za-z0-9_-]*)[ \t]*$/;

function cjkRatio(text) {
  const chars = text.replace(/\s/g, '');
  if (!chars.length) return 0;
  const cjk = (chars.match(/[\u4e00-\u9fff]/g) || []).length;
  return cjk / chars.length;
}

function shouldUnwrap(body) {
  const t = body.trim();
  if (!t) return true;
  if (/⊢|————————|—{3,}/.test(t)) return false;
  if (/^(def |theorem |example |inductive |namespace |import |#|set_option|open |class |instance |structure |lemma |variable |public |match |by\n|by$|@[a-z])/m.test(t)) {
    return false;
  }
  if (/^(class |def )/.test(t) && /:\s*$|pass|__init__/.test(t)) return false;
  if (cjkRatio(t) >= 0.2 && /[\u4e00-\u9fff]/.test(t[0] || '')) return true;
  if (cjkRatio(t) >= 0.35) return true;
  return false;
}

function classify(body) {
  const t = body.trim();
  if (!t) return 'text';

  if (/^public (class|interface)|^import java\b/m.test(t)) return 'java';
  if (/^class \w+:\s*$|^class \w+:\n/m.test(t) && /def __init__|pass/.test(t)) return 'python';
  if (/^fib \d|^module |^import [A-Z]/m.test(t)) return 'haskell';

  const leanStart = /^(def |theorem |example |inductive |namespace |import LoVe|#check|#eval|#reduce|#print|set_option|open |class |instance |structure |lemma |variable |local infix|notation|universe |noncomputable|RTC\.|abbrev )/m;
  const leanBody = /(Stmt\.|BigStep|PartialHoare|denote|Setoid|Quotient|MetaM|TacticM|Syntax|:=\s*by\b|infixl?:\d+|<\;>)/.test(t);
  const leanAssign = /^s\[x ↦.*=\s*\(fun /.test(t);

  if (leanStart.test(t) || leanAssign) return 'lean';
  if (/^\s*\|/.test(t) && /(=>|Stmt|Prop|Type|ℕ|α|β)/.test(t)) return 'lean';
  if (/^by\n/m.test(t) || leanBody) return 'lean';
  if (/^```/.test(t)) return 'text';

  if (/⊢|————————|—{3,}|【.*】|^intro |^apply |^exact |^calc\s|^inductive 谓词|^structure 结构体|^class 类名|^instance 实例名|^cases |^rw 【|^simp 【|^clear |^rename |^have 名称|^let 名称|^show 命题|^match 项|^axiom name/.test(t)) {
    return 'text';
  }

  return 'text';
}

function splitNestedFences(body) {
  if (!/```/.test(body)) return null;
  const segments = [];
  const lines = body.split('\n');
  let buf = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(FENCE_OPEN);
    if (m && m[1]) {
      if (buf.length) {
        segments.push({ kind: 'text', lines: buf });
        buf = [];
      }
      const lang = m[1];
      i++;
      const inner = [];
      while (i < lines.length && lines[i] !== '```') {
        inner.push(lines[i]);
        i++;
      }
      segments.push({ kind: lang || 'text', lines: inner });
      if (i < lines.length) i++;
      continue;
    }
    buf.push(lines[i]);
    i++;
  }
  if (buf.length) segments.push({ kind: 'text', lines: buf });
  return segments.length > 1 ? segments : null;
}

function emitSegment(out, kind, lines) {
  const body = lines.join('\n');
  if (shouldUnwrap(body)) {
    if (body.trim()) out.push(...lines);
    return 'unwrap';
  }
  const lang = kind === 'text' ? classify(body) : kind;
  out.push('```' + lang);
  out.push(...lines);
  out.push('```');
  return 'tag';
}

function tagMarkdown(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  const stats = { tagged: 0, unwrapped: 0 };

  while (i < lines.length) {
    const m = lines[i].match(FENCE_OPEN);
    if (!m) {
      out.push(lines[i]);
      i++;
      continue;
    }

    const lang = m[1] ?? '';
    if (lang) {
      out.push(lines[i]);
      i++;
      while (i < lines.length && lines[i] !== '```') {
        out.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        out.push(lines[i]);
        i++;
      }
      continue;
    }

    i++;
    const bodyLines = [];
    while (i < lines.length && lines[i] !== '```') {
      bodyLines.push(lines[i]);
      i++;
    }
    const body = bodyLines.join('\n');
    const nested = splitNestedFences(body);

    if (nested) {
      for (const seg of nested) {
        const r = emitSegment(out, seg.kind, seg.lines);
        if (r === 'unwrap') stats.unwrapped++;
        else stats.tagged++;
      }
    } else if (shouldUnwrap(body)) {
      if (body.trim()) out.push(...bodyLines);
      stats.unwrapped++;
    } else {
      const newLang = classify(body);
      stats.tagged++;
      out.push('```' + newLang);
      out.push(...bodyLines);
      out.push('```');
    }

    if (i < lines.length) i++;
  }

  return { text: out.join('\n'), stats };
}

function fileFilter(name) {
  if (parts === '1-8') {
    return /^(Foreword|ch(01|02|03|04|05|06|07|08)_.*|References)\.md$/.test(name);
  }
  if (parts === '9-14') {
    return /^ch(09|10|11|12|13|14)_/.test(name);
  }
  return /^(Foreword|ch\d{2}_.*|References)\.md$/.test(name);
}

const files = readdirSync(zhDir).filter(fileFilter).sort();
const totals = { tagged: 0, unwrapped: 0 };

for (const file of files) {
  const path = join(zhDir, file);
  const md = readFileSync(path, 'utf8');
  const { text, stats } = tagMarkdown(md);
  totals.tagged += stats.tagged;
  totals.unwrapped += stats.unwrapped;
  const n = stats.tagged + stats.unwrapped;
  if (n) console.log(`${file}: tagged ${stats.tagged}, unwrapped ${stats.unwrapped}`);
  if (write && n) writeFileSync(path, text);
}

console.log(`\nTotal: tagged ${totals.tagged}, unwrapped ${totals.unwrapped}`);
if (!write) console.log('Dry run — pass --write to apply');