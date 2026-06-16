#!/usr/bin/env node
/**
 * Lightweight port of Seasawher/mdgen ConvertToMd for syncing Lean-zh sources
 * when `lake exe mdgen` is unavailable (e.g. macOS dyld issues).
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function analysis(lines) {
  const res = [];
  let level = 0;
  let doc = false;
  let ignore = false;

  for (const line of lines) {
    if (line.endsWith('--#')) continue;
    if (line.endsWith('--#--')) {
      ignore = !ignore;
      continue;
    }
    if (ignore) continue;

    if (line.startsWith('/--')) doc = true;
    if (line.startsWith('/-') && !line.startsWith('/--')) level += 1;

    res.push({
      content: line,
      level,
      close: line.endsWith('-/') && !doc,
    });

    if (line.endsWith('-/')) {
      if (!doc) level -= 1;
      doc = false;
    }
  }

  return res;
}

function listShift([left, right]) {
  if (right.length === 0) return [left, []];
  const [head, ...tail] = right;
  return [left.concat(head), tail];
}

function buildBlocks(lines) {
  if (lines.length === 0) return [];

  const level = lines[0].level;
  let splited;

  if (level === 0) {
    const idx = lines.findIndex((x, i) => i > 0 && x.level === 0);
    const cut = idx === -1 ? lines.length : idx;
    splited = [lines.slice(0, cut), lines.slice(cut)];
  } else {
    const idx = lines.findIndex((x) => !(x.level > 1 || !x.close));
    const cut = idx === -1 ? lines.length : idx + 1;
    splited = listShift([lines.slice(0, cut), lines.slice(cut)]);
  }

  const fstBlock = {
    content: splited[0].map((x) => x.content).join('\n').trim(),
    toCodeBlock: level === 0,
  };

  return [fstBlock, ...buildBlocks(splited[1])];
}

function blockToMd(block) {
  if (!block.content) return '';
  if (block.toCodeBlock) {
    return `\`\`\`lean\n${block.content}\n\`\`\`\n\n`;
  }

  const separator = block.content.startsWith('/-!') ? '/-!' : '/-';
  let text = block.content.slice(separator.length);
  if (text.endsWith('-/')) {
    text = text.slice(0, -2);
  }
  return `${text.trim()}\n\n`;
}

function convertToMd(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks = buildBlocks(analysis(lines));
  return blocks.map(blockToMd).join('').trimEnd() + '\n';
}

function walkLeanFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const info = statSync(path);
    if (info.isDirectory()) {
      walkLeanFiles(path, acc);
    } else if (entry.endsWith('.lean') && entry !== 'cover.lean') {
      acc.push(path);
    }
  }
  return acc;
}

function remapPath(inputRoot, outputRoot, filePath) {
  const rel = relative(inputRoot, filePath).replace(/\.lean$/, '.md');
  return join(outputRoot, rel);
}

export function generateMarkdown({ inputDir, outputDir }) {
  mkdirSync(outputDir, { recursive: true });
  const files = walkLeanFiles(inputDir);

  for (const file of files) {
    const md = convertToMd(readFileSync(file, 'utf8'));
    const out = remapPath(inputDir, outputDir, file);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, md);
  }

  return files.length;
}

function main() {
  const repoRoot = join(__dirname, '..');
  const inputDir = join(repoRoot, 'lean');
  const outputDir = join(repoRoot, 'book', 'zh-CN');
  const count = generateMarkdown({ inputDir, outputDir });
  console.log(`mdgen-lite: wrote ${count} markdown files to ${relative(repoRoot, outputDir)}/`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}