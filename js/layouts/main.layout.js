import { header } from '../components/header.js';
import { navbar } from '../components/navbar.js';
import { footer } from '../components/footer.js';

export const mainLayout = () => `
	${header()}
	${navbar()}
	<main id="home" class="container">
		<section class="hero">
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
				<article class="hero-card">
					<span class="hero-meta">Latest Post</span>
					<h3>Designing With Light: A Study of Quiet Interfaces</h3>
					<p>
						A deep dive into soft palettes, subtle motion, and what makes a UI feel
						editorial instead of generic.
					</p>
					<p class="hero-meta">7 min read · April 25</p>
				</article>
			</div>
		</section>

		<section id="latest" class="section">
			<h2 class="section-title">Latest Posts</h2>
			<div class="grid-3">
				<article class="post-card">
					<span>Today</span>
					<h3>Sketching a Product Journey Map</h3>
					<p>Organize insights, align teams, and keep the story simple.</p>
				</article>
				<article class="post-card">
					<span>Yesterday</span>
					<h3>From Wireframe to Editorial Layout</h3>
					<p>Turn grids into elegant storytelling modules for modern blogs.</p>
				</article>
				<article class="post-card">
					<span>Last Week</span>
					<h3>The Ritual of Sunday Planning</h3>
					<p>How small routines keep long projects moving forward.</p>
				</article>
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
	</main>
	${footer()}
`;
