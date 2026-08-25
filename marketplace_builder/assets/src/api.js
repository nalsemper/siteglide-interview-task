function buildQuery(params) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function createApiClient(baseUrl) {
  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...options,
    })

    const text = await response.text()
    let data

    try {
      data = JSON.parse(text)
    } catch {
      throw new Error('Invalid JSON response from server')
    }

    if (!response.ok || data.error) {
      throw new Error(data.error || `Request failed (${response.status})`)
    }

    return data
  }

  return {
    list(params = {}) {
      return request(`/list.json${buildQuery(params)}`)
    },

    create(payload) {
      return request('/create.json', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    update(payload) {
      return request('/update.json', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    delete(id) {
      return request('/delete.json', {
        method: 'POST',
        body: JSON.stringify({ id }),
      })
    },

    clearCompleted() {
      return request('/clear-completed.json', {
        method: 'POST',
        body: JSON.stringify({}),
      })
    },
  }
}

export function createStatusesApiClient(baseUrl) {
  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...options,
    })

    const text = await response.text()
    let data

    try {
      data = JSON.parse(text)
    } catch {
      throw new Error('Invalid JSON response from server')
    }

    if (!response.ok || data.error) {
      throw new Error(data.error || `Request failed (${response.status})`)
    }

    return data
  }

  return {
    list() {
      return request('/list.json')
    },

    create(payload) {
      return request('/create.json', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    update(payload) {
      return request('/update.json', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    delete(id) {
      return request('/delete.json', {
        method: 'POST',
        body: JSON.stringify({ id }),
      })
    },
  }
}

export function createCategoriesApiClient(baseUrl) {
  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...options,
    })

    const text = await response.text()
    let data

    try {
      data = JSON.parse(text)
    } catch {
      throw new Error('Invalid JSON response from server')
    }

    if (!response.ok || data.error) {
      throw new Error(data.error || `Request failed (${response.status})`)
    }

    return data
  }

  return {
    list() {
      return request('/list.json')
    },

    create(payload) {
      return request('/create.json', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    update(payload) {
      return request('/update.json', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    delete(id) {
      return request('/delete.json', {
        method: 'POST',
        body: JSON.stringify({ id }),
      })
    },
  }
}
