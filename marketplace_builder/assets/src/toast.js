export function showToast(message, type = 'success') {
  const container = document.getElementById('todo-toast')
  if (!container) return

  const toast = document.createElement('div')
  toast.className = `todo-toast todo-toast--${type}`
  toast.textContent = message
  toast.setAttribute('role', 'status')
  container.appendChild(toast)

  requestAnimationFrame(() => {
    toast.classList.add('todo-toast--visible')
  })

  setTimeout(() => {
    toast.classList.remove('todo-toast--visible')
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}
