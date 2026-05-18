import { toast } from '../../utils/toast.js';
import { getAuthState, setAuthState } from '../../core/store.js';
import { initModal, openModal, closeModal } from '../../components/modal.js';
import {
  initConfirmModal,
  openConfirm,
} from '../../components/modal_confirm.js';
import {
  renderPostForm,
  initPostFormCategories,
} from '../../components/post.form.js';
import { updateUserProfile } from './user.service.js';
import {
  getPostById,
  getMyPosts,
  createPost,
  updatePost,
  publishPost,
  deletePost,
} from '../post/post.service.js';
import { bindCommentInteractions } from '../../components/comment.interactions.js';
import { renderMyPostCard } from '../../components/post.card.js';
import { renderOwnerPostModal } from '../../components/post.modal.js';
import { renderPagination } from '../../components/pagination.js';
import { escapeHtml } from '../../components/utils.js';
import { t } from '../../utils/i18n.js';

let isProfileBound = false;
let isMyPostsBound = false;

let myPostsState = {
  page: 1,
  limit: 6,
  keyword: '',
  status: '',
};

const validatePostForm = (title, content, mode) => {
  if (!title) {
    return t('myPosts.titleRequired');
  }
  if (title.length > 200) {
    return t('myPosts.titleMax');
  }
  if (!content) {
    return mode === 'create'
      ? t('myPosts.contentRequiredCreate')
      : t('myPosts.contentRequiredEdit');
  }
  return null;
};

const renderPostActions = (post) => {
  if (!post) return '';
  const isDraft = post.published === false;
  return `
    <div class="modal-actions">
      ${
        isDraft
          ? `
        <button class="btn btn-ghost" type="button" data-post-edit="${post.id}">${t('myPosts.edit')}</button>
        <button class="btn btn-primary" type="button" data-post-publish="${post.id}">${t('myPosts.publish')}</button>
      `
          : ''
      }
      <button class="btn btn-danger" type="button" data-post-delete="${post.id}">${t('myPosts.delete')}</button>
    </div>
  `;
};

const renderPostModalContent = (post, comments = []) =>
  renderOwnerPostModal(post, comments, renderPostActions);

const renderProfileCard = () => {
  const { isAuthenticated, user } = getAuthState();

  if (!isAuthenticated || !user) {
    return `
      <section class="auth">
        <div class="auth-card">
          <div>
            <h2 class="auth-title">${t('profile.loginToView')}</h2>
            <p class="auth-subtitle">${t('profile.accountDetails')}</p>
          </div>
          <a class="btn btn-primary" href="#/login">${t('profile.goToLogin')}</a>
        </div>
      </section>
    `;
  }

  return `
    <section class="section profile">
      <div class="profile-card">
        <div>
          <h2 class="section-title">${t('profile.myProfile')}</h2>
          <p class="posts-subtitle">${t('profile.updateSubtitle')}</p>
        </div>
        <form class="profile-form" data-profile-form>
          <label class="profile-field">
            <span>${t('profile.name')}</span>
            <input type="text" name="name" value="${escapeHtml(user.name || '')}" placeholder="${t('profile.yourName')}" 
            minlength="2" maxlength="50" required />
          </label>
          <label class="profile-field">
            <span>${t('profile.email')}</span>
            <input type="email" name="email" value="${escapeHtml(user.email || '')}" readonly />
          </label>
          <button class="btn btn-primary" type="submit">${t('profile.saveChanges')}</button>
        </form>
      </div>
    </section>
  `;
};

const renderMyPostsList = (posts) => {
  if (!posts.length) return `<p>${t('myPosts.noPostsFiltered')}</p>`;
  return posts.map(renderMyPostCard).join('');
};

const updateMyPosts = async () => {
  const listEl = document.querySelector('[data-my-posts-list]');
  const paginationEl = document.querySelector('[data-my-posts-pagination]');
  if (!listEl || !paginationEl) return;

  listEl.innerHTML = `<p>${t('myPosts.loadingYourPosts')}</p>`;
  paginationEl.innerHTML = '';

  try {
    const params = { page: myPostsState.page, limit: myPostsState.limit };
    if (myPostsState.keyword) params.keyword = myPostsState.keyword;
    if (myPostsState.status) params.status = myPostsState.status;

    const { items, meta } = await getMyPosts(params);
    listEl.innerHTML = renderMyPostsList(items);
    paginationEl.innerHTML = renderPagination(meta, {
      prefix: 'my-posts-page',
    });
  } catch (error) {
    const message =
      error.details?.message || error.message || t('errors.requestFailed');
    listEl.innerHTML = `<p>${t('myPosts.unableLoadYourPosts')}</p>`;
    paginationEl.innerHTML = '';
    toast.error(message);
  }
};

