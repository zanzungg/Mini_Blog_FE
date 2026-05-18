import { getAuthState } from '../core/store.js';
import { escapeHtml, formatDate } from './utils.js';
import { t } from '../utils/i18n.js';

// Render threaded comments (recursive)
export const renderComments = (comments = [], depth = 0) => {
  if (!comments.length) return '';

  return `
    <div class="modal__comment-list">
      ${comments
        .map((comment) => {
          const commenter =
            comment.user?.name ||
            comment.user?.email ||
            t('comments.anonymous');
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
                  ${t('comments.reply')}
                </button>
                ${
                  isOwner
                    ? `
                  <button class="btn-link" type="button" data-edit-comment="${comment.id}">
                    ${t('comments.edit')}
                  </button>
                  <button class="btn-link btn-link--danger" type="button" data-delete-comment="${comment.id}">
                    ${t('comments.delete')}
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

export const renderCommentForm = ({
  postId,
  parentId = null,
  placeholder = t('comments.writeCommentPlaceholder'),
} = {}) => {
  const { isAuthenticated } = getAuthState();

  if (!isAuthenticated) {
    return `
    <div class="modal__comment-auth">
      <div class="modal__comment-auth-content">
        <h5>${t('comments.joinConversation')}</h5>
        <p>
          ${t('comments.loginPrompt')}
        </p>
      </div>

      <a href="#" 
        class="btn btn-primary modal__comment-auth-btn" 
        data-action="login"
        data-modal-close>
        ${t('comments.loginAction')}
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
        minlength="1"
        maxlength="2000"
        required
      ></textarea>
      <div class="modal-actions">
        ${
          parentId
            ? `
          <button class="btn btn-ghost" type="button" data-cancel-reply>${t('comments.cancel')}</button>
        `
            : ''
        }
        <button class="btn btn-primary" type="submit">
          ${parentId ? t('comments.reply') : t('comments.comment')}
        </button>
      </div>
    </form>
  `;
};

export const renderCommentsSection = ({
  postId,
  comments = [],
  isPublished = true,
}) => {
  const commentsMarkup = comments.length
    ? renderComments(comments)
    : `<p class="modal__comment-empty">${t('comments.noComments')}</p>`;

  return `
    <div class="modal__divider"></div>
    <div class="modal__comments" data-comments-section data-post-id="${postId}">
      <h4 class="modal__section-title">${t('comments.commentsTitle', { count: comments.length })}</h4>
      <div data-comments-list>
        ${commentsMarkup}
      </div>
      ${
        isPublished
          ? renderCommentForm({ postId })
          : `<p class="modal__comment-hint">${t('comments.disabledForDraft')}</p>`
      }
    </div>
  `;
};
