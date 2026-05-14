import { toast } from '../../utils/toast.js';
import { login, register, logout } from './auth.service.js';

export const loginPage = () => `
	<section class="auth">
		<div class="auth-card">
			<div>
				<h2 class="auth-title">Welcome back</h2>
				<p class="auth-subtitle">Login to continue reading and writing.</p>
			</div>
			<form class="auth-form" data-auth-form>
				<label class="auth-field">
					<span>Email</span>
					<input type="email" name="email" autocomplete="email" placeholder="you@email.com" required />
				</label>
				<label class="auth-field">
					<span>Password</span>
					<input type="password" name="password" autocomplete="current-password" placeholder="Your password" required />
				</label>
				<button class="btn btn-primary" type="submit">Login</button>
			</form>
			<p class="auth-footer">
				New here? <a href="#/register">Create an account</a>
			</p>
		</div>
	</section>
`;

export const registerPage = () => `
	<section class="auth">
		<div class="auth-card">
			<div>
				<h2 class="auth-title">Create your account</h2>
				<p class="auth-subtitle">Start publishing and curating your own feed.</p>
			</div>
			<form class="auth-form" data-auth-form>
				<label class="auth-field">
					<span>Name</span>
					<input type="text" name="name" autocomplete="name" placeholder="Your name" required />
				</label>
				<label class="auth-field">
					<span>Email</span>
					<input type="email" name="email" autocomplete="email" placeholder="you@email.com" required />
				</label>
				<label class="auth-field">
					<span>Password</span>
					<input type="password" name="password" autocomplete="new-password" placeholder="Create a password" required />
				</label>
				<label class="auth-field">
					<span>Confirm Password</span>
					<input type="password" name="confirmPassword" autocomplete="new-password" placeholder="Confirm your password" required />
				</label>
				<button class="btn btn-primary" type="submit">Register</button>
			</form>
			<p class="auth-footer">
				Already have an account? <a href="#/login">Login</a>
			</p>
		</div>
	</section>
`;

export const logoutPage = () => `
	<section class="auth">
		<div class="auth-card">
			<div>
				<h2 class="auth-title">Signing you out</h2>
				<p class="auth-subtitle">Please wait while we close your session.</p>
			</div>
		</div>
	</section>
`;

export const initAuthPage = (mode) => {
  const form = document.querySelector('[data-auth-form]');
  if (!form) {
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');

  const setLoading = (isLoading) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading
      ? mode === 'login'
        ? 'Signing in...'
        : 'Creating account...'
      : mode === 'login'
        ? 'Login'
        : 'Register';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    if (mode === 'register' && payload.password !== payload.confirmPassword) {
      toast.error('Password confirmation does not match.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ email: payload.email, password: payload.password });
        toast.success('Welcome back! You are signed in.');
        window.location.hash = '#home';
        return;
      }

      await register({
        name: payload.name,
        email: payload.email,
        password: payload.password,
      });
      toast.success('Account created! Let us start writing.');
      window.location.hash = '#home';
    } catch (error) {
      const message =
        error.details?.message || error.message || 'Request failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  });
};

export const initLogoutPage = async () => {
  try {
    await logout();
    toast.success('You are signed out.');
  } catch (error) {
    const message = error.details?.message || error.message || 'Logout failed';
    toast.error(message);
  } finally {
    window.location.hash = '#/login';
  }
};
