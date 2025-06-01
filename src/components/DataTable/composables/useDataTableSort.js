// DataTable Sorting Composable
import { ref, reactive, computed } from 'vue'
import { SORT_DIRECTIONS } from '../types'

export function useDataTableSort(config = {}) {
  // State
  const sortBy = ref(null)
  const sortDirection = ref(null)
  const multipleSorts = reactive([])
  
  // Configuration
  const sortConfig = reactive({
    multiple: false,
    defaultDirection: SORT_DIRECTIONS.ASC,
    caseSensitive: false,
    nullsFirst: false,
    customSorters: {},
    ...config
  })

  // Computed
  const hasSorting = computed(() => {
    return sortBy.value !== null || multipleSorts.length > 0
  })

  const currentSort = computed(() => {
    if (sortConfig.multiple) {
      return multipleSorts
    }
    return sortBy.value ? [{ key: sortBy.value, direction: sortDirection.value }] : []
  })

  // Sorting methods
  function sort(columnKey, direction = null) {
    if (sortConfig.multiple) {
      sortMultiple(columnKey, direction)
    } else {
      sortSingle(columnKey, direction)
    }
  }

  function sortSingle(columnKey, direction = null) {
    if (sortBy.value === columnKey) {
      // Cycle through directions: asc -> desc -> none
      if (direction) {
        sortDirection.value = direction
      } else {
        if (sortDirection.value === SORT_DIRECTIONS.ASC) {
          sortDirection.value = SORT_DIRECTIONS.DESC
        } else if (sortDirection.value === SORT_DIRECTIONS.DESC) {
          sortBy.value = null
          sortDirection.value = null
        } else {
          sortDirection.value = SORT_DIRECTIONS.ASC
        }
      }
    } else {
      sortBy.value = columnKey
      sortDirection.value = direction || sortConfig.defaultDirection
    }
  }

  function sortMultiple(columnKey, direction = null) {
    const existingIndex = multipleSorts.findIndex(sort => sort.key === columnKey)
    
    if (existingIndex !== -1) {
      const currentSort = multipleSorts[existingIndex]
      
      if (direction) {
        currentSort.direction = direction
      } else {
        // Cycle through directions
        if (currentSort.direction === SORT_DIRECTIONS.ASC) {
          currentSort.direction = SORT_DIRECTIONS.DESC
        } else if (currentSort.direction === SORT_DIRECTIONS.DESC) {
          multipleSorts.splice(existingIndex, 1)
        }
      }
    } else {
      multipleSorts.push({
        key: columnKey,
        direction: direction || sortConfig.defaultDirection
      })
    }
  }

  function clearSort() {
    sortBy.value = null
    sortDirection.value = null
    multipleSorts.splice(0)
  }

  function removeSortColumn(columnKey) {
    if (sortConfig.multiple) {
      const index = multipleSorts.findIndex(sort => sort.key === columnKey)
      if (index !== -1) {
        multipleSorts.splice(index, 1)
      }
    } else if (sortBy.value === columnKey) {
      clearSort()
    }
  }

  // Apply sorting to data
  function applySorting(data, columns) {
    if (!hasSorting.value) return data

    const sorts = currentSort.value
    if (sorts.length === 0) return data

    return [...data].sort((a, b) => {
      for (const sortItem of sorts) {
        const result = compareValues(a, b, sortItem.key, sortItem.direction, columns)
        if (result !== 0) return result
      }
      return 0
    })
  }

  function compareValues(a, b, key, direction, columns) {
    const aVal = getNestedValue(a, key)
    const bVal = getNestedValue(b, key)
    
    // Handle null/undefined values
    if (aVal === null || aVal === undefined) {
      if (bVal === null || bVal === undefined) return 0
      return sortConfig.nullsFirst ? -1 : 1
    }
    if (bVal === null || bVal === undefined) {
      return sortConfig.nullsFirst ? 1 : -1
    }

    // Find column configuration
    const column = columns?.find(col => col.key === key)
    
    // Use custom sorter if available
    if (column?.customSort && typeof column.customSort === 'function') {
      const result = column.customSort(aVal, bVal, a, b)
      return direction === SORT_DIRECTIONS.DESC ? -result : result
    }

    // Use global custom sorter if available
    if (sortConfig.customSorters[key]) {
      const result = sortConfig.customSorters[key](aVal, bVal, a, b)
      return direction === SORT_DIRECTIONS.DESC ? -result : result
    }

    // Type-specific sorting
    let result = 0
    
    if (column?.type === 'number' || column?.type === 'currency') {
      result = compareNumbers(aVal, bVal)
    } else if (column?.type === 'date') {
      result = compareDates(aVal, bVal)
    } else if (column?.type === 'boolean') {
      result = compareBooleans(aVal, bVal)
    } else {
      result = compareStrings(aVal, bVal)
    }
    
    return direction === SORT_DIRECTIONS.DESC ? -result : result
  }

  function compareNumbers(a, b) {
    const numA = parseFloat(a)
    const numB = parseFloat(b)
    
    if (isNaN(numA) && isNaN(numB)) return 0
    if (isNaN(numA)) return 1
    if (isNaN(numB)) return -1
    
    return numA - numB
  }

  function compareDates(a, b) {
    const dateA = new Date(a)
    const dateB = new Date(b)
    
    if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0
    if (isNaN(dateA.getTime())) return 1
    if (isNaN(dateB.getTime())) return -1
    
    return dateA.getTime() - dateB.getTime()
  }

  function compareBooleans(a, b) {
    if (a === b) return 0
    return a ? 1 : -1
  }

  function compareStrings(a, b) {
    const strA = String(a)
    const strB = String(b)
    
    if (sortConfig.caseSensitive) {
      return strA.localeCompare(strB)
    } else {
      return strA.toLowerCase().localeCompare(strB.toLowerCase())
    }
  }

  // Utility functions
  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null
    }, obj)
  }

  function getSortDirection(columnKey) {
    if (sortConfig.multiple) {
      const sort = multipleSorts.find(s => s.key === columnKey)
      return sort ? sort.direction : null
    }
    return sortBy.value === columnKey ? sortDirection.value : null
  }

  function getSortIndex(columnKey) {
    if (!sortConfig.multiple) return -1
    return multipleSorts.findIndex(s => s.key === columnKey)
  }

  function isSorted(columnKey) {
    if (sortConfig.multiple) {
      return multipleSorts.some(s => s.key === columnKey)
    }
    return sortBy.value === columnKey
  }

  // Advanced sorting features
  function addCustomSorter(columnKey, sorterFunction) {
    sortConfig.customSorters[columnKey] = sorterFunction
  }

  function removeCustomSorter(columnKey) {
    delete sortConfig.customSorters[columnKey]
  }

  function setSortPriority(columnKey, priority) {
    if (!sortConfig.multiple) return
    
    const sortIndex = multipleSorts.findIndex(s => s.key === columnKey)
    if (sortIndex === -1) return
    
    const sortItem = multipleSorts.splice(sortIndex, 1)[0]
    const newIndex = Math.max(0, Math.min(priority, multipleSorts.length))
    multipleSorts.splice(newIndex, 0, sortItem)
  }

  // Export/Import sort state
  function exportSortState() {
    return {
      single: {
        sortBy: sortBy.value,
        sortDirection: sortDirection.value
      },
      multiple: [...multipleSorts],
      config: { ...sortConfig }
    }
  }

  function importSortState(state) {
    if (state.single) {
      sortBy.value = state.single.sortBy
      sortDirection.value = state.single.sortDirection
    }
    
    if (state.multiple) {
      multipleSorts.splice(0)
      multipleSorts.push(...state.multiple)
    }
    
    if (state.config) {
      Object.assign(sortConfig, state.config)
    }
  }

  return {
    // State
    sortBy,
    sortDirection,
    multipleSorts,
    sortConfig,

    // Computed
    hasSorting,
    currentSort,

    // Methods
    sort,
    sortSingle,
    sortMultiple,
    clearSort,
    removeSortColumn,
    applySorting,
    getSortDirection,
    getSortIndex,
    isSorted,
    addCustomSorter,
    removeCustomSorter,
    setSortPriority,
    exportSortState,
    importSortState
  }
}
