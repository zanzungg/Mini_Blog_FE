import { getAuthState } from '../core/store.js';

const renderAuthActions = (state) => {
  if (state?.isAuthenticated && state?.user) {
    return `
		<div class="auth-menu" data-auth-menu>
			<button class="auth-trigger" type="button" data-auth-menu-trigger aria-haspopup="true" aria-expanded="false">
				<span class="auth-user">Hello, ${state.user.name || state.user.email}</span>
				<span class="auth-caret" aria-hidden="true">v</span>
			</button>
			<div class="auth-dropdown" data-auth-dropdown>
				<a href="#/user/profile">My Profile</a>
				<a href="#/user/posts">My Posts</a>
				<a href="#/logout">Logout</a>
			</div>
		</div>
	`;
  }

  return `
		<a class="auth-link" href="#/login">Login</a>
		<a class="auth-link auth-link--primary" href="#/register">Register</a>
	`;
};

export const updateAuthActions = (state = getAuthState()) => {
  const container = document.querySelector('[data-auth-actions]');
  if (!container) {
    return;
  }

  container.innerHTML = renderAuthActions(state);
};

export const header = () => {
  const state = getAuthState();

  return `
	<header class="header">
		<div class="container brand">
			<div>
				<div class="brand__logo">Mini Blog</div>
			</div>
			<div class="auth-actions" data-auth-actions>
				${renderAuthActions(state)}
			</div>
		</div>
	</header>
`;
};
