import { mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOX_COMMENT = /^--\s*[│┌├└┴┬┤─=]/;

function parseBoxTableRow(line) {
  const inner = line.replace(/^--\s*/, '').trim();
  if (!inner.startsWith('│')) return null;
  return inner
    .slice(1, inner.endsWith('│') ? -1 : undefined)
    .split('│')
    .map((cell) => cell.trim());
}

function boxTableToMarkdown(lines) {
  const rows = lines.map(parseBoxTableRow).filter(Boolean);
  if (rows.length < 2) return null;
  const header = rows[0];
  const body = rows.slice(1);
  const out = [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...body.map((row) => `| ${row.join(' | ')} |`),
    '',
  ];
  return out;
}

const BASIC_CHAPTERS = [
  {
    file: 'Intro.md',
    title: '入门与调试工具',
    summary: '如何使用练习项目、trace_state 与 InfoView',
    match: (heading) => !heading,
  },
  {
    file: '01-rw-and-rfl.md',
    title: 'rfl、rw 与 calc',
    summary: '示例 1–7：基础 tactic 与调试命令',
    match: (heading) => {
      const n = exampleNumber(heading);
      return n !== null && n <= 7;
    },
  },
  {
    file: '02-lemmas-and-equality.md',
    title: '引理与等式改写',
    summary: '示例 8–10：add_zero、显式传参与 2+2=4',
    match: (heading) => {
      const n = exampleNumber(heading);
      return n !== null && n >= 8 && n <= 10;
    },
  },
  {
    file: '03-induction-addition.md',
    title: '归纳法：加法',
    summary: '示例 11–15：zero_add、succ_add、交换律与结合律',
    match: (heading) => {
      const n = exampleNumber(heading);
      return n !== null && n >= 11 && n <= 15;
    },
  },
  {
    file: '04-induction-multiplication.md',
    title: '归纳法：乘法',
    summary: '示例 16–19：mul_one、zero_mul、succ_mul、mul_comm',
    match: (heading) => {
      const n = exampleNumber(heading);
      return n !== null && n >= 16;
    },
  },
];

const EXTRA_CHAPTERS = [
  {
    file: '05-natural-numbers.md',
    title: '自然数：从零构造',
    summary: 'MyNat：归纳定义、加法与乘法的递归定义',
    source: 'Natural.lean',
  },
];

const ALL_CHAPTERS = [...BASIC_CHAPTERS, ...EXTRA_CHAPTERS];

function exampleNumber(heading) {
  if (!heading) return null;
  const match = heading.match(/示例\s*(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function isSectionHeading(line) {
  return /^--\s*示例\s/.test(line);
}

function isProseComment(line) {
  return line.startsWith('--') && !BOX_COMMENT.test(line);
}

function flushCode(buffer, parts) {
  const code = buffer.join('\n').trimEnd();
  if (!code) return;
  parts.push('```lean');
  parts.push(code);
  parts.push('```');
  parts.push('');
  buffer.length = 0;
}

function flushComments(buffer, parts) {
  if (!buffer.length) return;
  for (const line of buffer) {
    parts.push(line.replace(/^--\s?/, ''));
  }
  parts.push('');
  buffer.length = 0;
}

function parseLeanSections(leanText) {
  const lines = leanText.split('\n');
  const sections = [{ heading: null, parts: [] }];
  let commentBuffer = [];
  let codeBuffer = [];

  function current() {
    return sections[sections.length - 1];
  }

  function pushSection(heading) {
    sections.push({ heading, parts: [] });
  }

  let boxBuffer = [];

  function flushBox(parts) {
    if (!boxBuffer.length) return false;
    const table = boxTableToMarkdown(boxBuffer);
    boxBuffer = [];
    if (table) {
      parts.push(...table);
      return true;
    }
    return false;
  }

  for (const line of lines) {
    if (BOX_COMMENT.test(line)) {
      flushCode(codeBuffer, current().parts);
      flushComments(commentBuffer, current().parts);
      boxBuffer.push(line);
      continue;
    }

    if (boxBuffer.length) {
      flushBox(current().parts);
    }

    if (isSectionHeading(line)) {
      flushCode(codeBuffer, current().parts);
      flushComments(commentBuffer, current().parts);
      pushSection(line.replace(/^--\s*/, ''));
      continue;
    }

    if (isProseComment(line)) {
      flushCode(codeBuffer, current().parts);
      const prose = line.replace(/^--\s?/, '');
      if (commentBuffer.length === 0 && prose.endsWith('：')) {
        flushComments(commentBuffer, current().parts);
        current().parts.push(`## ${prose.replace(/：$/, '')}`);
        current().parts.push('');
      } else {
        commentBuffer.push(line);
      }
      continue;
    }

    flushComments(commentBuffer, current().parts);
    codeBuffer.push(line);
  }

  flushBox(current().parts);
  flushCode(codeBuffer, current().parts);
  flushComments(commentBuffer, current().parts);
  return sections;
}

function chapterForSection(section) {
  return BASIC_CHAPTERS.find((chapter) => chapter.match(section.heading)) ?? BASIC_CHAPTERS[0];
}

function buildChapterMarkdown(chapter, sections) {
  const parts = [
    `# ${chapter.title}`,
    '',
    '> 源文件：`learn_proof/LearnProof/Basic.lean` · 在 VS Code 中打开 Lake 项目配合 InfoView 运行',
    '',
  ];

  if (chapter.file === 'Intro.md') {
    parts.push(
      '## 如何使用',
      '',
      '1. 在仓库根目录执行 `cd learn_proof && code .` 打开练习项目。',
      '2. 阅读各章示例，把代码复制到 `LearnProof/Basic.lean` 或新建文件练习。',
      '3. 光标放在 `by` 后的 tactic 行，右侧 InfoView 会显示当前目标。',
      '',
    );
  }

  for (const section of sections) {
    if (section.heading) {
      parts.push(`## ${section.heading}`);
      parts.push('');
    }
    parts.push(...section.parts);
  }

  return `${parts.join('\n').trimEnd()}\n`;
}

/**
 * Convert a Lean file that uses `/-! ... -/` block comments for prose
 * into a single-section markdown chapter.
 */
function buildExtraChapterMarkdown(chapter, leanText) {
  const parts = [
    `# ${chapter.title}`,
    '',
    `> 源文件：\`learn_proof/LearnProof/${chapter.source}\` · 在 VS Code 中打开 Lake 项目配合 InfoView 运行`,
    '',
  ];

  const lines = leanText.split('\n');
  let inBlock = false;
  let blockBuffer = [];
  let codeBuffer = [];

  function flushCode() {
    const code = codeBuffer.join('\n').trimEnd();
    if (!code) return;
    parts.push('```lean');
    parts.push(code);
    parts.push('```');
    parts.push('');
    codeBuffer.length = 0;
  }

  function flushBlock() {
    if (!blockBuffer.length) return;
    // Remove leading `/-!` marker from first line and trailing `-/` from last line;
    // everything in between is already markdown prose.
    const first = blockBuffer[0].replace(/^\s*\/!-\s?/, '');
    const last = blockBuffer[blockBuffer.length - 1].replace(/\s?-\/\s*$/, '');
    const body = [first, ...blockBuffer.slice(1, -1), last];
    for (const line of body) {
      parts.push(line);
    }
    parts.push('');
    blockBuffer.length = 0;
  }

  for (const line of lines) {
    const startMatch = line.match(/^(\s*)\/-!(.*)$/);
    const endMatch = line.match(/^(.*)-\/\s*$/);

    if (startMatch && !inBlock) {
      flushCode();
      inBlock = true;
      blockBuffer.push(startMatch[2]);
      continue;
    }

    if (inBlock) {
      if (endMatch && line.includes('-/')) {
        blockBuffer.push(endMatch[1]);
        flushBlock();
        inBlock = false;
      } else {
        blockBuffer.push(line);
      }
      continue;
    }

    codeBuffer.push(line);
  }

  flushCode();
  return `${parts.join('\n').trimEnd()}\n`;
}

export function writeLearnProofBook({ repoRoot, dataRoot }) {
  const basicPath = join(repoRoot, 'learn_proof', 'LearnProof', 'Basic.lean');
  const target = join(dataRoot, 'learn-proof');
  mkdirSync(target, { recursive: true });

  const sections = parseLeanSections(readFileSync(basicPath, 'utf8'));
  const grouped = new Map(BASIC_CHAPTERS.map((chapter) => [chapter.file, []]));

  for (const section of sections) {
    const chapter = chapterForSection(section);
    grouped.get(chapter.file).push(section);
  }

  const allowed = new Set(ALL_CHAPTERS.map((chapter) => chapter.file));
  allowed.add('INDEX.md');
  for (const entry of readdirSync(target)) {
    if (entry.endsWith('.md') && !allowed.has(entry)) {
      unlinkSync(join(target, entry));
    }
  }

  for (const chapter of BASIC_CHAPTERS) {
    writeFileSync(
      join(target, chapter.file),
      buildChapterMarkdown(chapter, grouped.get(chapter.file)),
    );
  }

  for (const chapter of EXTRA_CHAPTERS) {
    const sourcePath = join(repoRoot, 'learn_proof', 'LearnProof', chapter.source);
    const leanText = readFileSync(sourcePath, 'utf8');
    writeFileSync(
      join(target, chapter.file),
      buildExtraChapterMarkdown(chapter, leanText),
    );
  }

  const indexLines = [
    '# 证明练习笔记',
    '',
    '> Lake 项目：`learn_proof/` · 配合 Natural Number Game 与 TPIL 使用',
    '',
    '## 练习章节',
    '',
    ...ALL_CHAPTERS.map((chapter) =>
      `- [${chapter.title}](${chapter.file}) — ${chapter.summary}`),
    '',
  ];

  writeFileSync(join(target, 'INDEX.md'), `${indexLines.join('\n')}\n`);

  return {
    id: 'learn-proof',
    title: 'Learn Proof Playground',
    titleZh: '证明练习笔记',
    subtitle: 'NNG 风格 tactic 练习 · 同步自 learn_proof 项目',
    originalUrl: null,
    externalPdfUrl: null,
    status: `${ALL_CHAPTERS.length} 章 · 随 learn_proof 自动同步`,
    indexPath: 'learn-proof/INDEX.md',
    chapterCount: ALL_CHAPTERS.length,
    sections: [
      {
        title: '练习章节',
        chapters: ALL_CHAPTERS.map((chapter) => ({
          title: chapter.title,
          path: `learn-proof/${chapter.file}`,
          summary: chapter.summary,
        })),
      },
    ],
  };
}
