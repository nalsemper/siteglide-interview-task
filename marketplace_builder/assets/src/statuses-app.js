import { createStatusesApiClient } from './api.js'
import { renderStatusTable, setStatusEmptyState } from './dom.js'
import { createModalController } from './modal.js'
import { showToast } from './toast.js'

function readStatusRow(row) {
  return {
    id: row.dataset.statusId,
    name: row.querySelector('[data-field="name"]')?.value.trim() || '',
    sort_order: Number(row.querySelector('[data-field="sort_order"]')?.value || 0),
    color: row.querySelector('[data-field="color"]')?.value.trim() || '',
    is_completed: row.querySelector('[data-field="is_completed"]')?.checked || false,
    is_default: row.querySelector('[data-field="is_default"]')?.checked || false,
  }
}

export function initStatusesApp() {
  const root = document.getElementById('todo-statuses-app')
  if (!root) return

  const api = createStatusesApiClient(root.dataset.apiBase || '/api/todo-statuses')
  const modal = createModalController(root)
  const tableBody = root.querySelector('#status-table-body')
  const formEl = root.querySelector('#status-add-form')
  const submitBtn = formEl?.querySelector('.status-add-form__submit')

  let isLoading = false
  const saveTimers = new Map()

  async function refreshStatuses() {
    if (isLoading) return
    isLoading = true

    try {
      const data = await api.list()
      const statuses = data.statuses || []
      tableBody.innerHTML = renderStatusTable(statuses)
      setStatusEmptyState(root, statuses.length === 0)
    } catch (error) {
      console.error('Failed to load statuses', error)
      await modal.alert(error.message || 'Failed to load statuses', 'Could not load statuses')
    } finally {
      isLoading = false
    }
  }

  async function saveStatusRow(row) {
    const payload = readStatusRow(row)
    if (!payload.name) return

    try {
      await api.update(payload)
      showToast('Status saved')
    } catch (error) {
      console.error('Failed to update status', error)
      await modal.alert(error.message || 'Failed to update status', 'Could not save status')
    }
  }

  function scheduleSave(row) {
    const id = row.dataset.statusId
    if (!id) return

    clearTimeout(saveTimers.get(id))
    saveTimers.set(
      id,
      setTimeout(() => {
        saveStatusRow(row)
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
      sort_order: Number(formData.get('sort_order') || 0),
      color: String(formData.get('color') || '').trim(),
      is_completed: formData.get('is_completed') === '1',
      is_default: formData.get('is_default') === '1',
    }

    if (!payload.name) return

    submitBtn.disabled = true

    try {
      await api.create(payload)
      formEl.reset()
      formEl.querySelector('[name="sort_order"]').value = '0'
      await refreshStatuses()
      showToast('Status added')
    } catch (error) {
      console.error('Failed to create status', error)
      await modal.alert(error.message || 'Failed to create status', 'Could not add status')
    } finally {
      submitBtn.disabled = false
    }
  })

  tableBody?.addEventListener('input', (event) => {
    const row = event.target.closest('[data-status-id]')
    if (!row) return
    scheduleSave(row)
  })

  tableBody?.addEventListener('change', (event) => {
    const row = event.target.closest('[data-status-id]')
    if (!row) return
    scheduleSave(row)
  })

  tableBody?.addEventListener('click', async (event) => {
    const deleteBtn = event.target.closest('[data-action="delete-status"]')
    if (!deleteBtn) return

    const row = deleteBtn.closest('[data-status-id]')
    if (!row) return

    const confirmed = await modal.confirm('This status will be permanently deleted.', 'Delete status?', {
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!confirmed) return

    try {
      await api.delete(row.dataset.statusId)
      await refreshStatuses()
      showToast('Status deleted')
    } catch (error) {
      console.error('Failed to delete status', error)
      await modal.alert(error.message || 'Failed to delete status', 'Could not delete status')
    }
  })
}
