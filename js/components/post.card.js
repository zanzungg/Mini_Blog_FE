import { escapeHtml, formatDate, createExcerpt } from './utils.js';
import { t } from '../utils/i18n.js';

export const renderPostCard = (post) => {
  const category = post.category?.name || t('post.general');
  const author =
    post.author?.name || post.author?.email || t('post.unknownAuthor');

  return `
    <article class="post-card post-card--clickable" data-post-id="${post.id}" role="button" tabindex="0">
      <span>${escapeHtml(category)} · ${escapeHtml(formatDate(post.createdAt))}</span>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(createExcerpt(post.content))}</p>
      <p class="hero-meta">${t('post.by')} ${escapeHtml(author)}</p>
    </article>
  `;
};

export const renderHeroPost = (post) => {
  if (!post) {
    return `
      <article class="hero-card">
        <span class="hero-meta">${t('post.latestPost')}</span>
        <h3>${t('post.noPostsYetTitle')}</h3>
        <p>${t('post.noPostsYetDesc')}</p>
      </article>
    `;
  }

  const author =
    post.author?.name || post.author?.email || t('post.unknownAuthor');
  const category = post.category?.name || t('post.general');

  return `
    <article class="hero-card hero-card--clickable" data-post-id="${post.id}" role="button" tabindex="0">
      <span class="hero-meta">${t('post.latestPost')} · ${escapeHtml(category)}</span>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(createExcerpt(post.content, 180))}</p>
      <p class="hero-meta">${t('post.by')} ${escapeHtml(author)} · ${escapeHtml(formatDate(post.createdAt))}</p>
    </article>
  `;
};

export const renderMyPostCard = (post) => {
  const statusLabel = post.published
    ? t('post.statusPublished')
    : t('post.statusDraft');
  const statusClass = post.published
    ? 'status-pill--success'
    : 'status-pill--draft';
  const category = post.category?.name || post.category || t('post.general');

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
