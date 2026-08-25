import { createCategoriesApiClient } from './api.js'
import {
  renderCategoryParentOptions,
  renderCategoryTable,
  setCategoryEmptyState,
} from './dom.js'
import { createModalController } from './modal.js'
import { showToast } from './toast.js'

function readCategoryRow(row) {
  const depth = Number(row.dataset.categoryDepth || 0)
  const parentSelect = row.querySelector('[data-field="parent_id"]')

  const payload = {
    id: row.dataset.categoryId,
    name: row.querySelector('[data-field="name"]')?.value.trim() || '',
    sort_order: Number(row.querySelector('[data-field="sort_order"]')?.value || 0),
  }

  if (depth > 0) {
    payload.parent_id = parentSelect?.value || ''
  }

  return payload
}

export function initCategoriesApp() {
  const root = document.getElementById('todo-categories-app')
  if (!root) return

  const api = createCategoriesApiClient(root.dataset.apiBase || '/api/todo-categories')
  const modal = createModalController(root)
  const tableBody = root.querySelector('#category-table-body')
  const formEl = root.querySelector('#category-add-form')
  const submitBtn = formEl?.querySelector('.category-add-form__submit')
  const parentSelectEl = formEl?.querySelector('[name="parent_id"]')

  let isLoading = false
  const saveTimers = new Map()

  function updateAddFormParentOptions(categories) {
    if (!parentSelectEl) return
    const selected = parentSelectEl.value
    parentSelectEl.innerHTML = renderCategoryParentOptions(categories, selected)
  }

  async function refreshCategories() {
    if (isLoading) return
    isLoading = true

    try {
      const data = await api.list()
      const categories = data.categories || []
      tableBody.innerHTML = renderCategoryTable(categories)
      updateAddFormParentOptions(categories)
      setCategoryEmptyState(root, categories.length === 0)
    } catch (error) {
      console.error('Failed to load categories', error)
      await modal.alert(error.message || 'Failed to load categories', 'Could not load categories')
    } finally {
      isLoading = false
    }
  }

  async function saveCategoryRow(row) {
    const payload = readCategoryRow(row)
    if (!payload.name) return

    try {
      await api.update(payload)
      showToast('Category saved')
      await refreshCategories()
    } catch (error) {
      console.error('Failed to update category', error)
      await modal.alert(error.message || 'Failed to update category', 'Could not save category')
    }
  }

  function scheduleSave(row) {
    const id = row.dataset.categoryId
    if (!id) return

    clearTimeout(saveTimers.get(id))
    saveTimers.set(
      id,
      setTimeout(() => {
        saveCategoryRow(row)
        saveTimers.delete(id)
      }, 300),
    )
  }

  formEl?.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (!submitBtn) return

    const formData = new FormData(formEl)
    const payload = {
      name: String(formData.get('name') || '').trim(),
      parent_id: String(formData.get('parent_id') || '').trim(),
      sort_order: Number(formData.get('sort_order') || 0),
    }

    if (!payload.name) return

    submitBtn.disabled = true

    try {
      await api.create(payload)
      formEl.reset()
      formEl.querySelector('[name="sort_order"]').value = '0'
      await refreshCategories()
      showToast('Category added')
    } catch (error) {
      console.error('Failed to create category', error)
      await modal.alert(error.message || 'Failed to create category', 'Could not add category')
    } finally {
      submitBtn.disabled = false
    }
  })

  tableBody?.addEventListener('input', (event) => {
    const row = event.target.closest('[data-category-id]')
    if (!row) return
    scheduleSave(row)
  })

  tableBody?.addEventListener('change', (event) => {
    const row = event.target.closest('[data-category-id]')
    if (!row) return
    scheduleSave(row)
  })

  tableBody?.addEventListener('click', async (event) => {
    const deleteBtn = event.target.closest('[data-action="delete-category"]')
    if (!deleteBtn) return

    const row = deleteBtn.closest('[data-category-id]')
    if (!row) return

    const confirmed = await modal.confirm('This category will be permanently deleted.', 'Delete category?', {
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!confirmed) return

    try {
      await api.delete(row.dataset.categoryId)
      await refreshCategories()
      showToast('Category deleted')
    } catch (error) {
      console.error('Failed to delete category', error)
      await modal.alert(error.message || 'Failed to delete category', 'Could not delete category')
    }
  })
}
