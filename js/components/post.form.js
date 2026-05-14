import { getCategories } from '../modules/category/category.service.js';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const renderPostForm = ({ mode = 'create', post = null } = {}) => {
  const isEdit = mode === 'edit';

  return `
    <div class="modal__meta">
      <span>${isEdit ? 'Edit Post' : 'Create Post'}</span>
    </div>

    <h3 id="modal-title" class="modal__title">
      ${isEdit ? 'Update Post' : 'New Post'}
    </h3>

    <form
      class="modal-form"
      data-post-form
      data-mode="${mode}"
      ${isEdit ? `data-post-id="${post.id}"` : ''}
    >
      <label class="modal-field">
        <span>Title</span>
        <input
          type="text"
          name="title"
          placeholder="Post title"
          value="${escapeHtml(post?.title || '')}"
          minlength="1"
          maxlength="200"
          required
        />
      </label>

      <label class="modal-field">
        <span>Category</span>
        <select name="categoryId" data-post-form-category>
          <option value="">Loading categories...</option>
        </select>
      </label>

      <label class="modal-field">
        <span>Content</span>
        <textarea
          name="content"
          rows="6"
          placeholder="Write your story"
          required
        >${escapeHtml(post?.content || '')}</textarea>
      </label>

      <div class="modal-actions">
        <button class="btn btn-ghost" type="button" data-modal-close>
          Cancel
        </button>
        <button class="btn btn-primary" type="submit">
          ${isEdit ? 'Update post' : 'Create post'}
        </button>
      </div>
    </form>
  `;
};

export const initPostFormCategories = async (currentCategoryId = null) => {
  const select = document.querySelector('[data-post-form-category]');
  if (!select) return;

  try {
    const { items } = await getCategories({ page: 1, limit: 100 });

    const options = [
      '<option value="">No category</option>',
      ...items.map(
        (cat) =>
          `<option value="${cat.id}" ${Number(currentCategoryId) === cat.id ? 'selected' : ''}>
            ${escapeHtml(cat.name)}
          </option>`
      ),
    ].join('');

    select.innerHTML = options;
  } catch {
    select.innerHTML = '<option value="">Unable to load categories</option>';
  }
};
