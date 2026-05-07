import { toast } from '../../utils/toast.js';

export const loginPage = () => `
	<section class="auth">
		<div class="auth-card">
			<div>
				<h2 class="auth-title">Welcome back</h2>
				<p class="auth-subtitle">Sign in to continue reading and writing.</p>
			</div>
			<form class="auth-form">
				<label class="auth-field">
					<span>Email</span>
					<input type="email" placeholder="you@email.com" required />
				</label>
				<label class="auth-field">
					<span>Password</span>
					<input type="password" placeholder="Your password" required />
				</label>
				<button class="btn btn-primary" type="submit">Login</button>
			</form>
			<p class="auth-footer">
				New here? <a href="#register">Create an account</a>
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
			<form class="auth-form">
				<label class="auth-field">
					<span>Name</span>
					<input type="text" placeholder="Your name" required />
				</label>
				<label class="auth-field">
					<span>Email</span>
					<input type="email" placeholder="you@email.com" required />
				</label>
				<label class="auth-field">
					<span>Password</span>
					<input type="password" placeholder="Create a password" required />
				</label>
				<label class="auth-field">
					<span>Confirm Password</span>
					<input type="password" placeholder="Confirm your password" required />
				</label>
				<button class="btn btn-primary" type="submit">Register</button>
			</form>
			<p class="auth-footer">
				Already have an account? <a href="#login">Login</a>
			</p>
		</div>
	</section>
`;

export const initAuthPage = (mode) => {
  const form = document.querySelector('.auth-form');
  if (!form) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (mode === 'login') {
      toast.success('Welcome back! You are signed in.');
      return;
    }

    toast.success('Account created! Let us start writing.');
  });
};
