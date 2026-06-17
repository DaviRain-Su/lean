#!/usr/bin/env node
/**
 * Tag unnamed ``` fences in LoVe ch9–14 as ```lean or ```text for reader highlighting.
 * Usage: node scripts/tag-code-fences.mjs [--write]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const zhDir = join(__dirname, '..', 'book', 'zh-CN');
const write = process.argv.includes('--write');
const files = readdirSync(zhDir).filter((f) => /^ch(09|10|11|12|13|14)/.test(f));

const FENCE_OPEN = /^```([A-Za-z0-9_-]*)[ \t]*$/;

function classify(body) {
  const t = body.trim();
  if (!t) return 'text';

  const leanStart = /^(def |theorem |example |inductive |namespace |import |#check|set_option|open |class |instance |structure |lemma |variable |local infix|notation|universe |noncomputable|RTC\.)/m;
  const leanBody = /(Stmt\.|BigStep|PartialHoare|denote|Setoid|Quotient|CompleteLattice|Monotone|Subtype|:=\s*by\b|infixl?:\d+)/.test(t);
  const leanAssign = /^s\[x ↦.*=\s*\(fun /.test(t);

  if (leanStart.test(t) || leanAssign) return 'lean';
  if (/^\s*\|/.test(t) && /(=>|Stmt|Prop|Type|ℕ)/.test(t)) return 'lean';
  if (leanBody && !/—{3,}/.test(t)) return 'lean';

  return 'text';
}

function tagMarkdown(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  let tagged = 0;

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
    const newLang = classify(body);
    tagged++;
    out.push('```' + newLang);
    out.push(...bodyLines);
    out.push('```');
    if (i < lines.length) i++;
  }

  return { text: out.join('\n'), tagged };
}

let total = 0;

for (const file of files) {
  const path = join(zhDir, file);
  const md = readFileSync(path, 'utf8');
  const { text, tagged } = tagMarkdown(md);
  total += tagged;
  console.log(`${file}: tagged ${tagged} blocks`);
  if (write && tagged) writeFileSync(path, text);
}

console.log(`\nTotal: ${total} blocks`);
if (!write) console.log('Dry run — pass --write to apply');