const bindProfileInteractions = () => {
  if (isProfileBound) return;

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-profile-form]');
    if (!form) return;

    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const { user } = getAuthState();

    if (!user) {
      toast.error(t('profile.loginToUpdate'));
      return;
    }
    if (!name) {
      toast.error(t('profile.nameRequired'));
      return;
    }
    if (name.length < 2) {
      toast.error(t('profile.nameMin'));
      return;
    }
    if (name.length > 50) {
      toast.error(t('profile.nameMax'));
      return;
    }
    if (name === (user.name || '').trim()) {
      toast.error(t('profile.noChanges'));
      return;
    }

    const setLoading = (isLoading) => {
      if (!submitButton) return;
      submitButton.disabled = isLoading;
      submitButton.textContent = isLoading
        ? t('profile.saving')
        : t('profile.saveChanges');
    };

    setLoading(true);
    updateUserProfile({ id: user.id, name })
      .then((updatedUser) => {
        if (!updatedUser) {
          toast.error(t('profile.profileUpdateNoData'));
          return;
        }
        setAuthState({ user: { ...user, ...updatedUser } });
        toast.success(t('profile.profileUpdated'));
      })
      .catch((error) => {
        const message =
          error.details?.message || error.message || t('profile.updateFailed');
        toast.error(message);
      })
      .finally(() => setLoading(false));
  });

  isProfileBound = true;
};

const bindMyPostsInteractions = () => {
  let _cachedPost = null;
  if (isMyPostsBound) return;

  bindCommentInteractions();

  const handlePostTrigger = async (postId) => {
    if (!Number.isFinite(postId)) return;
    if (!document.querySelector('[data-my-posts-list]')) return;

    openModal(`<p>${t('posts.loadingPostDetails')}</p>`);
    try {
      const post = await getPostById(postId);
      if (!post) {
        openModal(`<p>${t('posts.postNotFound')}</p>`);
        return;
      }

      const comments = post.comments ?? [];

      _cachedPost = post;

      openModal(renderPostModalContent(post, comments));
    } catch (error) {
      const message =
        error.details?.message || error.message || t('errors.requestFailed');
      openModal(`<p>${t('posts.unableLoadPostDetails')}</p>`);
      toast.error(message);
    }
  };

  // Search
  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-my-posts-search-form]');
    if (!form) return;
    event.preventDefault();
    const input = form.querySelector('[data-my-posts-search]');
    if (!input) return;
    myPostsState = { ...myPostsState, page: 1, keyword: input.value.trim() };
    updateMyPosts();
  });

  // Status filter
  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-my-posts-status]');
    if (!select) return;
    myPostsState = { ...myPostsState, page: 1, status: select.value };
    updateMyPosts();
  });

  // Click handler
  document.addEventListener('click', async (event) => {
    // Pagination
    const pageButton = event.target.closest('[data-my-posts-page]');
    if (pageButton?.closest('[data-my-posts-pagination]')) {
      if (pageButton.disabled) return;
      const nextPage = Number(pageButton.getAttribute('data-my-posts-page'));
      if (!Number.isFinite(nextPage) || nextPage < 1) return;
      myPostsState = { ...myPostsState, page: nextPage };
      updateMyPosts();
      return;
    }

    // Create post
    if (event.target.closest('[data-create-post]')) {
      openModal(renderPostForm({ mode: 'create' }));
      initPostFormCategories(null);
      return;
    }

    // Edit draft
    const editTrigger = event.target.closest('[data-post-edit]');
    if (editTrigger) {
      event.stopPropagation();
      if (!_cachedPost) {
        toast.error(t('myPosts.postDataUnavailable'));
        return;
      }
      openModal(renderPostForm({ mode: 'edit', post: _cachedPost }));
      initPostFormCategories(_cachedPost.categoryId ?? null);
      return;
    }

    // Publish draft
    const publishTrigger = event.target.closest('[data-post-publish]');
    if (publishTrigger) {
      event.stopPropagation();
      const postId = Number(publishTrigger.getAttribute('data-post-publish'));
      const confirmed = await openConfirm({
        title: t('myPosts.publishConfirmTitle'),
        message: t('myPosts.publishConfirmMessage'),
      });
      if (!confirmed) return;

      publishTrigger.disabled = true;
      publishTrigger.textContent = t('myPosts.publishLoading');
      publishPost(postId)
        .then(() => {
          toast.success(t('myPosts.postPublished'));
          closeModal();
          myPostsState = { ...myPostsState, page: 1 };
          updateMyPosts();
        })
        .catch((error) => {
          const message =
            error.details?.message ||
            error.message ||
            t('myPosts.publishFailed');
          toast.error(message);
          publishTrigger.disabled = false;
          publishTrigger.textContent = t('myPosts.publish');
        });
      return;
    }

    // Delete post
    const deleteTrigger = event.target.closest('[data-post-delete]');
    if (deleteTrigger) {
      event.stopPropagation();
      const postId = Number(deleteTrigger.getAttribute('data-post-delete'));
      const confirmed = await openConfirm({
        title: t('myPosts.deleteConfirmTitle'),
        message: t('myPosts.deleteConfirmMessage'),
      });
      if (!confirmed) return;

      deleteTrigger.disabled = true;
      deleteTrigger.textContent = t('myPosts.deleteLoading');
      deletePost(postId)
        .then(() => {
          toast.success(t('myPosts.postDeleted'));
          closeModal();
          myPostsState = { ...myPostsState, page: 1 };
          updateMyPosts();
        })
        .catch((error) => {
          const message =
            error.details?.message ||
            error.message ||
            t('myPosts.deleteFailed');
          toast.error(message);
          deleteTrigger.disabled = false;
          deleteTrigger.textContent = t('myPosts.delete');
        });
      return;
    }

    const postTrigger = event.target.closest('[data-post-id]');
    if (postTrigger && !event.target.closest('[data-modal]')) {
      if (!document.querySelector('[data-my-posts-list]')) return;
      handlePostTrigger(Number(postTrigger.dataset.postId));
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const trigger = event.target.closest('[data-post-id]');
    if (!trigger || event.target.closest('[data-modal]')) return;
    if (!document.querySelector('[data-my-posts-list]')) return;
    event.preventDefault();
    handlePostTrigger(Number(trigger.dataset.postId));
  });

  // Submit: create / edit post form
  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-post-form]');
    if (!form) return;

    if (!document.querySelector('[data-my-posts-list]')) return;
    event.preventDefault();

    const mode = form.dataset.mode;
    const postId = Number(form.dataset.postId);
    const formData = new FormData(form);
    const title = String(formData.get('title') || '').trim();
    const content = String(formData.get('content') || '').trim();
    const rawCategory = formData.get('categoryId');
    const categoryId = rawCategory ? Number(rawCategory) : undefined;

    const validationError = validatePostForm(title, content, mode);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const setLoading = (isLoading) => {
      if (!submitButton) return;
      submitButton.disabled = isLoading;
      submitButton.textContent = isLoading
        ? t('myPosts.saveLoading')
        : t('myPosts.save');
    };

    setLoading(true);

    const action =
      mode === 'create'
        ? createPost({ title, content, categoryId })
        : updatePost(postId, {
            title,
            content,
            categoryId: categoryId ?? null,
          });

    action
      .then(() => {
        toast.success(
          mode === 'create'
            ? t('myPosts.postCreated')
            : t('myPosts.postUpdated')
        );
        myPostsState = { ...myPostsState, page: 1 };
        closeModal();
        updateMyPosts();
      })
      .catch((error) => {
        const message =
          error.details?.message || error.message || t('myPosts.saveFailed');
        toast.error(message);
      })
      .finally(() => setLoading(false));
  });

  isMyPostsBound = true;
};

