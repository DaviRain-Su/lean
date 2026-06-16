#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = join(__dirname, '..');
const repoRoot = join(siteRoot, '..');
const dataRoot = join(siteRoot, 'books', 'data');

const BOOKS = [
  {
    id: 'tpil',
    title: 'Theorem Proving in Lean 4',
    titleZh: 'Lean 4 定理证明',
    subtitle: '依赖类型论、命题逻辑、策略与归纳类型',
    source: join(repoRoot, 'tpil-zh', 'book', 'zh-CN'),
    originalUrl: 'https://lean-lang.org/theorem_proving_in_lean4/',
    status: '全书 12 章已完成',
  },
  {
    id: 'fp-lean',
    title: 'Functional Programming in Lean',
    titleZh: 'Lean 函数式编程',
    subtitle: '类型、单子、类型类、依赖类型与程序证明',
    source: join(repoRoot, 'fp-lean-zh', 'book', 'zh-CN'),
    originalUrl: 'https://lean-lang.org/functional_programming_in_lean/',
    status: '全书已完成',
  },
  {
    id: 'mil',
    title: 'Mathematics in Lean',
    titleZh: 'Lean 中的数学',
    subtitle: 'Mathlib、集合论、代数、拓扑与测度论',
    source: join(repoRoot, 'mil-zh', 'book', 'zh-CN'),
    originalUrl: 'https://leanprover-community.github.io/mathematics_in_lean/',
    status: '全书 13 章已完成',
  },
  {
    id: 'faq',
    title: 'Lean FAQ',
    titleZh: 'Lean 常见问题',
    subtitle: '官方 FAQ：用途、逻辑、可信代码基与安全',
    source: join(repoRoot, 'faq-zh', 'book', 'zh-CN'),
    originalUrl: 'https://lean-lang.org/faq',
    status: '全文已完成',
  },
  {
    id: 'vscode-lean4',
    title: 'Lean 4 VS Code Extension Manual',
    titleZh: 'VS Code Lean 4 手册',
    subtitle: '安装、InfoView、项目与 Elan 版本管理',
    source: join(repoRoot, 'vscode-lean4-zh', 'book', 'zh-CN'),
    originalUrl: 'https://github.com/leanprover/vscode-lean4/blob/master/vscode-lean4/manual/manual.md',
    status: '全书 8 篇已完成',
  },
  {
    id: 'love',
    title: "The Hitchhiker's Guide to Logical Verification",
    titleZh: '逻辑验证漫游指南',
    subtitle: '研究生级逻辑验证 · PDF 中文 + 练习',
    source: join(repoRoot, 'love-zh', 'book', 'zh-CN'),
    originalUrl: 'https://github.com/lean-forward/logical_verification_2025',
    status: '导读已完成 · 正文见 PDF',
    externalPdfUrl: 'https://github.com/Lean-zh/LoVe-zh',
  },
];

const EXTERNAL_LINKS = [
  {
    title: 'Metaprogramming in Lean 4',
    titleZh: 'Lean 4 元编程',
    description: '宏、策略、elab 与扩展 Lean。Lean-zh Sphinx 译本。',
    url: 'https://leanprover.cn/mp-lean-zh/',
    originalUrl: 'https://leanprover-community.github.io/lean4-metaprogramming-book/',
  },
  {
    title: 'Natural Number Game (NNG4)',
    titleZh: '自然数游戏 NNG4',
    description: '交互式入门：tactic、rw、induction。',
    url: 'https://nng4.leanprover.cn',
    originalUrl: 'https://adam.math.hhu.de/#/g/leanprover-community/NNG4',
  },
  {
    title: 'The Mechanics of Proof',
    titleZh: '证明的机制（Math2001）',
    description: '本科数学推理 + Lean。英文在线书。',
    url: 'https://hrmacbeth.github.io/math2001/',
    originalUrl: 'https://hrmacbeth.github.io/math2001/',
  },
  {
    title: 'The Lean Language Reference',
    titleZh: 'Lean 语言参考手册',
    description: '权威参考（非教程）。按章节查阅。',
    url: 'https://lean-lang.org/doc/reference/latest/',
    originalUrl: 'https://lean-lang.org/doc/reference/latest/',
  },
];

function copyMarkdownTree(source, target) {
  mkdirSync(target, { recursive: true });
  for (const entry of readdirSync(source)) {
    const from = join(source, entry);
    const to = join(target, entry);
    const info = statSync(from);
    if (info.isDirectory()) {
      copyMarkdownTree(from, to);
    } else if (entry.endsWith('.md')) {
      cpSync(from, to);
    }
  }
}

function parseIndex(indexText) {
  const sections = [];
  let current = null;
  let skip = false;

  for (const line of indexText.split('\n')) {
    if (/^##\s+(待翻译|对应英文|学习路径|翻译说明)/.test(line)) {
      skip = true;
      continue;
    }
    if (/^##\s+/.test(line) && !/^###/.test(line)) {
      if (!/^(##\s+已翻译章节|##\s+说明)/.test(line)) {
        skip = /^##\s+待翻译/.test(line);
      } else {
        skip = false;
      }
      continue;
    }
    if (skip) continue;

    const sectionMatch = line.match(/^###\s+(.+)$/);
    if (sectionMatch) {
      current = { title: sectionMatch[1].trim(), chapters: [] };
      sections.push(current);
      continue;
    }

    const linkMatch = line.match(/^-\s+\[([^\]]+)\]\(([^)]+)\)(?:\s*[—-]\s*(.+))?$/);
    if (linkMatch && current) {
      const [, title, path, summary = ''] = linkMatch;
      if (path.startsWith('http')) continue;
      current.chapters.push({
        title: title.trim(),
        path: path.trim(),
        summary: summary.trim(),
      });
    }
  }

  return sections.filter((section) => section.chapters.length > 0);
}

function syncBook(book) {
  if (!existsSync(book.source)) {
    throw new Error(`Missing translation source: ${book.source}`);
  }

  const target = join(dataRoot, book.id);
  rmSync(target, { recursive: true, force: true });
  copyMarkdownTree(book.source, target);

  const indexPath = join(target, 'INDEX.md');
  const sections = existsSync(indexPath)
    ? parseIndex(readFileSync(indexPath, 'utf8'))
    : [];

  const chapterCount = sections.reduce((sum, section) => sum + section.chapters.length, 0);

  return {
    id: book.id,
    title: book.title,
    titleZh: book.titleZh,
    subtitle: book.subtitle,
    originalUrl: book.originalUrl,
    externalPdfUrl: book.externalPdfUrl ?? null,
    status: book.status,
    indexPath: `${book.id}/INDEX.md`,
    chapterCount,
    sections: sections.map((section) => ({
      title: section.title,
      chapters: section.chapters.map((chapter) => ({
        title: chapter.title,
        path: `${book.id}/${chapter.path}`,
        summary: chapter.summary,
      })),
    })),
  };
}

function main() {
  mkdirSync(dataRoot, { recursive: true });
  const books = BOOKS.map(syncBook);
  const catalog = {
    generatedAt: new Date().toISOString(),
    books,
    externalLinks: EXTERNAL_LINKS,
  };

  writeFileSync(join(siteRoot, 'books', 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`Synced ${books.length} books into books/data/`);
  for (const book of books) {
    console.log(`  · ${book.titleZh}: ${book.chapterCount} chapters`);
  }
}

main();