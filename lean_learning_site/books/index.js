import { mountSearch } from './search.js';

const grid = document.getElementById('book-grid');
const interactiveGrid = document.getElementById('interactive-grid');
const communityGrid = document.getElementById('community-grid');

function renderExternalCard(item) {
  const related = item.relatedPath
    ? `<a class="button secondary" href="./reader.html?book=learn-proof&path=${encodeURIComponent(item.relatedPath)}">配套练习</a>`
    : '';
  const original = item.originalUrl && item.originalUrl !== item.url
    ? `<a class="button secondary" href="${item.originalUrl}" target="_blank" rel="noreferrer">英文原版</a>`
    : '';

  return `
    <article class="book-card external-card">
      <span class="badge">${item.kind === 'interactive' ? '交互式' : '社区站点'}</span>
      <h2>${item.titleZh}</h2>
      <p class="meta"><strong>${item.title}</strong><br>${item.description}</p>
      <div class="actions">
        <a class="button primary" href="${item.url}" target="_blank" rel="noreferrer">打开</a>
        ${related}
        ${original}
      </div>
    </article>
  `;
}

function renderBooks(catalog) {
  grid.innerHTML = catalog.books.map((book) => {
    const firstChapter = book.sections[0]?.chapters[0];
    const startHref = firstChapter
      ? `./reader.html?book=${encodeURIComponent(book.id)}&path=${encodeURIComponent(firstChapter.path)}`
      : `./reader.html?book=${encodeURIComponent(book.id)}`;

    const pdfAction = book.externalPdfUrl
      ? `<a class="button secondary" href="${book.externalPdfUrl}" target="_blank" rel="noreferrer">中文 PDF</a>`
      : '';

    const originalLink = book.originalUrl
      ? `<a href="${book.originalUrl}" target="_blank" rel="noreferrer">英文原版</a>`
      : '本站练习';

    return `
      <article class="book-card">
        <span class="badge">${book.status}</span>
        <h2>${book.titleZh}</h2>
        <p class="meta"><strong>${book.title}</strong><br>${book.subtitle}</p>
        <p class="meta">共 ${book.chapterCount} 篇 · ${originalLink}</p>
        <div class="actions">
          <a class="button primary" href="${startHref}">开始阅读</a>
          <a class="button secondary" href="./reader.html?book=${encodeURIComponent(book.id)}">章节目录</a>
          ${pdfAction}
        </div>
      </article>
    `;
  }).join('');

  const links = catalog.externalLinks ?? [];
  if (interactiveGrid) {
    interactiveGrid.innerHTML = links
      .filter((item) => item.kind === 'interactive')
      .map(renderExternalCard)
      .join('');
  }
  if (communityGrid) {
    communityGrid.innerHTML = links
      .filter((item) => item.kind !== 'interactive')
      .map(renderExternalCard)
      .join('');
  }
}

async function main() {
  try {
    const response = await fetch('./catalog.json');
    if (!response.ok) throw new Error(`catalog.json ${response.status}`);
    const catalog = await response.json();
    renderBooks(catalog);
  } catch (error) {
    grid.innerHTML = `<p class="reader-status error">无法加载教材目录。请先运行 <code>npm run build</code> 同步译文。<br>${error.message}</p>`;
  }
}

mountSearch({
  input: document.getElementById('catalog-search'),
  results: document.getElementById('catalog-search-results'),
  onNavigate: (href) => {
    window.location.href = href;
  },
});

main();