// DataTable Utility Functions
import { COLUMN_TYPES, SORT_DIRECTIONS } from '../types'

/**
 * Generate unique ID for table rows
 */
export function generateRowId(prefix = 'row') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * Get nested object value by path
 */
export function getNestedValue(obj, path) {
  if (!path) return obj
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null
  }, obj)
}

/**
 * Set nested object value by path
 */
export function setNestedValue(obj, path, value) {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    return current[key]
  }, obj)
  target[lastKey] = value
}

/**
 * Format cell value based on column type
 */
export function formatCellValue(value, column) {
  if (value === null || value === undefined) return ''
  
  switch (column.type) {
    case COLUMN_TYPES.NUMBER:
      return typeof value === 'number' ? value.toLocaleString() : value
    
    case COLUMN_TYPES.CURRENCY:
      const currency = column.currency || 'USD'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(value)
    
    case COLUMN_TYPES.PERCENTAGE:
      return `${(value * 100).toFixed(column.decimals || 2)}%`
    
    case COLUMN_TYPES.DATE:
      if (!value) return ''
      const date = new Date(value)
      return date.toLocaleDateString(column.locale || 'en-US', column.dateFormat || {})
    
    case COLUMN_TYPES.BOOLEAN:
      return value ? (column.trueText || 'Yes') : (column.falseText || 'No')
    
    default:
      return value.toString()
  }
}

/**
 * Sort data by column
 */
export function sortData(data, sortBy, sortDirection) {
  if (!sortBy || !sortDirection) return data
  
  return [...data].sort((a, b) => {
    const aVal = getNestedValue(a, sortBy)
    const bVal = getNestedValue(b, sortBy)
    
    // Handle null/undefined values
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    
    // Compare values
    let result = 0
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      result = aVal.localeCompare(bVal)
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      result = aVal - bVal
    } else if (aVal instanceof Date && bVal instanceof Date) {
      result = aVal.getTime() - bVal.getTime()
    } else {
      result = String(aVal).localeCompare(String(bVal))
    }
    
    return sortDirection === SORT_DIRECTIONS.DESC ? -result : result
  })
}

/**
 * Filter data based on filters
 */
export function filterData(data, filters) {
  if (!filters || Object.keys(filters).length === 0) return data
  
  return data.filter(row => {
    return Object.entries(filters).every(([key, filter]) => {
      if (!filter.value || filter.value === '') return true
      
      const cellValue = getNestedValue(row, key)
      if (cellValue === null || cellValue === undefined) return false
      
      const value = String(cellValue).toLowerCase()
      const filterValue = String(filter.value).toLowerCase()
      
      switch (filter.type) {
        case 'contains':
          return value.includes(filterValue)
        case 'equals':
          return value === filterValue
        case 'startsWith':
          return value.startsWith(filterValue)
        case 'endsWith':
          return value.endsWith(filterValue)
        case 'greaterThan':
          return parseFloat(cellValue) > parseFloat(filter.value)
        case 'lessThan':
          return parseFloat(cellValue) < parseFloat(filter.value)
        default:
          return value.includes(filterValue)
      }
    })
  })
}

/**
 * Paginate data
 */
export function paginateData(data, page, pageSize) {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return data.slice(start, end)
}

/**
 * Calculate pagination info
 */
export function calculatePaginationInfo(totalItems, currentPage, pageSize) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)
  
  return {
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    start,
    end,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  }
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
