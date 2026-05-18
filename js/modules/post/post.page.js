import { toast } from '../../utils/toast.js';
import { getPosts, getPostById } from './post.service.js';
import { getCategories } from '../category/category.service.js';
import { initModal, openModal } from '../../components/modal.js';
import { bindCommentInteractions } from '../../components/comment.interactions.js';
import { renderPostCard } from '../../components/post.card.js';
import { renderPublicPostModal } from '../../components/post.modal.js';
import { renderPagination } from '../../components/pagination.js';
import { escapeHtml } from '../../components/utils.js';
import { t } from '../../utils/i18n.js';

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
  if (queryIndex === -1) return new URLSearchParams();
  return new URLSearchParams(hash.slice(queryIndex + 1));
};

const renderPosts = (posts) => {
  if (!posts.length) return `<p>${t('posts.noPostsFound')}</p>`;
  return posts.map(renderPostCard).join('');
};

const renderCategoryOptions = (categories) => {
  if (!categories.length)
    return `<option value="">${t('posts.allCategories')}</option>`;
  return [
    `<option value="">${t('posts.allCategories')}</option>`,
    ...categories.map(
      (cat) => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`
    ),
  ].join('');
};

const openPostModal = async (id) => {
  openModal(`<p>${t('posts.loadingPostDetails')}</p>`);
  try {
    const post = await getPostById(id);
    if (!post) {
      openModal(`<p>${t('posts.postNotFound')}</p>`);
      return;
    }

    const comments = post.comments ?? [];
    openModal(renderPublicPostModal(post, comments));
  } catch (error) {
    const message =
      error.details?.message || error.message || t('errors.requestFailed');
    openModal(`<p>${t('posts.unableLoadPostDetails')}</p>`);
    toast.error(message);
  }
};

const updatePosts = async () => {
  const listEl = document.querySelector('[data-post-list]');
  const paginationEl = document.querySelector('[data-post-pagination]');
  if (!listEl || !paginationEl) return;

  listEl.innerHTML = `<p>${t('posts.loadingPosts')}</p>`;
  paginationEl.innerHTML = '';

  try {
    const params = { page: postsState.page, limit: postsState.limit };
    if (postsState.keyword) params.keyword = postsState.keyword;
    if (postsState.categoryId) params.category_id = postsState.categoryId;

    const { items, meta } = await getPosts(params);
    listEl.innerHTML = renderPosts(items);
    paginationEl.innerHTML = renderPagination(meta, { prefix: 'page' });
  } catch (error) {
    const message =
      error.details?.message || error.message || t('errors.requestFailed');
    listEl.innerHTML = `<p>${t('posts.unableLoadPosts')}</p>`;
    paginationEl.innerHTML = '';
    toast.error(message);
  }
};

const bindPostsInteractions = () => {
  if (isPostsBound) return;

  bindCommentInteractions();

  // Search form
  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-post-search-form]');
    if (!form) return;
    const input = form.querySelector('[data-post-search]');
    if (!input) return;
    event.preventDefault();
    postsState = { ...postsState, page: 1, keyword: input.value.trim() };
    if (!postsState.categoryId) window.location.hash = '#/posts';
    updatePosts();
  });

  // Category filter
  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-post-category]');
    if (!select) return;
    const selectedSlug = select.selectedOptions?.[0]?.dataset?.slug || '';
    postsState = { ...postsState, page: 1, categoryId: select.value };
    window.location.hash = selectedSlug
      ? `#/posts?category=${selectedSlug}`
      : '#/posts';
    updatePosts();
  });

  // Click: pagination + post card
  document.addEventListener('click', async (event) => {
    if (event.target.closest('[data-modal]')) return;

    // Pagination
    const pageButton = event.target.closest('[data-page]');
    if (pageButton?.closest('[data-post-pagination]')) {
      if (pageButton.disabled) return;
      const nextPage = Number(pageButton.getAttribute('data-page'));
      if (!Number.isFinite(nextPage) || nextPage < 1) return;
      postsState = { ...postsState, page: nextPage };
      if (postsState.categoryId) {
        const categorySelect = document.querySelector('[data-post-category]');
        const selectedSlug =
          categorySelect?.selectedOptions?.[0]?.dataset?.slug || '';
        if (selectedSlug)
          window.location.hash = `#/posts?category=${selectedSlug}`;
      }
      updatePosts();
      return;
    }

    // Post card
    const trigger = event.target.closest('[data-post-id]');
    if (!trigger) return;
    if (!document.querySelector('[data-post-list]')) return;
    const id = Number(trigger.getAttribute('data-post-id'));
    if (!Number.isFinite(id)) return;
    await openPostModal(id);
  });

  // Keyboard: post card
  document.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (event.target.closest('[data-modal]')) return;
    const trigger = event.target.closest('[data-post-id]');
    if (!trigger) return;
    event.preventDefault();
    const id = Number(trigger.getAttribute('data-post-id'));
    if (!Number.isFinite(id)) return;
    await openPostModal(id);
  });

  isPostsBound = true;
};

export const initPostsPage = async () => {
  initModal();
  bindPostsInteractions();

  const params = getHashParams();
  const categoryParam = params.get('category');
  pendingCategorySlug = categoryParam ? String(categoryParam) : '';
  postsState = { ...postsState, page: 1, categoryId: '' };

  const categorySelect = document.querySelector('[data-post-category]');
  if (categorySelect) {
    categorySelect.innerHTML = `<option value="">${t('posts.loadingCategories')}</option>`;
    try {
      const { items } = await getCategories({ page: 1, limit: 100 });
      categorySelect.innerHTML = renderCategoryOptions(items);
      if (pendingCategorySlug) {
        const matched = items.find((cat) => cat.slug === pendingCategorySlug);
        if (matched) {
          postsState = { ...postsState, categoryId: String(matched.id) };
          categorySelect.value = postsState.categoryId;
        }
      }
    } catch (error) {
      const message =
        error.details?.message || error.message || t('errors.requestFailed');
      toast.error(message);
    }
  }

  updatePosts();
};

export const postsPage = () => `
  <section class="section posts">
    <div class="posts-header">
      <div>
        <h2 class="section-title">${t('posts.allPosts')}</h2>
        <p class="posts-subtitle">${t('posts.subtitle')}</p>
      </div>
      <div class="posts-actions">
        <form class="posts-search" data-post-search-form>
          <input
            class="posts-search__input"
            type="search"
            placeholder="${t('posts.searchPlaceholder')}"
            aria-label="${t('posts.searchAria')}"
            data-post-search
          />
          <button class="btn btn-primary" type="submit">${t('posts.searchButton')}</button>
        </form>
        <select class="posts-select" data-post-category aria-label="${t('posts.filterAria')}">
          <option value="">${t('posts.loadingCategories')}</option>
        </select>
      </div>
    </div>
    <div class="posts-grid" data-post-list>
      <p>${t('posts.loadingPosts')}</p>
    </div>
    <div class="pagination" data-post-pagination></div>
  </section>
`;
