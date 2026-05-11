import { toast } from '../../utils/toast.js';
import { getAuthState, setAuthState } from '../../core/store.js';
import { initModal, openModal, closeModal } from '../../components/modal.js';
import { updateUserProfile } from './user.service.js';

let isProfileBound = false;
let isMyPostsBound = false;

let myPostsState = {
  page: 1,
  limit: 6,
  keyword: '',
  status: '',
};

let userPosts = [
  {
    id: 1,
    title: 'Finding a steady writing rhythm',
    content:
      'I track ideas in small notebooks, then shape them into weekly drafts. The rhythm keeps the work light and consistent.',
    category: 'Writing',
    published: true,
    createdAt: '2026-02-10T09:30:00.000Z',
  },
  {
    id: 2,
    title: 'Draft: Morning rituals for focus',
    content:
      'Still sketching the structure. This will highlight three rituals I use to focus before I write.',
    category: 'Habits',
    published: false,
    createdAt: '2026-02-18T12:00:00.000Z',
  },
  {
    id: 3,
    title: 'Designing a gentle reading list',
    content:
      'A lightweight method for sorting articles so the ones that matter stay visible.',
    category: 'Productivity',
    published: true,
    createdAt: '2026-03-04T15:45:00.000Z',
  },
  {
    id: 4,
    title: 'Draft: Notes on slow publishing',
    content: 'A placeholder while I gather more examples from the community.',
    category: 'Publishing',
    published: false,
    createdAt: '2026-03-18T08:20:00.000Z',
  },
  {
    id: 5,
    title: 'Editing without burning out',
    content:
      'My short checklist for editing quickly, keeping energy for the next story.',
    category: 'Writing',
    published: true,
    createdAt: '2026-04-02T10:05:00.000Z',
  },
];

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

      return `
				<article class="post-card">
					<div class="post-card__meta">
						<span>${escapeHtml(post.category || 'General')} · ${escapeHtml(
              formatDate(post.createdAt)
            )}</span>
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
  if (!meta || meta.totalPages <= 1) {
    return '';
  }

  const current = meta.page || 1;
  const total = meta.totalPages || 1;
  const pages = Array.from({ length: total }, (_, index) => index + 1);

  return `
		<button class="btn btn-ghost" data-my-posts-page="${current - 1}" ${
      current === 1 ? 'disabled' : ''
    }>
			Prev
		</button>
		${pages
      .map(
        (page) => `
					<button class="btn ${
            page === current ? 'btn-primary' : 'btn-ghost'
          }" data-my-posts-page="${page}">
						${page}
					</button>
				`
      )
      .join('')}
		<button class="btn btn-ghost" data-my-posts-page="${current + 1}" ${
      current === total ? 'disabled' : ''
    }>
			Next
		</button>
	`;
};

const getFilteredPosts = () => {
  const keyword = myPostsState.keyword.toLowerCase();

  return userPosts.filter((post) => {
    const matchesKeyword = keyword
      ? post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword)
      : true;

    const matchesStatus = myPostsState.status
      ? myPostsState.status === 'published'
        ? post.published
        : !post.published
      : true;

    return matchesKeyword && matchesStatus;
  });
};

const getPagedPosts = () => {
  const filtered = getFilteredPosts();
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / myPostsState.limit)
  );
  const currentPage = Math.min(myPostsState.page, totalPages);
  const start = (currentPage - 1) * myPostsState.limit;

  return {
    items: filtered.slice(start, start + myPostsState.limit),
    meta: {
      page: currentPage,
      totalPages,
      totalItems: filtered.length,
    },
  };
};

const updateMyPosts = () => {
  const listEl = document.querySelector('[data-my-posts-list]');
  const paginationEl = document.querySelector('[data-my-posts-pagination]');

  if (!listEl || !paginationEl) {
    return;
  }

  const { items, meta } = getPagedPosts();
  listEl.innerHTML = renderMyPostsList(items);
  paginationEl.innerHTML = renderMyPostsPagination(meta);
};

const renderCreatePostForm = () => `
	<div class="modal__meta">
		<span>Create Post</span>
	</div>
	<h3 id="modal-title" class="modal__title">New Post</h3>
	<form class="modal-form" data-create-post-form>
		<label class="modal-field">
			<span>Title</span>
			<input type="text" name="title" placeholder="Post title" required />
		</label>
		<label class="modal-field">
			<span>Category</span>
			<input type="text" name="category" placeholder="Category" required />
		</label>
		<label class="modal-field">
			<span>Status</span>
			<select name="status" required>
				<option value="published">Published</option>
				<option value="draft">Draft</option>
			</select>
		</label>
		<label class="modal-field">
			<span>Content</span>
			<textarea name="content" rows="6" placeholder="Write your story" required></textarea>
		</label>
		<div class="modal-actions">
			<button class="btn btn-ghost" type="button" data-modal-close>Cancel</button>
			<button class="btn btn-primary" type="submit">Create post</button>
		</div>
	</form>
