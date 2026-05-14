import { toast } from '../../utils/toast.js';
import { getPosts, getPostById } from '../post/post.service.js';
import { getCategories } from '../category/category.service.js';
import { initModal, openModal } from '../../components/modal.js';
import { bindCommentInteractions } from '../../components/comment.interactions.js';
import { renderHeroPost, renderPostCard } from '../../components/post.card.js';
import { renderPublicPostModal } from '../../components/post.modal.js';
import {
  renderPostForm,
  initPostFormCategories,
} from '../../components/post.form.js';
import { escapeHtml } from '../../components/utils.js';
import { getAuthState } from '../../core/store.js';
import { createPost } from '../post/post.service.js';

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

  bindCommentInteractions();

  const handlePostTrigger = async (event) => {
    const trigger = event.target.closest('[data-post-id]');
    if (!trigger) return;

    if (!document.querySelector('[data-latest-posts]')) return;

    const id = Number(trigger.getAttribute('data-post-id'));
    if (!Number.isFinite(id)) return;

    openModal('<p>Loading post details...</p>');

    try {
      const post = await getPostById(id);
      if (!post) {
        openModal('<p>Post not found.</p>');
        return;
      }

      const comments = post.comments ?? [];
      openModal(renderPublicPostModal(post, comments));
    } catch (error) {
      const message =
        error.details?.message || error.message || 'Request failed';
      openModal('<p>Unable to load post details.</p>');
      toast.error(message);
    }
  };

  const handleSubmitStory = () => {
    const { isAuthenticated } = getAuthState();

    if (!isAuthenticated) {
      toast.error('Please login to submit a story.');
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 800);
      return;
    }

    openModal(renderPostForm({ mode: 'create' }));
    initPostFormCategories(null);
  };

  const handleCreatePostSubmit = (event) => {
    const form = event.target.closest('[data-post-form]');
    if (!form) return;
    if (form.dataset.mode !== 'create') return;

    event.preventDefault();

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
      submitButton.textContent = isLoading ? 'Saving...' : 'Create post';
    };

    setLoading(true);

    createPost({ title, content, categoryId })
      .then(() => {
        toast.success('Post created! Redirecting to My Posts...');
        import('../../components/modal.js').then(({ closeModal }) => {
          closeModal();
        });
        setTimeout(() => {
          window.location.hash = '#/user/posts';
        }, 800);
      })
      .catch((error) => {
        const message =
          error.details?.message || error.message || 'Save failed';
        toast.error(message);
      })
      .finally(() => setLoading(false));
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-submit-story]')) {
      handleSubmitStory();
      return;
    }

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
    event.preventDefault();
    handlePostTrigger(event);
  });

  document.addEventListener('submit', (event) => {
    handleCreatePostSubmit(event);
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
          <button class="btn btn-ghost" type="button" data-submit-story>
            Submit a Story
          </button>
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
