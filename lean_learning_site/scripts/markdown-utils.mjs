export function slugifyHeading(text, index = 0) {
  const ascii = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return ascii || `section-${index}`;
}

export function extractHeadings(markdown) {
  const headings = [];
  for (const match of markdown.matchAll(/^(#{2,3})\s+(.+)$/gm)) {
    const level = match[1].length;
    const title = match[2].trim();
    headings.push({
      level,
      title,
      anchor: slugifyHeading(title, headings.length),
    });
  }
  return headings;
}