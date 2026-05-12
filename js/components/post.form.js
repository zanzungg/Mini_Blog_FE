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
          required
        />
      </label>

      <label class="modal-field">
        <span>Category</span>
        <input
          type="text"
          name="category"
          placeholder="Category"
          value="${escapeHtml(post?.category || '')}"
          required
        />
      </label>

      <label class="modal-field">
        <span>Status</span>

        <select name="status" required>
          <option 
            value="published"
            ${post?.published ? 'selected' : ''}
          >
            Published
          </option>

          <option
            value="draft"
            ${post?.published === false ? 'selected' : ''}
          >
            Draft
          </option>
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
        <button
          class="btn btn-ghost"
          type="button"
          data-modal-close
        >
          Cancel
        </button>

        <button class="btn btn-primary" type="submit">
          ${isEdit ? 'Update post' : 'Create post'}
        </button>
      </div>
    </form>
  `;
};
