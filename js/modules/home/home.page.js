import { toast } from '../../utils/toast.js';
import { getPosts } from '../post/post.service.js';

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
    <article class="hero-card">
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
        <article class="post-card">
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

export const initHomePage = async () => {
  const latestContainer = document.querySelector('[data-latest-posts]');
  const heroContainer = document.querySelector('[data-hero-post]');
  if (!latestContainer) {
    return;
  }

  latestContainer.innerHTML = '<p>Loading latest posts...</p>';
  if (heroContainer) {
    heroContainer.innerHTML = renderHeroPost();
  }

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
  } catch (error) {
    const message = error.details?.message || error.message || 'Request failed';
    latestContainer.innerHTML = '<p>Unable to load latest posts.</p>';
    if (heroContainer) {
      heroContainer.innerHTML = renderHeroPost();
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
          <button class="btn btn-primary">Start Reading</button>
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
    <div class="category-list">
      <div class="category">Product</div>
      <div class="category">Design</div>
      <div class="category">Writing</div>
      <div class="category">Lifestyle</div>
    </div>
  </section>
`;
