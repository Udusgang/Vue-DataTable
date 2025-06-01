// DataTable Pagination Composable
import { ref, computed, reactive, watch } from 'vue'

export function useDataTablePagination(config = {}) {
  // State
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalItems = ref(0)
  
  // Configuration
  const paginationConfig = reactive({
    pageSizes: [5, 10, 25, 50, 100],
    showInfo: true,
    showSizeChanger: true,
    showQuickJump: true,
    maxVisiblePages: 7,
    serverSide: false,
    ...config
  })

  // Computed properties
  const totalPages = computed(() => {
    return Math.ceil(totalItems.value / pageSize.value)
  })

  const start = computed(() => {
    return (currentPage.value - 1) * pageSize.value + 1
  })

  const end = computed(() => {
    return Math.min(currentPage.value * pageSize.value, totalItems.value)
  })

  const hasNext = computed(() => {
    return currentPage.value < totalPages.value
  })

  const hasPrev = computed(() => {
    return currentPage.value > 1
  })

  const paginationInfo = computed(() => {
    return {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      totalItems: totalItems.value,
      totalPages: totalPages.value,
      start: start.value,
      end: end.value,
      hasNext: hasNext.value,
      hasPrev: hasPrev.value
    }
  })

  const visiblePages = computed(() => {
    const maxVisible = paginationConfig.maxVisiblePages
    const total = totalPages.value
    const current = currentPage.value
    
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }
    
    const pages = []
    const halfVisible = Math.floor(maxVisible / 2)
    
    let start = Math.max(1, current - halfVisible)
    let end = Math.min(total, start + maxVisible - 1)
    
    // Adjust start if we're near the end
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('...')
      }
    }
    
    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    // Add ellipsis and last page if needed
    if (end < total) {
      if (end < total - 1) {
        pages.push('...')
      }
      pages.push(total)
    }
    
    return pages
  })

  // Methods
  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function nextPage() {
    if (hasNext.value) {
      currentPage.value++
    }
  }

  function prevPage() {
    if (hasPrev.value) {
      currentPage.value--
    }
  }

  function firstPage() {
    currentPage.value = 1
  }

  function lastPage() {
    currentPage.value = totalPages.value
  }

  function setPageSize(size) {
    if (paginationConfig.pageSizes.includes(size)) {
      const oldSize = pageSize.value
      pageSize.value = size
      
      // Adjust current page to maintain position
      const currentItem = (currentPage.value - 1) * oldSize + 1
      currentPage.value = Math.ceil(currentItem / size)
    }
  }

  function reset() {
    currentPage.value = 1
  }

  function setTotalItems(total) {
    totalItems.value = total
    
    // Adjust current page if it's beyond the new total pages
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
    }
  }

  // Pagination for client-side data
  function paginateData(data) {
    if (paginationConfig.serverSide) {
      return data // Server handles pagination
    }
    
    setTotalItems(data.length)
    
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    
    return data.slice(startIndex, endIndex)
  }

  // Advanced pagination features
  function jumpToItem(itemIndex) {
    const page = Math.ceil((itemIndex + 1) / pageSize.value)
    goToPage(page)
  }

  function getPageForItem(itemIndex) {
    return Math.ceil((itemIndex + 1) / pageSize.value)
  }

  function getItemsOnPage(page = currentPage.value) {
    const startIndex = (page - 1) * pageSize.value
    const endIndex = Math.min(startIndex + pageSize.value, totalItems.value)
    
    return {
      start: startIndex + 1,
      end: endIndex,
      count: endIndex - startIndex
    }
  }

  function getPageRange(range = 2) {
    const start = Math.max(1, currentPage.value - range)
    const end = Math.min(totalPages.value, currentPage.value + range)
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  // Pagination state management
  function exportState() {
    return {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      totalItems: totalItems.value,
      config: { ...paginationConfig }
    }
  }

  function importState(state) {
    if (state.currentPage) currentPage.value = state.currentPage
    if (state.pageSize) pageSize.value = state.pageSize
    if (state.totalItems) totalItems.value = state.totalItems
    if (state.config) Object.assign(paginationConfig, state.config)
  }

  // Watch for page size changes to reset page if needed
  watch(pageSize, () => {
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
    }
  })

  // Watch for total items changes
  watch(totalItems, () => {
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
    }
  })

  return {
    // State
    currentPage,
    pageSize,
    totalItems,
    paginationConfig,

    // Computed
    totalPages,
    start,
    end,
    hasNext,
    hasPrev,
    paginationInfo,
    visiblePages,

    // Methods
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    reset,
    setTotalItems,
    paginateData,
    jumpToItem,
    getPageForItem,
    getItemsOnPage,
    getPageRange,
    exportState,
    importState
  }
}
