<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900">Advanced DataTable</h1>
      <div class="flex items-center space-x-4">
        <button
          @click="generateSampleData"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Generate Sample Data
        </button>
        <button
          @click="clearData"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Clear Data
        </button>
      </div>
    </div>

    <!-- DataTable Demo -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <DataTable
        ref="dataTableRef"
        :data="tableData"
        :columns="tableColumns"
        :config="tableConfig"
        @row-click="handleRowClick"
        @cell-update="handleCellUpdate"
        @action="handleAction"
        @create="handleCreate"
      />
    </div>

    <!-- Configuration Panel -->
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Table Configuration</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- UI Options -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-700">UI Options</h4>
          
          <label class="flex items-center">
            <input
              v-model="tableConfig.ui.striped"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Striped rows</span>
          </label>
          
          <label class="flex items-center">
            <input
              v-model="tableConfig.ui.bordered"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Bordered</span>
          </label>
          
          <label class="flex items-center">
            <input
              v-model="tableConfig.ui.hover"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Hover effects</span>
          </label>
          
          <label class="flex items-center">
            <input
              v-model="tableConfig.ui.compact"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Compact mode</span>
          </label>
          
          <label class="flex items-center">
            <input
              v-model="tableConfig.ui.stickyHeader"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Sticky header</span>
          </label>
        </div>

        <!-- Feature Options -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-700">Features</h4>
          
          <label class="flex items-center">
            <input
              v-model="tableConfig.selection.enabled"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Row selection</span>
          </label>
          
          <label class="flex items-center">
            <input
              v-model="tableConfig.sorting.enabled"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Sorting</span>
          </label>
          
          <label class="flex items-center">
            <input
              v-model="tableConfig.filtering.enabled"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Filtering</span>
          </label>
          
          <label class="flex items-center">
            <input
              v-model="tableConfig.pagination.enabled"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Pagination</span>
          </label>
          
          <label class="flex items-center">
            <input
              v-model="tableConfig.export.enabled"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Export</span>
          </label>
          
          <label class="flex items-center">
            <input
              v-model="tableConfig.crud.enabled"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">CRUD operations</span>
          </label>
        </div>

        <!-- Pagination Options -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-700">Pagination</h4>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Page Size</label>
            <select
              v-model="tableConfig.pagination.pageSize"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option v-for="size in [5, 10, 25, 50, 100]" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>
          
          <label class="flex items-center">
            <input
              v-model="tableConfig.pagination.showInfo"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Show info</span>
          </label>
          
          <label class="flex items-center">
            <input
              v-model="tableConfig.pagination.showSizeChanger"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Show size changer</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Usage Example -->
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Usage Example</h3>
      
      <div class="bg-gray-50 rounded-lg p-4">
        <pre class="text-sm text-gray-800 overflow-x-auto"><code>&lt;template&gt;
  &lt;DataTable
    :data="tableData"
    :columns="tableColumns"
    :config="tableConfig"
    @row-click="handleRowClick"
    @cell-update="handleCellUpdate"
    @action="handleAction"
  /&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { DataTable } from '@/components/DataTable'

const tableData = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  // ... more data
])

const tableColumns = [
  { key: 'name', title: 'Name', sortable: true, filterable: true },
  { key: 'email', title: 'Email', type: 'email' },
  { key: 'status', title: 'Status', type: 'badge' }
]

const tableConfig = {
  pagination: { enabled: true, pageSize: 10 },
  selection: { enabled: true },
  export: { enabled: true },
  crud: { enabled: true, inline: true }
}
&lt;/script&gt;</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import DataTable from '../components/DataTable/DataTable.vue'
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/vue/24/outline'

// Table data
const tableData = ref([])

