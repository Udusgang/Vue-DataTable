<template>
  <div class="datatable-container">
    <!-- Toolbar -->
    <DataTableToolbar v-if="showToolbar" :config="config" :selected-count="selectedRows.length"
      :total-count="filteredData.length" :global-filter="globalFilter" @search="handleGlobalSearch"
      @export="handleExport" @print="handlePrint" @refresh="refresh" @bulk-delete="deleteSelectedRows"
      @create="$emit('create')" />

    <!-- Additional Filters -->
    <AdditionalFilters v-if="config.filtering?.additionalFilters?.enabled" @filter-change="handleAdditionalFilters" />

    <!-- Table Container -->
    <div class="datatable-wrapper" :class="{
      'overflow-auto': config.ui.virtualScroll || config.ui.scrollable?.enabled,
      'border border-gray-200 rounded-lg': config.ui.bordered,
      'rounded-t-none': showToolbar
    }" :style="getTableContainerStyle()">
      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span class="text-gray-600">{{ config.ui.loadingText }}</span>
        </div>
      </div>

      <!-- Table -->
      <table class="min-w-full divide-y divide-gray-200" :class="{
        'table-striped': config.ui.striped,
        'table-hover': config.ui.hover,
        'table-compact': config.ui.compact
      }">
        <!-- Header -->
        <thead class="bg-gray-50" :class="{ 'sticky top-0 z-20': config.ui.stickyHeader }">
          <tr>
            <!-- Selection Column -->
            <th v-if="config.selection.enabled"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
              <input v-if="config.selection.showSelectAll" type="checkbox" :checked="isAllSelected"
                :indeterminate="hasSelection && !isAllSelected" @change="toggleSelectAll"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
            </th>

            <!-- Data Columns -->
            <th v-for="column in visibleColumns" :key="column.key" :class="[
              'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
              getColumnAlignClass(column.align),
              { 'cursor-pointer hover:bg-gray-100': column.sortable },
              getStickyColumnClass(column.key)
            ]" :style="{ ...getColumnStyle(column), ...getStickyColumnStyle(column.key) }"
              @click="column.sortable && handleSort(column.key)">
              <div class="flex items-center space-x-1">
                <span>{{ column.title || column.key }}</span>

                <!-- Sort Icons -->
                <div v-if="column.sortable" class="flex flex-col">
                  <svg class="w-3 h-3 text-gray-400"
                    :class="{ 'text-indigo-600': getCurrentSortColumn() === column.key && getCurrentSortDirection() === 'asc' }"
                    fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                  <svg class="w-3 h-3 text-gray-400 transform rotate-180"
                    :class="{ 'text-indigo-600': getCurrentSortColumn() === column.key && getCurrentSortDirection() === 'desc' }"
                    fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>

                <!-- Resize Handle -->
                <div v-if="column.resizable" class="w-1 h-4 bg-gray-300 cursor-col-resize hover:bg-gray-400"
                  @mousedown="startResize(column, $event)"></div>
              </div>

              <!-- Column Filter -->
              <div v-if="column.filterable && config.filtering.column" class="mt-2">
                <!-- Text Filter -->
                <input v-if="!column.filterType || column.filterType === 'text'" type="text"
                  :placeholder="column.placeholder || `Filter ${column.title || column.key}...`"
                  class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  @input="handleColumnFilter(column.key, $event.target.value, 'contains')" @click.stop />

                <!-- Searchable Select Filter -->
                <SearchableSelect v-else-if="column.filterType === 'select'" :model-value="getFilterValue(column.key)"
                  :options="column.filterOptions || []" :placeholder="column.placeholder || `Filter ${column.title}...`"
                  :search-placeholder="`Search ${column.title}...`"
                  @update:model-value="handleSelectFilter(column.key, $event)" @click.stop />

                <!-- Date Filter -->
                <input v-else-if="column.filterType === 'date'" type="date"
                  class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  @change="handleColumnFilter(column.key, $event.target.value, 'date')" @click.stop />

                <!-- Number Filter -->
                <input v-else-if="column.filterType === 'number'" type="number"
                  :placeholder="column.placeholder || `Filter ${column.title || column.key}...`"
                  class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  @input="handleColumnFilter(column.key, $event.target.value, 'equals')" @click.stop />
              </div>
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Debug Info -->
          <tr v-if="false">
            <td :colspan="totalColumns" class="px-6 py-2 text-xs text-gray-500 bg-yellow-50">
              Debug: data.length = {{ data.length }}, loading = {{ loading }}, serverSide = {{ config.serverSide }}
            </td>
          </tr>

          <!-- No Data -->
          <tr v-if="data.length === 0 && !loading">
            <td :colspan="totalColumns" class="px-6 py-12 text-center text-gray-500">
              <div class="flex flex-col items-center space-y-2">
                <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{{ config.ui.noDataText }}</span>
              </div>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr v-for="(row, index) in data" :key="row._id || index" :class="{
            'hover:bg-gray-50': config.ui.hover,
            'bg-indigo-50': selectedRows.includes(row._id),
            'bg-gray-50': config.ui.striped && index % 2 === 1
          }" @click="handleRowClick(row)">
            <!-- Selection Cell -->
            <td v-if="config.selection.enabled" class="px-6 py-4 whitespace-nowrap w-12">
              <input type="checkbox" :checked="selectedRows.includes(row._id)" @change="toggleRowSelection(row._id)"
                @click.stop class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
            </td>

            <!-- Data Cells -->
            <DataTableCell v-for="column in visibleColumns" :key="column.key" :row="row" :column="column"
              :editable="config.crud.enabled && config.crud.inline && column.editable"
              :sticky-class="getStickyColumnClass(column.key)" :sticky-style="getStickyColumnStyle(column.key)"
              @update="handleCellUpdate" @action="handleAction" />
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <DataTablePagination v-if="config.pagination.enabled" :pagination-info="paginationInfo"
      :page-sizes="config.pagination.pageSizes" :show-info="config.pagination.showInfo"
      :show-size-changer="config.pagination.showSizeChanger" @page-change="handlePageChange"
      @size-change="handleSizeChange" @prev="prevPage" @next="nextPage" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useDataTable } from './composables/useDataTable'
