import { createApiClient } from './api.js'

export function waitForTodoSync(apiBase, todoId) {
  const api = createApiClient(apiBase)

  return api.list().then((data) => {
    const found = (data.todos || []).find((todo) => todo.uuid === String(todoId))
    if (found) return found
    return new Promise(() => {})
  })
}