// Table columns configuration
const tableColumns = [
  {
    key: 'id',
    title: 'ID',
    type: 'number',
    sortable: true,
    filterable: true,
    width: '80px'
  },
  {
    key: 'name',
    title: 'Name',
    type: 'text',
    sortable: true,
    filterable: true,
    editable: true,
    required: true
  },
  {
    key: 'email',
    title: 'Email',
    type: 'email',
    sortable: true,
    filterable: true,
    editable: true,
    required: true
  },
  {
    key: 'role',
    title: 'Role',
    type: 'badge',
    sortable: true,
    filterable: true,
    editable: true,
    badgeConfig: {
      admin: 'bg-red-100 text-red-800',
      user: 'bg-blue-100 text-blue-800',
      moderator: 'bg-green-100 text-green-800'
    }
  },
  {
    key: 'salary',
    title: 'Salary',
    type: 'currency',
    sortable: true,
    filterable: true,
    editable: true,
    currency: 'USD',
    align: 'right'
  },
  {
    key: 'joinDate',
    title: 'Join Date',
    type: 'date',
    sortable: true,
    filterable: true,
    editable: true
  },
  {
    key: 'active',
    title: 'Status',
    type: 'boolean',
    sortable: true,
    filterable: true,
    editable: true,
    trueText: 'Active',
    falseText: 'Inactive'
  },
  {
    key: 'actions',
    title: 'Actions',
    type: 'actions',
    width: '120px',
    actions: [
      {
        key: 'view',
        icon: EyeIcon,
        title: 'View',
        class: 'text-blue-600 hover:text-blue-800'
      },
      {
        key: 'edit',
        icon: PencilIcon,
        title: 'Edit',
        class: 'text-green-600 hover:text-green-800'
      },
      {
        key: 'delete',
        icon: TrashIcon,
        title: 'Delete',
        class: 'text-red-600 hover:text-red-800'
      }
    ]
  }
]

// Table configuration
const tableConfig = reactive({
  pagination: {
    enabled: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50, 100],
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
    debounce: 300
  },
  selection: {
    enabled: true,
    multiple: true,
    showSelectAll: true
  },
  export: {
    enabled: true,
    formats: ['csv', 'excel', 'json'],
    filename: 'users-export'
  },
  crud: {
    enabled: true,
    inline: true,
    actions: ['create', 'update', 'delete', 'bulkDelete']
  },
  ui: {
    striped: true,
    bordered: true,
    hover: true,
    compact: false,
    stickyHeader: true,
    loading: false,
    noDataText: 'No users found',
    loadingText: 'Loading users...'
  }
})

// Table reference
const dataTableRef = ref(null)

// Methods
function generateSampleData() {
  const roles = ['admin', 'user', 'moderator']
  const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson', 'Diana Davis', 'Eve Miller', 'Frank Garcia', 'Grace Lee', 'Henry Taylor']
  
  const sampleData = Array.from({ length: 50 }, (_, index) => ({
    _id: `user_${index + 1}`,
    id: index + 1,
    name: names[index % names.length] + ` ${index + 1}`,
    email: `user${index + 1}@example.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    salary: Math.floor(Math.random() * 100000) + 30000,
    joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: Math.random() > 0.3
  }))
  
  tableData.value = sampleData
}

function clearData() {
  tableData.value = []
}

function handleRowClick(row) {
  console.log('Row clicked:', row)
}

function handleCellUpdate({ row, column, value }) {
  console.log('Cell updated:', { row, column, value })
  // Update the row data
  const index = tableData.value.findIndex(item => item._id === row._id)
  if (index !== -1) {
    tableData.value[index][column.key] = value
  }
}

function handleAction({ action, row }) {
  console.log('Action triggered:', { action, row })
  
  switch (action) {
    case 'view':
      alert(`Viewing user: ${row.name}`)
      break
    case 'edit':
      alert(`Editing user: ${row.name}`)
      break
    case 'delete':
      if (confirm(`Are you sure you want to delete ${row.name}?`)) {
        const index = tableData.value.findIndex(item => item._id === row._id)
        if (index !== -1) {
          tableData.value.splice(index, 1)
        }
      }
      break
  }
}

function handleCreate() {
  console.log('Create new record')
  alert('Create new user functionality would be implemented here')
}

// Initialize with sample data
generateSampleData()
</script>
