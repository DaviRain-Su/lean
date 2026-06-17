#!/usr/bin/env node
/** Verify markdown code fence pairing in LoVe zh-CN chapters. */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const zhDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'book', 'zh-CN');
const FENCE = /^```([A-Za-z0-9_-]*)[ \t]*$/;

const files = readdirSync(zhDir).filter((f) => /^ch\d{2}_/.test(f)).sort();
let errors = 0;

for (const file of files) {
  const lines = readFileSync(join(zhDir, file), 'utf8').split('\n');
  const stack = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(FENCE);
    if (!m) continue;
    const lang = m[1] ?? '';
    if (stack.length && stack.at(-1).open) {
      // closing fence
      if (lang) {
        console.error(`${file}:${i + 1}: closing fence must be plain \`\`\`, got \`\`\`${lang}`);
        errors++;
      }
      stack.pop();
    } else {
      stack.push({ line: i + 1, lang, open: true });
    }
  }
  for (const s of stack) {
    console.error(`${file}:${s.line}: unclosed fence (${s.lang || 'unnamed'})`);
    errors++;
  }
}

if (errors) {
  console.error(`\n${errors} fence error(s)`);
  process.exit(1);
}
console.log(`OK: ${files.length} chapter files, all fences balanced`);