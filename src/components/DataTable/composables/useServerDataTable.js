// Server-side DataTable Composable
import { ref, reactive, watch, computed } from 'vue'
import { useDataTable } from './useDataTable'
import { createServerAdapter, buildLaravelFilters } from '../utils/serverAdapter'
import { debounce } from '../utils/dataTableUtils'

export function useServerDataTable(config = {}) {
  // Server configuration
  const serverConfig = reactive({
    baseUrl: '',
    headers: {},
    timeout: 10000,
    debounceDelay: 500,
    autoLoad: true,
    ...config.server
  })

  // Create server adapter
  const serverAdapter = createServerAdapter(serverConfig)

  // Initialize DataTable with server-side config
  const dataTableConfig = {
    ...config,
    serverSide: true,
    pagination: {
      enabled: true,
      ...config.pagination
    }
  }

  const dataTable = useDataTable([], dataTableConfig)

  // Server state
  const loading = ref(false)
  const error = ref(null)
  const lastRequest = ref(null)

  // Request parameters
  const requestParams = reactive({
    page: 1,
    per_page: 10,
    sort: null,
    direction: null,
    search: '',
    filters: {}
  })

  // Computed request parameters
  const currentRequestParams = computed(() => ({
    page: dataTable.currentPage.value,
    per_page: dataTable.pageSize.value,
    sort: dataTable.sortBy.value,
    direction: dataTable.sortDirection.value,
    search: dataTable.globalFilter.value,
    filters: buildLaravelFilters(dataTable.filters)
  }))

  // Debounced fetch function
  const debouncedFetch = debounce(async (params) => {
    await fetchData(params)
  }, serverConfig.debounceDelay)

  // Fetch data from server
  async function fetchData(params = {}) {
    loading.value = true
    error.value = null

    try {
      const requestParams = {
        ...currentRequestParams.value,
        ...params
      }

      lastRequest.value = requestParams
      const response = await serverAdapter.fetchData(requestParams)
      
      // Update DataTable with server response
      dataTable.setServerResponse(response)
      
      return response
    } catch (err) {
      error.value = err.message || 'Failed to fetch data'
      console.error('Server DataTable fetch error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Refresh data
  async function refresh() {
    return fetchData()
  }

  // Handle pagination changes
  async function handlePageChange(page) {
    dataTable.goToPage(page)
    return fetchData({ page })
  }

  async function handlePageSizeChange(pageSize) {
    dataTable.setPageSize(pageSize)
    dataTable.goToPage(1) // Reset to first page
    return fetchData({ page: 1, per_page: pageSize })
  }

  // Handle sorting changes
  async function handleSort(column, direction) {
    dataTable.sort(column)
    return debouncedFetch({
      sort: column,
      direction: direction || dataTable.sortDirection.value,
      page: 1 // Reset to first page when sorting
    })
  }

  // Handle filtering changes
  async function handleFilter(key, value, type = 'contains') {
    dataTable.setFilter(key, value, type)
    return debouncedFetch({
      page: 1 // Reset to first page when filtering
    })
  }

  async function handleGlobalFilter(value) {
    dataTable.globalFilter.value = value
    return debouncedFetch({
      search: value,
      page: 1 // Reset to first page when searching
    })
  }

  // CRUD operations
  async function createRecord(data) {
    loading.value = true
    error.value = null

    try {
      const response = await serverAdapter.create(data)
      await refresh() // Refresh data after creation
      return response
    } catch (err) {
      error.value = err.message || 'Failed to create record'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateRecord(id, data) {
    loading.value = true
    error.value = null

    try {
      const response = await serverAdapter.update(id, data)
      await refresh() // Refresh data after update
      return response
    } catch (err) {
      error.value = err.message || 'Failed to update record'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteRecord(id) {
    loading.value = true
    error.value = null

    try {
      const response = await serverAdapter.delete(id)
      await refresh() // Refresh data after deletion
      return response
    } catch (err) {
      error.value = err.message || 'Failed to delete record'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function bulkDeleteRecords(ids) {
    loading.value = true
    error.value = null

    try {
      const response = await serverAdapter.bulkDelete(ids)
      await refresh() // Refresh data after bulk deletion
      return response
    } catch (err) {
      error.value = err.message || 'Failed to delete records'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Export data
  async function exportData(format = 'csv', params = {}) {
    loading.value = true
    error.value = null

    try {
      const exportParams = {
        ...currentRequestParams.value,
        ...params,
        format
      }

      const response = await serverAdapter.export(exportParams)
      
      // Handle file download
      if (response.headers.get('content-disposition')) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        
        // Extract filename from content-disposition header
        const contentDisposition = response.headers.get('content-disposition')
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        link.download = filenameMatch ? filenameMatch[1] : `export.${format}`
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }

      return response
    } catch (err) {
      error.value = err.message || 'Failed to export data'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Watch for changes that should trigger server requests
  watch(() => dataTable.currentPage.value, (newPage) => {
    if (newPage !== requestParams.page) {
      requestParams.page = newPage
      debouncedFetch()
    }
  })

  watch(() => dataTable.pageSize.value, (newPageSize) => {
    if (newPageSize !== requestParams.per_page) {
      requestParams.per_page = newPageSize
      requestParams.page = 1 // Reset to first page
      debouncedFetch()
    }
  })

  watch(() => dataTable.globalFilter.value, (newSearch) => {
    if (newSearch !== requestParams.search) {
      requestParams.search = newSearch
      requestParams.page = 1 // Reset to first page
      debouncedFetch()
    }
  })

  // Auto-load data on initialization
  if (serverConfig.autoLoad && serverConfig.baseUrl) {
    fetchData()
  }

  return {
    // DataTable instance
    ...dataTable,

    // Server-specific state
    loading,
    error,
    serverConfig,
    requestParams: currentRequestParams,
    lastRequest,

    // Server methods
    fetchData,
    refresh,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    handleFilter,
    handleGlobalFilter,
    createRecord,
    updateRecord,
    deleteRecord,
    bulkDeleteRecords,
    exportData,

    // Server adapter
    serverAdapter
  }
}
