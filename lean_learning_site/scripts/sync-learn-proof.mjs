import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOX_COMMENT = /^--\s*[│┌├└┴┬┤─]/;

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

export function leanFileToMarkdown(leanText) {
  const lines = leanText.split('\n');
  const parts = [
    '# 证明练习笔记',
    '',
    '> 源文件：`learn_proof/LearnProof/Basic.lean`。在 VS Code 中打开 Lake 项目，配合 InfoView 逐步运行；代码块可直接复制。',
    '',
    '## 如何使用',
    '',
    '1. 在仓库根目录执行 `cd learn_proof && code .` 打开练习项目。',
    '2. 在本页阅读说明，把对应示例复制到 `LearnProof/Basic.lean` 或新建文件练习。',
    '3. 光标放在 `by` 后的 tactic 行，右侧 InfoView 会显示当前目标。',
    '',
  ];

  let commentBuffer = [];
  let codeBuffer = [];
  let sectionStarted = false;

  for (const line of lines) {
    if (isSectionHeading(line)) {
      flushCode(codeBuffer, parts);
      flushComments(commentBuffer, parts);
      parts.push(`## ${line.replace(/^--\s*/, '')}`);
      parts.push('');
      sectionStarted = true;
      continue;
    }

    if (isProseComment(line)) {
      flushCode(codeBuffer, parts);
      const prose = line.replace(/^--\s?/, '');
      if (commentBuffer.length === 0 && prose.endsWith('：')) {
        flushComments(commentBuffer, parts);
        parts.push(`## ${prose.replace(/：$/, '')}`);
        parts.push('');
      } else {
        commentBuffer.push(line);
      }
      continue;
    }

    flushComments(commentBuffer, parts);
    codeBuffer.push(line);
  }

  flushCode(codeBuffer, parts);
  flushComments(commentBuffer, parts);

  if (!sectionStarted) {
    parts.splice(4, 0, '## 完整源码', '');
  }

  return `${parts.join('\n').trimEnd()}\n`;
}

export function writeLearnProofBook({ repoRoot, dataRoot }) {
  const leanPath = join(repoRoot, 'learn_proof', 'LearnProof', 'Basic.lean');
  const target = join(dataRoot, 'learn-proof');
  const markdown = leanFileToMarkdown(readFileSync(leanPath, 'utf8'));

  writeFileSync(join(target, 'Basic.md'), markdown);
  writeFileSync(join(target, 'INDEX.md'), `# 证明练习笔记

> Lake 项目：\`learn_proof/\` · 配合 Natural Number Game 与 TPIL 使用

## 练习

### 基础与归纳

- [证明练习笔记](Basic.md) — rfl、rw、calc、归纳法、乘法等 NNG 风格示例
`);

  return {
    id: 'learn-proof',
    title: 'Learn Proof Playground',
    titleZh: '证明练习笔记',
    subtitle: 'NNG 风格 tactic 练习 · 同步自 learn_proof 项目',
    originalUrl: null,
    externalPdfUrl: null,
    status: '随 learn_proof/Basic.lean 自动同步',
    indexPath: 'learn-proof/INDEX.md',
    chapterCount: 1,
    sections: [
      {
        title: '练习',
        chapters: [
          {
            title: '证明练习笔记',
            path: 'learn-proof/Basic.md',
            summary: 'rfl、rw、calc、归纳法与乘法练习',
          },
        ],
      },
    ],
  };
}