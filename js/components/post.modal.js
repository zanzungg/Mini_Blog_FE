import { escapeHtml, formatDate, renderPostContent } from './utils.js';
import { renderCommentsSection } from './comment.ui.js';

export const renderPublicPostModal = (post, comments = []) => {
  if (!post) return '<p>Post not found.</p>';

  const author = post.author?.name || post.author?.email || 'Unknown author';
  const category = post.category?.name || 'General';
  const statusLabel =
    typeof post.published === 'boolean'
      ? post.published
        ? 'Published'
        : 'Draft'
      : null;

  return `
    <div class="modal__meta">
      <span>${escapeHtml(category)}</span>
      <span>${escapeHtml(formatDate(post.createdAt))}</span>
      <span>By ${escapeHtml(author)}</span>
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
  if (!post) return '<p>Post not found.</p>';

  const category = post.category?.name || post.category || 'General';
  const author = post.author?.name || post.author?.email || 'You';
  const statusLabel =
    typeof post.published === 'boolean'
      ? post.published
        ? 'Published'
        : 'Draft'
      : null;

  return `
    <div class="modal__meta">
      <span>${escapeHtml(category)}</span>
      <span>${escapeHtml(formatDate(post.createdAt))}</span>
      <span>By ${escapeHtml(author)}</span>
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
