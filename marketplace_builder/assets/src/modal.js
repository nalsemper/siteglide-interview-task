export function createModalController(root) {
  const dialog = root.querySelector('#todo-modal')
  const form = root.querySelector('#todo-modal-form')
  const titleEl = root.querySelector('#todo-modal-title')
  const messageEl = root.querySelector('#todo-modal-message')
  const fieldsEl = root.querySelector('#todo-modal-fields')
  const editNameEl = root.querySelector('#todo-modal-edit-name')
  const editDueDateEl = root.querySelector('#todo-modal-edit-due-date')
  const editPriorityEl = root.querySelector('#todo-modal-edit-priority')
  const cancelBtn = root.querySelector('#todo-modal-cancel')
  const confirmBtn = root.querySelector('#todo-modal-confirm')

  if (!dialog || !form) {
    return {
      alert: async (message) => {
        window.alert(message)
      },
      confirm: async () => window.confirm('Continue?'),
      editTodo: async () => null,
    }
  }

  let resolver = null
  let mode = 'alert'

  function closeWith(value) {
    if (!resolver) return
    const resolve = resolver
    resolver = null
    dialog.close()
    resolve(value)
  }

  function openModal(config) {
    mode = config.mode

    return new Promise((resolve) => {
      resolver = resolve

      titleEl.textContent = config.title
      messageEl.textContent = config.message
      messageEl.hidden = !config.message

      fieldsEl.hidden = mode !== 'edit'
      cancelBtn.hidden = !config.showCancel
      confirmBtn.textContent = config.confirmLabel || 'OK'
      confirmBtn.classList.toggle('todo-modal__btn--danger', Boolean(config.danger))

      if (mode === 'edit') {
        editNameEl.value = config.name || ''
        editDueDateEl.value = config.due_date || ''
        editPriorityEl.value = config.priority || 'medium'
      }

      dialog.showModal()

      if (mode === 'edit') {
        editNameEl.focus()
        editNameEl.select()
      } else {
        confirmBtn.focus()
      }
    })
  }

  cancelBtn.addEventListener('click', () => {
    closeWith(null)
  })

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault()
    closeWith(null)
  })

  dialog.addEventListener('close', () => {
    if (resolver) {
      closeWith(null)
    }
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    if (mode === 'edit') {
      const name = editNameEl.value.trim()
      if (!name) {
        editNameEl.focus()
        return
      }

      closeWith({
        name,
        due_date: editDueDateEl.value,
        priority: editPriorityEl.value || 'medium',
      })
      return
    }

    closeWith(true)
  })

  return {
    alert(message, title = 'Something went wrong') {
      return openModal({
        mode: 'alert',
        title,
        message,
        showCancel: false,
        confirmLabel: 'OK',
        danger: false,
      })
    },

    confirm(message, title = 'Are you sure?', options = {}) {
      return openModal({
        mode: 'confirm',
        title,
        message,
        showCancel: true,
        confirmLabel: options.confirmLabel || 'Confirm',
        danger: Boolean(options.danger),
      }).then((result) => result === true)
    },

    editTodo(options = {}) {
      return openModal({
        mode: 'edit',
        title: options.title || 'Edit todo',
        message: options.message || '',
        showCancel: true,
        confirmLabel: options.confirmLabel || 'Save',
        danger: false,
        name: options.name || '',
        due_date: options.due_date || '',
        priority: options.priority || 'medium',
      })
    },
  }
}
