#!/usr/bin/env node
/**
 * Extract English PDF reference text and compare section structure with zh-CN chapters 9–14.
 * Usage: node scripts/proofread-compare.mjs
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTERS_EN } from './extract-from-pdf.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const enDir = join(repoRoot, '.proofread-en');
const zhDir = join(repoRoot, 'book', 'zh-CN');
const pdfPath = join(repoRoot, 'pdf', 'hitchhikers_guide_2025_en.pdf');

if (!existsSync(pdfPath)) {
  console.error(`PDF not found: ${pdfPath}`);
  process.exit(1);
}

const lines = execSync(`pdftotext "${pdfPath}" -`, {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
}).split('\n');

mkdirSync(enDir, { recursive: true });

for (const ch of CHAPTERS_EN) {
  const body = lines.slice(ch.from - 1, ch.to).join('\n');
  writeFileSync(join(enDir, ch.file.replace('.md', '.en.txt')), body);
}

console.log('Section structure (EN vs ZH):\n');
for (const ch of CHAPTERS_EN) {
  const en = readFileSync(join(enDir, ch.file.replace('.md', '.en.txt')), 'utf8');
  const zh = readFileSync(join(zhDir, ch.file), 'utf8');
  const enSecs = [...en.matchAll(/\n(\d+\.\d+)\s*\n/g)].map((m) => m[1]);
  const zhSecs = [...zh.matchAll(/^## (\d+\.\d+)/gm)].map((m) => m[1]);
  const zhSet = new Set(zhSecs);
  const missing = [...new Set(enSecs.filter((s) => !zhSet.has(s)))];
  const extra = [...new Set(zhSecs.filter((s) => !enSecs.includes(s)))];
  console.log(ch.file);
  if (missing.length) console.log(`  MISSING: ${missing.join(', ')}`);
  if (extra.length) console.log(`  EXTRA:   ${extra.join(', ')}`);
  if (!missing.length && !extra.length) console.log('  OK');
}