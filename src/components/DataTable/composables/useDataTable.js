// Main DataTable Composable
import { ref, computed, reactive, watch, nextTick } from 'vue'
import {
  sortData,
  filterData,
  paginateData,
  calculatePaginationInfo,
  debounce,
  deepClone,
  getNestedValue,
  generateRowId
} from '../utils/dataTableUtils'
import { DEFAULT_TABLE_CONFIG } from '../types'

export function useDataTable(initialData = [], initialConfig = {}) {
  // Merge config with defaults
  const config = reactive({ ...DEFAULT_TABLE_CONFIG, ...initialConfig })

  // Core data
  const originalData = ref([...initialData])
  const data = ref([...initialData])
  const columns = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Server-side data
  const serverResponse = ref(null)
  const serverSide = computed(() => config.serverSide || false)

  // Selection
  const selectedRows = ref([])
  const selectAll = ref(false)

  // Sorting
  const sortBy = ref(null)
  const sortDirection = ref(null)

  // Filtering
  const filters = reactive({})
  const globalFilter = ref('')

  // Pagination
  const currentPage = ref(1)
  const pageSize = ref(config.pagination.pageSize)

  // Computed properties
  const filteredData = computed(() => {
    let result = [...originalData.value]

    // Apply global filter
    if (globalFilter.value && config.filtering.global) {
      const searchTerm = globalFilter.value.toLowerCase()
      result = result.filter(row => {
        return columns.value.some(col => {
          if (!col.filterable) return false
          const value = getNestedValue(row, col.key)
          return String(value || '').toLowerCase().includes(searchTerm)
        })
      })
    }

    // Apply column filters
    if (Object.keys(filters).length > 0) {
      result = filterData(result, filters)
    }

    return result
  })

  const sortedData = computed(() => {
    if (!sortBy.value || !sortDirection.value) {
      return filteredData.value
    }
    return sortData(filteredData.value, sortBy.value, sortDirection.value)
  })

  const paginatedData = computed(() => {
    if (serverSide.value) {
      // For server-side, return the data as-is since pagination is handled by server
      return data.value
    }

    if (!config.pagination.enabled) {
      return sortedData.value
    }
    return paginateData(sortedData.value, currentPage.value, pageSize.value)
  })

  const paginationInfo = computed(() => {
    if (serverSide.value && serverResponse.value) {
      // Handle Laravel-style pagination response
      // Use our local pageSize instead of server response pageSize to prevent override
      const info = {
        currentPage: serverResponse.value.current_page,
        pageSize: pageSize.value, // Use local pageSize, not server response
        totalItems: serverResponse.value.total,
        totalPages: serverResponse.value.last_page,
        start: serverResponse.value.from || 0,
        end: serverResponse.value.to || 0,
        hasNext: !!serverResponse.value.next_page_url,
        hasPrev: !!serverResponse.value.prev_page_url
      }
      console.log('Server pagination info (using local pageSize):', info)
      return info
    }

    return calculatePaginationInfo(
      filteredData.value.length,
      currentPage.value,
      pageSize.value
    )
  })

  const hasSelection = computed(() => selectedRows.value.length > 0)
  const isAllSelected = computed(() => {
    return paginatedData.value.length > 0 &&
           selectedRows.value.length === paginatedData.value.length
  })

  // Methods
  function setData(newData) {
    if (serverSide.value) {
      // Handle server-side paginated response
      setServerResponse(newData)
    } else {
      originalData.value = [...newData]
      data.value = [...newData]
      resetSelection()
      resetPagination()
    }
  }

  function setServerResponse(response) {
    console.log('Setting server response:', response)
    serverResponse.value = response

    // Handle Laravel pagination response format
    const responseData = (response.data || []).map(row => ({
      ...row,
      _id: row._id || row.id || generateRowId()
    }))

    data.value = responseData
    originalData.value = responseData

    console.log('Data set to:', responseData)
    console.log('Server response set to:', response)

    // Update pagination state from server response
    if (response.current_page) {
      currentPage.value = response.current_page
    }
    // Don't override pageSize if we're in server-side mode
    // The pageSize should be controlled by the parent component
    if (response.per_page && !serverSide.value) {
      pageSize.value = response.per_page
    }

    resetSelection()
  }

  function setData(newData) {
    console.log('Composable setData called with length:', newData?.length, 'serverSide:', serverSide.value)
    if (Array.isArray(newData)) {
      // Direct array data
      const processedData = newData.map(row => ({
        ...row,
        _id: row._id || row.id || generateRowId()
      }))
      data.value = processedData
      originalData.value = processedData
      console.log('Data set directly, new length:', processedData.length)
    } else if (newData && newData.data && Array.isArray(newData.data)) {
      // Laravel pagination format
      console.log('Setting server response from setData')
      setServerResponse(newData)
    } else if (newData) {
      console.log('Unknown data format:', newData)
    }
  }

  function addRow(row) {
    const newRow = { ...row, _id: generateRowId() }
    originalData.value.push(newRow)
    data.value.push(newRow)
  }

  function updateRow(rowId, updates) {
    const index = originalData.value.findIndex(row => row._id === rowId)
    if (index !== -1) {
      originalData.value[index] = { ...originalData.value[index], ...updates }
      data.value[index] = { ...data.value[index], ...updates }
    }
  }

  function deleteRow(rowId) {
    originalData.value = originalData.value.filter(row => row._id !== rowId)
    data.value = data.value.filter(row => row._id !== rowId)
    selectedRows.value = selectedRows.value.filter(id => id !== rowId)
  }

  function deleteSelectedRows() {
    const idsToDelete = new Set(selectedRows.value)
    originalData.value = originalData.value.filter(row => !idsToDelete.has(row._id))
    data.value = data.value.filter(row => !idsToDelete.has(row._id))
    resetSelection()
  }

  // Sorting methods
  function sort(columnKey) {
    if (sortBy.value === columnKey) {
      // Cycle through: asc -> desc -> none
      if (sortDirection.value === 'asc') {
        sortDirection.value = 'desc'
      } else if (sortDirection.value === 'desc') {
        sortBy.value = null
        sortDirection.value = null
      }
    } else {
      sortBy.value = columnKey
      sortDirection.value = 'asc'
    }
  }

  function resetSort() {
    sortBy.value = null
    sortDirection.value = null
  }

  // Filtering methods
  const debouncedFilter = debounce((key, value, type = 'contains') => {
    if (value === '' || value === null || value === undefined) {
      delete filters[key]
    } else {
      filters[key] = { value, type }
    }
    resetPagination()
  }, config.filtering.debounce)

  function setFilter(key, value, type = 'contains') {
    debouncedFilter(key, value, type)
  }

  function clearFilter(key) {
    delete filters[key]
    resetPagination()
  }

  function clearAllFilters() {
    Object.keys(filters).forEach(key => delete filters[key])
    globalFilter.value = ''
    resetPagination()
  }

  // Pagination methods
  function goToPage(page) {
    if (page >= 1 && page <= paginationInfo.value.totalPages) {
      currentPage.value = page
    }
  }

  function nextPage() {
    if (paginationInfo.value.hasNext) {
      currentPage.value++
    }
  }

  function prevPage() {
    if (paginationInfo.value.hasPrev) {
      currentPage.value--
    }
  }

  function setPageSize(size) {
    console.log('setPageSize called with:', size, 'current pageSize:', pageSize.value)
    pageSize.value = size
    if (!serverSide.value) {
      resetPagination()
    }
    console.log('pageSize updated to:', pageSize.value)
  }

  function resetPagination() {
    currentPage.value = 1
  }

  // Selection methods
  function selectRow(rowId) {
    if (!selectedRows.value.includes(rowId)) {
      selectedRows.value.push(rowId)
    }
  }

  function deselectRow(rowId) {
    const index = selectedRows.value.indexOf(rowId)
    if (index !== -1) {
      selectedRows.value.splice(index, 1)
    }
  }

  function toggleRowSelection(rowId) {
    if (selectedRows.value.includes(rowId)) {
      deselectRow(rowId)
    } else {
      selectRow(rowId)
    }
  }

  function selectAllRows() {
    selectedRows.value = paginatedData.value.map(row => row._id)
  }

  function deselectAllRows() {
    selectedRows.value = []
  }

  function toggleSelectAll() {
    if (isAllSelected.value) {
      deselectAllRows()
    } else {
      selectAllRows()
    }
  }

  function resetSelection() {
    selectedRows.value = []
    selectAll.value = false
  }

  // Utility methods
  function refresh() {
    // Reset all states
    resetSort()
    clearAllFilters()
    resetPagination()
    resetSelection()
  }

  function getSelectedRowsData() {
    return originalData.value.filter(row => selectedRows.value.includes(row._id))
  }

  // Watch for data changes
  watch(() => originalData.value, () => {
    data.value = [...originalData.value]
  }, { deep: true })

  return {
    // Data
    data: paginatedData,
    originalData,
    columns,
    loading,
    error,

    // Server-side
    serverResponse,
    serverSide,
    setServerResponse,

    // Selection
    selectedRows,
    selectAll,
    hasSelection,
    isAllSelected,

    // Sorting
    sortBy,
    sortDirection,

    // Filtering
    filters,
    globalFilter,
    filteredData,

    // Pagination
    currentPage,
    pageSize,
    paginationInfo,

    // Config
    config,

    // Methods
    setData,
    addRow,
    updateRow,
    deleteRow,
    deleteSelectedRows,
    sort,
    resetSort,
    setFilter,
    clearFilter,
    clearAllFilters,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    resetPagination,
    selectRow,
    deselectRow,
    toggleRowSelection,
    selectAllRows,
    deselectAllRows,
    toggleSelectAll,
    resetSelection,
    refresh,
    getSelectedRowsData
  }
}
