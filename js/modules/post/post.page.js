import { toast } from '../../utils/toast.js';
import { getPosts, getPostById } from './post.service.js';
import { getCategories } from '../category/category.service.js';
import { initModal, openModal } from '../../components/modal.js';

import { getCommentsByPost } from '../comment/comment.service.js';
import { renderCommentsSection } from '../../components/comment.ui.js';
import { bindCommentInteractions } from '../../components/comment.interactions.js';

let isPostsBound = false;
let postsState = {
  page: 1,
  limit: 6,
  keyword: '',
  categoryId: '',
};
let pendingCategorySlug = '';

const getHashParams = () => {
  const hash = window.location.hash || '';
  const queryIndex = hash.indexOf('?');
  if (queryIndex === -1) {
    return new URLSearchParams();
  }

  return new URLSearchParams(hash.slice(queryIndex + 1));
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

const renderPostModalContent = (post, comments = []) => {
  if (!post) {
    return '<p>Post not found.</p>';
  }

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

const renderPosts = (posts) => {
  if (!posts.length) {
    return '<p>No posts found.</p>';
  }

  return posts
    .map((post) => {
      const category = post.category?.name || 'General';
      const author =
        post.author?.name || post.author?.email || 'Unknown author';

      return `
        <article class="post-card post-card--clickable" data-post-id="${post.id}" role="button" tabindex="0">
          <span>${escapeHtml(category)} · ${escapeHtml(
            formatDate(post.createdAt)
          )}</span>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(createExcerpt(post.content))}</p>
          <p class="hero-meta">By ${escapeHtml(author)}</p>
        </article>
      `;
    })
    .join('');
};

const renderPagination = (meta) => {
  if (!meta || meta.totalPages <= 1) {
    return '';
  }

  const current = meta.page || 1;
  const total = meta.totalPages || 1;
  const pages = Array.from({ length: total }, (_, index) => index + 1);

  return `
    <button class="btn btn-ghost" data-page="${current - 1}" ${
      current === 1 ? 'disabled' : ''
    }>
      Prev
    </button>
    ${pages
      .map(
        (page) => `
          <button class="btn ${page === current ? 'btn-primary' : 'btn-ghost'}" data-page="${page}">
            ${page}
          </button>
        `
      )
      .join('')}
    <button class="btn btn-ghost" data-page="${current + 1}" ${
      current === total ? 'disabled' : ''
    }>
      Next
    </button>
  `;
};

const renderCategoryOptions = (categories) => {
  if (!categories.length) {
    return '<option value="">All categories</option>';
  }

  return [
    '<option value="">All categories</option>',
    ...categories.map(
      (category) =>
        `<option value="${category.id}">${escapeHtml(category.name)}</option>`
    ),
  ].join('');
};

const updatePosts = async () => {
  const listEl = document.querySelector('[data-post-list]');
  const paginationEl = document.querySelector('[data-post-pagination]');

  if (!listEl || !paginationEl) {
    return;
  }

  listEl.innerHTML = '<p>Loading posts...</p>';
  paginationEl.innerHTML = '';

  try {
    const params = {
      page: postsState.page,
      limit: postsState.limit,
    };

    if (postsState.keyword) {
      params.keyword = postsState.keyword;
    }

    if (postsState.categoryId) {
      params.category_id = postsState.categoryId;
    }

    const { items, meta } = await getPosts(params);
    listEl.innerHTML = renderPosts(items);
    paginationEl.innerHTML = renderPagination(meta);
  } catch (error) {
    const message = error.details?.message || error.message || 'Request failed';
    listEl.innerHTML = '<p>Unable to load posts.</p>';
    paginationEl.innerHTML = '';
    toast.error(message);
  }
};

const bindPostsInteractions = () => {
  if (isPostsBound) {
    return;
  }

  bindCommentInteractions(getCommentsByPost);

  isPostsBound = true;

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-post-search-form]');
    if (!form) {
      return;
    }

    const input = form.querySelector('[data-post-search]');
    if (!input) {
      return;
    }

    event.preventDefault();
    postsState = {
      ...postsState,
      page: 1,
      keyword: input.value.trim(),
    };
    if (!postsState.categoryId) {
      window.location.hash = '#/posts';
    }
    updatePosts();
  });

  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-post-category]');
    if (!select) {
      return;
    }

    const selectedSlug = select.selectedOptions?.[0]?.dataset?.slug || '';
    postsState = {
      ...postsState,
      page: 1,
      categoryId: select.value,
    };
    if (selectedSlug) {
      window.location.hash = `#/posts?category=${selectedSlug}`;
    } else {
      window.location.hash = '#/posts';
    }
    updatePosts();
  });

  document.addEventListener('click', async (event) => {
    if (event.target.closest('[data-modal]')) {
      return;
    }

    const pageButton = event.target.closest('[data-page]');
    if (pageButton && pageButton.closest('[data-post-pagination]')) {
      if (pageButton.disabled) {
        return;
      }

      const nextPage = Number(pageButton.getAttribute('data-page'));
      if (!Number.isFinite(nextPage) || nextPage < 1) {
        return;
      }

      postsState = {
        ...postsState,
        page: nextPage,
      };
      if (postsState.categoryId) {
        const categorySelect = document.querySelector('[data-post-category]');
        const selectedSlug =
          categorySelect?.selectedOptions?.[0]?.dataset?.slug || '';
        if (selectedSlug) {
          window.location.hash = `#/posts?category=${selectedSlug}`;
        }
      }
      updatePosts();
      return;
    }

    const trigger = event.target.closest('[data-post-id]');
    if (!trigger) {
      return;
    }

    const id = Number(trigger.getAttribute('data-post-id'));
    if (!Number.isFinite(id)) {
      return;
    }

    openModal('<p>Loading post details...</p>');

    try {
      const post = await getPostById(id);
      if (!post) {
        openModal('<p>Post not found.</p>');
        return;
      }
      let comments = [];
      try {
        ({ items: comments } = await getCommentsByPost(id));
      } catch {
        toast.error('Unable to load comments.');
      }
      openModal(renderPostModalContent(post, comments));
    } catch (error) {
      const message =
        error.details?.message || error.message || 'Request failed';
      openModal('<p>Unable to load post details.</p>');
      toast.error(message);
    }
  });

  document.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    if (event.target.closest('[data-modal]')) {
      return;
    }

    const trigger = event.target.closest('[data-post-id]');
    if (!trigger) {
      return;
    }

    event.preventDefault();
    const id = Number(trigger.getAttribute('data-post-id'));
    if (!Number.isFinite(id)) {
      return;
    }

    openModal('<p>Loading post details...</p>');

    try {
      const post = await getPostById(id);
      if (!post) {
        openModal('<p>Post not found.</p>');
        return;
      }
      let comments = [];
      try {
        ({ items: comments } = await getCommentsByPost(id));
      } catch {
        toast.error('Unable to load comments.');
      }
      openModal(renderPostModalContent(post, comments));
    } catch (error) {
      const message =
        error.details?.message || error.message || 'Request failed';
      openModal('<p>Unable to load post details.</p>');
      toast.error(message);
    }
  });

  isPostsBound = true;
};

