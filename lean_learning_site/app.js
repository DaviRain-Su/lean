const copyButtons = document.querySelectorAll('[data-copy]');

for (const button of copyButtons) {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copy);
    const text = target?.innerText.trim();

    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      const previous = button.textContent;
      button.textContent = '已复制';
      window.setTimeout(() => {
        button.textContent = previous;
      }, 1200);
    } catch {
      button.textContent = '复制失败';
    }
  });
}

const lessonCards = document.querySelectorAll('.lesson-card');

for (const card of lessonCards) {
  card.addEventListener('mouseenter', () => {
    for (const item of lessonCards) item.classList.remove('active');
    card.classList.add('active');
  });
}

const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = [...navLinks]
  .map((link) => {
    const id = link.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    return el ? { link, el } : null;
  })
  .filter(Boolean);

if (sections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const match = sections.find((s) => s.el === entry.target);
        if (!match) continue;
        for (const { link } of sections) link.classList.remove('is-active');
        match.link.classList.add('is-active');
      }
    },
    { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
  );

  for (const { el } of sections) observer.observe(el);
}