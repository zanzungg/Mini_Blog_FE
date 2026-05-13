import { getAuthState } from '../core/store.js';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Render threaded comments (recursive)
export const renderComments = (comments = [], depth = 0) => {
  if (!comments.length) return '';

  return `
    <div class="modal__comment-list">
      ${comments
        .map((comment) => {
          const commenter =
            comment.user?.name || comment.user?.email || 'Anonymous';
          const { user } = getAuthState();
          const isOwner =
            user &&
            (comment.userId === user.id || comment.user?.id === user.id);
          const repliesMarkup = renderComments(
            comment.replies || [],
            depth + 1
          );

          return `
          <div class="modal__comment" data-depth="${depth}" data-comment-id="${comment.id}">
            <div class="modal__comment-header">
              <p class="modal__comment-meta">
                ${escapeHtml(commenter)} · ${escapeHtml(formatDate(comment.createdAt))}
              </p>
              <div class="modal__comment-actions">
                <button class="btn-link" type="button" data-reply-to="${comment.id}">
                  Reply
                </button>
                ${
                  isOwner
                    ? `
                  <button class="btn-link" type="button" data-edit-comment="${comment.id}">
                    Edit
                  </button>
                  <button class="btn-link btn-link--danger" type="button" data-delete-comment="${comment.id}">
                    Delete
                  </button>
                `
                    : ''
                }
              </div>
            </div>
            <p class="modal__comment-body" data-comment-body="${comment.id}">
              ${escapeHtml(comment.content).replace(/\n/g, '<br />')}
            </p>
            ${repliesMarkup ? `<div class="modal__comment-children">${repliesMarkup}</div>` : ''}
          </div>
        `;
        })
        .join('')}
    </div>
  `;
};

// Form thêm comment mới hoặc reply
export const renderCommentForm = ({
  postId,
  parentId = null,
  placeholder = 'Write a comment...',
} = {}) => {
  const { isAuthenticated } = getAuthState();

  if (!isAuthenticated) {
    return `
    <div class="modal__comment-auth">
      <div class="modal__comment-auth-content">
        <h5>Join the conversation</h5>
        <p>
          Login to leave a comment, reply to discussions,
          and interact with other readers.
        </p>
      </div>

      <a href="#" 
        class="btn btn-primary modal__comment-auth-btn" 
        data-action="login"
        data-modal-close>
        Login
      </a>
    </div>
  `;
  }

  return `
    <form class="modal__comment-form" data-comment-form
      data-post-id="${postId}"
      ${parentId ? `data-parent-id="${parentId}"` : ''}
    >
      <textarea
        class="modal__comment-input"
        name="content"
        placeholder="${escapeHtml(placeholder)}"
        rows="3"
        required
      ></textarea>
      <div class="modal-actions">
        ${
          parentId
            ? `
          <button class="btn btn-ghost" type="button" data-cancel-reply>Cancel</button>
        `
            : ''
        }
        <button class="btn btn-primary" type="submit">
          ${parentId ? 'Reply' : 'Comment'}
        </button>
      </div>
    </form>
  `;
};

// Section comments đầy đủ: list + form
export const renderCommentsSection = ({
  postId,
  comments = [],
  isPublished = true,
}) => {
  const commentsMarkup = comments.length
    ? renderComments(comments)
    : '<p class="modal__comment-empty">No comments yet. Be the first!</p>';

  return `
    <div class="modal__divider"></div>
    <div class="modal__comments" data-comments-section data-post-id="${postId}">
      <h4 class="modal__section-title">Comments (${comments.length})</h4>
      <div data-comments-list>
        ${commentsMarkup}
      </div>
      ${
        isPublished
          ? renderCommentForm({ postId })
          : '<p class="modal__comment-hint">Comments are disabled for draft posts.</p>'
      }
    </div>
  `;
};
