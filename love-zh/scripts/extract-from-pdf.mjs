#!/usr/bin/env node
/**
 * Extract LoVe Chinese PDF into chapter Markdown (line-range split + cleanup).
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const outDir = join(repoRoot, 'book', 'zh-CN');

/** 1-based inclusive line ranges from pdftotext of 2026 desktop PDF */
const CHAPTERS = [
  { file: 'Foreword.md', title: '前言', from: 340, to: 703 },
  { file: 'ch01_TypesAndTerms.md', title: '第 1 章 类型与项', from: 704, to: 1115 },
  { file: 'ch02_ProgramsAndTheorems.md', title: '第 2 章 程序与定理', from: 1116, to: 1713 },
  { file: 'ch03_BackwardProofs.md', title: '第 3 章 逆向证明', from: 1714, to: 2650 },
  { file: 'ch04_ForwardProofs.md', title: '第 4 章 正向证明', from: 2651, to: 3837 },
  { file: 'ch05_FunctionalProgramming.md', title: '第 5 章 函数式编程', from: 3838, to: 5056 },
  { file: 'ch06_InductivePredicates.md', title: '第 6 章 归纳谓词', from: 5057, to: 6294 },
  { file: 'ch07_EffectfulProgramming.md', title: '第 7 章 带作用的编程', from: 6295, to: 7164 },
  { file: 'ch08_Metaprogramming.md', title: '第 8 章 元编程', from: 7165, to: 8040 },
  { file: 'References.md', title: '参考文献', from: 8053, to: 8155 },
];

function cleanLines(lines) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\f/g, '').trimEnd();
    const t = line.trim();
    if (!t) {
      out.push('');
      continue;
    }
    if (/^第[一二三四五六七八九十]+章/.test(t)) continue;
    if (/^第\d+\.\d+/.test(t)) continue;
    if (/^[ivxlc]+$/i.test(t)) continue;
    if (/^\d{1,3}$/.test(t)) continue;
    if (/^\.{2,}/.test(t) || /\.\s*\.{4,}/.test(t)) continue;
    if (/^(一|二|三|四) /.test(t) && t.length < 20) continue;
    out.push(line);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function main() {
  const pdfPath = process.argv[2]
    ?? join(repoRoot, 'pdf', '逻辑验证漫游指南-2026-桌面版.pdf');

  if (!existsSync(pdfPath)) {
    console.error(`PDF not found: ${pdfPath}`);
    process.exit(1);
  }

  const txt = execSync(`pdftotext "${pdfPath}" -`, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  const lines = txt.split('\n');
  mkdirSync(outDir, { recursive: true });

  for (const ch of CHAPTERS) {
    const outPath = join(outDir, ch.file);
    if (existsSync(outPath)) {
      const existing = readFileSync(outPath, 'utf8');
      if (/已(?:对照|校对)/.test(existing.slice(0, 500))) {
        console.log(`  ${ch.file}: skipped (proofread)`);
        continue;
      }
    }
    const slice = lines.slice(ch.from - 1, ch.to);
    const body = cleanLines(slice);
    const md = `# ${ch.title}\n\n> 由 Lean-zh PDF 自动提取（${ch.from}–${ch.to} 行），代码块与公式尚需人工校对。\n\n${body}\n`;
    writeFileSync(outPath, md);
    console.log(`  ${ch.file}: ${body.length} chars`);
  }
}

main();