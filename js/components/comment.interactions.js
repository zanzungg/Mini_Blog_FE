import { toast } from '../utils/toast.js';
import { getAuthState } from '../core/store.js';
import { closeModal } from './modal.js';
import { initConfirmModal, openConfirm } from './modal_confirm.js';
import {
  createComment,
  updateComment,
  deleteComment,
} from '../modules/comment/comment.service.js';
import { getPostById } from '../modules/post/post.service.js';
import { renderComments, renderCommentForm } from './comment.ui.js';
import { escapeHtml } from './utils.js';
import { t } from '../utils/i18n.js';

let _isBound = false;

const refreshCommentList = async (postId) => {
  const section = document.querySelector('[data-comments-section]');
  if (!section) return;

  const listEl = section.querySelector('[data-comments-list]');
  if (!listEl) return;

  listEl.innerHTML = `<p>${t('comments.refreshing')}</p>`;

  try {
    const post = await getPostById(postId);
    const comments = post?.comments ?? [];

    const count = section.querySelector('.modal__section-title');
    if (count)
      count.textContent = t('comments.commentsTitle', {
        count: comments.length,
      });

    listEl.innerHTML = comments.length
      ? renderComments(comments)
      : `<p class="modal__comment-empty">${t('comments.noComments')}</p>`;
  } catch (error) {
    listEl.innerHTML = `<p>${t('comments.unableRefresh')}</p>`;
  }
};

export const bindCommentInteractions = () => {
  if (_isBound) return;

  initConfirmModal();

  document.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-comment-form]');
    if (!form) return;

    event.preventDefault();

    const { isAuthenticated } = getAuthState();
    if (!isAuthenticated) {
      toast.error(t('comments.loginToComment'));
      return;
    }

    const postId = Number(form.dataset.postId);
    const parentId = form.dataset.parentId
      ? Number(form.dataset.parentId)
      : null;
    const textarea = form.querySelector('textarea[name="content"]');
    const content = textarea?.value.trim() || '';

    if (!content) {
      toast.error(t('comments.commentEmpty'));
      return;
    }
    if (content.length > 2000) {
      toast.error(t('comments.commentTooLong'));
      return;
    }
    if (content.length > 2000) {
      toast.error('Comment must not exceed 2000 characters.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = t('comments.posting');
    }

    try {
      await createComment({ content, postId, parentId });
      toast.success(t('comments.commentPosted'));

      if (parentId) {
        const replyContainer = form.closest('[data-reply-container]');
        if (replyContainer) replyContainer.remove();
      } else {
        textarea.value = '';
      }

      await refreshCommentList(postId);
    } catch (error) {
      const message =
        error.details?.message || error.message || t('comments.failedToPost');
      toast.error(message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = parentId
          ? t('comments.reply')
          : t('comments.comment');
      }
    }
  });

  document.addEventListener('click', async (event) => {
    if (event.target.closest('[data-action="login"]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeModal();
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 10);
      return;
    }

    const replyBtn = event.target.closest('[data-reply-to]');
    if (replyBtn) {
      const { isAuthenticated } = getAuthState();
      if (!isAuthenticated) {
        toast.error(t('comments.loginToReply'));
        return;
      }

      const parentId = Number(replyBtn.getAttribute('data-reply-to'));
      const commentEl = replyBtn.closest('[data-comment-id]');
      if (!commentEl) return;

      commentEl.querySelector('[data-reply-container]')?.remove();

      const section = document.querySelector('[data-comments-section]');
      const postId = Number(section?.dataset.postId);

      const replyContainer = document.createElement('div');
      replyContainer.setAttribute('data-reply-container', '');
      replyContainer.innerHTML = renderCommentForm({
        postId,
        parentId,
        placeholder: t('comments.writeReplyPlaceholder'),
      });
      commentEl.appendChild(replyContainer);
      replyContainer.querySelector('textarea')?.focus();
      return;
    }

    if (event.target.closest('[data-cancel-reply]')) {
      event.target.closest('[data-reply-container]')?.remove();
      return;
    }

    const editBtn = event.target.closest('[data-edit-comment]');
    if (editBtn) {
      const commentId = Number(editBtn.getAttribute('data-edit-comment'));
      const commentEl = document.querySelector(
        `[data-comment-id="${commentId}"]`
      );
      if (!commentEl) return;

      const bodyEl = commentEl.querySelector(
        `[data-comment-body="${commentId}"]`
      );
      if (!bodyEl) return;

      const originalText = bodyEl.textContent.trim();

      bodyEl.innerHTML = `
        <form data-edit-comment-form data-comment-id="${commentId}">
          <textarea 
            name="content"
            rows="3"
            class="modal__comment-input"
            minlength="1"
            maxlength="2000"
          >${escapeHtml(originalText)}</textarea>
          <div class="modal-actions">
            <button class="btn btn-ghost" type="button" data-cancel-edit="${commentId}">${t('comments.cancel')}</button>
            <button class="btn btn-primary" type="submit">${t('comments.save')}</button>
          </div>
        </form>
      `;
      bodyEl.querySelector('textarea')?.focus();
      return;
    }

    const cancelEdit = event.target.closest('[data-cancel-edit]');
    if (cancelEdit) {
      const commentId = Number(cancelEdit.getAttribute('data-cancel-edit'));
      const section = document.querySelector('[data-comments-section]');
      const postId = Number(section?.dataset.postId);
      await refreshCommentList(postId);
      return;
    }

    const deleteBtn = event.target.closest('[data-delete-comment]');
    if (deleteBtn) {
      const commentId = Number(deleteBtn.getAttribute('data-delete-comment'));
      const section = document.querySelector('[data-comments-section]');
      const postId = Number(section?.dataset.postId);

      const confirmed = await openConfirm({
        title: t('comments.deleteConfirmTitle'),
        message: t('comments.deleteConfirmMessage'),
      });

      if (!confirmed) return;

      deleteBtn.disabled = true;

      try {
        await deleteComment(commentId);
        toast.success(t('comments.commentDeleted'));
        await refreshCommentList(postId);
      } catch (error) {
        const message =
          error.details?.message || error.message || t('comments.deleteFailed');
        toast.error(message);
        deleteBtn.disabled = false;
      }
      return;
    }
  });

  document.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-edit-comment-form]');
    if (!form) return;

    event.preventDefault();

    const commentId = Number(form.dataset.commentId);
    const content =
      form.querySelector('textarea[name="content"]')?.value.trim() || '';
    const section = document.querySelector('[data-comments-section]');
    const postId = Number(section?.dataset.postId);

    if (!content) {
      toast.error(t('comments.commentEmpty'));
      return;
    }
    if (content.length > 2000) {
      toast.error(t('comments.commentTooLong'));
      return;
    }
    if (content.length > 2000) {
      toast.error('Comment must not exceed 2000 characters.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = t('comments.saving');
    }

    try {
      await updateComment(commentId, { content });
      toast.success(t('comments.commentUpdated'));
      await refreshCommentList(postId);
    } catch (error) {
      const message =
        error.details?.message || error.message || t('comments.updateFailed');
      toast.error(message);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = t('comments.save');
      }
    }
  });

  _isBound = true;
};
