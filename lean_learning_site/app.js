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
