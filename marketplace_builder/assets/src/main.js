import { initTodoApp } from './todo-app.js'
import { initStatusesApp } from './statuses-app.js'
import { initCategoriesApp } from './categories-app.js'

document.addEventListener('DOMContentLoaded', () => {
  initTodoApp()
  initStatusesApp()
  initCategoriesApp()
})
