// Server-side DataTable Adapter
// Handles API communication for server-side processing

/**
 * Server-side DataTable adapter for Laravel-style paginated APIs
 */
export class ServerAdapter {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || ''
    this.headers = config.headers || {}
    this.timeout = config.timeout || 10000
    this.transformRequest = config.transformRequest || this.defaultTransformRequest
    this.transformResponse = config.transformResponse || this.defaultTransformResponse
  }

  /**
   * Fetch data from server with pagination, sorting, and filtering
   */
  async fetchData(params = {}) {
    const url = this.buildUrl(params)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.headers
        },
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return this.transformResponse(data)
    } catch (error) {
      console.error('Server adapter fetch error:', error)
      throw error
    }
  }

  /**
   * Build URL with query parameters
   */
  buildUrl(params) {
    const url = new URL(this.baseUrl)

    // Pagination
    if (params.page) {
      url.searchParams.set('page', params.page)
    }
    if (params.per_page || params.pageSize) {
      url.searchParams.set('per_page', params.per_page || params.pageSize)
    }

    // Sorting
    if (params.sort) {
      url.searchParams.set('sort', params.sort)
    }
    if (params.direction) {
      url.searchParams.set('direction', params.direction)
    }

    // Filtering
    if (params.search) {
      url.searchParams.set('search', params.search)
    }

    // Column filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          url.searchParams.set(`filter[${key}]`, value)
        }
      })
    }

    // Custom parameters
    if (params.custom) {
      Object.entries(params.custom).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }

    return url.toString()
  }

  /**
   * Default request transformation
   */
  defaultTransformRequest(params) {
    return params
  }

  /**
   * Default response transformation
   */
  defaultTransformResponse(data) {
    console.log('Raw API response:', data)

    // Handle Laravel pagination format
    if (data.data && Array.isArray(data.data)) {
      const transformed = {
        data: data.data,
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total,
        last_page: data.last_page,
        from: data.from,
        to: data.to,
        next_page_url: data.next_page_url,
        prev_page_url: data.prev_page_url,
        links: data.links || []
      }
      console.log('Transformed response:', transformed)
      return transformed
    }

    console.log('Returning data as-is:', data)
    return data
  }

  /**
   * Create a new record
   */
  async create(data) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.headers
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Server adapter create error:', error)
      throw error
    }
  }

  /**
   * Update a record
   */
  async update(id, data) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.headers
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Server adapter update error:', error)
      throw error
    }
  }

  /**
   * Delete a record
   */
  async delete(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          ...this.headers
        },
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.status === 204 ? {} : await response.json()
    } catch (error) {
      console.error('Server adapter delete error:', error)
      throw error
    }
  }

  /**
   * Bulk delete records
   */
  async bulkDelete(ids) {
    try {
      const response = await fetch(`${this.baseUrl}/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.headers
        },
        body: JSON.stringify({ ids }),
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Server adapter bulk delete error:', error)
      throw error
    }
  }

  /**
   * Export data
   */
  async export(params = {}) {
    const url = this.buildUrl({ ...params, export: true })

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...this.headers
        },
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response
    } catch (error) {
      console.error('Server adapter export error:', error)
      throw error
    }
  }
}

/**
 * Create a server adapter instance
 */
export function createServerAdapter(config) {
  return new ServerAdapter(config)
}

/**
 * Laravel pagination helper
 */
export function parseLaravelPagination(response) {
  return {
    data: response.data || [],
    pagination: {
      currentPage: response.current_page || 1,
      pageSize: response.per_page || 10,
      totalItems: response.total || 0,
      totalPages: response.last_page || 1,
      from: response.from || 0,
      to: response.to || 0,
      hasNext: !!response.next_page_url,
      hasPrev: !!response.prev_page_url,
      links: response.links || []
    }
  }
}

/**
 * Build Laravel-style filter parameters
 */
export function buildLaravelFilters(filters) {
  const params = {}

  Object.entries(filters).forEach(([key, filter]) => {
    if (filter.value !== null && filter.value !== undefined && filter.value !== '') {
      switch (filter.type) {
        case 'equals':
          params[`filter[${key}]`] = filter.value
          break
        case 'contains':
          params[`filter[${key}][like]`] = `%${filter.value}%`
          break
        case 'startsWith':
          params[`filter[${key}][like]`] = `${filter.value}%`
          break
        case 'endsWith':
          params[`filter[${key}][like]`] = `%${filter.value}`
          break
        case 'greaterThan':
          params[`filter[${key}][gt]`] = filter.value
          break
        case 'lessThan':
          params[`filter[${key}][lt]`] = filter.value
          break
        case 'greaterThanOrEqual':
          params[`filter[${key}][gte]`] = filter.value
          break
        case 'lessThanOrEqual':
          params[`filter[${key}][lte]`] = filter.value
          break
        case 'in':
          params[`filter[${key}][in]`] = Array.isArray(filter.value)
            ? filter.value.join(',')
            : filter.value
          break
        default:
          params[`filter[${key}]`] = filter.value
      }
    }
  })

  return params
}
