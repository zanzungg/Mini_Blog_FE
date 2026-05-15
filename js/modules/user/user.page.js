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
    return 'Title is required.';
  }
  if (title.length > 200) {
    return 'Title must not exceed 200 characters.';
  }
  if (!content) {
    return mode === 'create'
      ? 'Content is required.'
      : 'Content cannot be empty.';
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
        <button class="btn btn-ghost" type="button" data-post-edit="${post.id}">Edit</button>
        <button class="btn btn-primary" type="button" data-post-publish="${post.id}">Publish</button>
      `
          : ''
      }
      <button class="btn btn-danger" type="button" data-post-delete="${post.id}">Delete</button>
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
            <h2 class="auth-title">Login to view your profile</h2>
            <p class="auth-subtitle">Your account details will appear here.</p>
          </div>
          <a class="btn btn-primary" href="#/login">Go to login</a>
        </div>
      </section>
    `;
  }

  return `
    <section class="section profile">
      <div class="profile-card">
        <div>
          <h2 class="section-title">My Profile</h2>
          <p class="posts-subtitle">Update your display name and review your email.</p>
        </div>
        <form class="profile-form" data-profile-form>
          <label class="profile-field">
            <span>Name</span>
            <input type="text" name="name" value="${escapeHtml(user.name || '')}" placeholder="Your name" 
            minlength="2" maxlength="50" required />
          </label>
          <label class="profile-field">
            <span>Email</span>
            <input type="email" name="email" value="${escapeHtml(user.email || '')}" readonly />
          </label>
          <button class="btn btn-primary" type="submit">Save changes</button>
        </form>
      </div>
    </section>
  `;
};

const renderMyPostsList = (posts) => {
  if (!posts.length) return '<p>No posts match your current filters.</p>';
  return posts.map(renderMyPostCard).join('');
};

const updateMyPosts = async () => {
  const listEl = document.querySelector('[data-my-posts-list]');
  const paginationEl = document.querySelector('[data-my-posts-pagination]');
  if (!listEl || !paginationEl) return;

  listEl.innerHTML = '<p>Loading your posts...</p>';
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
    const message = error.details?.message || error.message || 'Request failed';
    listEl.innerHTML = '<p>Unable to load your posts.</p>';
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
      toast.error('Please login to update your profile.');
      return;
    }
    if (!name) {
      toast.error('Name is required.');
      return;
    }
    if (name.length < 2) {
      toast.error('Name must be at least 2 characters.');
      return;
    }
    if (name.length > 50) {
      toast.error('Name must not exceed 50 characters.');
      return;
    }
    if (name === (user.name || '').trim()) {
      toast.error('No changes detected.');
      return;
    }

    const setLoading = (isLoading) => {
      if (!submitButton) return;
      submitButton.disabled = isLoading;
      submitButton.textContent = isLoading ? 'Saving...' : 'Save changes';
    };

    setLoading(true);
    updateUserProfile({ id: user.id, name })
      .then((updatedUser) => {
        if (!updatedUser) {
          toast.error('Profile update returned no data.');
          return;
        }
        setAuthState({ user: { ...user, ...updatedUser } });
        toast.success('Profile updated.');
      })
      .catch((error) => {
        const message =
          error.details?.message || error.message || 'Update failed';
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

    openModal('<p>Loading post details...</p>');
    try {
      const post = await getPostById(postId);
      if (!post) {
        openModal('<p>Post not found.</p>');
        return;
      }

      const comments = post.comments ?? [];

      _cachedPost = post;

      openModal(renderPostModalContent(post, comments));
    } catch (error) {
      const message =
        error.details?.message || error.message || 'Request failed';
      openModal('<p>Unable to load post details.</p>');
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
        toast.error('Post data not available.');
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
        title: 'Publish this post?',
        message: 'Once published, the post cannot be edited. Are you sure?',
      });
      if (!confirmed) return;

      publishTrigger.disabled = true;
      publishTrigger.textContent = 'Publishing...';
      publishPost(postId)
        .then(() => {
          toast.success('Post published!');
          closeModal();
          myPostsState = { ...myPostsState, page: 1 };
          updateMyPosts();
        })
        .catch((error) => {
          const message =
            error.details?.message || error.message || 'Publish failed';
          toast.error(message);
          publishTrigger.disabled = false;
          publishTrigger.textContent = 'Publish';
        });
      return;
    }

    // Delete post
    const deleteTrigger = event.target.closest('[data-post-delete]');
    if (deleteTrigger) {
      event.stopPropagation();
      const postId = Number(deleteTrigger.getAttribute('data-post-delete'));
      const confirmed = await openConfirm({
        title: 'Delete this post?',
        message:
          'This action cannot be undone. The post will be permanently deleted.',
      });
      if (!confirmed) return;

      deleteTrigger.disabled = true;
      deleteTrigger.textContent = 'Deleting...';
      deletePost(postId)
        .then(() => {
          toast.success('Post deleted.');
          closeModal();
          myPostsState = { ...myPostsState, page: 1 };
          updateMyPosts();
        })
        .catch((error) => {
          const message =
            error.details?.message || error.message || 'Delete failed';
          toast.error(message);
          deleteTrigger.disabled = false;
          deleteTrigger.textContent = 'Delete';
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
      submitButton.textContent = isLoading ? 'Saving...' : 'Save';
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
        toast.success(mode === 'create' ? 'Post created!' : 'Post updated!');
        myPostsState = { ...myPostsState, page: 1 };
        closeModal();
        updateMyPosts();
      })
      .catch((error) => {
        const message =
          error.details?.message || error.message || 'Save failed';
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
            <h2 class="auth-title">Login to manage your posts</h2>
            <p class="auth-subtitle">Create, edit, and publish your stories after logging in.</p>
          </div>
          <a class="btn btn-primary" href="#/login">Go to login</a>
        </div>
      </section>
    `;
  }

  return `
    <section class="section my-posts">
      <div class="posts-header">
        <div>
          <h2 class="section-title">My Posts</h2>
          <p class="posts-subtitle">Manage drafts, published posts, and new ideas.</p>
        </div>
        <div class="posts-actions">
          <form class="posts-search" data-my-posts-search-form>
            <input
              class="posts-search__input"
              type="search"
              placeholder="Search your posts"
              data-my-posts-search
            />
            <button class="btn btn-ghost" type="submit">Search</button>
          </form>
          <select class="posts-select" data-my-posts-status>
            <option value="">All status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <button class="btn btn-primary" type="button" data-create-post>Create Post</button>
        </div>
      </div>
      <div class="posts-grid" data-my-posts-list>
        <p>Loading your posts...</p>
      </div>
      <div class="pagination" data-my-posts-pagination></div>
    </section>
  `;
};