`;

const bindProfileInteractions = () => {
  if (isProfileBound) {
    return;
  }

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-profile-form]');
    if (!form) {
      return;
    }

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
      if (!submitButton) {
        return;
      }

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

        setAuthState({
          user: {
            ...user,
            ...updatedUser,
          },
        });

        toast.success('Profile updated.');
      })
      .catch((error) => {
        const message =
          error.details?.message || error.message || 'Update failed';
        toast.error(message);
      })
      .finally(() => {
        setLoading(false);
      });
  });

  isProfileBound = true;
};

const bindMyPostsInteractions = () => {
  if (isMyPostsBound) {
    return;
  }

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-my-posts-search-form]');
    if (!form) {
      return;
    }

    event.preventDefault();
    const input = form.querySelector('[data-my-posts-search]');
    if (!input) {
      return;
    }

    myPostsState = {
      ...myPostsState,
      page: 1,
      keyword: input.value.trim(),
    };

    updateMyPosts();
  });

  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-my-posts-status]');
    if (!select) {
      return;
    }

    myPostsState = {
      ...myPostsState,
      page: 1,
      status: select.value,
    };

    updateMyPosts();
  });

  document.addEventListener('click', (event) => {
    const pageButton = event.target.closest('[data-my-posts-page]');
    if (pageButton && pageButton.closest('[data-my-posts-pagination]')) {
      if (pageButton.disabled) {
        return;
      }

      const nextPage = Number(pageButton.getAttribute('data-my-posts-page'));
      if (!Number.isFinite(nextPage) || nextPage < 1) {
        return;
      }

      myPostsState = {
        ...myPostsState,
        page: nextPage,
      };

      updateMyPosts();
      return;
    }

    const createTrigger = event.target.closest('[data-create-post]');
    if (createTrigger) {
      openModal(renderCreatePostForm());
    }
  });

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-create-post-form]');
    if (!form) {
      return;
    }

    event.preventDefault();
    const formData = new FormData(form);
    const title = String(formData.get('title') || '').trim();
    const category = String(formData.get('category') || '').trim();
    const status = String(formData.get('status') || 'draft');
    const content = String(formData.get('content') || '').trim();

    if (!title || !category || !content) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const newPost = {
      id: Date.now(),
      title,
      category,
      content,
      published: status === 'published',
      createdAt: new Date().toISOString(),
    };

    userPosts = [newPost, ...userPosts];
    myPostsState = {
      ...myPostsState,
      page: 1,
    };

    closeModal();
    updateMyPosts();
    toast.success('Post created locally.');
  });

  isMyPostsBound = true;
};

export const initMyProfilePage = () => {
  initModal();
  bindProfileInteractions();
};

export const initMyPostsPage = () => {
  initModal();
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
					<button class="btn btn-primary" type="button" data-create-post>
						Create Post
					</button>
				</div>
			</div>
			<div class="posts-grid" data-my-posts-list>
				<p>Loading your posts...</p>
			</div>
			<div class="pagination" data-my-posts-pagination></div>
		</section>
	`;
};
