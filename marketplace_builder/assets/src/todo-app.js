import { createApiClient } from './api.js'
import {
  renderTodoList,
  setActiveCategory,
  setActiveFilter,
  setEmptyState,
  sortTodosByDueDate,
  updateCategoryCounts,
  updateCounts,
} from './dom.js'
import { createModalController } from './modal.js'
import { showToast } from './toast.js'
import { waitForTodoSync } from './sync.js'

function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

function readFilters(root) {
  const activeButton = root.querySelector('.todo-filters__btn--active')
  return {
    status: activeButton ? activeButton.dataset.filter : 'all',
    keyword: root.querySelector('#todo-search')?.value.trim() || '',
    priority: root.querySelector('#todo-priority-filter')?.value || '',
    order: root.querySelector('#todo-sort-due-date')?.value || 'desc',
    category: root.dataset.activeCategory || '',
  }
}

export function initTodoApp() {
  const root = document.getElementById('todo-app')
  if (!root) return

  const api = createApiClient(root.dataset.apiBase || '/api/todos')
  const modal = createModalController(root)
  const listEl = root.querySelector('#todo-list')
  const formEl = root.querySelector('#todo-add-form')
  const submitBtn = formEl?.querySelector('.todo-add-form__submit')
  const categoryFilterEl = root.querySelector('#todo-category-filter')

  let isLoading = false
  let statusOptions = []
  let defaultStatusId = root.dataset.defaultStatusId || ''
  let completedStatusId = root.dataset.completedStatusId || ''

  async function refreshList(options = {}) {
    if (isLoading) return
    isLoading = true

    try {
      const filters = readFilters(root)
      const data = await api.list(filters)
      statusOptions = data.statuses || []
      defaultStatusId = data.meta?.default_status_id || defaultStatusId
      completedStatusId = data.meta?.completed_status_id || completedStatusId
      const sortedTodos = sortTodosByDueDate(data.todos || [], filters.order)
      listEl.innerHTML = renderTodoList(sortedTodos, statusOptions)
      if (!options.skipCountsUpdate) {
        updateCounts(root, data.counts)
      }
      updateCategoryCounts(root, data.categories || [])
      setEmptyState(root, (data.todos || []).length === 0)
    } catch (error) {
      console.error('Failed to load todos', error)
      await modal.alert(error.message || 'Failed to load todos', 'Could not load todos')
    } finally {
      isLoading = false
    }
  }

  const debouncedRefresh = debounce(refreshList, 300)

  root.querySelectorAll('.todo-filters__btn').forEach((button) => {
    button.addEventListener('click', () => {
      setActiveFilter(root, button.dataset.filter)
      refreshList()
    })
  })

  categoryFilterEl?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="filter-category"]')
    if (!button) return

    const categoryId = button.dataset.category || ''
    root.dataset.activeCategory = categoryId
    setActiveCategory(root, categoryId)
    refreshList()
  })

  root.querySelector('#todo-search')?.addEventListener('input', debouncedRefresh)
  root.querySelector('#todo-priority-filter')?.addEventListener('change', refreshList)
  root.querySelector('#todo-sort-due-date')?.addEventListener('change', refreshList)

  async function handleCreateSubmit(event) {
    event.preventDefault()
    if (!submitBtn) return

    const formData = new FormData(formEl)
    const payload = {
      name: String(formData.get('name') || '').trim(),
      due_date: String(formData.get('due_date') || '').trim(),
      priority: String(formData.get('priority') || 'medium'),
      category_id: String(formData.get('category_id') || '').trim(),
    }

    if (!payload.name) return

    submitBtn.disabled = true

    try {
      const result = await api.create(payload)
      formEl.reset()
      formEl.querySelector('[name="priority"]').value = 'medium'
      await waitForTodoSync(root.dataset.apiBase || '/api/todos', result.todo.id)
      await refreshList()
      showToast('Todo added')
      formEl.addEventListener('submit', handleCreateSubmit)
    } catch (error) {
      console.error('Failed to create todo', error)
      await modal.alert(error.message || 'Failed to create todo', 'Could not add todo')
    } finally {
      submitBtn.disabled = false
    }
  }

  formEl?.addEventListener('submit', handleCreateSubmit)

  listEl?.addEventListener('change', async (event) => {
    const checkbox = event.target.closest('[data-action="toggle-complete"]')
    if (checkbox) {
      const checkboxes = listEl.querySelectorAll('.todo-item__checkbox')
      const items = listEl.querySelectorAll('.todo-item')
      const index = Array.from(checkboxes).indexOf(checkbox)
      const item = items[index]
      if (!item) return

      try {
        await api.update({ id: item.dataset.todoId, completed: checkbox.checked })
        await refreshList()
        showToast(checkbox.checked ? 'Todo completed' : 'Todo reopened')
      } catch (error) {
        console.error('Failed to update todo', error)
        checkbox.checked = !checkbox.checked
        await modal.alert(error.message || 'Failed to update todo', 'Could not update todo')
      }
      return
    }

    const statusSelect = event.target.closest('[data-action="change-status"]')
    if (!statusSelect) return

    const item = statusSelect.closest('[data-todo-id]')
    if (!item) return

    const previousStatusId = item.dataset.todoStatusId || ''
    const nextStatusId = statusSelect.value

    if (nextStatusId === previousStatusId) return

    try {
      await api.update({ id: item.dataset.todoId, status_id: nextStatusId })
      await refreshList()
      showToast('Status updated')
    } catch (error) {
      console.error('Failed to update todo status', error)
      statusSelect.value = previousStatusId
      await modal.alert(error.message || 'Failed to update status', 'Could not update status')
    }
  })

  listEl?.addEventListener('click', async (event) => {
    const deleteBtn = event.target.closest('[data-action="delete"]')
    if (deleteBtn) {
      const item = deleteBtn.closest('[data-todo-id]')
      if (!item) return

      const confirmed = await modal.confirm('This todo will be permanently deleted.', 'Delete todo?', {
        confirmLabel: 'Delete',
        danger: true,
      })
      if (!confirmed) return

      try {
        await api.delete(item.dataset.todoId)
        await refreshList()
        showToast('Todo deleted')
      } catch (error) {
        console.error('Failed to delete todo', error)
        await modal.alert(error.message || 'Failed to delete todo', 'Could not delete todo')
      }
      return
    }

    const editBtn = event.target.closest('[data-action="edit-todo-btn"]')
    const titleEl = event.target.closest('[data-action="edit-todo"]')
    const targetItem = (editBtn || titleEl)?.closest('[data-todo-id]')
    if (!targetItem) return

    const currentTitle = targetItem.querySelector('.todo-item__title')?.textContent || ''
    const currentPriority = targetItem.dataset.todoPriority || 'medium'
    const currentDueDate = targetItem.dataset.todoDueDate || ''

    const edits = await modal.editTodo({
      title: 'Edit todo',
      name: currentTitle,
      priority: currentPriority,
      due_date: currentDueDate,
      confirmLabel: 'Save',
    })
    if (edits === null) return

    const trimmedName = edits.name.trim()
    const trimmedDueDate = edits.due_date.trim()
    const nextPriority = edits.priority || 'medium'

    if (
      trimmedName === currentTitle.trim()
      && trimmedDueDate === currentDueDate
      && nextPriority === currentPriority
    ) {
      return
    }

    try {
      await api.update({
        id: targetItem.dataset.todoId,
        name: trimmedName,
        due_date: trimmedDueDate,
        due_date_cleared: trimmedDueDate === '',
        priority: nextPriority,
      })
      await refreshList()
      showToast('Todo updated')
    } catch (error) {
      console.error('Failed to edit todo', error)
      await modal.alert(error.message || 'Failed to edit todo', 'Could not save changes')
    }
  })

  root.querySelector('#todo-clear-completed')?.addEventListener('click', async () => {
    const confirmed = await modal.confirm(
      'All completed todos will be permanently deleted.',
      'Clear completed todos?',
      { confirmLabel: 'Clear completed', danger: true },
    )
    if (!confirmed) return

    try {
      await api.clearCompleted()
      await refreshList({ skipCountsUpdate: true })
      showToast('Completed todos cleared')
    } catch (error) {
      console.error('Failed to clear completed todos', error)
      await modal.alert(error.message || 'Failed to clear completed todos', 'Could not clear completed')
    }
  })
}
