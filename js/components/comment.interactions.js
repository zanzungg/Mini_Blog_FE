import { toast } from '../utils/toast.js';
import { getAuthState } from '../core/store.js';
import { closeModal } from './modal.js';
import { initConfirmModal, openConfirm } from './modal_confirm.js';
import {
  createComment,
  updateComment,
  deleteComment,
} from '../modules/comment/comment.service.js';
import { renderComments, renderCommentForm } from './comment.ui.js';

let _isBound = false;

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Refresh chỉ phần comment list trong modal
const refreshCommentList = async (postId, getCommentsFn) => {
  const section = document.querySelector('[data-comments-section]');
  if (!section) return;

  const listEl = section.querySelector('[data-comments-list]');
  if (!listEl) return;

  listEl.innerHTML = '<p>Refreshing comments...</p>';

  try {
    const { items } = await getCommentsFn(postId);
    const count = section.querySelector('.modal__section-title');
    if (count) count.textContent = `Comments (${items.length})`;
    listEl.innerHTML = items.length
      ? renderComments(items)
      : '<p class="modal__comment-empty">No comments yet. Be the first!</p>';
  } catch {
    listEl.innerHTML = '<p>Unable to refresh comments.</p>';
  }
};

export const bindCommentInteractions = (getCommentsFn) => {
  if (_isBound) return;

  initConfirmModal();

  // Submit: thêm comment hoặc reply
  document.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-comment-form]');
    if (!form) return;

    event.preventDefault();

    const { isAuthenticated } = getAuthState();
    if (!isAuthenticated) {
      toast.error('Please sign in to comment.');
      return;
    }

    const postId = Number(form.dataset.postId);
    const parentId = form.dataset.parentId
      ? Number(form.dataset.parentId)
      : null;
    const textarea = form.querySelector('textarea[name="content"]');
    const content = textarea?.value.trim() || '';

    if (!content) {
      toast.error('Comment cannot be empty.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting...';
    }

    try {
      await createComment({ content, postId, parentId });
      toast.success('Comment posted.');

      // Reset form về dạng ban đầu nếu là reply form
      if (parentId) {
        const replyContainer = form.closest('[data-reply-container]');
        if (replyContainer) replyContainer.remove();
      } else {
        textarea.value = '';
      }

      await refreshCommentList(postId, getCommentsFn);
    } catch (error) {
      const message =
        error.details?.message || error.message || 'Failed to post comment';
      toast.error(message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = parentId ? 'Reply' : 'Comment';
      }
    }
  });

  // Click: Reply / Edit / Delete / Cancel reply
  document.addEventListener('click', async (event) => {
    if (event.target.closest('[data-action="login"]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeModal();
      setTimeout(() => {
        window.location.hash = '#/auth/login';
      }, 10);
      return;
    }

    // Reply button — thêm inline reply form
    const replyBtn = event.target.closest('[data-reply-to]');
    if (replyBtn) {
      const { isAuthenticated } = getAuthState();
      if (!isAuthenticated) {
        toast.error('Please sign in to reply.');
        return;
      }

      const parentId = Number(replyBtn.getAttribute('data-reply-to'));
      const commentEl = replyBtn.closest('[data-comment-id]');
      if (!commentEl) return;

      // Remove existing reply form nếu có
      commentEl.querySelector('[data-reply-container]')?.remove();

      const section = document.querySelector('[data-comments-section]');
      const postId = Number(section?.dataset.postId);

      const replyContainer = document.createElement('div');
      replyContainer.setAttribute('data-reply-container', '');
      replyContainer.innerHTML = renderCommentForm({
        postId,
        parentId,
        placeholder: 'Write a reply...',
      });
      commentEl.appendChild(replyContainer);
      replyContainer.querySelector('textarea')?.focus();
      return;
    }

    // Cancel reply
    if (event.target.closest('[data-cancel-reply]')) {
      event.target.closest('[data-reply-container]')?.remove();
      return;
    }

    // Edit comment — inline edit
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

      // Lấy text gốc (bỏ html entities)
      const originalText = bodyEl.textContent.trim();

      bodyEl.innerHTML = `
        <form data-edit-comment-form data-comment-id="${commentId}">
          <textarea name="content" rows="3" class="modal__comment-input">${escapeHtml(originalText)}</textarea>
          <div class="modal-actions">
            <button class="btn btn-ghost" type="button" data-cancel-edit="${commentId}">Cancel</button>
            <button class="btn btn-primary" type="submit">Save</button>
          </div>
        </form>
      `;
      bodyEl.querySelector('textarea')?.focus();
      return;
    }

    // Cancel edit
    const cancelEdit = event.target.closest('[data-cancel-edit]');
    if (cancelEdit) {
      const commentId = Number(cancelEdit.getAttribute('data-cancel-edit'));
      const section = document.querySelector('[data-comments-section]');
      const postId = Number(section?.dataset.postId);
      await refreshCommentList(postId, getCommentsFn);
      return;
    }

    // Delete comment
    const deleteBtn = event.target.closest('[data-delete-comment]');
    if (deleteBtn) {
      const commentId = Number(deleteBtn.getAttribute('data-delete-comment'));
      const section = document.querySelector('[data-comments-section]');
      const postId = Number(section?.dataset.postId);

      const confirmed = await openConfirm({
        title: 'Delete this comment?',
        message: 'This action cannot be undone.',
      });

      if (!confirmed) {
        return;
      }

      deleteBtn.disabled = true;

      try {
        await deleteComment(commentId);
        toast.success('Comment deleted.');
        await refreshCommentList(postId, getCommentsFn);
      } catch (error) {
        const message =
          error.details?.message || error.message || 'Delete failed';
        toast.error(message);
        deleteBtn.disabled = false;
      }
      return;
    }
  });

  // Submit edit form
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
      toast.error('Comment cannot be empty.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }

    try {
      await updateComment(commentId, { content });
      toast.success('Comment updated.');
      await refreshCommentList(postId, getCommentsFn);
    } catch (error) {
      const message =
        error.details?.message || error.message || 'Update failed';
      toast.error(message);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save';
      }
    }
  });

  _isBound = true;
};
