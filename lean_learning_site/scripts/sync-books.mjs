#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractHeadings } from './markdown-utils.mjs';
import { writeLearnProofBook } from './sync-learn-proof.mjs';

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
    id: 'lean-reference',
    title: 'The Lean Language Reference',
    titleZh: 'Lean 语言参考手册',
    subtitle: 'Lean 4 语言、模块、策略、Lake 与工具链参考',
    source: join(repoRoot, 'lean-reference-zh', 'book', 'zh-CN'),
    originalUrl: 'https://lean-lang.org/doc/reference/latest/',
    status: '首批 226 篇已翻译',
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
    subtitle: '逻辑验证研究生课程 · 全书 14 章',
    source: join(repoRoot, 'love-zh', 'book', 'zh-CN'),
    originalUrl: 'https://github.com/lean-forward/logical_verification_2025',
    status: '全书 14 章已译（9–14 对照英文版，待中文 PDF 对齐）',
    externalPdfUrl: 'https://github.com/Lean-zh/LoVe-zh',
    preSync: join(repoRoot, 'love-zh', 'scripts', 'extract-from-pdf.mjs'),
    preSyncOptional: true,
  },
  {
    id: 'type-checking',
    title: 'Type Checking in Lean',
    titleZh: 'Lean 4 类型检查',
    subtitle: '内核、表达式、声明与类型推断',
    source: join(repoRoot, 'type-checking-zh', 'book', 'zh-CN'),
    originalUrl: 'https://leanprover.cn/type-checking-in-lean-zh/',
    status: '全书已完成',
  },
  {
    id: 'glimpse',
    title: 'GlimpseOfLean',
    titleZh: 'Lean 初探（GlimpseOfLean）',
    subtitle: '数小时速览 Lean 证明与练习',
    source: join(repoRoot, 'glimpse-zh', 'book', 'zh-CN'),
    originalUrl: 'https://leanprover.cn/GlimpseOfLean/',
    status: '练习与解答已完成',
  },
  {
    id: 'math2001',
    title: 'The Mechanics of Proof',
    titleZh: '证明的机制（Math 2001）',
    subtitle: '本科严谨证明 + Lean',
    source: join(repoRoot, 'math2001-zh', 'book', 'zh-CN'),
    originalUrl: 'https://hrmacbeth.github.io/math2001/',
    status: '目录已建 · 正文待译',
  },
  {
    id: 'logic-and-proof',
    title: 'Logic and Proof',
    titleZh: '逻辑与证明',
    subtitle: '经典逻辑、自然演绎与 Lean 形式化',
    source: join(repoRoot, 'logic-and-proof-zh', 'book', 'zh-CN'),
    originalUrl: 'https://leanprover.github.io/logic_and_proof/',
    status: '全书 20 章 + 公理化基础 + 附录',
  },
  {
    id: 'mp-lean',
    title: 'Metaprogramming in Lean 4',
    titleZh: 'Lean 4 元编程',
    subtitle: 'Syntax、宏、elab、tactic 与 DSL（Lean-zh 译本）',
    source: join(repoRoot, 'mp-lean-zh', 'book', 'zh-CN'),
    originalUrl: 'https://leanprover-community.github.io/lean4-metaprogramming-book/',
    status: '全书 10 章 + 习题解答',
    preSync: join(repoRoot, 'mp-lean-zh', 'scripts', 'sync-md.mjs'),
  },
];

