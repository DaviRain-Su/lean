let searchIndex = null;
let fuse = null;

function chapterHref(entry) {
  return `./reader.html?book=${encodeURIComponent(entry.bookId)}&path=${encodeURIComponent(entry.path)}`;
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

function searchEntries(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  if (fuse) {
    return fuse.search(trimmed, { limit: 24 }).map((result) => result.item);
  }
  const lower = trimmed.toLowerCase();
  return searchIndex.entries
    .filter((entry) =>
      entry.title.toLowerCase().includes(lower)
      || entry.bookTitleZh.toLowerCase().includes(lower)
      || entry.text.toLowerCase().includes(lower))
    .slice(0, 24);
}

function renderResults(container, query, results) {
  if (!query.trim()) {
    container.innerHTML = '<p class="search-hint">输入关键词搜索全部教材章节。</p>';
    return;
  }
  if (!results.length) {
    container.innerHTML = '<p class="search-hint">没有找到匹配章节。</p>';
    return;
  }
  container.innerHTML = results.map((entry) => `
    <a class="search-result" href="${chapterHref(entry)}">
      <strong>${highlightMatch(entry.title, query)}</strong>
      <span class="search-meta">${escapeHtml(entry.bookTitleZh)} · ${escapeHtml(entry.section)}</span>
      <span class="search-snippet">${buildSnippet(entry, query)}</span>
    </a>
  `).join('');
}

export function mountSearch({ input, results, onNavigate } = {}) {
  if (!input || !results) return;

  let active = false;

  async function runSearch() {
    try {
      await loadSearchIndex();
      const query = input.value;
      const matches = searchEntries(query);
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
    if (event.target === input || results.contains(event.target)) return;
    results.hidden = true;
  });

  return { runSearch };
}