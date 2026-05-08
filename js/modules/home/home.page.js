import { toast } from '../../utils/toast.js';
import { getPosts, getPostById } from '../post/post.service.js';
import { getCategories } from '../category/category.service.js';
import { initModal, openModal } from '../../components/modal.js';

let isHomeBound = false;

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

const createExcerpt = (content = '', maxLength = 120) => {
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

const renderComments = (comments = [], depth = 0) => {
  if (!comments.length) {
    return '';
  }

  return `
    <div class="modal__comment-list">
      ${comments
        .map((comment) => {
          const commenter =
            comment.user?.name || comment.user?.email || 'Anonymous';
          const repliesMarkup = renderComments(
            comment.replies || [],
            depth + 1
          );

          return `
            <div class="modal__comment" data-depth="${depth}">
              <p class="modal__comment-meta">${escapeHtml(
                commenter
              )} · ${escapeHtml(formatDate(comment.createdAt))}</p>
              <p class="modal__comment-body">${renderPostContent(
                comment.content
              )}</p>
              ${repliesMarkup ? `<div class="modal__comment-children">${repliesMarkup}</div>` : ''}
            </div>
          `;
        })
        .join('')}
    </div>
  `;
};

const renderPostModalContent = (post) => {
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

  const comments = post.comments || [];
  const commentsMarkup = comments.length
    ? `
      <div class="modal__divider"></div>
      <div class="modal__comments">
        <h4 class="modal__section-title">Comments (${comments.length})</h4>
        ${renderComments(comments)}
      </div>
    `
    : '';

  return `
    <div class="modal__meta">
      <span>${escapeHtml(category)}</span>
      <span>${escapeHtml(formatDate(post.createdAt))}</span>
      <span>By ${escapeHtml(author)}</span>
      ${statusLabel ? `<span>${escapeHtml(statusLabel)}</span>` : ''}
    </div>
    <h3 id="modal-title" class="modal__title">${escapeHtml(post.title)}</h3>
    <div class="modal__body">${renderPostContent(post.content)}</div>
    ${commentsMarkup}
  `;
};

const renderHeroPost = (post) => {
  if (!post) {
    return `
      <article class="hero-card">
        <span class="hero-meta">Latest Post</span>
        <h3>No posts yet</h3>
        <p>Check back soon for the first story.</p>
      </article>
    `;
  }

  const author = post.author?.name || post.author?.email || 'Unknown author';
  const category = post.category?.name || 'General';

  return `
    <article class="hero-card hero-card--clickable" data-post-id="${post.id}" role="button" tabindex="0">
      <span class="hero-meta">Latest Post · ${escapeHtml(category)}</span>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(createExcerpt(post.content, 180))}</p>
      <p class="hero-meta">By ${escapeHtml(author)} · ${escapeHtml(
        formatDate(post.createdAt)
      )}</p>
    </article>
  `;
};

const renderLatestPosts = (posts) => {
  if (!posts.length) {
    return '<p>No posts available yet.</p>';
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

const renderCategories = (categories) => {
  if (!categories.length) {
    return '<p>No categories available yet.</p>';
  }

  return categories
    .map(
      (category) => `
        <a class="category category--link" href="#/posts?category=${encodeURIComponent(category.slug)}">${escapeHtml(category.name)}</a>
      `
    )
    .join('');
};

const bindHomeInteractions = () => {
  if (isHomeBound) {
    return;
  }

  const handlePostTrigger = async (event) => {
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

      openModal(renderPostModalContent(post));
    } catch (error) {
      const message =
        error.details?.message || error.message || 'Request failed';
      openModal('<p>Unable to load post details.</p>');
      toast.error(message);
    }
  };

  document.addEventListener('click', (event) => {
    const isPostTrigger = event.target.closest('[data-post-id]');
    if (isPostTrigger) {
      handlePostTrigger(event);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    const isPostTrigger = event.target.closest('[data-post-id]');
    if (!isPostTrigger) {
      return;
    }

    event.preventDefault();
    handlePostTrigger(event);
  });

  isHomeBound = true;
};

export const initHomePage = async () => {
  const latestContainer = document.querySelector('[data-latest-posts]');
  const heroContainer = document.querySelector('[data-hero-post]');
  const categoryContainer = document.querySelector('[data-category-list]');
  if (!latestContainer) {
    return;
  }

  latestContainer.innerHTML = '<p>Loading latest posts...</p>';
  if (heroContainer) {
    heroContainer.innerHTML = renderHeroPost();
  }
  if (categoryContainer) {
    categoryContainer.innerHTML = '<p>Loading categories...</p>';
  }

  initModal();
  bindHomeInteractions();

  try {
    const { items } = await getPosts({
      page: 1,
      limit: 4,
      status: 'published',
    });

    const [heroPost, ...latestPosts] = items;
    if (heroContainer) {
      heroContainer.innerHTML = renderHeroPost(heroPost);
    }
    latestContainer.innerHTML = renderLatestPosts(latestPosts.slice(0, 3));

    if (categoryContainer) {
      const { items: categories } = await getCategories({
        page: 1,
        limit: 10,
      });
      categoryContainer.innerHTML = renderCategories(categories);
    }
  } catch (error) {
    const message = error.details?.message || error.message || 'Request failed';
    latestContainer.innerHTML = '<p>Unable to load latest posts.</p>';
    if (heroContainer) {
      heroContainer.innerHTML = renderHeroPost();
    }
    if (categoryContainer) {
      categoryContainer.innerHTML = '<p>Unable to load categories.</p>';
    }
    toast.error(message);
  }
};

export const homePage = () => `
  <section id="home" class="hero">
    <div class="hero-grid">
      <div>
        <h1 class="hero-title">Write, curate, and share stories with a calm rhythm.</h1>
        <p class="hero-desc">
          The home page
          highlights fresh posts, hand-picked notes, and community signals without noise.
        </p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/posts">Start Reading</a>
          <button class="btn btn-ghost">Submit a Story</button>
        </div>
      </div>
      <div data-hero-post>
        <article class="hero-card">
          <span class="hero-meta">Latest Post</span>
          <h3>Loading...</h3>
          <p>Fetching the newest story.</p>
        </article>
      </div>
    </div>
  </section>

  <section id="latest" class="section">
    <h2 class="section-title">Latest Posts</h2>
    <div class="grid-3" data-latest-posts>
      <p>Loading latest posts...</p>
    </div>
  </section>

  <section id="categories" class="section">
    <h2 class="section-title">Browse Categories</h2>
    <div class="category-list" data-category-list>
      <p>Loading categories...</p>
    </div>
  </section>
`;
