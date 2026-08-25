(function() {
  "use strict";
  function buildQuery(params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== void 0 && value !== null && value !== "") {
        search.set(key, String(value));
      }
    });
    const query = search.toString();
    return query ? `?${query}` : "";
  }
  function createApiClient(baseUrl) {
    async function request(path, options = {}) {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: {
          Accept: "application/json",
          ...options.body ? { "Content-Type": "application/json" } : {}
        },
        ...options
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response from server");
      }
      if (!response.ok || data.error) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }
      return data;
    }
    return {
      list(params = {}) {
        return request(`/list.json${buildQuery(params)}`);
      },
      create(payload) {
        return request("/create.json", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      update(payload) {
        return request("/update.json", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      delete(id) {
        return request("/delete.json", {
          method: "POST",
          body: JSON.stringify({ id })
        });
      },
      clearCompleted() {
        return request("/clear-completed.json", {
          method: "POST",
          body: JSON.stringify({})
        });
      }
    };
  }
  function createStatusesApiClient(baseUrl) {
    async function request(path, options = {}) {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: {
          Accept: "application/json",
          ...options.body ? { "Content-Type": "application/json" } : {}
        },
        ...options
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response from server");
      }
      if (!response.ok || data.error) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }
      return data;
    }
    return {
      list() {
        return request("/list.json");
      },
      create(payload) {
        return request("/create.json", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      update(payload) {
        return request("/update.json", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      delete(id) {
        return request("/delete.json", {
          method: "POST",
          body: JSON.stringify({ id })
        });
      }
    };
  }
  function createCategoriesApiClient(baseUrl) {
    async function request(path, options = {}) {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: {
          Accept: "application/json",
          ...options.body ? { "Content-Type": "application/json" } : {}
        },
        ...options
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response from server");
      }
      if (!response.ok || data.error) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }
      return data;
    }
    return {
      list() {
        return request("/list.json");
      },
      create(payload) {
        return request("/create.json", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      update(payload) {
        return request("/update.json", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      delete(id) {
        return request("/delete.json", {
          method: "POST",
          body: JSON.stringify({ id })
        });
      }
    };
  }
  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function formatDueDateForInput(value) {
    if (value == null || value === "") return "";
    const str = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    return "";
  }
  function parseDueDateSortValue(value) {
    const iso = formatDueDateForInput(value);
    if (!iso) return null;
    return (/* @__PURE__ */ new Date(`${iso}T00:00:00`)).getTime();
  }
  function sortTodosByDueDate(todos, order = "desc") {
    const multiplier = order === "asc" ? 1 : -1;
    return [...todos].sort((a, b) => {
      const aDate = parseDueDateSortValue(a.due_date);
      const bDate = parseDueDateSortValue(b.due_date);
      if (aDate === null && bDate === null) return 0;
      if (aDate === null) return 1;
      if (bDate === null) return -1;
      return (aDate - bDate) * multiplier;
    });
  }
  function renderStatusOptions(statuses, selectedStatusId) {
    const selected = String(selectedStatusId || "");
    return (statuses || []).map((status) => {
      const isSelected = String(status.id) === selected ? " selected" : "";
      return `<option value="${escapeHtml(status.id)}"${isSelected}>${escapeHtml(status.name)}</option>`;
    }).join("");
  }
  function renderTodoItem(todo, statuses = []) {
    const completedClass = todo.completed ? " todo-item--completed" : "";
    const checked = todo.completed ? " checked" : "";
    const dueDateValue = formatDueDateForInput(todo.due_date);
    const dueDate = dueDateValue ? `<span class="todo-item__due">Due ${escapeHtml(dueDateValue)}</span>` : "";
    const priority = todo.priority || "medium";
    const statusId = todo.status_id || "";
    const statusOptions = renderStatusOptions(statuses, statusId);
    const categoryPath = todo.category_path ? `<span class="todo-item__category">${escapeHtml(todo.category_path)}</span>` : "";
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
</li>`;
  }
  function renderTodoList(todos, statuses = []) {
    return todos.map((todo) => renderTodoItem(todo, statuses)).join("");
  }
  function updateCounts(root, counts) {
    root.querySelector('[data-count="all"]').textContent = counts.all;
    root.querySelector('[data-count="active"]').textContent = counts.active;
    root.querySelector('[data-count="completed"]').textContent = counts.completed;
  }
  function setEmptyState(root, isEmpty) {
    const emptyEl = root.querySelector("#todo-empty");
    if (emptyEl) {
      emptyEl.classList.toggle("todo-empty--hidden", !isEmpty);
    }
  }
  function setActiveFilter(root, status) {
    root.querySelectorAll(".todo-filters__btn").forEach((button) => {
      const isActive = button.dataset.filter === status;
      button.classList.toggle("todo-filters__btn--active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }
  function setActiveCategory(root, categoryId) {
    const activeId = String(categoryId || "");
    root.querySelectorAll('[data-action="filter-category"]').forEach((button) => {
      const buttonId = button.dataset.category || "";
      const isActive = buttonId === activeId;
      button.classList.toggle("category-filter__btn--active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }
  function updateCategoryCounts(root, categories) {
    (categories || []).forEach((category) => {
      const countEl = root.querySelector(`[data-category-count="${category.id}"]`);
      if (countEl) {
        countEl.textContent = category.todo_count ?? 0;
      }
    });
  }
  function renderStatusRow(status) {
    const completedChecked = status.is_completed ? " checked" : "";
    const defaultChecked = status.is_default ? " checked" : "";
    return `
<tr data-status-id="${escapeHtml(status.id)}">
  <td><input type="text" class="status-table__input" data-field="name" value="${escapeHtml(status.name)}" aria-label="Status name"></td>
  <td><input type="number" class="status-table__number" data-field="sort_order" value="${escapeHtml(status.sort_order ?? 0)}" min="0" step="1" aria-label="Sort order"></td>
  <td><input type="text" class="status-table__input" data-field="color" value="${escapeHtml(status.color || "")}" aria-label="Color"></td>
  <td class="status-table__center"><input type="checkbox" data-field="is_completed"${completedChecked} aria-label="Completed status"></td>
  <td class="status-table__center"><input type="checkbox" data-field="is_default"${defaultChecked} aria-label="Default status"></td>
  <td class="status-table__actions">
    <button type="button" class="status-table__delete" data-action="delete-status">Delete</button>
  </td>
</tr>`;
  }
  function renderStatusTable(statuses) {
    return (statuses || []).map(renderStatusRow).join("");
  }
  function setStatusEmptyState(root, isEmpty) {
    const emptyEl = root.querySelector("#status-empty");
    if (emptyEl) {
      emptyEl.classList.toggle("todo-empty--hidden", !isEmpty);
    }
  }
  function isRootCategory(category) {
    const parentId = String(category.parent_id || "").trim();
    return parentId === "" || parentId === "0";
  }
  function orderCategoriesHierarchically(categories) {
    const roots = (categories || []).filter(isRootCategory).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const ordered = [];
    roots.forEach((root) => {
      ordered.push({ ...root, depth: 0 });
      (categories || []).filter((category) => String(category.parent_id) === String(root.id)).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).forEach((child) => ordered.push({ ...child, depth: 1 }));
    });
    return ordered;
  }
  function renderParentOptions(categories, selectedParentId, currentId, disabled) {
    const roots = (categories || []).filter(isRootCategory);
    const selected = String(selectedParentId || "");
    const disabledAttr = disabled ? " disabled" : "";
    let options = `<option value=""${selected === "" ? " selected" : ""}>— Root —</option>`;
    roots.forEach((root) => {
      if (String(root.id) === String(currentId)) return;
      const isSelected = String(root.id) === selected ? " selected" : "";
      options += `<option value="${escapeHtml(root.id)}"${isSelected}>${escapeHtml(root.name)}</option>`;
    });
    return `<select class="category-table__select" data-field="parent_id" aria-label="Parent category"${disabledAttr}>${options}</select>`;
  }
  function renderCategoryRow(category, allCategories) {
    const depth = category.depth ?? (isRootCategory(category) ? 0 : 1);
    const childClass = depth > 0 ? " category-table__row--child" : "";
    const parentSelect = renderParentOptions(
      allCategories,
      category.parent_id,
      category.id,
      depth === 0
    );
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
</tr>`;
  }
  function renderCategoryTable(categories) {
    const ordered = orderCategoriesHierarchically(categories);
    return ordered.map((category) => renderCategoryRow(category, categories)).join("");
  }
  function renderCategoryParentOptions(categories, selectedParentId = "") {
    const roots = orderCategoriesHierarchically(categories).filter((category) => category.depth === 0);
    const selected = String(selectedParentId || "");
    let options = `<option value=""${selected === "" ? " selected" : ""}>— Root category —</option>`;
    roots.forEach((root) => {
      const isSelected = String(root.id) === selected ? " selected" : "";
      options += `<option value="${escapeHtml(root.id)}"${isSelected}>${escapeHtml(root.name)}</option>`;
    });
    return options;
  }
  function setCategoryEmptyState(root, isEmpty) {
    const emptyEl = root.querySelector("#category-empty");
    if (emptyEl) {
      emptyEl.classList.toggle("todo-empty--hidden", !isEmpty);
    }
  }
  function createModalController(root) {
    const dialog = root.querySelector("#todo-modal");
    const form = root.querySelector("#todo-modal-form");
    const titleEl = root.querySelector("#todo-modal-title");
    const messageEl = root.querySelector("#todo-modal-message");
    const fieldsEl = root.querySelector("#todo-modal-fields");
    const editNameEl = root.querySelector("#todo-modal-edit-name");
    const editDueDateEl = root.querySelector("#todo-modal-edit-due-date");
    const editPriorityEl = root.querySelector("#todo-modal-edit-priority");
    const cancelBtn = root.querySelector("#todo-modal-cancel");
    const confirmBtn = root.querySelector("#todo-modal-confirm");
    if (!dialog || !form) {
      return {
        alert: async (message) => {
          window.alert(message);
        },
        confirm: async () => window.confirm("Continue?"),
        editTodo: async () => null
      };
    }
    let resolver = null;
    let mode = "alert";
    function closeWith(value) {
      if (!resolver) return;
      const resolve = resolver;
      resolver = null;
      dialog.close();
      resolve(value);
    }
    function openModal(config) {
      mode = config.mode;
      return new Promise((resolve) => {
        resolver = resolve;
        titleEl.textContent = config.title;
        messageEl.textContent = config.message;
        messageEl.hidden = !config.message;
        fieldsEl.hidden = mode !== "edit";
        cancelBtn.hidden = !config.showCancel;
        confirmBtn.textContent = config.confirmLabel || "OK";
        confirmBtn.classList.toggle("todo-modal__btn--danger", Boolean(config.danger));
        if (mode === "edit") {
          editNameEl.value = config.name || "";
          editDueDateEl.value = config.due_date || "";
          editPriorityEl.value = config.priority || "medium";
        }
        dialog.showModal();
        if (mode === "edit") {
          editNameEl.focus();
          editNameEl.select();
        } else {
          confirmBtn.focus();
        }
      });
    }
    cancelBtn.addEventListener("click", () => {
      closeWith(null);
    });
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeWith(null);
    });
    dialog.addEventListener("close", () => {
      if (resolver) {
        closeWith(null);
      }
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (mode === "edit") {
        const name = editNameEl.value.trim();
        if (!name) {
          editNameEl.focus();
          return;
        }
        closeWith({
          name,
          due_date: editDueDateEl.value,
          priority: editPriorityEl.value || "medium"
        });
        return;
      }
      closeWith(true);
    });
    return {
      alert(message, title = "Something went wrong") {
        return openModal({
          mode: "alert",
          title,
          message,
          showCancel: false,
          confirmLabel: "OK",
          danger: false
        });
      },
      confirm(message, title = "Are you sure?", options = {}) {
        return openModal({
          mode: "confirm",
          title,
          message,
          showCancel: true,
          confirmLabel: options.confirmLabel || "Confirm",
          danger: Boolean(options.danger)
        }).then((result) => result === true);
      },
      editTodo(options = {}) {
        return openModal({
          mode: "edit",
          title: options.title || "Edit todo",
          message: options.message || "",
          showCancel: true,
          confirmLabel: options.confirmLabel || "Save",
          danger: false,
          name: options.name || "",
          due_date: options.due_date || "",
          priority: options.priority || "medium"
        });
      }
    };
  }
  function showToast(message, type = "success") {
    const container = document.getElementById("todo-toast");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `todo-toast todo-toast--${type}`;
    toast.textContent = message;
    toast.setAttribute("role", "status");
    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.add("todo-toast--visible");
    });
    setTimeout(() => {
      toast.classList.remove("todo-toast--visible");
      setTimeout(() => toast.remove(), 300);
    }, 3e3);
  }
  function waitForTodoSync(apiBase, todoId) {
    const api = createApiClient(apiBase);
    return api.list().then((data) => {
      const found = (data.todos || []).find((todo) => todo.uuid === String(todoId));
      if (found) return found;
      return new Promise(() => {
      });
    });
  }
  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
  function readFilters(root) {
    var _a, _b, _c;
    const activeButton = root.querySelector(".todo-filters__btn--active");
    return {
      status: activeButton ? activeButton.dataset.filter : "all",
      keyword: ((_a = root.querySelector("#todo-search")) == null ? void 0 : _a.value.trim()) || "",
      priority: ((_b = root.querySelector("#todo-priority-filter")) == null ? void 0 : _b.value) || "",
      order: ((_c = root.querySelector("#todo-sort-due-date")) == null ? void 0 : _c.value) || "desc",
      category: root.dataset.activeCategory || ""
    };
  }
  function initTodoApp() {
    var _a, _b, _c, _d;
    const root = document.getElementById("todo-app");
    if (!root) return;
    const api = createApiClient(root.dataset.apiBase || "/api/todos");
    const modal = createModalController(root);
    const listEl = root.querySelector("#todo-list");
    const formEl = root.querySelector("#todo-add-form");
    const submitBtn = formEl == null ? void 0 : formEl.querySelector(".todo-add-form__submit");
    const categoryFilterEl = root.querySelector("#todo-category-filter");
    let isLoading = false;
    let statusOptions = [];
    let defaultStatusId = root.dataset.defaultStatusId || "";
    let completedStatusId = root.dataset.completedStatusId || "";
    async function refreshList(options = {}) {
      var _a2, _b2;
      if (isLoading) return;
      isLoading = true;
      try {
        const filters = readFilters(root);
        const data = await api.list(filters);
        statusOptions = data.statuses || [];
        defaultStatusId = ((_a2 = data.meta) == null ? void 0 : _a2.default_status_id) || defaultStatusId;
        completedStatusId = ((_b2 = data.meta) == null ? void 0 : _b2.completed_status_id) || completedStatusId;
        const sortedTodos = sortTodosByDueDate(data.todos || [], filters.order);
        listEl.innerHTML = renderTodoList(sortedTodos, statusOptions);
        if (!options.skipCountsUpdate) {
          updateCounts(root, data.counts);
        }
        updateCategoryCounts(root, data.categories || []);
        setEmptyState(root, (data.todos || []).length === 0);
      } catch (error) {
        console.error("Failed to load todos", error);
        await modal.alert(error.message || "Failed to load todos", "Could not load todos");
      } finally {
        isLoading = false;
      }
    }
    const debouncedRefresh = debounce(refreshList, 300);
    root.querySelectorAll(".todo-filters__btn").forEach((button) => {
      button.addEventListener("click", () => {
        setActiveFilter(root, button.dataset.filter);
        refreshList();
      });
    });
    categoryFilterEl == null ? void 0 : categoryFilterEl.addEventListener("click", (event) => {
      const button = event.target.closest('[data-action="filter-category"]');
      if (!button) return;
      const categoryId = button.dataset.category || "";
      root.dataset.activeCategory = categoryId;
      setActiveCategory(root, categoryId);
      refreshList();
    });
    (_a = root.querySelector("#todo-search")) == null ? void 0 : _a.addEventListener("input", debouncedRefresh);
    (_b = root.querySelector("#todo-priority-filter")) == null ? void 0 : _b.addEventListener("change", refreshList);
    (_c = root.querySelector("#todo-sort-due-date")) == null ? void 0 : _c.addEventListener("change", refreshList);
    async function handleCreateSubmit(event) {
      event.preventDefault();
      if (!submitBtn) return;
      const formData = new FormData(formEl);
      const payload = {
        name: String(formData.get("name") || "").trim(),
        due_date: String(formData.get("due_date") || "").trim(),
        priority: String(formData.get("priority") || "medium"),
        category_id: String(formData.get("category_id") || "").trim()
      };
      if (!payload.name) return;
      submitBtn.disabled = true;
      try {
        const result = await api.create(payload);
        formEl.reset();
        formEl.querySelector('[name="priority"]').value = "medium";
        await waitForTodoSync(root.dataset.apiBase || "/api/todos", result.todo.id);
        await refreshList();
        showToast("Todo added");
        formEl.addEventListener("submit", handleCreateSubmit);
      } catch (error) {
        console.error("Failed to create todo", error);
        await modal.alert(error.message || "Failed to create todo", "Could not add todo");
      } finally {
        submitBtn.disabled = false;
      }
    }
    formEl == null ? void 0 : formEl.addEventListener("submit", handleCreateSubmit);
    listEl == null ? void 0 : listEl.addEventListener("change", async (event) => {
      const checkbox = event.target.closest('[data-action="toggle-complete"]');
      if (checkbox) {
        const checkboxes = listEl.querySelectorAll(".todo-item__checkbox");
        const items = listEl.querySelectorAll(".todo-item");
        const index = Array.from(checkboxes).indexOf(checkbox);
        const item2 = items[index];
        if (!item2) return;
        try {
          await api.update({ id: item2.dataset.todoId, completed: checkbox.checked });
          await refreshList();
          showToast(checkbox.checked ? "Todo completed" : "Todo reopened");
        } catch (error) {
          console.error("Failed to update todo", error);
          checkbox.checked = !checkbox.checked;
          await modal.alert(error.message || "Failed to update todo", "Could not update todo");
        }
        return;
      }
      const statusSelect = event.target.closest('[data-action="change-status"]');
      if (!statusSelect) return;
      const item = statusSelect.closest("[data-todo-id]");
      if (!item) return;
      const previousStatusId = item.dataset.todoStatusId || "";
      const nextStatusId = statusSelect.value;
      if (nextStatusId === previousStatusId) return;
      try {
        await api.update({ id: item.dataset.todoId, status_id: nextStatusId });
        await refreshList();
        showToast("Status updated");
      } catch (error) {
        console.error("Failed to update todo status", error);
        statusSelect.value = previousStatusId;
        await modal.alert(error.message || "Failed to update status", "Could not update status");
      }
    });
    listEl == null ? void 0 : listEl.addEventListener("click", async (event) => {
      var _a2, _b2;
      const deleteBtn = event.target.closest('[data-action="delete"]');
      if (deleteBtn) {
        const item = deleteBtn.closest("[data-todo-id]");
        if (!item) return;
        const confirmed = await modal.confirm("This todo will be permanently deleted.", "Delete todo?", {
          confirmLabel: "Delete",
          danger: true
        });
        if (!confirmed) return;
        try {
          await api.delete(item.dataset.todoId);
          await refreshList();
          showToast("Todo deleted");
        } catch (error) {
          console.error("Failed to delete todo", error);
          await modal.alert(error.message || "Failed to delete todo", "Could not delete todo");
        }
        return;
      }
      const editBtn = event.target.closest('[data-action="edit-todo-btn"]');
      const titleEl = event.target.closest('[data-action="edit-todo"]');
      const targetItem = (_a2 = editBtn || titleEl) == null ? void 0 : _a2.closest("[data-todo-id]");
      if (!targetItem) return;
      const currentTitle = ((_b2 = targetItem.querySelector(".todo-item__title")) == null ? void 0 : _b2.textContent) || "";
      const currentPriority = targetItem.dataset.todoPriority || "medium";
      const currentDueDate = targetItem.dataset.todoDueDate || "";
      const edits = await modal.editTodo({
        title: "Edit todo",
        name: currentTitle,
        priority: currentPriority,
        due_date: currentDueDate,
        confirmLabel: "Save"
      });
      if (edits === null) return;
      const trimmedName = edits.name.trim();
      const trimmedDueDate = edits.due_date.trim();
      const nextPriority = edits.priority || "medium";
      if (trimmedName === currentTitle.trim() && trimmedDueDate === currentDueDate && nextPriority === currentPriority) {
        return;
      }
      try {
        await api.update({
          id: targetItem.dataset.todoId,
          name: trimmedName,
          due_date: trimmedDueDate,
          due_date_cleared: trimmedDueDate === "",
          priority: nextPriority
        });
        await refreshList();
        showToast("Todo updated");
      } catch (error) {
        console.error("Failed to edit todo", error);
        await modal.alert(error.message || "Failed to edit todo", "Could not save changes");
      }
    });
    (_d = root.querySelector("#todo-clear-completed")) == null ? void 0 : _d.addEventListener("click", async () => {
      const confirmed = await modal.confirm(
        "All completed todos will be permanently deleted.",
        "Clear completed todos?",
        { confirmLabel: "Clear completed", danger: true }
      );
      if (!confirmed) return;
      try {
        await api.clearCompleted();
        await refreshList({ skipCountsUpdate: true });
        showToast("Completed todos cleared");
      } catch (error) {
        console.error("Failed to clear completed todos", error);
        await modal.alert(error.message || "Failed to clear completed todos", "Could not clear completed");
      }
    });
  }
  function readStatusRow(row) {
    var _a, _b, _c, _d, _e;
    return {
      id: row.dataset.statusId,
      name: ((_a = row.querySelector('[data-field="name"]')) == null ? void 0 : _a.value.trim()) || "",
      sort_order: Number(((_b = row.querySelector('[data-field="sort_order"]')) == null ? void 0 : _b.value) || 0),
      color: ((_c = row.querySelector('[data-field="color"]')) == null ? void 0 : _c.value.trim()) || "",
      is_completed: ((_d = row.querySelector('[data-field="is_completed"]')) == null ? void 0 : _d.checked) || false,
      is_default: ((_e = row.querySelector('[data-field="is_default"]')) == null ? void 0 : _e.checked) || false
    };
  }
  function initStatusesApp() {
    const root = document.getElementById("todo-statuses-app");
    if (!root) return;
    const api = createStatusesApiClient(root.dataset.apiBase || "/api/todo-statuses");
    const modal = createModalController(root);
    const tableBody = root.querySelector("#status-table-body");
    const formEl = root.querySelector("#status-add-form");
    const submitBtn = formEl == null ? void 0 : formEl.querySelector(".status-add-form__submit");
    let isLoading = false;
    const saveTimers = /* @__PURE__ */ new Map();
    async function refreshStatuses() {
      if (isLoading) return;
      isLoading = true;
      try {
        const data = await api.list();
        const statuses = data.statuses || [];
        tableBody.innerHTML = renderStatusTable(statuses);
        setStatusEmptyState(root, statuses.length === 0);
      } catch (error) {
        console.error("Failed to load statuses", error);
        await modal.alert(error.message || "Failed to load statuses", "Could not load statuses");
      } finally {
        isLoading = false;
      }
    }
    async function saveStatusRow(row) {
      const payload = readStatusRow(row);
      if (!payload.name) return;
      try {
        await api.update(payload);
        showToast("Status saved");
      } catch (error) {
        console.error("Failed to update status", error);
        await modal.alert(error.message || "Failed to update status", "Could not save status");
      }
    }
    function scheduleSave(row) {
      const id = row.dataset.statusId;
      if (!id) return;
      clearTimeout(saveTimers.get(id));
      saveTimers.set(
        id,
        setTimeout(() => {
          saveStatusRow(row);
          saveTimers.delete(id);
        }, 300)
      );
    }
    formEl == null ? void 0 : formEl.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!submitBtn) return;
      const formData = new FormData(formEl);
      const payload = {
        name: String(formData.get("name") || "").trim(),
        sort_order: Number(formData.get("sort_order") || 0),
        color: String(formData.get("color") || "").trim(),
        is_completed: formData.get("is_completed") === "1",
        is_default: formData.get("is_default") === "1"
      };
      if (!payload.name) return;
      submitBtn.disabled = true;
      try {
        await api.create(payload);
        formEl.reset();
        formEl.querySelector('[name="sort_order"]').value = "0";
        await refreshStatuses();
        showToast("Status added");
      } catch (error) {
        console.error("Failed to create status", error);
        await modal.alert(error.message || "Failed to create status", "Could not add status");
      } finally {
        submitBtn.disabled = false;
      }
    });
    tableBody == null ? void 0 : tableBody.addEventListener("input", (event) => {
      const row = event.target.closest("[data-status-id]");
      if (!row) return;
      scheduleSave(row);
    });
    tableBody == null ? void 0 : tableBody.addEventListener("change", (event) => {
      const row = event.target.closest("[data-status-id]");
      if (!row) return;
      scheduleSave(row);
    });
    tableBody == null ? void 0 : tableBody.addEventListener("click", async (event) => {
      const deleteBtn = event.target.closest('[data-action="delete-status"]');
      if (!deleteBtn) return;
      const row = deleteBtn.closest("[data-status-id]");
      if (!row) return;
      const confirmed = await modal.confirm("This status will be permanently deleted.", "Delete status?", {
        confirmLabel: "Delete",
        danger: true
      });
      if (!confirmed) return;
      try {
        await api.delete(row.dataset.statusId);
        await refreshStatuses();
        showToast("Status deleted");
      } catch (error) {
        console.error("Failed to delete status", error);
        await modal.alert(error.message || "Failed to delete status", "Could not delete status");
      }
    });
  }
  function readCategoryRow(row) {
    var _a, _b;
    const depth = Number(row.dataset.categoryDepth || 0);
    const parentSelect = row.querySelector('[data-field="parent_id"]');
    const payload = {
      id: row.dataset.categoryId,
      name: ((_a = row.querySelector('[data-field="name"]')) == null ? void 0 : _a.value.trim()) || "",
      sort_order: Number(((_b = row.querySelector('[data-field="sort_order"]')) == null ? void 0 : _b.value) || 0)
    };
    if (depth > 0) {
      payload.parent_id = (parentSelect == null ? void 0 : parentSelect.value) || "";
    }
    return payload;
  }
  function initCategoriesApp() {
    const root = document.getElementById("todo-categories-app");
    if (!root) return;
    const api = createCategoriesApiClient(root.dataset.apiBase || "/api/todo-categories");
    const modal = createModalController(root);
    const tableBody = root.querySelector("#category-table-body");
    const formEl = root.querySelector("#category-add-form");
    const submitBtn = formEl == null ? void 0 : formEl.querySelector(".category-add-form__submit");
    const parentSelectEl = formEl == null ? void 0 : formEl.querySelector('[name="parent_id"]');
    let isLoading = false;
    const saveTimers = /* @__PURE__ */ new Map();
    function updateAddFormParentOptions(categories) {
      if (!parentSelectEl) return;
      const selected = parentSelectEl.value;
      parentSelectEl.innerHTML = renderCategoryParentOptions(categories, selected);
    }
    async function refreshCategories() {
      if (isLoading) return;
      isLoading = true;
      try {
        const data = await api.list();
        const categories = data.categories || [];
        tableBody.innerHTML = renderCategoryTable(categories);
        updateAddFormParentOptions(categories);
        setCategoryEmptyState(root, categories.length === 0);
      } catch (error) {
        console.error("Failed to load categories", error);
        await modal.alert(error.message || "Failed to load categories", "Could not load categories");
      } finally {
        isLoading = false;
      }
    }
    async function saveCategoryRow(row) {
      const payload = readCategoryRow(row);
      if (!payload.name) return;
      try {
        await api.update(payload);
        showToast("Category saved");
        await refreshCategories();
      } catch (error) {
        console.error("Failed to update category", error);
        await modal.alert(error.message || "Failed to update category", "Could not save category");
      }
    }
    function scheduleSave(row) {
      const id = row.dataset.categoryId;
      if (!id) return;
      clearTimeout(saveTimers.get(id));
      saveTimers.set(
        id,
        setTimeout(() => {
          saveCategoryRow(row);
          saveTimers.delete(id);
        }, 300)
      );
    }
    formEl == null ? void 0 : formEl.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!submitBtn) return;
      const formData = new FormData(formEl);
      const payload = {
        name: String(formData.get("name") || "").trim(),
        parent_id: String(formData.get("parent_id") || "").trim(),
        sort_order: Number(formData.get("sort_order") || 0)
      };
      if (!payload.name) return;
      submitBtn.disabled = true;
      try {
        await api.create(payload);
        formEl.reset();
        formEl.querySelector('[name="sort_order"]').value = "0";
        await refreshCategories();
        showToast("Category added");
      } catch (error) {
        console.error("Failed to create category", error);
        await modal.alert(error.message || "Failed to create category", "Could not add category");
      } finally {
        submitBtn.disabled = false;
      }
    });
    tableBody == null ? void 0 : tableBody.addEventListener("input", (event) => {
      const row = event.target.closest("[data-category-id]");
      if (!row) return;
      scheduleSave(row);
    });
    tableBody == null ? void 0 : tableBody.addEventListener("change", (event) => {
      const row = event.target.closest("[data-category-id]");
      if (!row) return;
      scheduleSave(row);
    });
    tableBody == null ? void 0 : tableBody.addEventListener("click", async (event) => {
      const deleteBtn = event.target.closest('[data-action="delete-category"]');
      if (!deleteBtn) return;
      const row = deleteBtn.closest("[data-category-id]");
      if (!row) return;
      const confirmed = await modal.confirm("This category will be permanently deleted.", "Delete category?", {
        confirmLabel: "Delete",
        danger: true
      });
      if (!confirmed) return;
      try {
        await api.delete(row.dataset.categoryId);
        await refreshCategories();
        showToast("Category deleted");
      } catch (error) {
        console.error("Failed to delete category", error);
        await modal.alert(error.message || "Failed to delete category", "Could not delete category");
      }
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    initTodoApp();
    initStatusesApp();
    initCategoriesApp();
  });
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kby1hcHAuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9hcGkuanMiLCIuLi9zcmMvZG9tLmpzIiwiLi4vc3JjL21vZGFsLmpzIiwiLi4vc3JjL3RvYXN0LmpzIiwiLi4vc3JjL3N5bmMuanMiLCIuLi9zcmMvdG9kby1hcHAuanMiLCIuLi9zcmMvc3RhdHVzZXMtYXBwLmpzIiwiLi4vc3JjL2NhdGVnb3JpZXMtYXBwLmpzIiwiLi4vc3JjL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gYnVpbGRRdWVyeShwYXJhbXMpIHtcbiAgY29uc3Qgc2VhcmNoID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXG4gIE9iamVjdC5lbnRyaWVzKHBhcmFtcykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09ICcnKSB7XG4gICAgICBzZWFyY2guc2V0KGtleSwgU3RyaW5nKHZhbHVlKSlcbiAgICB9XG4gIH0pXG4gIGNvbnN0IHF1ZXJ5ID0gc2VhcmNoLnRvU3RyaW5nKClcbiAgcmV0dXJuIHF1ZXJ5ID8gYD8ke3F1ZXJ5fWAgOiAnJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXBpQ2xpZW50KGJhc2VVcmwpIHtcbiAgYXN5bmMgZnVuY3Rpb24gcmVxdWVzdChwYXRoLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke2Jhc2VVcmx9JHtwYXRofWAsIHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIC4uLihvcHRpb25zLmJvZHkgPyB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSA6IHt9KSxcbiAgICAgIH0sXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pXG5cbiAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpXG4gICAgbGV0IGRhdGFcblxuICAgIHRyeSB7XG4gICAgICBkYXRhID0gSlNPTi5wYXJzZSh0ZXh0KVxuICAgIH0gY2F0Y2gge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEpTT04gcmVzcG9uc2UgZnJvbSBzZXJ2ZXInKVxuICAgIH1cblxuICAgIGlmICghcmVzcG9uc2Uub2sgfHwgZGF0YS5lcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGRhdGEuZXJyb3IgfHwgYFJlcXVlc3QgZmFpbGVkICgke3Jlc3BvbnNlLnN0YXR1c30pYClcbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBsaXN0KHBhcmFtcyA9IHt9KSB7XG4gICAgICByZXR1cm4gcmVxdWVzdChgL2xpc3QuanNvbiR7YnVpbGRRdWVyeShwYXJhbXMpfWApXG4gICAgfSxcblxuICAgIGNyZWF0ZShwYXlsb2FkKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdCgnL2NyZWF0ZS5qc29uJywge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICB1cGRhdGUocGF5bG9hZCkge1xuICAgICAgcmV0dXJuIHJlcXVlc3QoJy91cGRhdGUuanNvbicsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgZGVsZXRlKGlkKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdCgnL2RlbGV0ZS5qc29uJywge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBpZCB9KSxcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGNsZWFyQ29tcGxldGVkKCkge1xuICAgICAgcmV0dXJuIHJlcXVlc3QoJy9jbGVhci1jb21wbGV0ZWQuanNvbicsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHt9KSxcbiAgICAgIH0pXG4gICAgfSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhdHVzZXNBcGlDbGllbnQoYmFzZVVybCkge1xuICBhc3luYyBmdW5jdGlvbiByZXF1ZXN0KHBhdGgsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7YmFzZVVybH0ke3BhdGh9YCwge1xuICAgICAgaGVhZGVyczoge1xuICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgLi4uKG9wdGlvbnMuYm9keSA/IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9IDoge30pLFxuICAgICAgfSxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfSlcblxuICAgIGNvbnN0IHRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KClcbiAgICBsZXQgZGF0YVxuXG4gICAgdHJ5IHtcbiAgICAgIGRhdGEgPSBKU09OLnBhcnNlKHRleHQpXG4gICAgfSBjYXRjaCB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSlNPTiByZXNwb25zZSBmcm9tIHNlcnZlcicpXG4gICAgfVxuXG4gICAgaWYgKCFyZXNwb25zZS5vayB8fCBkYXRhLmVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5lcnJvciB8fCBgUmVxdWVzdCBmYWlsZWQgKCR7cmVzcG9uc2Uuc3RhdHVzfSlgKVxuICAgIH1cblxuICAgIHJldHVybiBkYXRhXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGxpc3QoKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdCgnL2xpc3QuanNvbicpXG4gICAgfSxcblxuICAgIGNyZWF0ZShwYXlsb2FkKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdCgnL2NyZWF0ZS5qc29uJywge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICB1cGRhdGUocGF5bG9hZCkge1xuICAgICAgcmV0dXJuIHJlcXVlc3QoJy91cGRhdGUuanNvbicsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgZGVsZXRlKGlkKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdCgnL2RlbGV0ZS5qc29uJywge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBpZCB9KSxcbiAgICAgIH0pXG4gICAgfSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ2F0ZWdvcmllc0FwaUNsaWVudChiYXNlVXJsKSB7XG4gIGFzeW5jIGZ1bmN0aW9uIHJlcXVlc3QocGF0aCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtiYXNlVXJsfSR7cGF0aH1gLCB7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAuLi4ob3B0aW9ucy5ib2R5ID8geyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0gOiB7fSksXG4gICAgICB9LFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KVxuXG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKVxuICAgIGxldCBkYXRhXG5cbiAgICB0cnkge1xuICAgICAgZGF0YSA9IEpTT04ucGFyc2UodGV4dClcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBKU09OIHJlc3BvbnNlIGZyb20gc2VydmVyJylcbiAgICB9XG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rIHx8IGRhdGEuZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhLmVycm9yIHx8IGBSZXF1ZXN0IGZhaWxlZCAoJHtyZXNwb25zZS5zdGF0dXN9KWApXG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGFcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbGlzdCgpIHtcbiAgICAgIHJldHVybiByZXF1ZXN0KCcvbGlzdC5qc29uJylcbiAgICB9LFxuXG4gICAgY3JlYXRlKHBheWxvYWQpIHtcbiAgICAgIHJldHVybiByZXF1ZXN0KCcvY3JlYXRlLmpzb24nLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKSxcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHVwZGF0ZShwYXlsb2FkKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdCgnL3VwZGF0ZS5qc29uJywge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBkZWxldGUoaWQpIHtcbiAgICAgIHJldHVybiByZXF1ZXN0KCcvZGVsZXRlLmpzb24nLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGlkIH0pLFxuICAgICAgfSlcbiAgICB9LFxuICB9XG59XG4iLCJmdW5jdGlvbiBlc2NhcGVIdG1sKHZhbHVlKSB7XG4gIHJldHVybiBTdHJpbmcodmFsdWUpXG4gICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAucmVwbGFjZSgvJy9nLCAnJiMzOTsnKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RHVlRGF0ZUZvcklucHV0KHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsIHx8IHZhbHVlID09PSAnJykgcmV0dXJuICcnXG4gIGNvbnN0IHN0ciA9IFN0cmluZyh2YWx1ZSkudHJpbSgpXG4gIGlmICgvXlxcZHs0fS1cXGR7Mn0tXFxkezJ9JC8udGVzdChzdHIpKSByZXR1cm4gc3RyXG4gIHJldHVybiAnJ1xufVxuXG5mdW5jdGlvbiBwYXJzZUR1ZURhdGVTb3J0VmFsdWUodmFsdWUpIHtcbiAgY29uc3QgaXNvID0gZm9ybWF0RHVlRGF0ZUZvcklucHV0KHZhbHVlKVxuICBpZiAoIWlzbykgcmV0dXJuIG51bGxcbiAgcmV0dXJuIG5ldyBEYXRlKGAke2lzb31UMDA6MDA6MDBgKS5nZXRUaW1lKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvcnRUb2Rvc0J5RHVlRGF0ZSh0b2Rvcywgb3JkZXIgPSAnZGVzYycpIHtcbiAgY29uc3QgbXVsdGlwbGllciA9IG9yZGVyID09PSAnYXNjJyA/IDEgOiAtMVxuXG4gIHJldHVybiBbLi4udG9kb3NdLnNvcnQoKGEsIGIpID0+IHtcbiAgICBjb25zdCBhRGF0ZSA9IHBhcnNlRHVlRGF0ZVNvcnRWYWx1ZShhLmR1ZV9kYXRlKVxuICAgIGNvbnN0IGJEYXRlID0gcGFyc2VEdWVEYXRlU29ydFZhbHVlKGIuZHVlX2RhdGUpXG5cbiAgICBpZiAoYURhdGUgPT09IG51bGwgJiYgYkRhdGUgPT09IG51bGwpIHJldHVybiAwXG4gICAgaWYgKGFEYXRlID09PSBudWxsKSByZXR1cm4gMVxuICAgIGlmIChiRGF0ZSA9PT0gbnVsbCkgcmV0dXJuIC0xXG5cbiAgICByZXR1cm4gKGFEYXRlIC0gYkRhdGUpICogbXVsdGlwbGllclxuICB9KVxufVxuXG5mdW5jdGlvbiByZW5kZXJTdGF0dXNPcHRpb25zKHN0YXR1c2VzLCBzZWxlY3RlZFN0YXR1c0lkKSB7XG4gIGNvbnN0IHNlbGVjdGVkID0gU3RyaW5nKHNlbGVjdGVkU3RhdHVzSWQgfHwgJycpXG4gIHJldHVybiAoc3RhdHVzZXMgfHwgW10pXG4gICAgLm1hcCgoc3RhdHVzKSA9PiB7XG4gICAgICBjb25zdCBpc1NlbGVjdGVkID0gU3RyaW5nKHN0YXR1cy5pZCkgPT09IHNlbGVjdGVkID8gJyBzZWxlY3RlZCcgOiAnJ1xuICAgICAgcmV0dXJuIGA8b3B0aW9uIHZhbHVlPVwiJHtlc2NhcGVIdG1sKHN0YXR1cy5pZCl9XCIke2lzU2VsZWN0ZWR9PiR7ZXNjYXBlSHRtbChzdGF0dXMubmFtZSl9PC9vcHRpb24+YFxuICAgIH0pXG4gICAgLmpvaW4oJycpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJUb2RvSXRlbSh0b2RvLCBzdGF0dXNlcyA9IFtdKSB7XG4gIGNvbnN0IGNvbXBsZXRlZENsYXNzID0gdG9kby5jb21wbGV0ZWQgPyAnIHRvZG8taXRlbS0tY29tcGxldGVkJyA6ICcnXG4gIGNvbnN0IGNoZWNrZWQgPSB0b2RvLmNvbXBsZXRlZCA/ICcgY2hlY2tlZCcgOiAnJ1xuICBjb25zdCBkdWVEYXRlVmFsdWUgPSBmb3JtYXREdWVEYXRlRm9ySW5wdXQodG9kby5kdWVfZGF0ZSlcbiAgY29uc3QgZHVlRGF0ZSA9IGR1ZURhdGVWYWx1ZVxuICAgID8gYDxzcGFuIGNsYXNzPVwidG9kby1pdGVtX19kdWVcIj5EdWUgJHtlc2NhcGVIdG1sKGR1ZURhdGVWYWx1ZSl9PC9zcGFuPmBcbiAgICA6ICcnXG4gIGNvbnN0IHByaW9yaXR5ID0gdG9kby5wcmlvcml0eSB8fCAnbWVkaXVtJ1xuICBjb25zdCBzdGF0dXNJZCA9IHRvZG8uc3RhdHVzX2lkIHx8ICcnXG4gIGNvbnN0IHN0YXR1c09wdGlvbnMgPSByZW5kZXJTdGF0dXNPcHRpb25zKHN0YXR1c2VzLCBzdGF0dXNJZClcbiAgY29uc3QgY2F0ZWdvcnlQYXRoID0gdG9kby5jYXRlZ29yeV9wYXRoXG4gICAgPyBgPHNwYW4gY2xhc3M9XCJ0b2RvLWl0ZW1fX2NhdGVnb3J5XCI+JHtlc2NhcGVIdG1sKHRvZG8uY2F0ZWdvcnlfcGF0aCl9PC9zcGFuPmBcbiAgICA6ICcnXG5cbiAgcmV0dXJuIGBcbjxsaSBjbGFzcz1cInRvZG8taXRlbSR7Y29tcGxldGVkQ2xhc3N9XCIgZGF0YS10b2RvLWlkPVwiJHtlc2NhcGVIdG1sKHRvZG8uaWQpfVwiIGRhdGEtdG9kby1wcmlvcml0eT1cIiR7ZXNjYXBlSHRtbChwcmlvcml0eSl9XCIgZGF0YS10b2RvLWR1ZS1kYXRlPVwiJHtlc2NhcGVIdG1sKGR1ZURhdGVWYWx1ZSl9XCIgZGF0YS10b2RvLXN0YXR1cy1pZD1cIiR7ZXNjYXBlSHRtbChzdGF0dXNJZCl9XCI+XG4gIDxsYWJlbCBjbGFzcz1cInRvZG8taXRlbV9fY2hlY2tcIj5cbiAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJ0b2RvLWl0ZW1fX2NoZWNrYm94XCIgZGF0YS1hY3Rpb249XCJ0b2dnbGUtY29tcGxldGVcIiR7Y2hlY2tlZH0gYXJpYS1sYWJlbD1cIk1hcmsgY29tcGxldGVcIj5cbiAgPC9sYWJlbD5cbiAgPGRpdiBjbGFzcz1cInRvZG8taXRlbV9fYm9keVwiPlxuICAgIDxzcGFuIGNsYXNzPVwidG9kby1pdGVtX190aXRsZVwiIGRhdGEtYWN0aW9uPVwiZWRpdC10b2RvXCIgdGFiaW5kZXg9XCIwXCI+JHtlc2NhcGVIdG1sKHRvZG8ubmFtZSl9PC9zcGFuPlxuICAgIDxkaXYgY2xhc3M9XCJ0b2RvLWl0ZW1fX21ldGFcIj5cbiAgICAgICR7Y2F0ZWdvcnlQYXRofVxuICAgICAgPHNlbGVjdCBjbGFzcz1cInRvZG8taXRlbV9fc3RhdHVzXCIgZGF0YS1hY3Rpb249XCJjaGFuZ2Utc3RhdHVzXCIgYXJpYS1sYWJlbD1cIlN0YXR1c1wiPiR7c3RhdHVzT3B0aW9uc308L3NlbGVjdD5cbiAgICAgIDxzcGFuIGNsYXNzPVwidG9kby1pdGVtX19wcmlvcml0eSB0b2RvLWl0ZW1fX3ByaW9yaXR5LS0ke2VzY2FwZUh0bWwocHJpb3JpdHkpfVwiPiR7ZXNjYXBlSHRtbChwcmlvcml0eSl9PC9zcGFuPlxuICAgICAgJHtkdWVEYXRlfVxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cInRvZG8taXRlbV9fYWN0aW9uc1wiPlxuICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwidG9kby1pdGVtX19lZGl0XCIgZGF0YS1hY3Rpb249XCJlZGl0LXRvZG8tYnRuXCIgYXJpYS1sYWJlbD1cIkVkaXQgdG9kb1wiPkVkaXQ8L2J1dHRvbj5cbiAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInRvZG8taXRlbV9fZGVsZXRlXCIgZGF0YS1hY3Rpb249XCJkZWxldGVcIiBhcmlhLWxhYmVsPVwiRGVsZXRlIHRvZG9cIj5EZWxldGU8L2J1dHRvbj5cbiAgPC9kaXY+XG48L2xpPmBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclRvZG9MaXN0KHRvZG9zLCBzdGF0dXNlcyA9IFtdKSB7XG4gIHJldHVybiB0b2Rvcy5tYXAoKHRvZG8pID0+IHJlbmRlclRvZG9JdGVtKHRvZG8sIHN0YXR1c2VzKSkuam9pbignJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUNvdW50cyhyb290LCBjb3VudHMpIHtcbiAgcm9vdC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1jb3VudD1cImFsbFwiXScpLnRleHRDb250ZW50ID0gY291bnRzLmFsbFxuICByb290LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWNvdW50PVwiYWN0aXZlXCJdJykudGV4dENvbnRlbnQgPSBjb3VudHMuYWN0aXZlXG4gIHJvb3QucXVlcnlTZWxlY3RvcignW2RhdGEtY291bnQ9XCJjb21wbGV0ZWRcIl0nKS50ZXh0Q29udGVudCA9IGNvdW50cy5jb21wbGV0ZWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEVtcHR5U3RhdGUocm9vdCwgaXNFbXB0eSkge1xuICBjb25zdCBlbXB0eUVsID0gcm9vdC5xdWVyeVNlbGVjdG9yKCcjdG9kby1lbXB0eScpXG4gIGlmIChlbXB0eUVsKSB7XG4gICAgZW1wdHlFbC5jbGFzc0xpc3QudG9nZ2xlKCd0b2RvLWVtcHR5LS1oaWRkZW4nLCAhaXNFbXB0eSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QWN0aXZlRmlsdGVyKHJvb3QsIHN0YXR1cykge1xuICByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2RvLWZpbHRlcnNfX2J0bicpLmZvckVhY2goKGJ1dHRvbikgPT4ge1xuICAgIGNvbnN0IGlzQWN0aXZlID0gYnV0dG9uLmRhdGFzZXQuZmlsdGVyID09PSBzdGF0dXNcbiAgICBidXR0b24uY2xhc3NMaXN0LnRvZ2dsZSgndG9kby1maWx0ZXJzX19idG4tLWFjdGl2ZScsIGlzQWN0aXZlKVxuICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCBpc0FjdGl2ZSA/ICd0cnVlJyA6ICdmYWxzZScpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRBY3RpdmVDYXRlZ29yeShyb290LCBjYXRlZ29yeUlkKSB7XG4gIGNvbnN0IGFjdGl2ZUlkID0gU3RyaW5nKGNhdGVnb3J5SWQgfHwgJycpXG4gIHJvb3QucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwiZmlsdGVyLWNhdGVnb3J5XCJdJykuZm9yRWFjaCgoYnV0dG9uKSA9PiB7XG4gICAgY29uc3QgYnV0dG9uSWQgPSBidXR0b24uZGF0YXNldC5jYXRlZ29yeSB8fCAnJ1xuICAgIGNvbnN0IGlzQWN0aXZlID0gYnV0dG9uSWQgPT09IGFjdGl2ZUlkXG4gICAgYnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoJ2NhdGVnb3J5LWZpbHRlcl9fYnRuLS1hY3RpdmUnLCBpc0FjdGl2ZSlcbiAgICBidXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBpc0FjdGl2ZSA/ICd0cnVlJyA6ICdmYWxzZScpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVDYXRlZ29yeUNvdW50cyhyb290LCBjYXRlZ29yaWVzKSB7XG4gIDsoY2F0ZWdvcmllcyB8fCBbXSkuZm9yRWFjaCgoY2F0ZWdvcnkpID0+IHtcbiAgICBjb25zdCBjb3VudEVsID0gcm9vdC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1jYXRlZ29yeS1jb3VudD1cIiR7Y2F0ZWdvcnkuaWR9XCJdYClcbiAgICBpZiAoY291bnRFbCkge1xuICAgICAgY291bnRFbC50ZXh0Q29udGVudCA9IGNhdGVnb3J5LnRvZG9fY291bnQgPz8gMFxuICAgIH1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclN0YXR1c1JvdyhzdGF0dXMpIHtcbiAgY29uc3QgY29tcGxldGVkQ2hlY2tlZCA9IHN0YXR1cy5pc19jb21wbGV0ZWQgPyAnIGNoZWNrZWQnIDogJydcbiAgY29uc3QgZGVmYXVsdENoZWNrZWQgPSBzdGF0dXMuaXNfZGVmYXVsdCA/ICcgY2hlY2tlZCcgOiAnJ1xuXG4gIHJldHVybiBgXG48dHIgZGF0YS1zdGF0dXMtaWQ9XCIke2VzY2FwZUh0bWwoc3RhdHVzLmlkKX1cIj5cbiAgPHRkPjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic3RhdHVzLXRhYmxlX19pbnB1dFwiIGRhdGEtZmllbGQ9XCJuYW1lXCIgdmFsdWU9XCIke2VzY2FwZUh0bWwoc3RhdHVzLm5hbWUpfVwiIGFyaWEtbGFiZWw9XCJTdGF0dXMgbmFtZVwiPjwvdGQ+XG4gIDx0ZD48aW5wdXQgdHlwZT1cIm51bWJlclwiIGNsYXNzPVwic3RhdHVzLXRhYmxlX19udW1iZXJcIiBkYXRhLWZpZWxkPVwic29ydF9vcmRlclwiIHZhbHVlPVwiJHtlc2NhcGVIdG1sKHN0YXR1cy5zb3J0X29yZGVyID8/IDApfVwiIG1pbj1cIjBcIiBzdGVwPVwiMVwiIGFyaWEtbGFiZWw9XCJTb3J0IG9yZGVyXCI+PC90ZD5cbiAgPHRkPjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic3RhdHVzLXRhYmxlX19pbnB1dFwiIGRhdGEtZmllbGQ9XCJjb2xvclwiIHZhbHVlPVwiJHtlc2NhcGVIdG1sKHN0YXR1cy5jb2xvciB8fCAnJyl9XCIgYXJpYS1sYWJlbD1cIkNvbG9yXCI+PC90ZD5cbiAgPHRkIGNsYXNzPVwic3RhdHVzLXRhYmxlX19jZW50ZXJcIj48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgZGF0YS1maWVsZD1cImlzX2NvbXBsZXRlZFwiJHtjb21wbGV0ZWRDaGVja2VkfSBhcmlhLWxhYmVsPVwiQ29tcGxldGVkIHN0YXR1c1wiPjwvdGQ+XG4gIDx0ZCBjbGFzcz1cInN0YXR1cy10YWJsZV9fY2VudGVyXCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGRhdGEtZmllbGQ9XCJpc19kZWZhdWx0XCIke2RlZmF1bHRDaGVja2VkfSBhcmlhLWxhYmVsPVwiRGVmYXVsdCBzdGF0dXNcIj48L3RkPlxuICA8dGQgY2xhc3M9XCJzdGF0dXMtdGFibGVfX2FjdGlvbnNcIj5cbiAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInN0YXR1cy10YWJsZV9fZGVsZXRlXCIgZGF0YS1hY3Rpb249XCJkZWxldGUtc3RhdHVzXCI+RGVsZXRlPC9idXR0b24+XG4gIDwvdGQ+XG48L3RyPmBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclN0YXR1c1RhYmxlKHN0YXR1c2VzKSB7XG4gIHJldHVybiAoc3RhdHVzZXMgfHwgW10pLm1hcChyZW5kZXJTdGF0dXNSb3cpLmpvaW4oJycpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTdGF0dXNFbXB0eVN0YXRlKHJvb3QsIGlzRW1wdHkpIHtcbiAgY29uc3QgZW1wdHlFbCA9IHJvb3QucXVlcnlTZWxlY3RvcignI3N0YXR1cy1lbXB0eScpXG4gIGlmIChlbXB0eUVsKSB7XG4gICAgZW1wdHlFbC5jbGFzc0xpc3QudG9nZ2xlKCd0b2RvLWVtcHR5LS1oaWRkZW4nLCAhaXNFbXB0eSlcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1Jvb3RDYXRlZ29yeShjYXRlZ29yeSkge1xuICBjb25zdCBwYXJlbnRJZCA9IFN0cmluZyhjYXRlZ29yeS5wYXJlbnRfaWQgfHwgJycpLnRyaW0oKVxuICByZXR1cm4gcGFyZW50SWQgPT09ICcnIHx8IHBhcmVudElkID09PSAnMCdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yZGVyQ2F0ZWdvcmllc0hpZXJhcmNoaWNhbGx5KGNhdGVnb3JpZXMpIHtcbiAgY29uc3Qgcm9vdHMgPSAoY2F0ZWdvcmllcyB8fCBbXSlcbiAgICAuZmlsdGVyKGlzUm9vdENhdGVnb3J5KVxuICAgIC5zb3J0KChhLCBiKSA9PiAoYS5zb3J0X29yZGVyID8/IDApIC0gKGIuc29ydF9vcmRlciA/PyAwKSlcblxuICBjb25zdCBvcmRlcmVkID0gW11cbiAgcm9vdHMuZm9yRWFjaCgocm9vdCkgPT4ge1xuICAgIG9yZGVyZWQucHVzaCh7IC4uLnJvb3QsIGRlcHRoOiAwIH0pXG4gICAgOyhjYXRlZ29yaWVzIHx8IFtdKVxuICAgICAgLmZpbHRlcigoY2F0ZWdvcnkpID0+IFN0cmluZyhjYXRlZ29yeS5wYXJlbnRfaWQpID09PSBTdHJpbmcocm9vdC5pZCkpXG4gICAgICAuc29ydCgoYSwgYikgPT4gKGEuc29ydF9vcmRlciA/PyAwKSAtIChiLnNvcnRfb3JkZXIgPz8gMCkpXG4gICAgICAuZm9yRWFjaCgoY2hpbGQpID0+IG9yZGVyZWQucHVzaCh7IC4uLmNoaWxkLCBkZXB0aDogMSB9KSlcbiAgfSlcbiAgcmV0dXJuIG9yZGVyZWRcbn1cblxuZnVuY3Rpb24gcmVuZGVyUGFyZW50T3B0aW9ucyhjYXRlZ29yaWVzLCBzZWxlY3RlZFBhcmVudElkLCBjdXJyZW50SWQsIGRpc2FibGVkKSB7XG4gIGNvbnN0IHJvb3RzID0gKGNhdGVnb3JpZXMgfHwgW10pLmZpbHRlcihpc1Jvb3RDYXRlZ29yeSlcbiAgY29uc3Qgc2VsZWN0ZWQgPSBTdHJpbmcoc2VsZWN0ZWRQYXJlbnRJZCB8fCAnJylcbiAgY29uc3QgZGlzYWJsZWRBdHRyID0gZGlzYWJsZWQgPyAnIGRpc2FibGVkJyA6ICcnXG4gIGxldCBvcHRpb25zID0gYDxvcHRpb24gdmFsdWU9XCJcIiR7c2VsZWN0ZWQgPT09ICcnID8gJyBzZWxlY3RlZCcgOiAnJ30+4oCUIFJvb3Qg4oCUPC9vcHRpb24+YFxuXG4gIHJvb3RzLmZvckVhY2goKHJvb3QpID0+IHtcbiAgICBpZiAoU3RyaW5nKHJvb3QuaWQpID09PSBTdHJpbmcoY3VycmVudElkKSkgcmV0dXJuXG4gICAgY29uc3QgaXNTZWxlY3RlZCA9IFN0cmluZyhyb290LmlkKSA9PT0gc2VsZWN0ZWQgPyAnIHNlbGVjdGVkJyA6ICcnXG4gICAgb3B0aW9ucyArPSBgPG9wdGlvbiB2YWx1ZT1cIiR7ZXNjYXBlSHRtbChyb290LmlkKX1cIiR7aXNTZWxlY3RlZH0+JHtlc2NhcGVIdG1sKHJvb3QubmFtZSl9PC9vcHRpb24+YFxuICB9KVxuXG4gIHJldHVybiBgPHNlbGVjdCBjbGFzcz1cImNhdGVnb3J5LXRhYmxlX19zZWxlY3RcIiBkYXRhLWZpZWxkPVwicGFyZW50X2lkXCIgYXJpYS1sYWJlbD1cIlBhcmVudCBjYXRlZ29yeVwiJHtkaXNhYmxlZEF0dHJ9PiR7b3B0aW9uc308L3NlbGVjdD5gXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJDYXRlZ29yeVJvdyhjYXRlZ29yeSwgYWxsQ2F0ZWdvcmllcykge1xuICBjb25zdCBkZXB0aCA9IGNhdGVnb3J5LmRlcHRoID8/IChpc1Jvb3RDYXRlZ29yeShjYXRlZ29yeSkgPyAwIDogMSlcbiAgY29uc3QgY2hpbGRDbGFzcyA9IGRlcHRoID4gMCA/ICcgY2F0ZWdvcnktdGFibGVfX3Jvdy0tY2hpbGQnIDogJydcbiAgY29uc3QgcGFyZW50U2VsZWN0ID0gcmVuZGVyUGFyZW50T3B0aW9ucyhcbiAgICBhbGxDYXRlZ29yaWVzLFxuICAgIGNhdGVnb3J5LnBhcmVudF9pZCxcbiAgICBjYXRlZ29yeS5pZCxcbiAgICBkZXB0aCA9PT0gMCxcbiAgKVxuXG4gIHJldHVybiBgXG48dHIgY2xhc3M9XCJjYXRlZ29yeS10YWJsZV9fcm93JHtjaGlsZENsYXNzfVwiIGRhdGEtY2F0ZWdvcnktaWQ9XCIke2VzY2FwZUh0bWwoY2F0ZWdvcnkuaWQpfVwiIGRhdGEtY2F0ZWdvcnktZGVwdGg9XCIke2RlcHRofVwiPlxuICA8dGQgY2xhc3M9XCJjYXRlZ29yeS10YWJsZV9fbmFtZVwiPlxuICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiY2F0ZWdvcnktdGFibGVfX2lucHV0IGNhdGVnb3J5LXRhYmxlX19pbnB1dC0tbmFtZVwiIGRhdGEtZmllbGQ9XCJuYW1lXCIgdmFsdWU9XCIke2VzY2FwZUh0bWwoY2F0ZWdvcnkubmFtZSl9XCIgYXJpYS1sYWJlbD1cIkNhdGVnb3J5IG5hbWVcIj5cbiAgPC90ZD5cbiAgPHRkPiR7cGFyZW50U2VsZWN0fTwvdGQ+XG4gIDx0ZD5cbiAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIGNsYXNzPVwiY2F0ZWdvcnktdGFibGVfX251bWJlclwiIGRhdGEtZmllbGQ9XCJzb3J0X29yZGVyXCIgdmFsdWU9XCIke2VzY2FwZUh0bWwoY2F0ZWdvcnkuc29ydF9vcmRlciA/PyAwKX1cIiBtaW49XCIwXCIgc3RlcD1cIjFcIiBhcmlhLWxhYmVsPVwiU29ydCBvcmRlclwiPlxuICA8L3RkPlxuICA8dGQgY2xhc3M9XCJjYXRlZ29yeS10YWJsZV9fYWN0aW9uc1wiPlxuICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2F0ZWdvcnktdGFibGVfX2RlbGV0ZVwiIGRhdGEtYWN0aW9uPVwiZGVsZXRlLWNhdGVnb3J5XCI+RGVsZXRlPC9idXR0b24+XG4gIDwvdGQ+XG48L3RyPmBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckNhdGVnb3J5VGFibGUoY2F0ZWdvcmllcykge1xuICBjb25zdCBvcmRlcmVkID0gb3JkZXJDYXRlZ29yaWVzSGllcmFyY2hpY2FsbHkoY2F0ZWdvcmllcylcbiAgcmV0dXJuIG9yZGVyZWQubWFwKChjYXRlZ29yeSkgPT4gcmVuZGVyQ2F0ZWdvcnlSb3coY2F0ZWdvcnksIGNhdGVnb3JpZXMpKS5qb2luKCcnKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQ2F0ZWdvcnlQYXJlbnRPcHRpb25zKGNhdGVnb3JpZXMsIHNlbGVjdGVkUGFyZW50SWQgPSAnJykge1xuICBjb25zdCByb290cyA9IG9yZGVyQ2F0ZWdvcmllc0hpZXJhcmNoaWNhbGx5KGNhdGVnb3JpZXMpLmZpbHRlcigoY2F0ZWdvcnkpID0+IGNhdGVnb3J5LmRlcHRoID09PSAwKVxuICBjb25zdCBzZWxlY3RlZCA9IFN0cmluZyhzZWxlY3RlZFBhcmVudElkIHx8ICcnKVxuICBsZXQgb3B0aW9ucyA9IGA8b3B0aW9uIHZhbHVlPVwiXCIke3NlbGVjdGVkID09PSAnJyA/ICcgc2VsZWN0ZWQnIDogJyd9PuKAlCBSb290IGNhdGVnb3J5IOKAlDwvb3B0aW9uPmBcblxuICByb290cy5mb3JFYWNoKChyb290KSA9PiB7XG4gICAgY29uc3QgaXNTZWxlY3RlZCA9IFN0cmluZyhyb290LmlkKSA9PT0gc2VsZWN0ZWQgPyAnIHNlbGVjdGVkJyA6ICcnXG4gICAgb3B0aW9ucyArPSBgPG9wdGlvbiB2YWx1ZT1cIiR7ZXNjYXBlSHRtbChyb290LmlkKX1cIiR7aXNTZWxlY3RlZH0+JHtlc2NhcGVIdG1sKHJvb3QubmFtZSl9PC9vcHRpb24+YFxuICB9KVxuXG4gIHJldHVybiBvcHRpb25zXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDYXRlZ29yeUVtcHR5U3RhdGUocm9vdCwgaXNFbXB0eSkge1xuICBjb25zdCBlbXB0eUVsID0gcm9vdC5xdWVyeVNlbGVjdG9yKCcjY2F0ZWdvcnktZW1wdHknKVxuICBpZiAoZW1wdHlFbCkge1xuICAgIGVtcHR5RWwuY2xhc3NMaXN0LnRvZ2dsZSgndG9kby1lbXB0eS0taGlkZGVuJywgIWlzRW1wdHkpXG4gIH1cbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb2RhbENvbnRyb2xsZXIocm9vdCkge1xuICBjb25zdCBkaWFsb2cgPSByb290LnF1ZXJ5U2VsZWN0b3IoJyN0b2RvLW1vZGFsJylcbiAgY29uc3QgZm9ybSA9IHJvb3QucXVlcnlTZWxlY3RvcignI3RvZG8tbW9kYWwtZm9ybScpXG4gIGNvbnN0IHRpdGxlRWwgPSByb290LnF1ZXJ5U2VsZWN0b3IoJyN0b2RvLW1vZGFsLXRpdGxlJylcbiAgY29uc3QgbWVzc2FnZUVsID0gcm9vdC5xdWVyeVNlbGVjdG9yKCcjdG9kby1tb2RhbC1tZXNzYWdlJylcbiAgY29uc3QgZmllbGRzRWwgPSByb290LnF1ZXJ5U2VsZWN0b3IoJyN0b2RvLW1vZGFsLWZpZWxkcycpXG4gIGNvbnN0IGVkaXROYW1lRWwgPSByb290LnF1ZXJ5U2VsZWN0b3IoJyN0b2RvLW1vZGFsLWVkaXQtbmFtZScpXG4gIGNvbnN0IGVkaXREdWVEYXRlRWwgPSByb290LnF1ZXJ5U2VsZWN0b3IoJyN0b2RvLW1vZGFsLWVkaXQtZHVlLWRhdGUnKVxuICBjb25zdCBlZGl0UHJpb3JpdHlFbCA9IHJvb3QucXVlcnlTZWxlY3RvcignI3RvZG8tbW9kYWwtZWRpdC1wcmlvcml0eScpXG4gIGNvbnN0IGNhbmNlbEJ0biA9IHJvb3QucXVlcnlTZWxlY3RvcignI3RvZG8tbW9kYWwtY2FuY2VsJylcbiAgY29uc3QgY29uZmlybUJ0biA9IHJvb3QucXVlcnlTZWxlY3RvcignI3RvZG8tbW9kYWwtY29uZmlybScpXG5cbiAgaWYgKCFkaWFsb2cgfHwgIWZvcm0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgYWxlcnQ6IGFzeW5jIChtZXNzYWdlKSA9PiB7XG4gICAgICAgIHdpbmRvdy5hbGVydChtZXNzYWdlKVxuICAgICAgfSxcbiAgICAgIGNvbmZpcm06IGFzeW5jICgpID0+IHdpbmRvdy5jb25maXJtKCdDb250aW51ZT8nKSxcbiAgICAgIGVkaXRUb2RvOiBhc3luYyAoKSA9PiBudWxsLFxuICAgIH1cbiAgfVxuXG4gIGxldCByZXNvbHZlciA9IG51bGxcbiAgbGV0IG1vZGUgPSAnYWxlcnQnXG5cbiAgZnVuY3Rpb24gY2xvc2VXaXRoKHZhbHVlKSB7XG4gICAgaWYgKCFyZXNvbHZlcikgcmV0dXJuXG4gICAgY29uc3QgcmVzb2x2ZSA9IHJlc29sdmVyXG4gICAgcmVzb2x2ZXIgPSBudWxsXG4gICAgZGlhbG9nLmNsb3NlKClcbiAgICByZXNvbHZlKHZhbHVlKVxuICB9XG5cbiAgZnVuY3Rpb24gb3Blbk1vZGFsKGNvbmZpZykge1xuICAgIG1vZGUgPSBjb25maWcubW9kZVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICByZXNvbHZlciA9IHJlc29sdmVcblxuICAgICAgdGl0bGVFbC50ZXh0Q29udGVudCA9IGNvbmZpZy50aXRsZVxuICAgICAgbWVzc2FnZUVsLnRleHRDb250ZW50ID0gY29uZmlnLm1lc3NhZ2VcbiAgICAgIG1lc3NhZ2VFbC5oaWRkZW4gPSAhY29uZmlnLm1lc3NhZ2VcblxuICAgICAgZmllbGRzRWwuaGlkZGVuID0gbW9kZSAhPT0gJ2VkaXQnXG4gICAgICBjYW5jZWxCdG4uaGlkZGVuID0gIWNvbmZpZy5zaG93Q2FuY2VsXG4gICAgICBjb25maXJtQnRuLnRleHRDb250ZW50ID0gY29uZmlnLmNvbmZpcm1MYWJlbCB8fCAnT0snXG4gICAgICBjb25maXJtQnRuLmNsYXNzTGlzdC50b2dnbGUoJ3RvZG8tbW9kYWxfX2J0bi0tZGFuZ2VyJywgQm9vbGVhbihjb25maWcuZGFuZ2VyKSlcblxuICAgICAgaWYgKG1vZGUgPT09ICdlZGl0Jykge1xuICAgICAgICBlZGl0TmFtZUVsLnZhbHVlID0gY29uZmlnLm5hbWUgfHwgJydcbiAgICAgICAgZWRpdER1ZURhdGVFbC52YWx1ZSA9IGNvbmZpZy5kdWVfZGF0ZSB8fCAnJ1xuICAgICAgICBlZGl0UHJpb3JpdHlFbC52YWx1ZSA9IGNvbmZpZy5wcmlvcml0eSB8fCAnbWVkaXVtJ1xuICAgICAgfVxuXG4gICAgICBkaWFsb2cuc2hvd01vZGFsKClcblxuICAgICAgaWYgKG1vZGUgPT09ICdlZGl0Jykge1xuICAgICAgICBlZGl0TmFtZUVsLmZvY3VzKClcbiAgICAgICAgZWRpdE5hbWVFbC5zZWxlY3QoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uZmlybUJ0bi5mb2N1cygpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGNhbmNlbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBjbG9zZVdpdGgobnVsbClcbiAgfSlcblxuICBkaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcignY2FuY2VsJywgKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGNsb3NlV2l0aChudWxsKVxuICB9KVxuXG4gIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsICgpID0+IHtcbiAgICBpZiAocmVzb2x2ZXIpIHtcbiAgICAgIGNsb3NlV2l0aChudWxsKVxuICAgIH1cbiAgfSlcblxuICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgIGlmIChtb2RlID09PSAnZWRpdCcpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBlZGl0TmFtZUVsLnZhbHVlLnRyaW0oKVxuICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIGVkaXROYW1lRWwuZm9jdXMoKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY2xvc2VXaXRoKHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgZHVlX2RhdGU6IGVkaXREdWVEYXRlRWwudmFsdWUsXG4gICAgICAgIHByaW9yaXR5OiBlZGl0UHJpb3JpdHlFbC52YWx1ZSB8fCAnbWVkaXVtJyxcbiAgICAgIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjbG9zZVdpdGgodHJ1ZSlcbiAgfSlcblxuICByZXR1cm4ge1xuICAgIGFsZXJ0KG1lc3NhZ2UsIHRpdGxlID0gJ1NvbWV0aGluZyB3ZW50IHdyb25nJykge1xuICAgICAgcmV0dXJuIG9wZW5Nb2RhbCh7XG4gICAgICAgIG1vZGU6ICdhbGVydCcsXG4gICAgICAgIHRpdGxlLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgICBzaG93Q2FuY2VsOiBmYWxzZSxcbiAgICAgICAgY29uZmlybUxhYmVsOiAnT0snLFxuICAgICAgICBkYW5nZXI6IGZhbHNlLFxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgY29uZmlybShtZXNzYWdlLCB0aXRsZSA9ICdBcmUgeW91IHN1cmU/Jywgb3B0aW9ucyA9IHt9KSB7XG4gICAgICByZXR1cm4gb3Blbk1vZGFsKHtcbiAgICAgICAgbW9kZTogJ2NvbmZpcm0nLFxuICAgICAgICB0aXRsZSxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgc2hvd0NhbmNlbDogdHJ1ZSxcbiAgICAgICAgY29uZmlybUxhYmVsOiBvcHRpb25zLmNvbmZpcm1MYWJlbCB8fCAnQ29uZmlybScsXG4gICAgICAgIGRhbmdlcjogQm9vbGVhbihvcHRpb25zLmRhbmdlciksXG4gICAgICB9KS50aGVuKChyZXN1bHQpID0+IHJlc3VsdCA9PT0gdHJ1ZSlcbiAgICB9LFxuXG4gICAgZWRpdFRvZG8ob3B0aW9ucyA9IHt9KSB7XG4gICAgICByZXR1cm4gb3Blbk1vZGFsKHtcbiAgICAgICAgbW9kZTogJ2VkaXQnLFxuICAgICAgICB0aXRsZTogb3B0aW9ucy50aXRsZSB8fCAnRWRpdCB0b2RvJyxcbiAgICAgICAgbWVzc2FnZTogb3B0aW9ucy5tZXNzYWdlIHx8ICcnLFxuICAgICAgICBzaG93Q2FuY2VsOiB0cnVlLFxuICAgICAgICBjb25maXJtTGFiZWw6IG9wdGlvbnMuY29uZmlybUxhYmVsIHx8ICdTYXZlJyxcbiAgICAgICAgZGFuZ2VyOiBmYWxzZSxcbiAgICAgICAgbmFtZTogb3B0aW9ucy5uYW1lIHx8ICcnLFxuICAgICAgICBkdWVfZGF0ZTogb3B0aW9ucy5kdWVfZGF0ZSB8fCAnJyxcbiAgICAgICAgcHJpb3JpdHk6IG9wdGlvbnMucHJpb3JpdHkgfHwgJ21lZGl1bScsXG4gICAgICB9KVxuICAgIH0sXG4gIH1cbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBzaG93VG9hc3QobWVzc2FnZSwgdHlwZSA9ICdzdWNjZXNzJykge1xuICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9kby10b2FzdCcpXG4gIGlmICghY29udGFpbmVyKSByZXR1cm5cblxuICBjb25zdCB0b2FzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHRvYXN0LmNsYXNzTmFtZSA9IGB0b2RvLXRvYXN0IHRvZG8tdG9hc3QtLSR7dHlwZX1gXG4gIHRvYXN0LnRleHRDb250ZW50ID0gbWVzc2FnZVxuICB0b2FzdC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnc3RhdHVzJylcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRvYXN0KVxuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgdG9hc3QuY2xhc3NMaXN0LmFkZCgndG9kby10b2FzdC0tdmlzaWJsZScpXG4gIH0pXG5cbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgdG9hc3QuY2xhc3NMaXN0LnJlbW92ZSgndG9kby10b2FzdC0tdmlzaWJsZScpXG4gICAgc2V0VGltZW91dCgoKSA9PiB0b2FzdC5yZW1vdmUoKSwgMzAwKVxuICB9LCAzMDAwKVxufVxuIiwiaW1wb3J0IHsgY3JlYXRlQXBpQ2xpZW50IH0gZnJvbSAnLi9hcGkuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yVG9kb1N5bmMoYXBpQmFzZSwgdG9kb0lkKSB7XG4gIGNvbnN0IGFwaSA9IGNyZWF0ZUFwaUNsaWVudChhcGlCYXNlKVxuXG4gIHJldHVybiBhcGkubGlzdCgpLnRoZW4oKGRhdGEpID0+IHtcbiAgICBjb25zdCBmb3VuZCA9IChkYXRhLnRvZG9zIHx8IFtdKS5maW5kKCh0b2RvKSA9PiB0b2RvLnV1aWQgPT09IFN0cmluZyh0b2RvSWQpKVxuICAgIGlmIChmb3VuZCkgcmV0dXJuIGZvdW5kXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHt9KVxuICB9KVxufVxuIiwiaW1wb3J0IHsgY3JlYXRlQXBpQ2xpZW50IH0gZnJvbSAnLi9hcGkuanMnXG5pbXBvcnQge1xuICByZW5kZXJUb2RvTGlzdCxcbiAgc2V0QWN0aXZlQ2F0ZWdvcnksXG4gIHNldEFjdGl2ZUZpbHRlcixcbiAgc2V0RW1wdHlTdGF0ZSxcbiAgc29ydFRvZG9zQnlEdWVEYXRlLFxuICB1cGRhdGVDYXRlZ29yeUNvdW50cyxcbiAgdXBkYXRlQ291bnRzLFxufSBmcm9tICcuL2RvbS5qcydcbmltcG9ydCB7IGNyZWF0ZU1vZGFsQ29udHJvbGxlciB9IGZyb20gJy4vbW9kYWwuanMnXG5pbXBvcnQgeyBzaG93VG9hc3QgfSBmcm9tICcuL3RvYXN0LmpzJ1xuaW1wb3J0IHsgd2FpdEZvclRvZG9TeW5jIH0gZnJvbSAnLi9zeW5jLmpzJ1xuXG5mdW5jdGlvbiBkZWJvdW5jZShmbiwgZGVsYXkpIHtcbiAgbGV0IHRpbWVyXG4gIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcilcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4gZm4oLi4uYXJncyksIGRlbGF5KVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlYWRGaWx0ZXJzKHJvb3QpIHtcbiAgY29uc3QgYWN0aXZlQnV0dG9uID0gcm9vdC5xdWVyeVNlbGVjdG9yKCcudG9kby1maWx0ZXJzX19idG4tLWFjdGl2ZScpXG4gIHJldHVybiB7XG4gICAgc3RhdHVzOiBhY3RpdmVCdXR0b24gPyBhY3RpdmVCdXR0b24uZGF0YXNldC5maWx0ZXIgOiAnYWxsJyxcbiAgICBrZXl3b3JkOiByb290LnF1ZXJ5U2VsZWN0b3IoJyN0b2RvLXNlYXJjaCcpPy52YWx1ZS50cmltKCkgfHwgJycsXG4gICAgcHJpb3JpdHk6IHJvb3QucXVlcnlTZWxlY3RvcignI3RvZG8tcHJpb3JpdHktZmlsdGVyJyk/LnZhbHVlIHx8ICcnLFxuICAgIG9yZGVyOiByb290LnF1ZXJ5U2VsZWN0b3IoJyN0b2RvLXNvcnQtZHVlLWRhdGUnKT8udmFsdWUgfHwgJ2Rlc2MnLFxuICAgIGNhdGVnb3J5OiByb290LmRhdGFzZXQuYWN0aXZlQ2F0ZWdvcnkgfHwgJycsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRUb2RvQXBwKCkge1xuICBjb25zdCByb290ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvZG8tYXBwJylcbiAgaWYgKCFyb290KSByZXR1cm5cblxuICBjb25zdCBhcGkgPSBjcmVhdGVBcGlDbGllbnQocm9vdC5kYXRhc2V0LmFwaUJhc2UgfHwgJy9hcGkvdG9kb3MnKVxuICBjb25zdCBtb2RhbCA9IGNyZWF0ZU1vZGFsQ29udHJvbGxlcihyb290KVxuICBjb25zdCBsaXN0RWwgPSByb290LnF1ZXJ5U2VsZWN0b3IoJyN0b2RvLWxpc3QnKVxuICBjb25zdCBmb3JtRWwgPSByb290LnF1ZXJ5U2VsZWN0b3IoJyN0b2RvLWFkZC1mb3JtJylcbiAgY29uc3Qgc3VibWl0QnRuID0gZm9ybUVsPy5xdWVyeVNlbGVjdG9yKCcudG9kby1hZGQtZm9ybV9fc3VibWl0JylcbiAgY29uc3QgY2F0ZWdvcnlGaWx0ZXJFbCA9IHJvb3QucXVlcnlTZWxlY3RvcignI3RvZG8tY2F0ZWdvcnktZmlsdGVyJylcblxuICBsZXQgaXNMb2FkaW5nID0gZmFsc2VcbiAgbGV0IHN0YXR1c09wdGlvbnMgPSBbXVxuICBsZXQgZGVmYXVsdFN0YXR1c0lkID0gcm9vdC5kYXRhc2V0LmRlZmF1bHRTdGF0dXNJZCB8fCAnJ1xuICBsZXQgY29tcGxldGVkU3RhdHVzSWQgPSByb290LmRhdGFzZXQuY29tcGxldGVkU3RhdHVzSWQgfHwgJydcblxuICBhc3luYyBmdW5jdGlvbiByZWZyZXNoTGlzdChvcHRpb25zID0ge30pIHtcbiAgICBpZiAoaXNMb2FkaW5nKSByZXR1cm5cbiAgICBpc0xvYWRpbmcgPSB0cnVlXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZmlsdGVycyA9IHJlYWRGaWx0ZXJzKHJvb3QpXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgYXBpLmxpc3QoZmlsdGVycylcbiAgICAgIHN0YXR1c09wdGlvbnMgPSBkYXRhLnN0YXR1c2VzIHx8IFtdXG4gICAgICBkZWZhdWx0U3RhdHVzSWQgPSBkYXRhLm1ldGE/LmRlZmF1bHRfc3RhdHVzX2lkIHx8IGRlZmF1bHRTdGF0dXNJZFxuICAgICAgY29tcGxldGVkU3RhdHVzSWQgPSBkYXRhLm1ldGE/LmNvbXBsZXRlZF9zdGF0dXNfaWQgfHwgY29tcGxldGVkU3RhdHVzSWRcbiAgICAgIGNvbnN0IHNvcnRlZFRvZG9zID0gc29ydFRvZG9zQnlEdWVEYXRlKGRhdGEudG9kb3MgfHwgW10sIGZpbHRlcnMub3JkZXIpXG4gICAgICBsaXN0RWwuaW5uZXJIVE1MID0gcmVuZGVyVG9kb0xpc3Qoc29ydGVkVG9kb3MsIHN0YXR1c09wdGlvbnMpXG4gICAgICBpZiAoIW9wdGlvbnMuc2tpcENvdW50c1VwZGF0ZSkge1xuICAgICAgICB1cGRhdGVDb3VudHMocm9vdCwgZGF0YS5jb3VudHMpXG4gICAgICB9XG4gICAgICB1cGRhdGVDYXRlZ29yeUNvdW50cyhyb290LCBkYXRhLmNhdGVnb3JpZXMgfHwgW10pXG4gICAgICBzZXRFbXB0eVN0YXRlKHJvb3QsIChkYXRhLnRvZG9zIHx8IFtdKS5sZW5ndGggPT09IDApXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHRvZG9zJywgZXJyb3IpXG4gICAgICBhd2FpdCBtb2RhbC5hbGVydChlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gbG9hZCB0b2RvcycsICdDb3VsZCBub3QgbG9hZCB0b2RvcycpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlzTG9hZGluZyA9IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgY29uc3QgZGVib3VuY2VkUmVmcmVzaCA9IGRlYm91bmNlKHJlZnJlc2hMaXN0LCAzMDApXG5cbiAgcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcudG9kby1maWx0ZXJzX19idG4nKS5mb3JFYWNoKChidXR0b24pID0+IHtcbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBzZXRBY3RpdmVGaWx0ZXIocm9vdCwgYnV0dG9uLmRhdGFzZXQuZmlsdGVyKVxuICAgICAgcmVmcmVzaExpc3QoKVxuICAgIH0pXG4gIH0pXG5cbiAgY2F0ZWdvcnlGaWx0ZXJFbD8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBidXR0b24gPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtYWN0aW9uPVwiZmlsdGVyLWNhdGVnb3J5XCJdJylcbiAgICBpZiAoIWJ1dHRvbikgcmV0dXJuXG5cbiAgICBjb25zdCBjYXRlZ29yeUlkID0gYnV0dG9uLmRhdGFzZXQuY2F0ZWdvcnkgfHwgJydcbiAgICByb290LmRhdGFzZXQuYWN0aXZlQ2F0ZWdvcnkgPSBjYXRlZ29yeUlkXG4gICAgc2V0QWN0aXZlQ2F0ZWdvcnkocm9vdCwgY2F0ZWdvcnlJZClcbiAgICByZWZyZXNoTGlzdCgpXG4gIH0pXG5cbiAgcm9vdC5xdWVyeVNlbGVjdG9yKCcjdG9kby1zZWFyY2gnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBkZWJvdW5jZWRSZWZyZXNoKVxuICByb290LnF1ZXJ5U2VsZWN0b3IoJyN0b2RvLXByaW9yaXR5LWZpbHRlcicpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCByZWZyZXNoTGlzdClcbiAgcm9vdC5xdWVyeVNlbGVjdG9yKCcjdG9kby1zb3J0LWR1ZS1kYXRlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHJlZnJlc2hMaXN0KVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNyZWF0ZVN1Ym1pdChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBpZiAoIXN1Ym1pdEJ0bikgcmV0dXJuXG5cbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtRWwpXG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgIG5hbWU6IFN0cmluZyhmb3JtRGF0YS5nZXQoJ25hbWUnKSB8fCAnJykudHJpbSgpLFxuICAgICAgZHVlX2RhdGU6IFN0cmluZyhmb3JtRGF0YS5nZXQoJ2R1ZV9kYXRlJykgfHwgJycpLnRyaW0oKSxcbiAgICAgIHByaW9yaXR5OiBTdHJpbmcoZm9ybURhdGEuZ2V0KCdwcmlvcml0eScpIHx8ICdtZWRpdW0nKSxcbiAgICAgIGNhdGVnb3J5X2lkOiBTdHJpbmcoZm9ybURhdGEuZ2V0KCdjYXRlZ29yeV9pZCcpIHx8ICcnKS50cmltKCksXG4gICAgfVxuXG4gICAgaWYgKCFwYXlsb2FkLm5hbWUpIHJldHVyblxuXG4gICAgc3VibWl0QnRuLmRpc2FibGVkID0gdHJ1ZVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5jcmVhdGUocGF5bG9hZClcbiAgICAgIGZvcm1FbC5yZXNldCgpXG4gICAgICBmb3JtRWwucXVlcnlTZWxlY3RvcignW25hbWU9XCJwcmlvcml0eVwiXScpLnZhbHVlID0gJ21lZGl1bSdcbiAgICAgIGF3YWl0IHdhaXRGb3JUb2RvU3luYyhyb290LmRhdGFzZXQuYXBpQmFzZSB8fCAnL2FwaS90b2RvcycsIHJlc3VsdC50b2RvLmlkKVxuICAgICAgYXdhaXQgcmVmcmVzaExpc3QoKVxuICAgICAgc2hvd1RvYXN0KCdUb2RvIGFkZGVkJylcbiAgICAgIGZvcm1FbC5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBoYW5kbGVDcmVhdGVTdWJtaXQpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgdG9kbycsIGVycm9yKVxuICAgICAgYXdhaXQgbW9kYWwuYWxlcnQoZXJyb3IubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGNyZWF0ZSB0b2RvJywgJ0NvdWxkIG5vdCBhZGQgdG9kbycpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHN1Ym1pdEJ0bi5kaXNhYmxlZCA9IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgZm9ybUVsPy5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBoYW5kbGVDcmVhdGVTdWJtaXQpXG5cbiAgbGlzdEVsPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBjaGVja2JveCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1hY3Rpb249XCJ0b2dnbGUtY29tcGxldGVcIl0nKVxuICAgIGlmIChjaGVja2JveCkge1xuICAgICAgY29uc3QgY2hlY2tib3hlcyA9IGxpc3RFbC5xdWVyeVNlbGVjdG9yQWxsKCcudG9kby1pdGVtX19jaGVja2JveCcpXG4gICAgICBjb25zdCBpdGVtcyA9IGxpc3RFbC5xdWVyeVNlbGVjdG9yQWxsKCcudG9kby1pdGVtJylcbiAgICAgIGNvbnN0IGluZGV4ID0gQXJyYXkuZnJvbShjaGVja2JveGVzKS5pbmRleE9mKGNoZWNrYm94KVxuICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2luZGV4XVxuICAgICAgaWYgKCFpdGVtKSByZXR1cm5cblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYXBpLnVwZGF0ZSh7IGlkOiBpdGVtLmRhdGFzZXQudG9kb0lkLCBjb21wbGV0ZWQ6IGNoZWNrYm94LmNoZWNrZWQgfSlcbiAgICAgICAgYXdhaXQgcmVmcmVzaExpc3QoKVxuICAgICAgICBzaG93VG9hc3QoY2hlY2tib3guY2hlY2tlZCA/ICdUb2RvIGNvbXBsZXRlZCcgOiAnVG9kbyByZW9wZW5lZCcpXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gdXBkYXRlIHRvZG8nLCBlcnJvcilcbiAgICAgICAgY2hlY2tib3guY2hlY2tlZCA9ICFjaGVja2JveC5jaGVja2VkXG4gICAgICAgIGF3YWl0IG1vZGFsLmFsZXJ0KGVycm9yLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byB1cGRhdGUgdG9kbycsICdDb3VsZCBub3QgdXBkYXRlIHRvZG8nKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdHVzU2VsZWN0ID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWFjdGlvbj1cImNoYW5nZS1zdGF0dXNcIl0nKVxuICAgIGlmICghc3RhdHVzU2VsZWN0KSByZXR1cm5cblxuICAgIGNvbnN0IGl0ZW0gPSBzdGF0dXNTZWxlY3QuY2xvc2VzdCgnW2RhdGEtdG9kby1pZF0nKVxuICAgIGlmICghaXRlbSkgcmV0dXJuXG5cbiAgICBjb25zdCBwcmV2aW91c1N0YXR1c0lkID0gaXRlbS5kYXRhc2V0LnRvZG9TdGF0dXNJZCB8fCAnJ1xuICAgIGNvbnN0IG5leHRTdGF0dXNJZCA9IHN0YXR1c1NlbGVjdC52YWx1ZVxuXG4gICAgaWYgKG5leHRTdGF0dXNJZCA9PT0gcHJldmlvdXNTdGF0dXNJZCkgcmV0dXJuXG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYXBpLnVwZGF0ZSh7IGlkOiBpdGVtLmRhdGFzZXQudG9kb0lkLCBzdGF0dXNfaWQ6IG5leHRTdGF0dXNJZCB9KVxuICAgICAgYXdhaXQgcmVmcmVzaExpc3QoKVxuICAgICAgc2hvd1RvYXN0KCdTdGF0dXMgdXBkYXRlZCcpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byB1cGRhdGUgdG9kbyBzdGF0dXMnLCBlcnJvcilcbiAgICAgIHN0YXR1c1NlbGVjdC52YWx1ZSA9IHByZXZpb3VzU3RhdHVzSWRcbiAgICAgIGF3YWl0IG1vZGFsLmFsZXJ0KGVycm9yLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byB1cGRhdGUgc3RhdHVzJywgJ0NvdWxkIG5vdCB1cGRhdGUgc3RhdHVzJylcbiAgICB9XG4gIH0pXG5cbiAgbGlzdEVsPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGRlbGV0ZUJ0biA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1hY3Rpb249XCJkZWxldGVcIl0nKVxuICAgIGlmIChkZWxldGVCdG4pIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBkZWxldGVCdG4uY2xvc2VzdCgnW2RhdGEtdG9kby1pZF0nKVxuICAgICAgaWYgKCFpdGVtKSByZXR1cm5cblxuICAgICAgY29uc3QgY29uZmlybWVkID0gYXdhaXQgbW9kYWwuY29uZmlybSgnVGhpcyB0b2RvIHdpbGwgYmUgcGVybWFuZW50bHkgZGVsZXRlZC4nLCAnRGVsZXRlIHRvZG8/Jywge1xuICAgICAgICBjb25maXJtTGFiZWw6ICdEZWxldGUnLFxuICAgICAgICBkYW5nZXI6IHRydWUsXG4gICAgICB9KVxuICAgICAgaWYgKCFjb25maXJtZWQpIHJldHVyblxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhcGkuZGVsZXRlKGl0ZW0uZGF0YXNldC50b2RvSWQpXG4gICAgICAgIGF3YWl0IHJlZnJlc2hMaXN0KClcbiAgICAgICAgc2hvd1RvYXN0KCdUb2RvIGRlbGV0ZWQnKVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGRlbGV0ZSB0b2RvJywgZXJyb3IpXG4gICAgICAgIGF3YWl0IG1vZGFsLmFsZXJ0KGVycm9yLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBkZWxldGUgdG9kbycsICdDb3VsZCBub3QgZGVsZXRlIHRvZG8nKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgZWRpdEJ0biA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1hY3Rpb249XCJlZGl0LXRvZG8tYnRuXCJdJylcbiAgICBjb25zdCB0aXRsZUVsID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1tkYXRhLWFjdGlvbj1cImVkaXQtdG9kb1wiXScpXG4gICAgY29uc3QgdGFyZ2V0SXRlbSA9IChlZGl0QnRuIHx8IHRpdGxlRWwpPy5jbG9zZXN0KCdbZGF0YS10b2RvLWlkXScpXG4gICAgaWYgKCF0YXJnZXRJdGVtKSByZXR1cm5cblxuICAgIGNvbnN0IGN1cnJlbnRUaXRsZSA9IHRhcmdldEl0ZW0ucXVlcnlTZWxlY3RvcignLnRvZG8taXRlbV9fdGl0bGUnKT8udGV4dENvbnRlbnQgfHwgJydcbiAgICBjb25zdCBjdXJyZW50UHJpb3JpdHkgPSB0YXJnZXRJdGVtLmRhdGFzZXQudG9kb1ByaW9yaXR5IHx8ICdtZWRpdW0nXG4gICAgY29uc3QgY3VycmVudER1ZURhdGUgPSB0YXJnZXRJdGVtLmRhdGFzZXQudG9kb0R1ZURhdGUgfHwgJydcblxuICAgIGNvbnN0IGVkaXRzID0gYXdhaXQgbW9kYWwuZWRpdFRvZG8oe1xuICAgICAgdGl0bGU6ICdFZGl0IHRvZG8nLFxuICAgICAgbmFtZTogY3VycmVudFRpdGxlLFxuICAgICAgcHJpb3JpdHk6IGN1cnJlbnRQcmlvcml0eSxcbiAgICAgIGR1ZV9kYXRlOiBjdXJyZW50RHVlRGF0ZSxcbiAgICAgIGNvbmZpcm1MYWJlbDogJ1NhdmUnLFxuICAgIH0pXG4gICAgaWYgKGVkaXRzID09PSBudWxsKSByZXR1cm5cblxuICAgIGNvbnN0IHRyaW1tZWROYW1lID0gZWRpdHMubmFtZS50cmltKClcbiAgICBjb25zdCB0cmltbWVkRHVlRGF0ZSA9IGVkaXRzLmR1ZV9kYXRlLnRyaW0oKVxuICAgIGNvbnN0IG5leHRQcmlvcml0eSA9IGVkaXRzLnByaW9yaXR5IHx8ICdtZWRpdW0nXG5cbiAgICBpZiAoXG4gICAgICB0cmltbWVkTmFtZSA9PT0gY3VycmVudFRpdGxlLnRyaW0oKVxuICAgICAgJiYgdHJpbW1lZER1ZURhdGUgPT09IGN1cnJlbnREdWVEYXRlXG4gICAgICAmJiBuZXh0UHJpb3JpdHkgPT09IGN1cnJlbnRQcmlvcml0eVxuICAgICkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGFwaS51cGRhdGUoe1xuICAgICAgICBpZDogdGFyZ2V0SXRlbS5kYXRhc2V0LnRvZG9JZCxcbiAgICAgICAgbmFtZTogdHJpbW1lZE5hbWUsXG4gICAgICAgIGR1ZV9kYXRlOiB0cmltbWVkRHVlRGF0ZSxcbiAgICAgICAgZHVlX2RhdGVfY2xlYXJlZDogdHJpbW1lZER1ZURhdGUgPT09ICcnLFxuICAgICAgICBwcmlvcml0eTogbmV4dFByaW9yaXR5LFxuICAgICAgfSlcbiAgICAgIGF3YWl0IHJlZnJlc2hMaXN0KClcbiAgICAgIHNob3dUb2FzdCgnVG9kbyB1cGRhdGVkJylcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGVkaXQgdG9kbycsIGVycm9yKVxuICAgICAgYXdhaXQgbW9kYWwuYWxlcnQoZXJyb3IubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGVkaXQgdG9kbycsICdDb3VsZCBub3Qgc2F2ZSBjaGFuZ2VzJylcbiAgICB9XG4gIH0pXG5cbiAgcm9vdC5xdWVyeVNlbGVjdG9yKCcjdG9kby1jbGVhci1jb21wbGV0ZWQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgY29uZmlybWVkID0gYXdhaXQgbW9kYWwuY29uZmlybShcbiAgICAgICdBbGwgY29tcGxldGVkIHRvZG9zIHdpbGwgYmUgcGVybWFuZW50bHkgZGVsZXRlZC4nLFxuICAgICAgJ0NsZWFyIGNvbXBsZXRlZCB0b2Rvcz8nLFxuICAgICAgeyBjb25maXJtTGFiZWw6ICdDbGVhciBjb21wbGV0ZWQnLCBkYW5nZXI6IHRydWUgfSxcbiAgICApXG4gICAgaWYgKCFjb25maXJtZWQpIHJldHVyblxuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGFwaS5jbGVhckNvbXBsZXRlZCgpXG4gICAgICBhd2FpdCByZWZyZXNoTGlzdCh7IHNraXBDb3VudHNVcGRhdGU6IHRydWUgfSlcbiAgICAgIHNob3dUb2FzdCgnQ29tcGxldGVkIHRvZG9zIGNsZWFyZWQnKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2xlYXIgY29tcGxldGVkIHRvZG9zJywgZXJyb3IpXG4gICAgICBhd2FpdCBtb2RhbC5hbGVydChlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gY2xlYXIgY29tcGxldGVkIHRvZG9zJywgJ0NvdWxkIG5vdCBjbGVhciBjb21wbGV0ZWQnKVxuICAgIH1cbiAgfSlcbn1cbiIsImltcG9ydCB7IGNyZWF0ZVN0YXR1c2VzQXBpQ2xpZW50IH0gZnJvbSAnLi9hcGkuanMnXG5pbXBvcnQgeyByZW5kZXJTdGF0dXNUYWJsZSwgc2V0U3RhdHVzRW1wdHlTdGF0ZSB9IGZyb20gJy4vZG9tLmpzJ1xuaW1wb3J0IHsgY3JlYXRlTW9kYWxDb250cm9sbGVyIH0gZnJvbSAnLi9tb2RhbC5qcydcbmltcG9ydCB7IHNob3dUb2FzdCB9IGZyb20gJy4vdG9hc3QuanMnXG5cbmZ1bmN0aW9uIHJlYWRTdGF0dXNSb3cocm93KSB7XG4gIHJldHVybiB7XG4gICAgaWQ6IHJvdy5kYXRhc2V0LnN0YXR1c0lkLFxuICAgIG5hbWU6IHJvdy5xdWVyeVNlbGVjdG9yKCdbZGF0YS1maWVsZD1cIm5hbWVcIl0nKT8udmFsdWUudHJpbSgpIHx8ICcnLFxuICAgIHNvcnRfb3JkZXI6IE51bWJlcihyb3cucXVlcnlTZWxlY3RvcignW2RhdGEtZmllbGQ9XCJzb3J0X29yZGVyXCJdJyk/LnZhbHVlIHx8IDApLFxuICAgIGNvbG9yOiByb3cucXVlcnlTZWxlY3RvcignW2RhdGEtZmllbGQ9XCJjb2xvclwiXScpPy52YWx1ZS50cmltKCkgfHwgJycsXG4gICAgaXNfY29tcGxldGVkOiByb3cucXVlcnlTZWxlY3RvcignW2RhdGEtZmllbGQ9XCJpc19jb21wbGV0ZWRcIl0nKT8uY2hlY2tlZCB8fCBmYWxzZSxcbiAgICBpc19kZWZhdWx0OiByb3cucXVlcnlTZWxlY3RvcignW2RhdGEtZmllbGQ9XCJpc19kZWZhdWx0XCJdJyk/LmNoZWNrZWQgfHwgZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRTdGF0dXNlc0FwcCgpIHtcbiAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2RvLXN0YXR1c2VzLWFwcCcpXG4gIGlmICghcm9vdCkgcmV0dXJuXG5cbiAgY29uc3QgYXBpID0gY3JlYXRlU3RhdHVzZXNBcGlDbGllbnQocm9vdC5kYXRhc2V0LmFwaUJhc2UgfHwgJy9hcGkvdG9kby1zdGF0dXNlcycpXG4gIGNvbnN0IG1vZGFsID0gY3JlYXRlTW9kYWxDb250cm9sbGVyKHJvb3QpXG4gIGNvbnN0IHRhYmxlQm9keSA9IHJvb3QucXVlcnlTZWxlY3RvcignI3N0YXR1cy10YWJsZS1ib2R5JylcbiAgY29uc3QgZm9ybUVsID0gcm9vdC5xdWVyeVNlbGVjdG9yKCcjc3RhdHVzLWFkZC1mb3JtJylcbiAgY29uc3Qgc3VibWl0QnRuID0gZm9ybUVsPy5xdWVyeVNlbGVjdG9yKCcuc3RhdHVzLWFkZC1mb3JtX19zdWJtaXQnKVxuXG4gIGxldCBpc0xvYWRpbmcgPSBmYWxzZVxuICBjb25zdCBzYXZlVGltZXJzID0gbmV3IE1hcCgpXG5cbiAgYXN5bmMgZnVuY3Rpb24gcmVmcmVzaFN0YXR1c2VzKCkge1xuICAgIGlmIChpc0xvYWRpbmcpIHJldHVyblxuICAgIGlzTG9hZGluZyA9IHRydWVcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgYXBpLmxpc3QoKVxuICAgICAgY29uc3Qgc3RhdHVzZXMgPSBkYXRhLnN0YXR1c2VzIHx8IFtdXG4gICAgICB0YWJsZUJvZHkuaW5uZXJIVE1MID0gcmVuZGVyU3RhdHVzVGFibGUoc3RhdHVzZXMpXG4gICAgICBzZXRTdGF0dXNFbXB0eVN0YXRlKHJvb3QsIHN0YXR1c2VzLmxlbmd0aCA9PT0gMClcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgc3RhdHVzZXMnLCBlcnJvcilcbiAgICAgIGF3YWl0IG1vZGFsLmFsZXJ0KGVycm9yLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBsb2FkIHN0YXR1c2VzJywgJ0NvdWxkIG5vdCBsb2FkIHN0YXR1c2VzJylcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaXNMb2FkaW5nID0gZmFsc2VcbiAgICB9XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBzYXZlU3RhdHVzUm93KHJvdykge1xuICAgIGNvbnN0IHBheWxvYWQgPSByZWFkU3RhdHVzUm93KHJvdylcbiAgICBpZiAoIXBheWxvYWQubmFtZSkgcmV0dXJuXG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYXBpLnVwZGF0ZShwYXlsb2FkKVxuICAgICAgc2hvd1RvYXN0KCdTdGF0dXMgc2F2ZWQnKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gdXBkYXRlIHN0YXR1cycsIGVycm9yKVxuICAgICAgYXdhaXQgbW9kYWwuYWxlcnQoZXJyb3IubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHVwZGF0ZSBzdGF0dXMnLCAnQ291bGQgbm90IHNhdmUgc3RhdHVzJylcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzY2hlZHVsZVNhdmUocm93KSB7XG4gICAgY29uc3QgaWQgPSByb3cuZGF0YXNldC5zdGF0dXNJZFxuICAgIGlmICghaWQpIHJldHVyblxuXG4gICAgY2xlYXJUaW1lb3V0KHNhdmVUaW1lcnMuZ2V0KGlkKSlcbiAgICBzYXZlVGltZXJzLnNldChcbiAgICAgIGlkLFxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHNhdmVTdGF0dXNSb3cocm93KVxuICAgICAgICBzYXZlVGltZXJzLmRlbGV0ZShpZClcbiAgICAgIH0sIDMwMCksXG4gICAgKVxuICB9XG5cbiAgZm9ybUVsPy5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaWYgKCFzdWJtaXRCdG4pIHJldHVyblxuXG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybUVsKVxuICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICBuYW1lOiBTdHJpbmcoZm9ybURhdGEuZ2V0KCduYW1lJykgfHwgJycpLnRyaW0oKSxcbiAgICAgIHNvcnRfb3JkZXI6IE51bWJlcihmb3JtRGF0YS5nZXQoJ3NvcnRfb3JkZXInKSB8fCAwKSxcbiAgICAgIGNvbG9yOiBTdHJpbmcoZm9ybURhdGEuZ2V0KCdjb2xvcicpIHx8ICcnKS50cmltKCksXG4gICAgICBpc19jb21wbGV0ZWQ6IGZvcm1EYXRhLmdldCgnaXNfY29tcGxldGVkJykgPT09ICcxJyxcbiAgICAgIGlzX2RlZmF1bHQ6IGZvcm1EYXRhLmdldCgnaXNfZGVmYXVsdCcpID09PSAnMScsXG4gICAgfVxuXG4gICAgaWYgKCFwYXlsb2FkLm5hbWUpIHJldHVyblxuXG4gICAgc3VibWl0QnRuLmRpc2FibGVkID0gdHJ1ZVxuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGFwaS5jcmVhdGUocGF5bG9hZClcbiAgICAgIGZvcm1FbC5yZXNldCgpXG4gICAgICBmb3JtRWwucXVlcnlTZWxlY3RvcignW25hbWU9XCJzb3J0X29yZGVyXCJdJykudmFsdWUgPSAnMCdcbiAgICAgIGF3YWl0IHJlZnJlc2hTdGF0dXNlcygpXG4gICAgICBzaG93VG9hc3QoJ1N0YXR1cyBhZGRlZCcpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgc3RhdHVzJywgZXJyb3IpXG4gICAgICBhd2FpdCBtb2RhbC5hbGVydChlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gY3JlYXRlIHN0YXR1cycsICdDb3VsZCBub3QgYWRkIHN0YXR1cycpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHN1Ym1pdEJ0bi5kaXNhYmxlZCA9IGZhbHNlXG4gICAgfVxuICB9KVxuXG4gIHRhYmxlQm9keT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCByb3cgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtc3RhdHVzLWlkXScpXG4gICAgaWYgKCFyb3cpIHJldHVyblxuICAgIHNjaGVkdWxlU2F2ZShyb3cpXG4gIH0pXG5cbiAgdGFibGVCb2R5Py5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCByb3cgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtc3RhdHVzLWlkXScpXG4gICAgaWYgKCFyb3cpIHJldHVyblxuICAgIHNjaGVkdWxlU2F2ZShyb3cpXG4gIH0pXG5cbiAgdGFibGVCb2R5Py5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IGRlbGV0ZUJ0biA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1hY3Rpb249XCJkZWxldGUtc3RhdHVzXCJdJylcbiAgICBpZiAoIWRlbGV0ZUJ0bikgcmV0dXJuXG5cbiAgICBjb25zdCByb3cgPSBkZWxldGVCdG4uY2xvc2VzdCgnW2RhdGEtc3RhdHVzLWlkXScpXG4gICAgaWYgKCFyb3cpIHJldHVyblxuXG4gICAgY29uc3QgY29uZmlybWVkID0gYXdhaXQgbW9kYWwuY29uZmlybSgnVGhpcyBzdGF0dXMgd2lsbCBiZSBwZXJtYW5lbnRseSBkZWxldGVkLicsICdEZWxldGUgc3RhdHVzPycsIHtcbiAgICAgIGNvbmZpcm1MYWJlbDogJ0RlbGV0ZScsXG4gICAgICBkYW5nZXI6IHRydWUsXG4gICAgfSlcbiAgICBpZiAoIWNvbmZpcm1lZCkgcmV0dXJuXG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYXBpLmRlbGV0ZShyb3cuZGF0YXNldC5zdGF0dXNJZClcbiAgICAgIGF3YWl0IHJlZnJlc2hTdGF0dXNlcygpXG4gICAgICBzaG93VG9hc3QoJ1N0YXR1cyBkZWxldGVkJylcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGRlbGV0ZSBzdGF0dXMnLCBlcnJvcilcbiAgICAgIGF3YWl0IG1vZGFsLmFsZXJ0KGVycm9yLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBkZWxldGUgc3RhdHVzJywgJ0NvdWxkIG5vdCBkZWxldGUgc3RhdHVzJylcbiAgICB9XG4gIH0pXG59XG4iLCJpbXBvcnQgeyBjcmVhdGVDYXRlZ29yaWVzQXBpQ2xpZW50IH0gZnJvbSAnLi9hcGkuanMnXG5pbXBvcnQge1xuICByZW5kZXJDYXRlZ29yeVBhcmVudE9wdGlvbnMsXG4gIHJlbmRlckNhdGVnb3J5VGFibGUsXG4gIHNldENhdGVnb3J5RW1wdHlTdGF0ZSxcbn0gZnJvbSAnLi9kb20uanMnXG5pbXBvcnQgeyBjcmVhdGVNb2RhbENvbnRyb2xsZXIgfSBmcm9tICcuL21vZGFsLmpzJ1xuaW1wb3J0IHsgc2hvd1RvYXN0IH0gZnJvbSAnLi90b2FzdC5qcydcblxuZnVuY3Rpb24gcmVhZENhdGVnb3J5Um93KHJvdykge1xuICBjb25zdCBkZXB0aCA9IE51bWJlcihyb3cuZGF0YXNldC5jYXRlZ29yeURlcHRoIHx8IDApXG4gIGNvbnN0IHBhcmVudFNlbGVjdCA9IHJvdy5xdWVyeVNlbGVjdG9yKCdbZGF0YS1maWVsZD1cInBhcmVudF9pZFwiXScpXG5cbiAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICBpZDogcm93LmRhdGFzZXQuY2F0ZWdvcnlJZCxcbiAgICBuYW1lOiByb3cucXVlcnlTZWxlY3RvcignW2RhdGEtZmllbGQ9XCJuYW1lXCJdJyk/LnZhbHVlLnRyaW0oKSB8fCAnJyxcbiAgICBzb3J0X29yZGVyOiBOdW1iZXIocm93LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWZpZWxkPVwic29ydF9vcmRlclwiXScpPy52YWx1ZSB8fCAwKSxcbiAgfVxuXG4gIGlmIChkZXB0aCA+IDApIHtcbiAgICBwYXlsb2FkLnBhcmVudF9pZCA9IHBhcmVudFNlbGVjdD8udmFsdWUgfHwgJydcbiAgfVxuXG4gIHJldHVybiBwYXlsb2FkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0Q2F0ZWdvcmllc0FwcCgpIHtcbiAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2RvLWNhdGVnb3JpZXMtYXBwJylcbiAgaWYgKCFyb290KSByZXR1cm5cblxuICBjb25zdCBhcGkgPSBjcmVhdGVDYXRlZ29yaWVzQXBpQ2xpZW50KHJvb3QuZGF0YXNldC5hcGlCYXNlIHx8ICcvYXBpL3RvZG8tY2F0ZWdvcmllcycpXG4gIGNvbnN0IG1vZGFsID0gY3JlYXRlTW9kYWxDb250cm9sbGVyKHJvb3QpXG4gIGNvbnN0IHRhYmxlQm9keSA9IHJvb3QucXVlcnlTZWxlY3RvcignI2NhdGVnb3J5LXRhYmxlLWJvZHknKVxuICBjb25zdCBmb3JtRWwgPSByb290LnF1ZXJ5U2VsZWN0b3IoJyNjYXRlZ29yeS1hZGQtZm9ybScpXG4gIGNvbnN0IHN1Ym1pdEJ0biA9IGZvcm1FbD8ucXVlcnlTZWxlY3RvcignLmNhdGVnb3J5LWFkZC1mb3JtX19zdWJtaXQnKVxuICBjb25zdCBwYXJlbnRTZWxlY3RFbCA9IGZvcm1FbD8ucXVlcnlTZWxlY3RvcignW25hbWU9XCJwYXJlbnRfaWRcIl0nKVxuXG4gIGxldCBpc0xvYWRpbmcgPSBmYWxzZVxuICBjb25zdCBzYXZlVGltZXJzID0gbmV3IE1hcCgpXG5cbiAgZnVuY3Rpb24gdXBkYXRlQWRkRm9ybVBhcmVudE9wdGlvbnMoY2F0ZWdvcmllcykge1xuICAgIGlmICghcGFyZW50U2VsZWN0RWwpIHJldHVyblxuICAgIGNvbnN0IHNlbGVjdGVkID0gcGFyZW50U2VsZWN0RWwudmFsdWVcbiAgICBwYXJlbnRTZWxlY3RFbC5pbm5lckhUTUwgPSByZW5kZXJDYXRlZ29yeVBhcmVudE9wdGlvbnMoY2F0ZWdvcmllcywgc2VsZWN0ZWQpXG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiByZWZyZXNoQ2F0ZWdvcmllcygpIHtcbiAgICBpZiAoaXNMb2FkaW5nKSByZXR1cm5cbiAgICBpc0xvYWRpbmcgPSB0cnVlXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGFwaS5saXN0KClcbiAgICAgIGNvbnN0IGNhdGVnb3JpZXMgPSBkYXRhLmNhdGVnb3JpZXMgfHwgW11cbiAgICAgIHRhYmxlQm9keS5pbm5lckhUTUwgPSByZW5kZXJDYXRlZ29yeVRhYmxlKGNhdGVnb3JpZXMpXG4gICAgICB1cGRhdGVBZGRGb3JtUGFyZW50T3B0aW9ucyhjYXRlZ29yaWVzKVxuICAgICAgc2V0Q2F0ZWdvcnlFbXB0eVN0YXRlKHJvb3QsIGNhdGVnb3JpZXMubGVuZ3RoID09PSAwKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBjYXRlZ29yaWVzJywgZXJyb3IpXG4gICAgICBhd2FpdCBtb2RhbC5hbGVydChlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gbG9hZCBjYXRlZ29yaWVzJywgJ0NvdWxkIG5vdCBsb2FkIGNhdGVnb3JpZXMnKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpc0xvYWRpbmcgPSBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIHNhdmVDYXRlZ29yeVJvdyhyb3cpIHtcbiAgICBjb25zdCBwYXlsb2FkID0gcmVhZENhdGVnb3J5Um93KHJvdylcbiAgICBpZiAoIXBheWxvYWQubmFtZSkgcmV0dXJuXG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYXBpLnVwZGF0ZShwYXlsb2FkKVxuICAgICAgc2hvd1RvYXN0KCdDYXRlZ29yeSBzYXZlZCcpXG4gICAgICBhd2FpdCByZWZyZXNoQ2F0ZWdvcmllcygpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byB1cGRhdGUgY2F0ZWdvcnknLCBlcnJvcilcbiAgICAgIGF3YWl0IG1vZGFsLmFsZXJ0KGVycm9yLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byB1cGRhdGUgY2F0ZWdvcnknLCAnQ291bGQgbm90IHNhdmUgY2F0ZWdvcnknKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNjaGVkdWxlU2F2ZShyb3cpIHtcbiAgICBjb25zdCBpZCA9IHJvdy5kYXRhc2V0LmNhdGVnb3J5SWRcbiAgICBpZiAoIWlkKSByZXR1cm5cblxuICAgIGNsZWFyVGltZW91dChzYXZlVGltZXJzLmdldChpZCkpXG4gICAgc2F2ZVRpbWVycy5zZXQoXG4gICAgICBpZCxcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBzYXZlQ2F0ZWdvcnlSb3cocm93KVxuICAgICAgICBzYXZlVGltZXJzLmRlbGV0ZShpZClcbiAgICAgIH0sIDMwMCksXG4gICAgKVxuICB9XG5cbiAgZm9ybUVsPy5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgaWYgKCFzdWJtaXRCdG4pIHJldHVyblxuXG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybUVsKVxuICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICBuYW1lOiBTdHJpbmcoZm9ybURhdGEuZ2V0KCduYW1lJykgfHwgJycpLnRyaW0oKSxcbiAgICAgIHBhcmVudF9pZDogU3RyaW5nKGZvcm1EYXRhLmdldCgncGFyZW50X2lkJykgfHwgJycpLnRyaW0oKSxcbiAgICAgIHNvcnRfb3JkZXI6IE51bWJlcihmb3JtRGF0YS5nZXQoJ3NvcnRfb3JkZXInKSB8fCAwKSxcbiAgICB9XG5cbiAgICBpZiAoIXBheWxvYWQubmFtZSkgcmV0dXJuXG5cbiAgICBzdWJtaXRCdG4uZGlzYWJsZWQgPSB0cnVlXG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYXBpLmNyZWF0ZShwYXlsb2FkKVxuICAgICAgZm9ybUVsLnJlc2V0KClcbiAgICAgIGZvcm1FbC5xdWVyeVNlbGVjdG9yKCdbbmFtZT1cInNvcnRfb3JkZXJcIl0nKS52YWx1ZSA9ICcwJ1xuICAgICAgYXdhaXQgcmVmcmVzaENhdGVnb3JpZXMoKVxuICAgICAgc2hvd1RvYXN0KCdDYXRlZ29yeSBhZGRlZCcpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgY2F0ZWdvcnknLCBlcnJvcilcbiAgICAgIGF3YWl0IG1vZGFsLmFsZXJ0KGVycm9yLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBjcmVhdGUgY2F0ZWdvcnknLCAnQ291bGQgbm90IGFkZCBjYXRlZ29yeScpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHN1Ym1pdEJ0bi5kaXNhYmxlZCA9IGZhbHNlXG4gICAgfVxuICB9KVxuXG4gIHRhYmxlQm9keT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZXZlbnQpID0+IHtcbiAgICBjb25zdCByb3cgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtY2F0ZWdvcnktaWRdJylcbiAgICBpZiAoIXJvdykgcmV0dXJuXG4gICAgc2NoZWR1bGVTYXZlKHJvdylcbiAgfSlcblxuICB0YWJsZUJvZHk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChldmVudCkgPT4ge1xuICAgIGNvbnN0IHJvdyA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1jYXRlZ29yeS1pZF0nKVxuICAgIGlmICghcm93KSByZXR1cm5cbiAgICBzY2hlZHVsZVNhdmUocm93KVxuICB9KVxuXG4gIHRhYmxlQm9keT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBkZWxldGVCdG4gPSBldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtYWN0aW9uPVwiZGVsZXRlLWNhdGVnb3J5XCJdJylcbiAgICBpZiAoIWRlbGV0ZUJ0bikgcmV0dXJuXG5cbiAgICBjb25zdCByb3cgPSBkZWxldGVCdG4uY2xvc2VzdCgnW2RhdGEtY2F0ZWdvcnktaWRdJylcbiAgICBpZiAoIXJvdykgcmV0dXJuXG5cbiAgICBjb25zdCBjb25maXJtZWQgPSBhd2FpdCBtb2RhbC5jb25maXJtKCdUaGlzIGNhdGVnb3J5IHdpbGwgYmUgcGVybWFuZW50bHkgZGVsZXRlZC4nLCAnRGVsZXRlIGNhdGVnb3J5PycsIHtcbiAgICAgIGNvbmZpcm1MYWJlbDogJ0RlbGV0ZScsXG4gICAgICBkYW5nZXI6IHRydWUsXG4gICAgfSlcbiAgICBpZiAoIWNvbmZpcm1lZCkgcmV0dXJuXG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYXBpLmRlbGV0ZShyb3cuZGF0YXNldC5jYXRlZ29yeUlkKVxuICAgICAgYXdhaXQgcmVmcmVzaENhdGVnb3JpZXMoKVxuICAgICAgc2hvd1RvYXN0KCdDYXRlZ29yeSBkZWxldGVkJylcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGRlbGV0ZSBjYXRlZ29yeScsIGVycm9yKVxuICAgICAgYXdhaXQgbW9kYWwuYWxlcnQoZXJyb3IubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGRlbGV0ZSBjYXRlZ29yeScsICdDb3VsZCBub3QgZGVsZXRlIGNhdGVnb3J5JylcbiAgICB9XG4gIH0pXG59XG4iLCJpbXBvcnQgeyBpbml0VG9kb0FwcCB9IGZyb20gJy4vdG9kby1hcHAuanMnXG5pbXBvcnQgeyBpbml0U3RhdHVzZXNBcHAgfSBmcm9tICcuL3N0YXR1c2VzLWFwcC5qcydcbmltcG9ydCB7IGluaXRDYXRlZ29yaWVzQXBwIH0gZnJvbSAnLi9jYXRlZ29yaWVzLWFwcC5qcydcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgaW5pdFRvZG9BcHAoKVxuICBpbml0U3RhdHVzZXNBcHAoKVxuICBpbml0Q2F0ZWdvcmllc0FwcCgpXG59KVxuIl0sIm5hbWVzIjpbIl9hIiwiX2IiLCJpdGVtIl0sIm1hcHBpbmdzIjoiOztBQUFBLFdBQVMsV0FBVyxRQUFRO0FBQzFCLFVBQU0sU0FBUyxJQUFJLGdCQUFlO0FBQ2xDLFdBQU8sUUFBUSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxLQUFLLE1BQU07QUFDL0MsVUFBSSxVQUFVLFVBQWEsVUFBVSxRQUFRLFVBQVUsSUFBSTtBQUN6RCxlQUFPLElBQUksS0FBSyxPQUFPLEtBQUssQ0FBQztBQUFBLE1BQy9CO0FBQUEsSUFDRixDQUFDO0FBQ0QsVUFBTSxRQUFRLE9BQU8sU0FBUTtBQUM3QixXQUFPLFFBQVEsSUFBSSxLQUFLLEtBQUs7QUFBQSxFQUMvQjtBQUVPLFdBQVMs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