import { exportToCSV, exportToExcel, exportToJSON, printTable } from './utils/exportUtils'
import DataTableToolbar from './DataTableToolbar.vue'
import DataTableCell from './DataTableCell.vue'
import DataTablePagination from './DataTablePagination.vue'
import SearchableSelect from './SearchableSelect.vue'
import AdditionalFilters from './AdditionalFilters.vue'

// Props
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  config: {
    type: Object,
    default: () => ({})
  },
  showToolbar: {
    type: Boolean,
    default: true
  },
  serverSide: {
    type: Boolean,
    default: false
  },
  serverResponse: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'row-click',
  'cell-update',
  'action',
  'create',
  'update',
  'delete',
  'bulk-delete',
  'sort',
  'filter',
  'page-change',
  'size-change',
  'server-request',
  'server-response',
  'server-error'
])

// Use DataTable composable with server-side configuration
const dataTableConfig = {
  ...props.config,
  serverSide: props.serverSide
}

const {
  data,
  originalData,
  loading,
  selectedRows,
  hasSelection,
  isAllSelected,
  sortBy,
  sortDirection,
  globalFilter,
  filteredData,
  paginationInfo,
  config,
  sort,
  setFilter,
  goToPage,
  prevPage,
  nextPage,
  setPageSize,
  toggleSelectAll,
  toggleRowSelection,
  deleteSelectedRows,
  refresh,
  setData,
  setServerResponse
} = useDataTable(props.data, dataTableConfig)

// Watch for data changes from parent
watch(() => props.data, (newData) => {
  console.log('DataTable: Props data changed, length:', newData?.length, 'data:', newData)
  setData(newData)
}, { immediate: true, deep: true })

// Debug config on mount
watch(() => config.export, (exportConfig) => {
  console.log('Export config:', exportConfig)
}, { immediate: true, deep: true })

// Watch for server response changes from parent (if available)
watch(() => props.serverResponse, (newResponse) => {
  if (newResponse && props.serverSide) {
    console.log('Server response changed:', newResponse)
    setServerResponse(newResponse)
  }
}, { immediate: true, deep: true })

// Computed
const visibleColumns = computed(() => {
  return props.columns.filter(col => col.visible !== false)
})

const totalColumns = computed(() => {
  let count = visibleColumns.value.length
  if (config.selection.enabled) count++
  return count
})

// Methods
function getColumnAlignClass(align) {
  switch (align) {
    case 'center': return 'text-center'
    case 'right': return 'text-right'
    default: return 'text-left'
  }
}

function getColumnStyle(column) {
  const style = {}
  if (column.width) style.width = column.width
  if (column.minWidth) style.minWidth = column.minWidth
  if (column.maxWidth) style.maxWidth = column.maxWidth
  return style
}

function getTableContainerStyle() {
  const style = {}

  if (config.ui.scrollable?.enabled) {
    // Use maxHeight instead of fixed height to avoid empty space
    if (config.ui.scrollable.maxHeight) {
      style.maxHeight = config.ui.scrollable.maxHeight
      style.overflowY = 'auto'
    } else if (config.ui.scrollable.height) {
      // Fallback to height if maxHeight is not provided
      style.height = config.ui.scrollable.height
      style.overflowY = 'auto'
    }

    if (config.ui.scrollable.width) {
      style.width = config.ui.scrollable.width
      style.overflowX = 'auto'
    }
  }

  return style
}

