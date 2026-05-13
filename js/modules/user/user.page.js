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

import { getCommentsByPost } from '../comment/comment.service.js';
import { renderCommentsSection } from '../../components/comment.ui.js';
import { bindCommentInteractions } from '../../components/comment.interactions.js';

let isProfileBound = false;
let isMyPostsBound = false;

let myPostsState = {
  page: 1,
  limit: 6,
  keyword: '',
  status: '',
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDate = (value) => {
  if (!value) {
    return 'Unknown date';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const createExcerpt = (content = '', maxLength = 140) => {
  const normalized = String(content).replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return 'No summary available.';
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
};

const renderPostContent = (content = '') =>
  escapeHtml(content).replace(/\n/g, '<br />');

const renderPostActions = (post) => {
  if (!post) return '';

  const isDraft = post.published === false;

  return `
    <div class="modal-actions">
      ${
        isDraft
          ? `
        <button class="btn btn-ghost" type="button" data-post-edit="${post.id}">
          Edit
        </button>
        <button class="btn btn-primary" type="button" data-post-publish="${post.id}">
          Publish
        </button>
      `
          : ''
      }
      <button class="btn btn-danger" type="button" data-post-delete="${post.id}">
        Delete
      </button>
    </div>
  `;
};

const resolveCategoryLabel = (post) =>
  post.category?.name || post.category || 'General';

const resolveAuthorLabel = (post) =>
  post.author?.name || post.author?.email || 'You';

const renderPostModalContent = (post, comments = []) => {
  if (!post) {
    return '<p>Post not found.</p>';
  }

  const category = resolveCategoryLabel(post);
  const author = resolveAuthorLabel(post);
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
    ${renderPostActions(post)}
    ${renderCommentsSection({
      postId: post.id,
      comments,
      isPublished: post.published, // draft → ẩn form comment
    })}
  `;
};

const renderProfileCard = () => {
  const { isAuthenticated, user } = getAuthState();

  if (!isAuthenticated || !user) {
    return `
			<section class="auth">
				<div class="auth-card">
					<div>
						<h2 class="auth-title">Sign in to view your profile</h2>
						<p class="auth-subtitle">Your account details will appear here.</p>
					</div>
					<a class="btn btn-primary" href="#/auth/login">Go to login</a>
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
						<input type="text" name="name" value="${escapeHtml(
              user.name || ''
            )}" placeholder="Your name" required />
					</label>
					<label class="profile-field">
						<span>Email</span>
						<input type="email" name="email" value="${escapeHtml(
              user.email || ''
            )}" readonly />
					</label>
					<button class="btn btn-primary" type="submit">Save changes</button>
				</form>
			</div>
		</section>
	`;
};

const renderMyPostsList = (posts) => {
  if (!posts.length) {
    return '<p>No posts match your current filters.</p>';
  }

  return posts
    .map((post) => {
      const statusLabel = post.published ? 'Published' : 'Draft';
      const statusClass = post.published
        ? 'status-pill--success'
        : 'status-pill--draft';
      const category = resolveCategoryLabel(post);

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
    })
    .join('');
};

const renderMyPostsPagination = (meta) => {
  if (!meta || meta.totalPages <= 1) return '';

  const current = meta.page || 1;
  const total = meta.totalPages || 1;
  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return `
    <button class="btn btn-ghost" data-my-posts-page="${current - 1}" ${current === 1 ? 'disabled' : ''}>Prev</button>
    ${pages
      .map(
        (page) => `
        <button class="btn ${page === current ? 'btn-primary' : 'btn-ghost'}" data-my-posts-page="${page}">
          ${page}
        </button>
      `
      )
      .join('')}
    <button class="btn btn-ghost" data-my-posts-page="${current + 1}" ${current === total ? 'disabled' : ''}>Next</button>
  `;
};

const updateMyPosts = async () => {
  const listEl = document.querySelector('[data-my-posts-list]');
  const paginationEl = document.querySelector('[data-my-posts-pagination]');

  if (!listEl || !paginationEl) return;

  listEl.innerHTML = '<p>Loading your posts...</p>';
  paginationEl.innerHTML = '';

  try {
    const params = {
      page: myPostsState.page,
      limit: myPostsState.limit,
    };

    if (myPostsState.keyword) {
      params.keyword = myPostsState.keyword;
    }

    if (myPostsState.status) {
      params.status = myPostsState.status;
    }

    const { items, meta } = await getMyPosts(params);
    listEl.innerHTML = renderMyPostsList(items);
    paginationEl.innerHTML = renderMyPostsPagination(meta);
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
      toast.error('Please sign in to update your profile.');
      return;
    }
    if (!name) {
      toast.error('Name is required.');
      return;
    }
    if (!user.id) {
      toast.error('User id is missing.');
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

  bindCommentInteractions(getCommentsByPost);

  // Mở modal xem chi tiết post
  const handlePostTrigger = async (postId) => {
    if (!Number.isFinite(postId)) return;

    openModal('<p>Loading post details...</p>');

    try {
      const post = await getPostById(postId);

      if (!post) {
        openModal('<p>Post not found.</p>');
        return;
      }
      let comments = [];
      try {
        ({ items: comments } = await getCommentsByPost(postId));
      } catch {
        toast.error('Unable to load comments.');
      }
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

  // Filter status
  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-my-posts-status]');
    if (!select) return;

    myPostsState = { ...myPostsState, page: 1, status: select.value };
    updateMyPosts();
  });

  // Click: pagination / create / edit / publish / open post
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
      initPostFormCategories(null); // load categories vào dropdown
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

    // Open post detail
    const postTrigger = event.target.closest('[data-post-id]');

    if (postTrigger) {
      // Ignore clicks inside modal
      if (event.target.closest('[data-modal]')) {
        return;
      }

      const postId = Number(postTrigger.dataset.postId);

      handlePostTrigger(postId);
    }
  });

  // Keyboard: open post detail
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const trigger = event.target.closest('[data-post-id]');
    if (!trigger) return;
    if (event.target.closest('[data-modal]')) return;
    event.preventDefault();
    const postId = Number(trigger.dataset.postId);
    handlePostTrigger(postId);
  });

  // Submit post form (create / edit)
  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-post-form]');
    if (!form) return;

    event.preventDefault();

    const mode = form.dataset.mode;
    const postId = Number(form.dataset.postId);
    const formData = new FormData(form);
    const title = String(formData.get('title') || '').trim();
    const content = String(formData.get('content') || '').trim();

    const rawCategory = formData.get('categoryId');
    const categoryId = rawCategory ? Number(rawCategory) : undefined;

    if (!title || !content) {
      toast.error('Please fill in title and content.');
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
            <h2 class="auth-title">Sign in to manage your posts</h2>
            <p class="auth-subtitle">Create, edit, and publish your stories after logging in.</p>
          </div>
          <a class="btn btn-primary" href="#/auth/login">Go to login</a>
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
