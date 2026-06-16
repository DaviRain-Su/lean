const grid = document.getElementById('book-grid');
const externalGrid = document.getElementById('external-grid');

function renderBooks(catalog) {
  grid.innerHTML = catalog.books.map((book) => {
    const firstChapter = book.sections[0]?.chapters[0];
    const startHref = firstChapter
      ? `./reader.html?book=${encodeURIComponent(book.id)}&path=${encodeURIComponent(firstChapter.path)}`
      : `./reader.html?book=${encodeURIComponent(book.id)}`;

    const pdfAction = book.externalPdfUrl
      ? `<a class="button secondary" href="${book.externalPdfUrl}" target="_blank" rel="noreferrer">中文 PDF</a>`
      : '';

    return `
      <article class="book-card">
        <span class="badge">${book.status}</span>
        <h2>${book.titleZh}</h2>
        <p class="meta"><strong>${book.title}</strong><br>${book.subtitle}</p>
        <p class="meta">共 ${book.chapterCount} 篇 · <a href="${book.originalUrl}" target="_blank" rel="noreferrer">英文原版</a></p>
        <div class="actions">
          <a class="button primary" href="${startHref}">开始阅读</a>
          <a class="button secondary" href="./reader.html?book=${encodeURIComponent(book.id)}">章节目录</a>
          ${pdfAction}
        </div>
      </article>
    `;
  }).join('');

  if (!externalGrid) return;

  const links = catalog.externalLinks ?? [];
  externalGrid.innerHTML = links.map((item) => `
    <article class="book-card external-card">
      <h2>${item.titleZh}</h2>
      <p class="meta"><strong>${item.title}</strong><br>${item.description}</p>
      <div class="actions">
        <a class="button primary" href="${item.url}" target="_blank" rel="noreferrer">打开</a>
        <a class="button secondary" href="${item.originalUrl}" target="_blank" rel="noreferrer">英文原版</a>
      </div>
    </article>
  `).join('');
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

main();