function getStickyColumnClass(columnKey) {
  if (!config.ui.scrollable?.enabled) return ''

  const leftSticky = config.ui.scrollable.stickyColumns?.left || []
  const rightSticky = config.ui.scrollable.stickyColumns?.right || []

  if (leftSticky.includes(columnKey)) {
    return 'sticky left-0 z-10 bg-white'
  }
  if (rightSticky.includes(columnKey)) {
    return 'sticky right-0 z-10 bg-white'
  }

  return ''
}

function getStickyColumnStyle(columnKey) {
  if (!config.ui.scrollable?.enabled) return {}

  const leftSticky = config.ui.scrollable.stickyColumns?.left || []
  const rightSticky = config.ui.scrollable.stickyColumns?.right || []

  if (leftSticky.includes(columnKey)) {
    // Calculate left position based on previous sticky columns
    let leftPosition = 0
    const columnIndex = leftSticky.indexOf(columnKey)
    for (let i = 0; i < columnIndex; i++) {
      const prevColumn = visibleColumns.value.find(col => col.key === leftSticky[i])
      if (prevColumn && prevColumn.width) {
        leftPosition += parseInt(prevColumn.width) || 0
      } else {
        leftPosition += 150 // Default column width
      }
    }
    return { left: `${leftPosition}px` }
  }

  if (rightSticky.includes(columnKey)) {
    // Calculate right position based on following sticky columns
    let rightPosition = 0
    const columnIndex = rightSticky.indexOf(columnKey)
    for (let i = columnIndex + 1; i < rightSticky.length; i++) {
      const nextColumn = visibleColumns.value.find(col => col.key === rightSticky[i])
      if (nextColumn && nextColumn.width) {
        rightPosition += parseInt(nextColumn.width) || 0
      } else {
        rightPosition += 150 // Default column width
      }
    }
    return { right: `${rightPosition}px` }
  }

  return {}
}

function handleRowClick(row) {
  emit('row-click', row)
}

function handleCellUpdate(row, column, value) {
  emit('cell-update', { row, column, value })
}

function handleAction(action, row) {
  emit('action', { action, row })
}

function handlePageChange(page) {
  if (props.serverSide) {
    emit('page-change', page)
  } else {
    goToPage(page)
  }
}

function handleSizeChange(size) {
  if (props.serverSide) {
    emit('size-change', size)
  } else {
    setPageSize(size)
  }
}

function handleGlobalSearch(searchTerm) {
  if (props.serverSide) {
    emit('filter', { key: 'global', value: searchTerm, type: 'contains' })
  } else {
    globalFilter.value = searchTerm
  }
}

// Handle sorting for both client-side and server-side
function handleSort(columnKey) {
  console.log('Sort clicked:', { columnKey, currentSort: currentSort.value })

  if (props.serverSide) {
    // For server-side sorting, emit sort event to parent
    let direction = 'asc'

    // Toggle direction if clicking the same column
    if (currentSort.value.column === columnKey) {
      if (currentSort.value.direction === 'asc') {
        direction = 'desc'
      } else if (currentSort.value.direction === 'desc') {
        direction = null // Remove sorting
        columnKey = null // Clear column when removing sort
      } else {
        direction = 'asc'
      }
    }

    // Update local sort state
    currentSort.value = { column: columnKey, direction }

    console.log('Emitting server-side sort:', { column: columnKey, direction })
    emit('sort', { column: columnKey, direction })
  } else {
    // For client-side sorting, use the composable's sort function
    sort(columnKey)
  }
}

// Debounced filter function for better performance
const filterTimeouts = ref({})

function handleColumnFilter(columnKey, value, type = 'contains') {
  console.log('Column filter:', { columnKey, value, type })

  if (props.serverSide) {
    // Clear existing timeout for this column
    if (filterTimeouts.value[columnKey]) {
      clearTimeout(filterTimeouts.value[columnKey])
    }

    // Set new timeout for debouncing (300ms delay)
    filterTimeouts.value[columnKey] = setTimeout(() => {
      console.log('Emitting filter after debounce:', { key: columnKey, value, type })
      emit('filter', { key: columnKey, value, type })
    }, 300)
  } else {
    // For client-side, use the composable's setFilter function
    setFilter(columnKey, value)
  }
}

// Store current filter values
const currentFilters = ref({})

// Store current sort state for server-side sorting
const currentSort = ref({ column: null, direction: null })

// Get current filter value for a column
function getFilterValue(columnKey) {
  return currentFilters.value[columnKey] || ''
}

