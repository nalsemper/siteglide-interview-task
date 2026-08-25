function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function formatDueDateForInput(value) {
  if (value == null || value === '') return ''
  const str = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
  return ''
}

function parseDueDateSortValue(value) {
  const iso = formatDueDateForInput(value)
  if (!iso) return null
  return new Date(`${iso}T00:00:00`).getTime()
}

export function sortTodosByDueDate(todos, order = 'desc') {
  const multiplier = order === 'asc' ? 1 : -1

  return [...todos].sort((a, b) => {
    const aDate = parseDueDateSortValue(a.due_date)
    const bDate = parseDueDateSortValue(b.due_date)

    if (aDate === null && bDate === null) return 0
    if (aDate === null) return 1
    if (bDate === null) return -1

    return (aDate - bDate) * multiplier
  })
}

function renderStatusOptions(statuses, selectedStatusId) {
  const selected = String(selectedStatusId || '')
  return (statuses || [])
    .map((status) => {
      const isSelected = String(status.id) === selected ? ' selected' : ''
      return `<option value="${escapeHtml(status.id)}"${isSelected}>${escapeHtml(status.name)}</option>`
    })
    .join('')
}

export function renderTodoItem(todo, statuses = []) {
  const completedClass = todo.completed ? ' todo-item--completed' : ''
  const checked = todo.completed ? ' checked' : ''
  const dueDateValue = formatDueDateForInput(todo.due_date)
  const dueDate = dueDateValue
    ? `<span class="todo-item__due">Due ${escapeHtml(dueDateValue)}</span>`
    : ''
  const priority = todo.priority || 'medium'
  const statusId = todo.status_id || ''
  const statusOptions = renderStatusOptions(statuses, statusId)
  const categoryPath = todo.category_path
    ? `<span class="todo-item__category">${escapeHtml(todo.category_path)}</span>`
    : ''

  return `
<li class="todo-item${completedClass}" data-todo-id="${escapeHtml(todo.id)}" data-todo-priority="${escapeHtml(priority)}" data-todo-due-date="${escapeHtml(dueDateValue)}" data-todo-status-id="${escapeHtml(statusId)}">
  <label class="todo-item__check">
    <input type="checkbox" class="todo-item__checkbox" data-action="toggle-complete"${checked} aria-label="Mark complete">
  </label>
  <div class="todo-item__body">
    <span class="todo-item__title" data-action="edit-todo" tabindex="0">${escapeHtml(todo.name)}</span>
    <div class="todo-item__meta">
      ${categoryPath}
      <select class="todo-item__status" data-action="change-status" aria-label="Status">${statusOptions}</select>
      <span class="todo-item__priority todo-item__priority--${escapeHtml(priority)}">${escapeHtml(priority)}</span>
      ${dueDate}
    </div>
  </div>
  <div class="todo-item__actions">
    <button type="button" class="todo-item__edit" data-action="edit-todo-btn" aria-label="Edit todo">Edit</button>
    <button type="button" class="todo-item__delete" data-action="delete" aria-label="Delete todo">Delete</button>
  </div>
</li>`
}

export function renderTodoList(todos, statuses = []) {
  return todos.map((todo) => renderTodoItem(todo, statuses)).join('')
}

export function updateCounts(root, counts) {
  root.querySelector('[data-count="all"]').textContent = counts.all
  root.querySelector('[data-count="active"]').textContent = counts.active
  root.querySelector('[data-count="completed"]').textContent = counts.completed
}

export function setEmptyState(root, isEmpty) {
  const emptyEl = root.querySelector('#todo-empty')
  if (emptyEl) {
    emptyEl.classList.toggle('todo-empty--hidden', !isEmpty)
  }
}

export function setActiveFilter(root, status) {
  root.querySelectorAll('.todo-filters__btn').forEach((button) => {
    const isActive = button.dataset.filter === status
    button.classList.toggle('todo-filters__btn--active', isActive)
    button.setAttribute('aria-selected', isActive ? 'true' : 'false')
  })
}

export function setActiveCategory(root, categoryId) {
  const activeId = String(categoryId || '')
  root.querySelectorAll('[data-action="filter-category"]').forEach((button) => {
    const buttonId = button.dataset.category || ''
    const isActive = buttonId === activeId
    button.classList.toggle('category-filter__btn--active', isActive)
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false')
  })
}

export function updateCategoryCounts(root, categories) {
  ;(categories || []).forEach((category) => {
    const countEl = root.querySelector(`[data-category-count="${category.id}"]`)
    if (countEl) {
      countEl.textContent = category.todo_count ?? 0
    }
  })
}

