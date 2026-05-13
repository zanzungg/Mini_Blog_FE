import { escapeHtml, formatDate, createExcerpt } from './utils.js';

export const renderPostCard = (post) => {
  const category = post.category?.name || 'General';
  const author = post.author?.name || post.author?.email || 'Unknown author';

  return `
    <article class="post-card post-card--clickable" data-post-id="${post.id}" role="button" tabindex="0">
      <span>${escapeHtml(category)} · ${escapeHtml(formatDate(post.createdAt))}</span>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(createExcerpt(post.content))}</p>
      <p class="hero-meta">By ${escapeHtml(author)}</p>
    </article>
  `;
};

export const renderHeroPost = (post) => {
  if (!post) {
    return `
      <article class="hero-card">
        <span class="hero-meta">Latest Post</span>
        <h3>No posts yet</h3>
        <p>Check back soon for the first story.</p>
      </article>
    `;
  }

  const author = post.author?.name || post.author?.email || 'Unknown author';
  const category = post.category?.name || 'General';

  return `
    <article class="hero-card hero-card--clickable" data-post-id="${post.id}" role="button" tabindex="0">
      <span class="hero-meta">Latest Post · ${escapeHtml(category)}</span>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(createExcerpt(post.content, 180))}</p>
      <p class="hero-meta">By ${escapeHtml(author)} · ${escapeHtml(formatDate(post.createdAt))}</p>
    </article>
  `;
};

export const renderMyPostCard = (post) => {
  const statusLabel = post.published ? 'Published' : 'Draft';
  const statusClass = post.published
    ? 'status-pill--success'
    : 'status-pill--draft';
  const category = post.category?.name || post.category || 'General';

  return `
    <article class="post-card post-card--clickable" data-post-id="${post.id}" role="button" tabindex="0">
      <div class="post-card__meta">
        <span>${escapeHtml(category)} · ${escapeHtml(formatDate(post.createdAt))}</span>
        <span class="status-pill ${statusClass}">${statusLabel}</span>
      </div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(createExcerpt(post.content))}</p>
    </article>
  `;
};
