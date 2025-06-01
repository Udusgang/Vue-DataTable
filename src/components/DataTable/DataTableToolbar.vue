<template>
  <div class="datatable-toolbar bg-white border border-gray-200 rounded-t-lg px-4 py-3">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
      <!-- Left Section -->
      <div class="flex items-center space-x-4">
        <!-- Search -->
        <div v-if="config.filtering.global" class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" :value="globalFilter" @input="$emit('search', $event.target.value)" placeholder="Search..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <!-- Selection Info -->
        <div v-if="selectedCount > 0" class="flex items-center space-x-2 text-sm text-gray-600">
          <span class="font-medium">{{ selectedCount }}</span>
          <span>of</span>
          <span class="font-medium">{{ totalCount }}</span>
          <span>selected</span>
        </div>
      </div>

      <!-- Right Section -->
      <div class="flex items-center space-x-2">
        <!-- Bulk Actions -->
        <div v-if="selectedCount > 0" class="flex items-center space-x-2">
          <button v-if="config.crud.enabled && config.crud.actions.includes('bulkDelete')" @click="$emit('bulk-delete')"
            class="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            <TrashIcon class="h-4 w-4 mr-1" />
            Delete Selected
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center space-x-2">
          <!-- Create Button -->
          <button v-if="config.crud.enabled && config.crud.actions.includes('create')" @click="$emit('create')"
            class="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <PlusIcon class="h-4 w-4 mr-1" />
            Add New
          </button>

          <!-- Export Dropdown -->
          <div v-if="config.export.enabled" class="relative inline-block text-left">
            <button
              @click="console.log('Export button clicked, showExportMenu before:', showExportMenu); showExportMenu = !showExportMenu; console.log('showExportMenu after:', showExportMenu)"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <ArrowDownTrayIcon class="h-4 w-4 mr-1" />
              Export
              <ChevronDownIcon class="h-4 w-4 ml-1" />
            </button>

            <!-- Export Menu -->
            <div v-if="showExportMenu"
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              style="border: 2px solid red;" @click="console.log('Menu clicked')">
              <div class="py-1">
                <button v-for="format in config.export.formats" :key="format"
                  @click="console.log('Export menu item clicked:', format); handleExport(format)"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                  Export as {{ format.toUpperCase() }}
                </button>
              </div>
            </div>
          </div>

          <!-- Print Button -->
          <button @click="$emit('print')"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <PrinterIcon class="h-4 w-4 mr-1" />
            Print
          </button>



          <!-- Refresh Button -->
          <button @click="$emit('refresh')"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <ArrowPathIcon class="h-4 w-4 mr-1" />
            Refresh
          </button>

          <!-- Settings Button -->
          <button @click="showSettings = !showSettings"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Cog6ToothIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Advanced Filters -->
    <div v-if="showAdvancedFilters" class="mt-4 pt-4 border-t border-gray-200">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="filter in availableFilters" :key="filter.key" class="space-y-1">
          <label class="block text-xs font-medium text-gray-700">
            {{ filter.label }}
          </label>

          <!-- Text Filter -->
          <input v-if="filter.type === 'text'" type="text" :placeholder="`Filter by ${filter.label.toLowerCase()}...`"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            @input="$emit('filter', filter.key, $event.target.value)" />

          <!-- Select Filter -->
          <select v-else-if="filter.type === 'select'"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            @change="$emit('filter', filter.key, $event.target.value)">
            <option value="">All {{ filter.label }}</option>
            <option v-for="option in filter.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <!-- Date Range Filter -->
          <div v-else-if="filter.type === 'dateRange'" class="flex space-x-2">
            <input type="date"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              @change="$emit('filter', `${filter.key}_from`, $event.target.value)" />
            <input type="date"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              @change="$emit('filter', `${filter.key}_to`, $event.target.value)" />
          </div>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button @click="$emit('clear-filters')"
          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Clear All Filters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  selectedCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  },
  globalFilter: {
    type: String,
    default: ''
  },
  availableFilters: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'search',
  'export',
  'print',
  'refresh',
  'bulk-delete',
  'create',
  'filter',
  'clear-filters',
  'additional-filters'
])

// State
const showExportMenu = ref(false)
const showSettings = ref(false)
const showAdvancedFilters = ref(false)

// Methods
function handleExport(format) {
  console.log('Toolbar handleExport called with format:', format)
  emit('export', format)
  showExportMenu.value = false
  console.log('Export event emitted and menu closed')
}



// Click outside directive
const vClickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function (event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<style scoped>
.datatable-toolbar {
  @apply relative;
}
</style>
