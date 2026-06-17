let searchIndex = null;
let fuse = null;
let catalogBooks = null;

function chapterHref(entry) {
  let href = `./reader.html?book=${encodeURIComponent(entry.bookId)}&path=${encodeURIComponent(entry.path)}`;
  if (entry.anchor) href += `#${entry.anchor}`;
  return href;
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function highlightMatch(text, query) {
  if (!query) return escapeHtml(text);
  const lower = text.toLowerCase();
  const needle = query.toLowerCase();
  const index = lower.indexOf(needle);
  if (index < 0) return escapeHtml(text);
  const before = text.slice(0, index);
  const match = text.slice(index, index + needle.length);
  const after = text.slice(index + needle.length);
  return `${escapeHtml(before)}<mark>${escapeHtml(match)}</mark>${escapeHtml(after)}`;
}

function buildSnippet(entry, query) {
  const text = entry.text ?? '';
  if (entry.kind === 'heading') {
    return `<span class="search-kind">章节内标题</span> ${highlightMatch(entry.text, query)}`;
  }
  if (!query) return escapeHtml(text.slice(0, 140));
  const lower = text.toLowerCase();
  const needle = query.toLowerCase();
  const index = lower.indexOf(needle);
  if (index < 0) return escapeHtml(text.slice(0, 140));
  const start = Math.max(0, index - 60);
  const end = Math.min(text.length, index + needle.length + 80);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return highlightMatch(`${prefix}${text.slice(start, end)}${suffix}`, query);
}

async function loadCatalogBooks() {
  if (catalogBooks) return catalogBooks;
  const response = await fetch('./catalog.json');
  if (!response.ok) return [];
  const catalog = await response.json();
  catalogBooks = catalog.books ?? [];
  return catalogBooks;
}

async function loadSearchIndex() {
  if (searchIndex) return searchIndex;
  const response = await fetch('./search-index.json');
  if (!response.ok) throw new Error(`search-index.json ${response.status}`);
  searchIndex = await response.json();
  if (typeof Fuse !== 'undefined') {
    fuse = new Fuse(searchIndex.entries, {
      includeScore: true,
      threshold: 0.38,
      ignoreLocation: true,
      keys: [
        { name: 'title', weight: 0.45 },
        { name: 'bookTitleZh', weight: 0.2 },
        { name: 'section', weight: 0.1 },
        { name: 'text', weight: 0.25 },
      ],
    });
  }
  return searchIndex;
}

function filterEntries(entries, bookId) {
  if (!bookId) return entries;
  return entries.filter((entry) => entry.bookId === bookId);
}

function searchEntries(query, bookId = '') {
  const trimmed = query.trim();
  if (!trimmed) return [];

  let results = [];
  if (fuse) {
    results = fuse.search(trimmed, { limit: 40 }).map((result) => result.item);
  } else {
    const lower = trimmed.toLowerCase();
    results = searchIndex.entries.filter((entry) =>
      entry.title.toLowerCase().includes(lower)
      || entry.bookTitleZh.toLowerCase().includes(lower)
      || entry.text.toLowerCase().includes(lower));
  }

  return filterEntries(results, bookId).slice(0, 24);
}

function renderResults(container, query, results) {
  if (!query.trim()) {
    container.innerHTML = '<p class="search-hint">输入关键词搜索全部教材章节与文内标题。</p>';
    return;
  }
  if (!results.length) {
    container.innerHTML = '<p class="search-hint">没有找到匹配章节。</p>';
    return;
  }
  container.innerHTML = results.map((entry) => `
    <a class="search-result" href="${chapterHref(entry)}">
      <strong>${highlightMatch(entry.title, query)}</strong>
      <span class="search-meta">${escapeHtml(entry.bookTitleZh)} · ${escapeHtml(entry.section)}${entry.kind === 'heading' ? ' · 文内标题' : ''}</span>
      <span class="search-snippet">${buildSnippet(entry, query)}</span>
    </a>
  `).join('');
}

export async function populateBookFilter(select, { includeAll = true, defaultBookId = '' } = {}) {
  if (!select) return;
  const books = await loadCatalogBooks();
  select.innerHTML = [
    includeAll ? '<option value="">全部教材</option>' : '',
    ...books.map((book) => `<option value="${escapeHtml(book.id)}">${escapeHtml(book.titleZh)}</option>`),
  ].join('');
  if (defaultBookId) select.value = defaultBookId;
}

export function mountSearch({
  input,
  results,
  filter,
  onNavigate,
  defaultBookId = '',
  scopeHint,
} = {}) {
  if (!input || !results) return;

  let active = false;

  if (filter) {
    populateBookFilter(filter, { defaultBookId });
  }

  if (scopeHint && defaultBookId) {
    scopeHint.hidden = false;
    scopeHint.textContent = '默认仅搜索当前书籍；可切换为「全部教材」。';
  }

  async function runSearch() {
    try {
      await loadSearchIndex();
      const query = input.value;
      const bookId = filter ? filter.value : (defaultBookId ?? '');
      const matches = searchEntries(query, bookId);
      renderResults(results, query, matches);
      results.hidden = !query.trim();
    } catch (error) {
      results.hidden = false;
      results.innerHTML = `<p class="search-hint error">搜索索引加载失败。请先运行 <code>npm run build</code>。<br>${escapeHtml(error.message)}</p>`;
    }
  }

  input.addEventListener('input', () => {
    active = true;
    runSearch();
  });

  if (filter) {
    filter.addEventListener('change', () => {
      if (input.value.trim()) runSearch();
    });
  }

  input.addEventListener('focus', () => {
    if (input.value.trim()) {
      results.hidden = false;
    }
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      input.value = '';
      results.hidden = true;
      input.blur();
      return;
    }
    if (event.key === 'Enter') {
      const first = results.querySelector('.search-result');
      if (first) {
        event.preventDefault();
        if (onNavigate) onNavigate(first.getAttribute('href'));
        else window.location.href = first.getAttribute('href');
      }
    }
  });

  document.addEventListener('click', (event) => {
    if (!active) return;
    const inFilter = filter && (event.target === filter || filter.contains(event.target));
    if (event.target === input || results.contains(event.target) || inFilter) return;
    results.hidden = true;
  });

  return { runSearch };
}