const grid = document.getElementById('book-grid');

function renderBooks(catalog) {
  grid.innerHTML = catalog.books.map((book) => {
    const firstChapter = book.sections[0]?.chapters[0];
    const startHref = firstChapter
      ? `./reader.html?book=${encodeURIComponent(book.id)}&path=${encodeURIComponent(firstChapter.path)}`
      : `./reader.html?book=${encodeURIComponent(book.id)}`;

    return `
      <article class="book-card">
        <span class="badge">${book.status}</span>
        <h2>${book.titleZh}</h2>
        <p class="meta"><strong>${book.title}</strong><br>${book.subtitle}</p>
        <p class="meta">共 ${book.chapterCount} 篇 · <a href="${book.originalUrl}" target="_blank" rel="noreferrer">英文原版</a></p>
        <div class="actions">
          <a class="button primary" href="${startHref}">开始阅读</a>
          <a class="button secondary" href="./reader.html?book=${encodeURIComponent(book.id)}">章节目录</a>
        </div>
      </article>
    `;
  }).join('');
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