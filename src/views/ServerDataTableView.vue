<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900">Server-side DataTable</h1>
      <div class="flex items-center space-x-4">
        <button @click="refresh" :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
          <ArrowPathIcon class="h-4 w-4 mr-2" :class="{ 'animate-spin': loading }" />
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-2 text-sm text-red-700">
            {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Info -->
    <div v-if="data.length > 0" class="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
      <p class="text-green-800">✅ Data loaded: {{ data.length }} products</p>
      <p class="text-xs text-green-600">First product: {{ data[0]?.name }}</p>
    </div>

    <!-- Server DataTable -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <DataTable ref="dataTableRef" :data="data" :columns="tableColumns" :config="tableConfig" :server-side="true"
        :server-response="serverResponse" @row-click="handleRowClick" @cell-update="handleCellUpdate"
        @action="handleAction" @create="handleCreate" @sort="handleSort" @filter="handleFilter"
        @page-change="handlePageChange" @size-change="handlePageSizeChange" @export="handleExport" />
    </div>

    <!-- API Configuration -->
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">API Configuration</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">API Endpoint</label>
          <input v-model="apiEndpoint" type="url" placeholder="http://127.0.0.1:8000/products"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            @change="updateApiEndpoint" />
          <p class="mt-1 text-xs text-gray-500">Enter your Laravel API endpoint</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Request Status</label>
          <div class="mt-1 flex items-center space-x-2">
            <div :class="[
              'h-3 w-3 rounded-full',
              loading ? 'bg-yellow-400' : error ? 'bg-red-400' : 'bg-green-400'
            ]"></div>
            <span class="text-sm text-gray-600">
              {{ loading ? 'Loading...' : error ? 'Error' : 'Connected' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Request Info -->
      <div v-if="lastRequest" class="mt-6">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Last Request</h4>
        <div class="bg-gray-50 rounded-lg p-3">
          <pre class="text-xs text-gray-600 overflow-x-auto">{{ JSON.stringify(lastRequest, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Usage Example -->
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Server-side Usage Example</h3>

      <div class="bg-gray-50 rounded-lg p-4">
        <pre class="text-sm text-gray-800 overflow-x-auto"><code>&lt;template&gt;
  &lt;DataTable
    :data="data"
    :columns="columns"
    :config="config"
    server-side
    @sort="handleSort"
    @filter="handleFilter"
    @page-change="handlePageChange"
  /&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { useServerDataTable } from '@/components/DataTable'

const {
  data,
  loading,
  error,
  handleSort,
  handleFilter,
  handlePageChange,
  refresh
} = useServerDataTable({
  server: {
    baseUrl: 'http://127.0.0.1:8000/products',
    headers: {
      'Authorization': 'Bearer your-token'
    }
  }
})

// Columns configuration for Laravel API
const columns = [
  { key: 'id', title: 'ID', type: 'number', sortable: true },
  { key: 'name', title: 'Name', type: 'text', sortable: true, filterable: true },
  { key: 'category', title: 'Category', type: 'badge', sortable: true, filterable: true },
  { key: 'price', title: 'Price', type: 'currency', sortable: true, align: 'right' },
  { key: 'stock', title: 'Stock', type: 'number', sortable: true },
  { key: 'status', title: 'Status', type: 'badge', sortable: true, filterable: true }
]
&lt;/script&gt;</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import DataTable from '../components/DataTable/DataTable.vue'
// import { useServerDataTable } from '../components/DataTable/composables/useServerDataTable'
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

// API Configuration
const apiEndpoint = ref('http://127.0.0.1:8000/products')

// Server DataTable Configuration
const serverConfig = reactive({
  server: {
    baseUrl: apiEndpoint.value,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    timeout: 10000,
    debounceDelay: 500,
    autoLoad: false // We'll load manually after setup
  },
  pagination: {
    enabled: true,
    pageSize: 5,
    pageSizes: [5, 10, 25, 50],
    showInfo: true,
    showSizeChanger: true
  },
  sorting: {
    enabled: true,
    multiple: false
  },
  filtering: {
    enabled: true,
    global: true,
    column: true,
    debounce: 300,
    additionalFilters: {
      enabled: true
    }
  },
  selection: {
    enabled: true,
    multiple: true,
    showSelectAll: true
  },
  export: {
    enabled: true,
    formats: ['csv', 'excel', 'json'],
    filename: 'products-export'
  },
  crud: {
    enabled: true,
    inline: false,
    actions: ['update', 'delete']
  },
  ui: {
    striped: true,
    bordered: true,
    hover: true,
    compact: false,
    stickyHeader: true,
    loading: false,
    noDataText: 'No products found',
    loadingText: 'Loading products...',
    scrollable: {
      enabled: true,
      maxHeight: '500px', // Maximum height before scrolling kicks in
      width: '100%',      // Full width, horizontal scroll when needed
      stickyColumns: {
        left: ['id'], // Stick ID column to the left
        right: []     // No right sticky columns
      }
    }
  }
})

// Server data management with pagination and filtering
const data = ref([])
const loading = ref(false)
const error = ref(null)
const lastRequest = ref(null)
const serverResponse = ref(null)
const paginationInfo = ref({
  currentPage: 1,
  perPage: 5,
  total: 0,
  lastPage: 1
})

// Current filters and sort
const currentFilters = ref({})
const currentSort = ref({ column: null, direction: null })

// Build query parameters
function buildQueryParams() {
  const params = new URLSearchParams()

  // Pagination
  params.append('page', paginationInfo.value.currentPage)
  params.append('per_page', paginationInfo.value.perPage)

  // Sorting
  if (currentSort.value.column) {
    params.append('sort', currentSort.value.column)
    params.append('direction', currentSort.value.direction)
  }

  // Filtering
  Object.entries(currentFilters.value).forEach(([key, filter]) => {
    if (filter.value) {
      params.append(`filter[${key}]`, filter.value)
      params.append(`filter_type[${key}]`, filter.type || 'contains')
    }
  })

  return params.toString()
}

// Fetch data with current parameters
async function fetchData() {
  loading.value = true
  error.value = null

  try {
    const queryParams = buildQueryParams()
    const url = `${apiEndpoint.value}?${queryParams}`
    console.log('Fetching from:', url)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('API Response:', result)

    // Store the server response
    serverResponse.value = result

    // Handle Laravel pagination format
    if (result.data && Array.isArray(result.data)) {
      // Process data to ensure each row has an _id
      const processedData = result.data.map(row => ({
        ...row,
        _id: row._id || row.id || `row_${Date.now()}_${Math.random()}`
      }))
      data.value = processedData

      // Update pagination info
      paginationInfo.value = {
        currentPage: result.current_page || 1,
        perPage: result.per_page || 5,
        total: result.total || 0,
        lastPage: result.last_page || 1
      }

      console.log('Data set to:', data.value)
      console.log('Pagination info:', paginationInfo.value)

      // Notify DataTable about server response if it's available
      console.log('Processed data length:', processedData.length)
      console.log('Setting data.value to:', processedData)

      nextTick(() => {
        if (dataTableRef.value && dataTableRef.value.setServerResponse) {
          console.log('Calling DataTable setServerResponse with:', result)
          dataTableRef.value.setServerResponse(result)
        }
      })
    } else if (Array.isArray(result)) {
      const processedData = result.map(row => ({
        ...row,
        _id: row._id || row.id || `row_${Date.now()}_${Math.random()}`
      }))
      data.value = processedData
    } else {
      data.value = []
    }

    lastRequest.value = { url, timestamp: new Date() }

  } catch (err) {
    error.value = err.message
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
}

// Refresh function
const refresh = fetchData

// Table columns for Laravel products API
const tableColumns = [
  {
    key: 'id',
    title: 'ID',
    type: 'number',
    sortable: true,
    filterable: true,
    filterType: 'text',
    width: '80px',
    placeholder: 'Filter ID...'
  },
  {
    key: 'name',
    title: 'Product Name',
    type: 'text',
    sortable: true,
    filterable: true,
    filterType: 'text',
    editable: false,
    placeholder: 'Search products...'
  },
  {
    key: 'category',
    title: 'Category',
    type: 'badge',
    sortable: true,
    filterable: true,
    filterType: 'select',
    placeholder: 'Filter Category...',
    filterOptions: [
      { value: '', label: 'All Categories' },
      { value: 'Toys', label: 'Toys' },
      { value: 'Home & Kitchen', label: 'Home & Kitchen' },
      { value: 'Books', label: 'Books' },
      { value: 'Sports', label: 'Sports' },
      { value: 'Electronics', label: 'Electronics' }
    ],
    badgeConfig: {
      'Toys': 'bg-purple-100 text-purple-800',
      'Home & Kitchen': 'bg-blue-100 text-blue-800',
      'Books': 'bg-green-100 text-green-800',
      'Sports': 'bg-orange-100 text-orange-800',
      'Electronics': 'bg-indigo-100 text-indigo-800'
    }
  },
  {
    key: 'price',
    title: 'Price',
    type: 'currency',
    sortable: true,
    filterable: true,
    filterType: 'text',
    currency: 'USD',
    align: 'right',
    placeholder: 'Filter price...'
  },
  {
    key: 'stock',
    title: 'Stock',
    type: 'number',
    sortable: true,
    filterable: true,
    filterType: 'text',
    align: 'center',
    placeholder: 'Filter stock...'
  },
  {
    key: 'status',
    title: 'Status',
    type: 'badge',
    sortable: true,
    filterable: true,
    filterType: 'select',
    placeholder: 'Filter Status...',
    filterOptions: [
      { value: '', label: 'All Status' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
      { value: 'out_of_stock', label: 'Out of Stock' }
    ],
    badgeConfig: {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'out_of_stock': 'bg-red-100 text-red-800'
    }
  },
  {
    key: 'created_at',
    title: 'Created',
    type: 'date',
    sortable: true,
    filterable: true,
    filterType: 'date'
  }
]

// Table configuration
const tableConfig = reactive({
  ...serverConfig,
  serverSide: true
})

// Table reference
const dataTableRef = ref(null)

// Event handlers
function handleRowClick(row) {
  console.log('Row clicked:', row)
}

function handleCellUpdate({ row, column, value }) {
  console.log('Cell updated:', { row, column, value })
  // In a real app, you would call an API to update the record
}

function handleAction({ action, row }) {
  console.log('Action triggered:', { action, row })

  switch (action) {
    case 'view':
      alert(`Viewing product: ${row.name}`)
      break
    case 'edit':
      alert(`Editing product: ${row.name}`)
      break
    case 'delete':
      if (confirm(`Are you sure you want to delete ${row.name}?`)) {
        // Call delete API
        console.log('Delete product:', row.id)
      }
      break
  }
}

function handleCreate() {
  console.log('Create new product')
  alert('Create new product functionality would be implemented here')
}

// Server event handlers
async function handleSort({ column, direction }) {
  console.log('Sort:', { column, direction })
  currentSort.value = { column, direction }
  paginationInfo.value.currentPage = 1 // Reset to first page when sorting
  await fetchData()
}

async function handleFilter({ key, value, type }) {
  console.log('Filter:', { key, value, type })

  // Handle all filters the same way
  if (value === '' || value === null || value === undefined) {
    delete currentFilters.value[key]
  } else {
    currentFilters.value[key] = { value, type: type || 'contains' }
  }

  paginationInfo.value.currentPage = 1 // Reset to first page when filtering
  await fetchData()
}

async function handlePageChange(page) {
  console.log('Page change:', page)
  paginationInfo.value.currentPage = page
  await fetchData()
}

async function handlePageSizeChange(size) {
  console.log('Page size change:', size)
  console.log('Before change - Current page:', paginationInfo.value.currentPage, 'Per page:', paginationInfo.value.perPage)

  // First, update the DataTable's page size to prevent override
  if (dataTableRef.value && dataTableRef.value.setPageSize) {
    console.log('Setting DataTable page size to:', size)
    dataTableRef.value.setPageSize(size)
  }

  // Update our local pagination info
  paginationInfo.value.perPage = size
  paginationInfo.value.currentPage = 1 // Reset to first page when changing page size

  console.log('After change - Current page:', paginationInfo.value.currentPage, 'Per page:', paginationInfo.value.perPage)

  // Fetch new data with updated page size
  await fetchData()
}

function handleExport({ format, filename, data: exportData }) {
  console.log('Export requested:', { format, filename, dataLength: exportData?.length })
  // In a real application, you might want to:
  // 1. Make an API call to get all data for export
  // 2. Or use the current page data (which is already handled by the DataTable)
  // The DataTable component already handles the actual export
}

// Update API endpoint
function updateApiEndpoint() {
  refresh()
}

// Watch data changes
watch(data, (newData) => {
  console.log('Data changed:', newData)
}, { deep: true })

// Load data on mount
onMounted(() => {
  console.log('Component mounted, data:', data.value)
  console.log('API endpoint:', apiEndpoint.value)
  console.log('Table config:', tableConfig)
  if (apiEndpoint.value) {
    fetchData().then(() => {
      console.log('Data after fetch:', data.value)
    })
  }
})
</script>
