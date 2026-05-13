import { toast } from '../../utils/toast.js';
import { getPosts, getPostById } from '../post/post.service.js';
import { getCategories } from '../category/category.service.js';
import { initModal, openModal } from '../../components/modal.js';
import { getCommentsByPost } from '../comment/comment.service.js';
import { bindCommentInteractions } from '../../components/comment.interactions.js';
import { renderHeroPost, renderPostCard } from '../../components/post.card.js';
import { renderPublicPostModal } from '../../components/post.modal.js';
import { escapeHtml } from '../../components/utils.js';

let isHomeBound = false;

const renderLatestPosts = (posts) => {
  if (!posts.length) return '<p>No posts available yet.</p>';
  return posts.map(renderPostCard).join('');
};

const renderCategories = (categories) => {
  if (!categories.length) return '<p>No categories available yet.</p>';
  return categories
    .map(
      (cat) => `
        <a class="category category--link" href="#/posts?category=${encodeURIComponent(cat.slug)}">
          ${escapeHtml(cat.name)}
        </a>
      `
    )
    .join('');
};

const bindHomeInteractions = () => {
  if (isHomeBound) return;

  bindCommentInteractions(getCommentsByPost);

  const handlePostTrigger = async (event) => {
    const trigger = event.target.closest('[data-post-id]');
    if (!trigger) return;

    const id = Number(trigger.getAttribute('data-post-id'));
    if (!Number.isFinite(id)) return;

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
      } catch (error) {
        const message =
          error.details?.message || error.message || 'Fallback message';
        toast.error(message);
      }

      openModal(renderPublicPostModal(post, comments));
    } catch (error) {
      const message =
        error.details?.message || error.message || 'Request failed';
      openModal('<p>Unable to load post details.</p>');
      toast.error(message);
    }
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-modal]')) return;
    const trigger = event.target.closest('[data-post-id]');
    if (trigger) handlePostTrigger(event);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (event.target.closest('[data-modal]')) return;
    const trigger = event.target.closest('[data-post-id]');
    if (!trigger) return;
    if (!document.querySelector('[data-latest-posts]')) return;
    handlePostTrigger(event);
  });

  isHomeBound = true;
};

export const initHomePage = async () => {
  const latestContainer = document.querySelector('[data-latest-posts]');
  const heroContainer = document.querySelector('[data-hero-post]');
  const categoryContainer = document.querySelector('[data-category-list]');
  if (!latestContainer) return;

  latestContainer.innerHTML = '<p>Loading latest posts...</p>';
  if (heroContainer) heroContainer.innerHTML = renderHeroPost();
  if (categoryContainer)
    categoryContainer.innerHTML = '<p>Loading categories...</p>';

  initModal();
  bindHomeInteractions();

  try {
    const { items } = await getPosts({
      page: 1,
      limit: 4,
      status: 'published',
    });
    const [heroPost, ...latestPosts] = items;

    if (heroContainer) heroContainer.innerHTML = renderHeroPost(heroPost);
    latestContainer.innerHTML = renderLatestPosts(latestPosts.slice(0, 3));

    if (categoryContainer) {
      const { items: categories } = await getCategories({ page: 1, limit: 10 });
      categoryContainer.innerHTML = renderCategories(categories);
    }
  } catch (error) {
    const message = error.details?.message || error.message || 'Request failed';
    latestContainer.innerHTML = '<p>Unable to load latest posts.</p>';
    if (heroContainer) heroContainer.innerHTML = renderHeroPost();
    if (categoryContainer)
      categoryContainer.innerHTML = '<p>Unable to load categories.</p>';
    toast.error(message);
  }
};

export const homePage = () => `
  <section id="home" class="hero">
    <div class="hero-grid">
      <div>
        <h1 class="hero-title">Write, curate, and share stories with a calm rhythm.</h1>
        <p class="hero-desc">
          The home page highlights fresh posts, hand-picked notes, and community signals without noise.
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
