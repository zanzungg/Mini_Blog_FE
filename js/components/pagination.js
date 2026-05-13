export const renderPagination = (meta, { prefix = 'page' } = {}) => {
  if (!meta || meta.totalPages <= 1) return '';

  const current = meta.page || 1;
  const total = meta.totalPages || 1;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const attr = `data-${prefix}`;

  return `
    <button class="btn btn-ghost" ${attr}="${current - 1}" ${current === 1 ? 'disabled' : ''}>
      Prev
    </button>
    ${pages
      .map(
        (page) => `
      <button class="btn ${page === current ? 'btn-primary' : 'btn-ghost'}" ${attr}="${page}">
        ${page}
      </button>
    `
      )
      .join('')}
    <button class="btn btn-ghost" ${attr}="${current + 1}" ${current === total ? 'disabled' : ''}>
      Next
    </button>
  `;
};
