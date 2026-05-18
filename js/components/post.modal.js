import { escapeHtml, formatDate, renderPostContent } from './utils.js';
import { renderCommentsSection } from './comment.ui.js';
import { t } from '../utils/i18n.js';

export const renderPublicPostModal = (post, comments = []) => {
  if (!post) return `<p>${t('posts.postNotFound')}</p>`;

  const author =
    post.author?.name || post.author?.email || t('post.unknownAuthor');
  const category = post.category?.name || t('post.general');
  const statusLabel =
    typeof post.published === 'boolean'
      ? post.published
        ? t('post.statusPublished')
        : t('post.statusDraft')
      : null;

  return `
    <div class="modal__meta">
      <span>${escapeHtml(category)}</span>
      <span>${escapeHtml(formatDate(post.createdAt))}</span>
      <span>${t('post.by')} ${escapeHtml(author)}</span>
      ${statusLabel ? `<span>${escapeHtml(statusLabel)}</span>` : ''}
    </div>
    <h3 id="modal-title" class="modal__title">${escapeHtml(post.title)}</h3>
    <div class="modal__body">${renderPostContent(post.content)}</div>
    ${renderCommentsSection({
      postId: post.id,
      comments,
      isPublished: post.published,
    })}
  `;
};

export const renderOwnerPostModal = (post, comments = [], renderActions) => {
  if (!post) return `<p>${t('posts.postNotFound')}</p>`;

  const category = post.category?.name || post.category || t('post.general');
  const author = post.author?.name || post.author?.email || t('post.you');
  const statusLabel =
    typeof post.published === 'boolean'
      ? post.published
        ? t('post.statusPublished')
        : t('post.statusDraft')
      : null;

  return `
    <div class="modal__meta">
      <span>${escapeHtml(category)}</span>
      <span>${escapeHtml(formatDate(post.createdAt))}</span>
      <span>${t('post.by')} ${escapeHtml(author)}</span>
      ${statusLabel ? `<span>${escapeHtml(statusLabel)}</span>` : ''}
    </div>
    <h3 id="modal-title" class="modal__title">${escapeHtml(post.title)}</h3>
    <div class="modal__body">${renderPostContent(post.content)}</div>
    ${renderActions ? renderActions(post) : ''}
    ${renderCommentsSection({
      postId: post.id,
      comments,
      isPublished: post.published,
    })}
  `;
};
