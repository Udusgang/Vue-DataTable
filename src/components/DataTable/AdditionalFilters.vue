<template>
  <div>
    <!-- Filter Toggle Button -->
    <div class="bg-white border-b border-gray-200 px-4 py-2">
      <button @click="toggleFilters"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        :class="{ 'bg-indigo-50 border-indigo-300 text-indigo-700': hasActiveFilters || showFilters }">
        <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
        </svg>
        Additional Filters
        <span v-if="activeFiltersCount > 0"
          class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {{ activeFiltersCount }}
        </span>
        <svg v-if="!showFilters" class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
        <svg v-else class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>

    <!-- Filters Panel -->
    <div v-if="showFilters" class="bg-gray-50 border-b border-gray-200 px-4 py-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <!-- Created Date Filter -->
        <div>
          <label class="block text-xs font-medium text-gray-900 mb-1">Created Date</label>
          <input v-model="filters.created_at" @change="emitFilters" type="date"
            class="block w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <!-- Updated Date Filter -->
        <div>
          <label class="block text-xs font-medium text-gray-900 mb-1">Updated Date</label>
          <input v-model="filters.updated_at" @change="emitFilters" type="date"
            class="block w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <!-- Created By Filter -->
        <div>
          <label class="block text-xs font-medium text-gray-900 mb-1">Created By</label>
          <input v-model="filters.created_by" @input="debounceEmit" type="text" placeholder="Enter creator name..."
            class="block w-full px-2 py-1 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <!-- Updated By Filter -->
        <div>
          <label class="block text-xs font-medium text-gray-900 mb-1">Updated By</label>
          <input v-model="filters.updated_by" @input="debounceEmit" type="text" placeholder="Enter updater name..."
            class="block w-full px-2 py-1 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <!-- Clear Filters Button -->
        <div class="flex items-end">
          <button @click="clearFilters"
            class="w-full px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Emits
const emit = defineEmits(['filter-change'])

// State
const showFilters = ref(false)
const filters = ref({
  created_at: '',
  updated_at: '',
  created_by: '',
  updated_by: ''
})

const debounceTimeout = ref(null)

// Computed
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => value && value.trim() !== '')
})

const activeFiltersCount = computed(() => {
  return Object.values(filters.value).filter(value => value && value.trim() !== '').length
})

// Methods
function toggleFilters() {
  showFilters.value = !showFilters.value
}

function emitFilters() {
  // Only emit non-empty filters
  const activeFilters = {}
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      activeFilters[key] = value
    }
  })

  console.log('Additional filters changed:', activeFilters)
  emit('filter-change', activeFilters)
}

function debounceEmit() {
  // Clear existing timeout
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value)
  }

  // Set new timeout for text inputs
  debounceTimeout.value = setTimeout(() => {
    emitFilters()
  }, 300)
}

function clearFilters() {
  filters.value = {
    created_at: '',
    updated_at: '',
    created_by: '',
    updated_by: ''
  }
  emitFilters()
}
</script>