export const initMyProfilePage = () => {
  initModal();
  bindProfileInteractions();
};

export const initMyPostsPage = () => {
  initModal();
  initConfirmModal();
  bindMyPostsInteractions();
  updateMyPosts();
};

export const myProfilePage = () => renderProfileCard();

export const myPostsPage = () => {
  const { isAuthenticated, user } = getAuthState();

  if (!isAuthenticated || !user) {
    return `
      <section class="auth">
        <div class="auth-card">
          <div>
            <h2 class="auth-title">${t('myPosts.loginToManage')}</h2>
            <p class="auth-subtitle">${t('myPosts.loginSubtitle')}</p>
          </div>
          <a class="btn btn-primary" href="#/login">${t('profile.goToLogin')}</a>
        </div>
      </section>
    `;
  }

  return `
    <section class="section my-posts">
      <div class="posts-header">
        <div>
          <h2 class="section-title">${t('myPosts.myPosts')}</h2>
          <p class="posts-subtitle">${t('myPosts.manageSubtitle')}</p>
        </div>
        <div class="posts-actions">
          <form class="posts-search" data-my-posts-search-form>
            <input
              class="posts-search__input"
              type="search"
              placeholder="${t('myPosts.searchPlaceholder')}"
              data-my-posts-search
            />
            <button class="btn btn-ghost" type="submit">${t('myPosts.searchButton')}</button>
          </form>
          <select class="posts-select" data-my-posts-status>
            <option value="">${t('myPosts.allStatus')}</option>
            <option value="published">${t('myPosts.published')}</option>
            <option value="draft">${t('myPosts.draft')}</option>
          </select>
          <button class="btn btn-primary" type="button" data-create-post>${t('myPosts.createPost')}</button>
        </div>
      </div>
      <div class="posts-grid" data-my-posts-list>
        <p>${t('myPosts.loadingYourPosts')}</p>
      </div>
      <div class="pagination" data-my-posts-pagination></div>
    </section>
  `;
};