// Get current sort column (works for both client-side and server-side)
function getCurrentSortColumn() {
  return props.serverSide ? currentSort.value.column : sortBy.value
}

// Get current sort direction (works for both client-side and server-side)
function getCurrentSortDirection() {
  return props.serverSide ? currentSort.value.direction : sortDirection.value
}

// Immediate filter for select dropdowns (no debounce needed)
function handleSelectFilter(columnKey, value) {
  console.log('Select filter (immediate):', { columnKey, value })

  // Store the filter value
  currentFilters.value[columnKey] = value

  if (props.serverSide) {
    // Emit immediately for select filters
    emit('filter', { key: columnKey, value, type: 'equals' })
  } else {
    // For client-side, use the composable's setFilter function
    setFilter(columnKey, value)
  }
}

// Handle additional filters
function handleAdditionalFilters(filters) {
  console.log('Additional filters changed:', filters)

  if (props.serverSide) {
    // Emit each filter individually for server-side processing
    Object.entries(filters).forEach(([key, value]) => {
      emit('filter', { key, value, type: 'contains' })
    })
  } else {
    // For client-side, you could implement additional filtering logic here
    console.log('Client-side additional filtering not implemented yet')
  }
}



function handleExport(format) {
  console.log('handleExport called with format:', format)

  const exportData = props.serverSide ? data.value : filteredData.value
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')

  console.log('Export triggered:', { format, exportData, dataLength: exportData.length })

  if (!exportData || exportData.length === 0) {
    alert('No data to export')
    return
  }

  try {
    if (props.serverSide) {
      // For server-side, we can export the current page data
      // In a real app, you might want to emit an event to get all data from server
      const filename = `server_export_${timestamp}`

      switch (format) {
        case 'csv':
          exportToCSV(exportData, visibleColumns.value, `${filename}.csv`)
          break
        case 'excel':
          exportToExcel(exportData, visibleColumns.value, `${filename}.xlsx`)
          break
        case 'json':
          exportToJSON(exportData, visibleColumns.value, `${filename}.json`)
          break
        default:
          console.error('Unknown export format:', format)
          return
      }

      // Also emit event for custom server-side export handling
      emit('export', { format, filename, data: exportData })
    } else {
      // Handle client-side export
      const filename = `export_${timestamp}`

      switch (format) {
        case 'csv':
          exportToCSV(exportData, visibleColumns.value, `${filename}.csv`)
          break
        case 'excel':
          exportToExcel(exportData, visibleColumns.value, `${filename}.xlsx`)
          break
        case 'json':
          exportToJSON(exportData, visibleColumns.value, `${filename}.json`)
          break
        default:
          console.error('Unknown export format:', format)
          return
      }
    }

    console.log('Export completed successfully')
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed: ' + error.message)
  }
}

function handlePrint() {
  const printData = props.serverSide ? data.value : filteredData.value
  printTable(printData, visibleColumns.value, 'Data Table')
}

// Column resizing
const resizing = ref(false)
const resizeColumn = ref(null)

function startResize(column, event) {
  resizing.value = true
  resizeColumn.value = column
  // Add resize logic here
}

// Expose methods for parent component
defineExpose({
  refresh,
  exportData: handleExport,
  printData: handlePrint,
  getSelectedRows: () => selectedRows.value,
  clearSelection: () => selectedRows.value = [],
  setServerResponse,
  setPageSize
})
</script>

<style scoped>
.datatable-container {
  position: relative;
}

.datatable-wrapper {
  position: relative;
}

.table-striped tbody tr:nth-child(even) {
  background-color: #f9fafb;
}

.table-hover tbody tr:hover {
  background-color: #f3f4f6;
}

.table-compact th,
.table-compact td {
  padding: 0.75rem;
}

/* Custom scrollbar */
.datatable-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.datatable-wrapper::-webkit-scrollbar-track {
  background-color: #f3f4f6;
  border-radius: 4px;
}

.datatable-wrapper::-webkit-scrollbar-thumb {
  background-color: #9ca3af;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.datatable-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}

.datatable-wrapper::-webkit-scrollbar-corner {
  background-color: #f3f4f6;
}

/* Sticky column shadows */
.sticky-shadow-right::after {
  content: '';
  position: absolute;
  top: 0;
  right: -10px;
  bottom: 0;
  width: 10px;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.1), transparent);
  pointer-events: none;
}

.sticky-shadow-left::before {
  content: '';
  position: absolute;
  top: 0;
  left: -10px;
  bottom: 0;
  width: 10px;
  background: linear-gradient(to left, rgba(0, 0, 0, 0.1), transparent);
  pointer-events: none;
}
</style>
