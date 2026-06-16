const params = new URLSearchParams(window.location.search);
const bookId = params.get('book') ?? 'tpil';
const requestedPath = params.get('path');

const sidebarTitle = document.getElementById('sidebar-title');
const bookSwitch = document.getElementById('book-switch');
const readerToc = document.getElementById('reader-toc');
const crumbs = document.getElementById('crumbs');
const readerContent = document.getElementById('reader-content');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

let catalog = null;
let flatChapters = [];
let currentIndex = -1;

marked.setOptions({
  gfm: true,
  breaks: false,
});

function flattenChapters(book) {
  const chapters = [];
  for (const section of book.sections) {
    for (const chapter of section.chapters) {
      chapters.push({ ...chapter, sectionTitle: section.title });
    }
  }
  return chapters;
}

function chapterHref(path) {
  return `./reader.html?book=${encodeURIComponent(bookId)}&path=${encodeURIComponent(path)}`;
}

function renderBookSwitch() {
  bookSwitch.innerHTML = catalog.books.map((book) => {
    const active = book.id === bookId ? 'active' : '';
    return `<a class="${active}" href="./reader.html?book=${encodeURIComponent(book.id)}">${book.titleZh}</a>`;
  }).join('');
}

function renderToc(book) {
  readerToc.innerHTML = book.sections.map((section) => `
    <section>
      <h3>${section.title}</h3>
      ${section.chapters.map((chapter) => {
        const active = chapter.path === flatChapters[currentIndex]?.path ? 'active' : '';
        return `<a class="${active}" href="${chapterHref(chapter.path)}">${chapter.title}</a>`;
      }).join('')}
    </section>
  `).join('');
}

function updateNavButtons() {
  prevBtn.disabled = currentIndex <= 0;
  nextBtn.disabled = currentIndex < 0 || currentIndex >= flatChapters.length - 1;
}

function renderCrumbs(book, chapter) {
  crumbs.innerHTML = `
    <a href="./index.html">中文教材</a>
    <span>/</span>
    <span>${book.titleZh}</span>
    ${chapter ? `<span>/</span><span>${chapter.title}</span>` : ''}
  `;
}

async function loadChapter(path) {
  readerContent.innerHTML = '<p class="reader-status">正在加载…</p>';
  const response = await fetch(`./data/${path}`);
  if (!response.ok) {
    throw new Error(`无法加载 ${path}（${response.status}）`);
  }
  const markdown = await response.text();
  readerContent.innerHTML = marked.parse(markdown);
  document.title = `${flatChapters[currentIndex]?.title ?? '阅读器'} · ${catalog.books.find((b) => b.id === bookId)?.titleZh ?? 'Lean 4'}`;
}

function selectChapter(path, { pushState = true } = {}) {
  currentIndex = flatChapters.findIndex((chapter) => chapter.path === path);
  const book = catalog.books.find((entry) => entry.id === bookId);
  if (!book || currentIndex < 0) return;

  const chapter = flatChapters[currentIndex];
  sidebarTitle.textContent = book.titleZh;
  renderBookSwitch();
  renderToc(book);
  renderCrumbs(book, chapter);
  updateNavButtons();

  if (pushState) {
    const url = chapterHref(path);
    window.history.pushState({ bookId, path }, '', url);
  }

  return loadChapter(path);
}

async function init() {
  try {
    const response = await fetch('./catalog.json');
    if (!response.ok) throw new Error(`catalog.json ${response.status}`);
    catalog = await response.json();

    const book = catalog.books.find((entry) => entry.id === bookId) ?? catalog.books[0];
    flatChapters = flattenChapters(book);

    const initialPath = requestedPath ?? flatChapters[0]?.path;
    if (!initialPath) {
      readerContent.innerHTML = '<p class="reader-status error">这本书还没有可阅读的章节。</p>';
      return;
    }

    await selectChapter(initialPath, { pushState: false });
  } catch (error) {
    readerContent.innerHTML = `<p class="reader-status error">加载失败。请先运行 <code>npm run build</code> 同步译文。<br>${error.message}</p>`;
  }
}

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    selectChapter(flatChapters[currentIndex - 1].path);
  }
});

nextBtn.addEventListener('click', () => {
  if (currentIndex < flatChapters.length - 1) {
    selectChapter(flatChapters[currentIndex + 1].path);
  }
});

window.addEventListener('popstate', (event) => {
  const state = event.state;
  if (state?.path) {
    selectChapter(state.path, { pushState: false });
  }
});

init();