export function renderStatusRow(status) {
  const completedChecked = status.is_completed ? ' checked' : ''
  const defaultChecked = status.is_default ? ' checked' : ''

  return `
<tr data-status-id="${escapeHtml(status.id)}">
  <td><input type="text" class="status-table__input" data-field="name" value="${escapeHtml(status.name)}" aria-label="Status name"></td>
  <td><input type="number" class="status-table__number" data-field="sort_order" value="${escapeHtml(status.sort_order ?? 0)}" min="0" step="1" aria-label="Sort order"></td>
  <td><input type="text" class="status-table__input" data-field="color" value="${escapeHtml(status.color || '')}" aria-label="Color"></td>
  <td class="status-table__center"><input type="checkbox" data-field="is_completed"${completedChecked} aria-label="Completed status"></td>
  <td class="status-table__center"><input type="checkbox" data-field="is_default"${defaultChecked} aria-label="Default status"></td>
  <td class="status-table__actions">
    <button type="button" class="status-table__delete" data-action="delete-status">Delete</button>
  </td>
</tr>`
}

export function renderStatusTable(statuses) {
  return (statuses || []).map(renderStatusRow).join('')
}

export function setStatusEmptyState(root, isEmpty) {
  const emptyEl = root.querySelector('#status-empty')
  if (emptyEl) {
    emptyEl.classList.toggle('todo-empty--hidden', !isEmpty)
  }
}

function isRootCategory(category) {
  const parentId = String(category.parent_id || '').trim()
  return parentId === '' || parentId === '0'
}

export function orderCategoriesHierarchically(categories) {
  const roots = (categories || [])
    .filter(isRootCategory)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  const ordered = []
  roots.forEach((root) => {
    ordered.push({ ...root, depth: 0 })
    ;(categories || [])
      .filter((category) => String(category.parent_id) === String(root.id))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .forEach((child) => ordered.push({ ...child, depth: 1 }))
  })
  return ordered
}

function renderParentOptions(categories, selectedParentId, currentId, disabled) {
  const roots = (categories || []).filter(isRootCategory)
  const selected = String(selectedParentId || '')
  const disabledAttr = disabled ? ' disabled' : ''
  let options = `<option value=""${selected === '' ? ' selected' : ''}>— Root —</option>`

  roots.forEach((root) => {
    if (String(root.id) === String(currentId)) return
    const isSelected = String(root.id) === selected ? ' selected' : ''
    options += `<option value="${escapeHtml(root.id)}"${isSelected}>${escapeHtml(root.name)}</option>`
  })

  return `<select class="category-table__select" data-field="parent_id" aria-label="Parent category"${disabledAttr}>${options}</select>`
}

export function renderCategoryRow(category, allCategories) {
  const depth = category.depth ?? (isRootCategory(category) ? 0 : 1)
  const childClass = depth > 0 ? ' category-table__row--child' : ''
  const parentSelect = renderParentOptions(
    allCategories,
    category.parent_id,
    category.id,
    depth === 0,
  )

  return `
<tr class="category-table__row${childClass}" data-category-id="${escapeHtml(category.id)}" data-category-depth="${depth}">
  <td class="category-table__name">
    <input type="text" class="category-table__input category-table__input--name" data-field="name" value="${escapeHtml(category.name)}" aria-label="Category name">
  </td>
  <td>${parentSelect}</td>
  <td>
    <input type="number" class="category-table__number" data-field="sort_order" value="${escapeHtml(category.sort_order ?? 0)}" min="0" step="1" aria-label="Sort order">
  </td>
  <td class="category-table__actions">
    <button type="button" class="category-table__delete" data-action="delete-category">Delete</button>
  </td>
</tr>`
}

export function renderCategoryTable(categories) {
  const ordered = orderCategoriesHierarchically(categories)
  return ordered.map((category) => renderCategoryRow(category, categories)).join('')
}

export function renderCategoryParentOptions(categories, selectedParentId = '') {
  const roots = orderCategoriesHierarchically(categories).filter((category) => category.depth === 0)
  const selected = String(selectedParentId || '')
  let options = `<option value=""${selected === '' ? ' selected' : ''}>— Root category —</option>`

  roots.forEach((root) => {
    const isSelected = String(root.id) === selected ? ' selected' : ''
    options += `<option value="${escapeHtml(root.id)}"${isSelected}>${escapeHtml(root.name)}</option>`
  })

  return options
}

export function setCategoryEmptyState(root, isEmpty) {
  const emptyEl = root.querySelector('#category-empty')
  if (emptyEl) {
    emptyEl.classList.toggle('todo-empty--hidden', !isEmpty)
  }
}
