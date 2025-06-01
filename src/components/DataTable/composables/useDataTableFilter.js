// DataTable Filtering Composable
import { ref, reactive, computed } from 'vue'
import { debounce } from '../utils/dataTableUtils'
import { FILTER_TYPES } from '../types'

export function useDataTableFilter(config = {}) {
  // State
  const filters = reactive({})
  const globalFilter = ref('')
  const advancedFilters = reactive({})
  const filterHistory = ref([])
  
  // Configuration
  const filterConfig = reactive({
    debounce: 300,
    caseSensitive: false,
    exactMatch: false,
    enableHistory: true,
    maxHistoryItems: 10,
    ...config
  })

  // Computed
  const hasActiveFilters = computed(() => {
    return Object.keys(filters).length > 0 || 
           globalFilter.value !== '' || 
           Object.keys(advancedFilters).length > 0
  })

  const activeFilterCount = computed(() => {
    let count = 0
    if (globalFilter.value) count++
    count += Object.keys(filters).length
    count += Object.keys(advancedFilters).length
    return count
  })

  // Debounced filter functions
  const debouncedSetFilter = debounce((key, value, type = 'contains') => {
    setFilterImmediate(key, value, type)
  }, filterConfig.debounce)

  const debouncedSetGlobalFilter = debounce((value) => {
    setGlobalFilterImmediate(value)
  }, filterConfig.debounce)

  // Filter methods
  function setFilter(key, value, type = 'contains') {
    if (filterConfig.debounce > 0) {
      debouncedSetFilter(key, value, type)
    } else {
      setFilterImmediate(key, value, type)
    }
  }

  function setFilterImmediate(key, value, type = 'contains') {
    if (value === '' || value === null || value === undefined) {
      delete filters[key]
    } else {
      filters[key] = { value, type }
    }
    
    if (filterConfig.enableHistory) {
      addToHistory({ key, value, type, timestamp: Date.now() })
    }
  }

  function setGlobalFilter(value) {
    if (filterConfig.debounce > 0) {
      debouncedSetGlobalFilter(value)
    } else {
      setGlobalFilterImmediate(value)
    }
  }

  function setGlobalFilterImmediate(value) {
    globalFilter.value = value || ''
    
    if (filterConfig.enableHistory && value) {
      addToHistory({ 
        key: '_global', 
        value, 
        type: 'global', 
        timestamp: Date.now() 
      })
    }
  }

  function clearFilter(key) {
    delete filters[key]
    delete advancedFilters[key]
  }

  function clearAllFilters() {
    Object.keys(filters).forEach(key => delete filters[key])
    Object.keys(advancedFilters).forEach(key => delete advancedFilters[key])
    globalFilter.value = ''
  }

  function clearGlobalFilter() {
    globalFilter.value = ''
  }

  // Advanced filtering
  function setAdvancedFilter(key, filterConfig) {
    if (!filterConfig || Object.keys(filterConfig).length === 0) {
      delete advancedFilters[key]
    } else {
      advancedFilters[key] = filterConfig
    }
  }

  function setDateRangeFilter(key, startDate, endDate) {
    if (!startDate && !endDate) {
      delete advancedFilters[key]
    } else {
      advancedFilters[key] = {
        type: FILTER_TYPES.DATE_RANGE,
        startDate,
        endDate
      }
    }
  }

  function setNumberRangeFilter(key, min, max) {
    if (min === null && max === null) {
      delete advancedFilters[key]
    } else {
      advancedFilters[key] = {
        type: FILTER_TYPES.NUMBER_RANGE,
        min,
        max
      }
    }
  }

  function setMultiSelectFilter(key, values) {
    if (!values || values.length === 0) {
      delete advancedFilters[key]
    } else {
      advancedFilters[key] = {
        type: FILTER_TYPES.MULTISELECT,
        values
      }
    }
  }

  // Filter application
  function applyFilters(data, columns) {
    let filteredData = [...data]

    // Apply global filter
    if (globalFilter.value && columns) {
      const searchTerm = filterConfig.caseSensitive 
        ? globalFilter.value 
        : globalFilter.value.toLowerCase()
      
      filteredData = filteredData.filter(row => {
        return columns.some(column => {
          if (!column.filterable) return false
          
          const value = getNestedValue(row, column.key)
          if (value === null || value === undefined) return false
          
          const stringValue = filterConfig.caseSensitive 
            ? String(value) 
            : String(value).toLowerCase()
          
          return filterConfig.exactMatch 
            ? stringValue === searchTerm
            : stringValue.includes(searchTerm)
        })
      })
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, filter]) => {
      filteredData = filteredData.filter(row => {
        return applyColumnFilter(row, key, filter)
      })
    })

    // Apply advanced filters
    Object.entries(advancedFilters).forEach(([key, filter]) => {
      filteredData = filteredData.filter(row => {
        return applyAdvancedFilter(row, key, filter)
      })
    })

    return filteredData
  }

  function applyColumnFilter(row, key, filter) {
    const value = getNestedValue(row, key)
    if (value === null || value === undefined) return false

    const stringValue = filterConfig.caseSensitive 
      ? String(value) 
      : String(value).toLowerCase()
    const filterValue = filterConfig.caseSensitive 
      ? String(filter.value) 
      : String(filter.value).toLowerCase()

    switch (filter.type) {
      case 'contains':
        return stringValue.includes(filterValue)
      case 'equals':
        return stringValue === filterValue
      case 'startsWith':
        return stringValue.startsWith(filterValue)
      case 'endsWith':
        return stringValue.endsWith(filterValue)
      case 'greaterThan':
        return parseFloat(value) > parseFloat(filter.value)
      case 'lessThan':
        return parseFloat(value) < parseFloat(filter.value)
      case 'greaterThanOrEqual':
        return parseFloat(value) >= parseFloat(filter.value)
      case 'lessThanOrEqual':
        return parseFloat(value) <= parseFloat(filter.value)
      case 'notEquals':
        return stringValue !== filterValue
      case 'isEmpty':
        return value === '' || value === null || value === undefined
      case 'isNotEmpty':
        return value !== '' && value !== null && value !== undefined
      default:
        return stringValue.includes(filterValue)
    }
  }

  function applyAdvancedFilter(row, key, filter) {
    const value = getNestedValue(row, key)

    switch (filter.type) {
      case FILTER_TYPES.DATE_RANGE:
        const date = new Date(value)
        const start = filter.startDate ? new Date(filter.startDate) : null
        const end = filter.endDate ? new Date(filter.endDate) : null
        
        if (start && date < start) return false
        if (end && date > end) return false
        return true

      case FILTER_TYPES.NUMBER_RANGE:
        const num = parseFloat(value)
        if (isNaN(num)) return false
        
        if (filter.min !== null && num < filter.min) return false
        if (filter.max !== null && num > filter.max) return false
        return true

      case FILTER_TYPES.MULTISELECT:
        return filter.values.includes(value)

      default:
        return true
    }
  }

  // Filter history
  function addToHistory(filterItem) {
    if (!filterConfig.enableHistory) return

    filterHistory.value.unshift(filterItem)
    
    // Limit history size
    if (filterHistory.value.length > filterConfig.maxHistoryItems) {
      filterHistory.value = filterHistory.value.slice(0, filterConfig.maxHistoryItems)
    }
  }

  function applyHistoryFilter(historyItem) {
    if (historyItem.key === '_global') {
      setGlobalFilter(historyItem.value)
    } else {
      setFilter(historyItem.key, historyItem.value, historyItem.type)
    }
  }

  function clearHistory() {
    filterHistory.value = []
  }

  // Utility function
  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null
    }, obj)
  }

  // Export filter state
  function exportFilters() {
    return {
      filters: { ...filters },
      globalFilter: globalFilter.value,
      advancedFilters: { ...advancedFilters }
    }
  }

  // Import filter state
  function importFilters(filterState) {
    clearAllFilters()
    
    if (filterState.filters) {
      Object.assign(filters, filterState.filters)
    }
    
    if (filterState.globalFilter) {
      globalFilter.value = filterState.globalFilter
    }
    
    if (filterState.advancedFilters) {
      Object.assign(advancedFilters, filterState.advancedFilters)
    }
  }

  return {
    // State
    filters,
    globalFilter,
    advancedFilters,
    filterHistory,
    filterConfig,

    // Computed
    hasActiveFilters,
    activeFilterCount,

    // Methods
    setFilter,
    setGlobalFilter,
    clearFilter,
    clearAllFilters,
    clearGlobalFilter,
    setAdvancedFilter,
    setDateRangeFilter,
    setNumberRangeFilter,
    setMultiSelectFilter,
    applyFilters,
    applyHistoryFilter,
    clearHistory,
    exportFilters,
    importFilters
  }
}
