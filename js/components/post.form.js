import { getCategories } from '../modules/category/category.service.js';
import { t } from '../utils/i18n.js';

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
      <span>${isEdit ? t('postForm.editMeta') : t('postForm.createMeta')}</span>
    </div>

    <h3 id="modal-title" class="modal__title">
      ${isEdit ? t('postForm.updateTitle') : t('postForm.newTitle')}
    </h3>

    <form
      class="modal-form"
      data-post-form
      data-mode="${mode}"
      ${isEdit ? `data-post-id="${post.id}"` : ''}
    >
      <label class="modal-field">
        <span>${t('postForm.title')}</span>
        <input
          type="text"
          name="title"
          placeholder="${t('postForm.titlePlaceholder')}"
          value="${escapeHtml(post?.title || '')}"
          minlength="1"
          maxlength="200"
          required
        />
      </label>

      <label class="modal-field">
        <span>${t('postForm.category')}</span>
        <select name="categoryId" data-post-form-category>
          <option value="">${t('postForm.loadingCategories')}</option>
        </select>
      </label>

      <label class="modal-field">
        <span>${t('postForm.content')}</span>
        <textarea
          name="content"
          rows="6"
          placeholder="${t('postForm.contentPlaceholder')}"
          required
        >${escapeHtml(post?.content || '')}</textarea>
      </label>

      <div class="modal-actions">
        <button class="btn btn-ghost" type="button" data-modal-close>
          ${t('postForm.cancel')}
        </button>
        <button class="btn btn-primary" type="submit">
          ${isEdit ? t('postForm.updateButton') : t('postForm.createButton')}
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
      `<option value="">${t('postForm.noCategory')}</option>`,
      ...items.map(
        (cat) =>
          `<option value="${cat.id}" ${Number(currentCategoryId) === cat.id ? 'selected' : ''}>
            ${escapeHtml(cat.name)}
          </option>`
      ),
    ].join('');

    select.innerHTML = options;
  } catch {
    select.innerHTML = `<option value="">${t('postForm.unableLoadCategories')}</option>`;
  }
};
