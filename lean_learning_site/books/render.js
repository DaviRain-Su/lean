import { slugifyHeading } from './slug.js';

const LEAN_KEYWORDS = [
  'import', 'open', 'namespace', 'section', 'end', 'variable', 'variables',
  'theorem', 'lemma', 'def', 'abbrev', 'example', 'axiom', 'opaque',
  'inductive', 'structure', 'class', 'instance', 'where', 'extends',
  'by', 'have', 'let', 'in', 'fun', 'match', 'with', 'if', 'then', 'else',
  'do', 'return', 'mut', 'for', 'while', 'break', 'continue',
  'private', 'protected', 'noncomputable', 'unsafe', 'partial', 'mutual',
  'attribute', 'local', 'scoped', 'macro', 'syntax', 'elab', 'simp',
  'rw', 'rfl', 'apply', 'intro', 'cases', 'induction', 'calc', 'show',
  'trace_state', 'dbg_trace', 'sorry', 'exact', 'refine', 'constructor',
  'exists', 'use', 'obtain', 'rcases', 'rintro', 'ext', 'congr',
  'simp', 'simp_all', 'aesop', 'omega', 'linarith', 'ring', 'norm_num',
  'trivial', 'assumption', 'contradiction', 'exfalso', 'push_neg',
  'True', 'False', 'Prop', 'Type', 'Sort', 'Nat', 'Int', 'Bool', 'String',
  'Unit', 'List', 'Array', 'Option', 'IO', 'Lean',
].join(' ');

function registerLeanLanguage() {
  if (typeof hljs === 'undefined' || hljs.getLanguage('lean')) return;

  hljs.registerLanguage('lean', () => ({
    case_insensitive: false,
    keywords: { keyword: LEAN_KEYWORDS },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      { begin: /#(?:check|eval|reduce|print|synth|guard_msgs|find|where)\b/ },
      { className: 'number', begin: /\b\d+(?:\.\d+)?\b/ },
      { className: 'title', begin: /\b(?:theorem|lemma|def|example|instance|class|structure|inductive)\s+([A-Za-z0-9_.']+)/ },
    ],
  }));
}

function normalizeCodeLanguage(block) {
  const classes = [...block.classList];
  const langClass = classes.find((name) => name.startsWith('language-'));
  const lang = langClass?.slice('language-'.length) ?? '';
  const leanAliases = new Set(['lean', 'lean4', 'lean3', '']);
  if (leanAliases.has(lang)) {
    block.classList.remove(...classes.filter((name) => name.startsWith('language-')));
    block.classList.add('language-lean');
  }
}

function highlightCodeBlocks(root) {
  if (typeof hljs === 'undefined') return;
  registerLeanLanguage();

  for (const block of root.querySelectorAll('pre code')) {
    const source = block.textContent ?? '';
    if (!source.trim()) continue;

    normalizeCodeLanguage(block);

    try {
      if (block.classList.contains('hljs')) {
        block.classList.remove('hljs');
      }
      hljs.highlightElement(block);
      if (!(block.textContent ?? '').trim()) {
        block.textContent = source;
      }
    } catch {
      block.textContent = source;
      block.classList.remove('hljs');
    }
  }
}

function renderMath(root) {
  if (typeof renderMathInElement === 'undefined') return;
  renderMathInElement(root, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\[', right: '\\]', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
    ],
    throwOnError: false,
    strict: 'ignore',
  });
}

function addCopyButtons(root) {
  for (const pre of root.querySelectorAll('pre')) {
    if (pre.querySelector('.code-copy')) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.textContent = '复制';
    button.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.innerText ?? pre.innerText;
      try {
        await navigator.clipboard.writeText(code.trim());
        const previous = button.textContent;
        button.textContent = '已复制';
        window.setTimeout(() => {
          button.textContent = previous;
        }, 1200);
      } catch {
        button.textContent = '复制失败';
      }
    });
    pre.classList.add('has-copy');
    pre.appendChild(button);
  }
}

function addHeadingIds(root) {
  const used = new Set();
  root.querySelectorAll('h2, h3').forEach((heading, index) => {
    if (heading.id) return;
    let id = slugifyHeading(heading.textContent ?? '', index);
    while (used.has(id)) {
      id = `${id}-${index}`;
    }
    used.add(id);
    heading.id = id;
  });
}

export function enrichContent(root) {
  addHeadingIds(root);
  highlightCodeBlocks(root);
  renderMath(root);
  addCopyButtons(root);
}

export function renderMarkdown(markdown) {
  return marked.parse(markdown);
}