export const initPostsPage = async () => {
  initModal();
  bindPostsInteractions();

  const params = getHashParams();
  const categoryParam = params.get('category');
  pendingCategorySlug = categoryParam ? String(categoryParam) : '';
  postsState = {
    ...postsState,
    page: 1,
    categoryId: '',
  };

  const categorySelect = document.querySelector('[data-post-category]');
  if (categorySelect) {
    categorySelect.innerHTML =
      '<option value="">Loading categories...</option>';

    try {
      const { items } = await getCategories({ page: 1, limit: 100 });
      categorySelect.innerHTML = renderCategoryOptions(items);
      if (pendingCategorySlug) {
        const matched = items.find(
          (category) => category.slug === pendingCategorySlug
        );
        if (matched) {
          postsState = {
            ...postsState,
            categoryId: String(matched.id),
          };
          categorySelect.value = postsState.categoryId;
        }
      }
    } catch (error) {
      categorySelect.innerHTML = '<option value="">All categories</option>';
    }
  }

  updatePosts();
};

export const postsPage = () => `
  <section class="section posts">
    <div class="posts-header">
      <div>
        <h2 class="section-title">All Posts</h2>
        <p class="posts-subtitle">Search and filter stories from the community.</p>
      </div>
      <div class="posts-actions">
        <form class="posts-search" data-post-search-form>
          <input
            class="posts-search__input"
            type="search"
            placeholder="Search posts..."
            aria-label="Search posts"
            data-post-search
          />
          <button class="btn btn-primary" type="submit">Search</button>
        </form>
        <select class="posts-select" data-post-category aria-label="Filter by category">
          <option value="">Loading categories...</option>
        </select>
      </div>
    </div>
    <div class="posts-grid" data-post-list>
      <p>Loading posts...</p>
    </div>
    <div class="pagination" data-post-pagination></div>
  </section>
`;
