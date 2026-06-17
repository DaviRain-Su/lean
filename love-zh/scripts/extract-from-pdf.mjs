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

/** 1-based line ranges from pdftotext of 2025 English desktop PDF (ch 9–14).
 *  Chinese 2026 PDF parts III–IV are not published yet; use for reference only. */
export const CHAPTERS_EN = [
  { file: 'ch09_OperationalSemantics.md', title: '第 9 章 操作语义', from: 6849, to: 7481 },
  { file: 'ch10_HoareLogic.md', title: '第 10 章 Hoare 逻辑', from: 7482, to: 8099 },
  { file: 'ch11_DenotationalSemantics.md', title: '第 11 章 指称语义', from: 8100, to: 8555 },
  { file: 'ch12_LogicalFoundations.md', title: '第 12 章 数学的逻辑基础', from: 8562, to: 9376 },
  { file: 'ch13_BasicStructures.md', title: '第 13 章 基本数学结构', from: 9377, to: 10060 },
  { file: 'ch14_RealNumbers.md', title: '第 14 章 有理数与实数', from: 10061, to: 10489 },
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

function cleanLinesEn(lines) {
  const out = [];
  for (const line of lines) {
    const t = line.replace(/\f/g, '').trimEnd().trim();
    if (!t) {
      out.push('');
      continue;
    }
    if (/^Chapter \d+\./.test(t)) continue;
    if (/^Part (III|IV)$/i.test(t)) continue;
    if (/^(Program Semantics|Mathematics)$/i.test(t)) continue;
    if (/^[ivxlc]+$/i.test(t)) continue;
    if (/^\d{1,3}$/.test(t)) continue;
    if (/^\.{2,}/.test(t)) continue;
    out.push(line.replace(/\f/g, '').trimEnd());
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function main() {
  const useEnglish = process.argv.includes('--english');
  const pdfPath = process.argv.find((a) => a.endsWith('.pdf'))
    ?? (useEnglish
      ? join(repoRoot, 'pdf', 'hitchhikers_guide_2025_en.pdf')
      : join(repoRoot, 'pdf', '逻辑验证漫游指南-2026-桌面版.pdf'));
  const chapters = useEnglish ? CHAPTERS_EN : CHAPTERS;

  if (!existsSync(pdfPath)) {
    console.error(`PDF not found: ${pdfPath}`);
    process.exit(1);
  }

  const txt = execSync(`pdftotext "${pdfPath}" -`, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  const lines = txt.split('\n');
  mkdirSync(outDir, { recursive: true });

  for (const ch of chapters) {
    const outPath = join(outDir, ch.file);
    if (existsSync(outPath)) {
      const existing = readFileSync(outPath, 'utf8');
      if (/已(?:对照|校对)/.test(existing.slice(0, 500))) {
        console.log(`  ${ch.file}: skipped (proofread)`);
        continue;
      }
    }
    const slice = lines.slice(ch.from - 1, ch.to);
    const body = useEnglish ? cleanLinesEn(slice) : cleanLines(slice);
    const note = useEnglish
      ? `> 由英文原版 PDF 自动提取（${ch.from}–${ch.to} 行），待译为中文并对照 Demo.lean 校对。中文版 PDF 第三部分尚未发布。`
      : `> 由 Lean-zh PDF 自动提取（${ch.from}–${ch.to} 行），代码块与公式尚需人工校对。`;
    const md = `# ${ch.title}\n\n${note}\n\n${body}\n`;
    writeFileSync(outPath, md);
    console.log(`  ${ch.file}: ${body.length} chars`);
  }
}

main();