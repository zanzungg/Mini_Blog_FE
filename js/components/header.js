import { getAuthState } from '../core/store.js';

const renderAuthActions = (state) => {
  if (state?.isAuthenticated && state?.user) {
    return `
		<span class="auth-user">Hello, ${state.user.name || state.user.email}</span>
		<a class="auth-link auth-link--ghost" href="#/auth/logout">Logout</a>
	`;
  }

  return `
		<a class="auth-link" href="#/auth/login">Login</a>
		<a class="auth-link auth-link--primary" href="#/auth/register">Register</a>
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