const EXTERNAL_LINKS = [
  {
    kind: 'interactive',
    title: 'Natural Number Game (NNG4)',
    titleZh: '自然数游戏 NNG4（中文）',
    description: '交互式入门：tactic、rw、induction。建议配合本站「证明练习笔记」一起用。',
    url: 'https://nng4.leanprover.cn',
    originalUrl: 'https://adam.math.hhu.de/#/g/leanprover-community/NNG4',
    relatedPath: 'learn-proof/01-rw-and-rfl.md',
  },
  {
    kind: 'interactive',
    title: 'Natural Number Game (NNG4)',
    titleZh: 'Natural Number Game（英文）',
    description: 'NNG4 英文站，与中文版关卡一致。',
    url: 'https://adam.math.hhu.de/#/g/leanprover-community/NNG4',
    originalUrl: 'https://adam.math.hhu.de/#/g/leanprover-community/NNG4',
  },
  {
    kind: 'community',
    title: 'Theorem Proving in Lean (Lean 3, Chinese)',
    titleZh: 'Lean 3 定理证明（Lean-zh 社区版）',
    description: 'Sphinx 站点，适合对照 Lean 3 历史资料；Lean 4 请优先读本站 TPIL。',
    url: 'https://www.leanprover.cn/tp-lean-zh/',
    originalUrl: 'https://leanprover.github.io/theorem_proving_in_lean/',
  },
  {
    kind: 'community',
    title: 'GlimpseOfLean (Lean-zh)',
    titleZh: 'Lean 初探（Lean-zh 在线站）',
    description: '社区原版 Sphinx 站点；本站已同步 Markdown 译文与解答。',
    url: 'https://leanprover.cn/GlimpseOfLean/',
    originalUrl: 'https://leanprover-community.github.io/GlimpseOfLean/',
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
  if (book.preSync && existsSync(book.preSync)) {
    const result = spawnSync(process.execPath, [book.preSync], { stdio: 'inherit' });
    if (result.status !== 0 && !book.preSyncOptional) {
      throw new Error(`preSync failed for ${book.id}: ${book.preSync}`);
    }
  }

  if (!existsSync(book.source)) {
    throw new Error(`Missing translation source: ${book.source}`);
  }

  const target = join(dataRoot, book.id);
  rmSync(target, { recursive: true, force: true });
  copyMarkdownTree(book.source, target);

  const indexPath = join(target, 'INDEX.md');
  const rawSections = existsSync(indexPath)
    ? parseIndex(readFileSync(indexPath, 'utf8'))
    : [];

  // Only advertise chapters whose Markdown files actually exist.
  const sections = rawSections
    .map((section) => ({
      ...section,
      chapters: section.chapters.filter((chapter) =>
        existsSync(join(target, chapter.path))
      ),
    }))
    .filter((section) => section.chapters.length > 0);

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

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/[#*_>|-]/g, ' ')
    .replace(/\$\$?[^$]+\$\$?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSearchIndex(books) {
  const entries = [];

  for (const book of books) {
    for (const section of book.sections) {
      for (const chapter of section.chapters) {
        const filePath = join(dataRoot, chapter.path);
        if (!existsSync(filePath)) continue;
        const raw = readFileSync(filePath, 'utf8');
        const title = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? chapter.title;
        entries.push({
          kind: 'chapter',
          bookId: book.id,
          bookTitleZh: book.titleZh,
          path: chapter.path,
          title,
          section: section.title,
          text: stripMarkdown(raw).slice(0, 5000),
        });

        for (const heading of extractHeadings(raw)) {
          entries.push({
            kind: 'heading',
            bookId: book.id,
            bookTitleZh: book.titleZh,
            path: chapter.path,
            title: `${title} › ${heading.title}`,
            section: section.title,
            text: heading.title,
            anchor: heading.anchor,
          });
        }
      }
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    entryCount: entries.length,
    entries,
  };
}

function main() {
  mkdirSync(dataRoot, { recursive: true });
  const books = BOOKS.map(syncBook);
  mkdirSync(join(dataRoot, 'learn-proof'), { recursive: true });
  books.push(writeLearnProofBook({ repoRoot, dataRoot }));

  const catalog = {
    generatedAt: new Date().toISOString(),
    books,
    externalLinks: EXTERNAL_LINKS,
  };

  const searchIndex = buildSearchIndex(books);

  writeFileSync(join(siteRoot, 'books', 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
  writeFileSync(join(siteRoot, 'books', 'search-index.json'), `${JSON.stringify(searchIndex, null, 2)}\n`);
  console.log(`Synced ${books.length} books into books/data/`);
  for (const book of books) {
    console.log(`  · ${book.titleZh}: ${book.chapterCount} chapters`);
  }
  console.log(`Built search index with ${searchIndex.entryCount} entries`);
}

main();