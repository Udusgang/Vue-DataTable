<template>
  <div class="datatable-pagination bg-white border-t border-gray-200 px-4 py-3 sm:px-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
      <!-- Info Section -->
      <div v-if="showInfo" class="flex items-center text-sm text-gray-700">
        <span>
          Showing 
          <span class="font-medium">{{ paginationInfo.start }}</span>
          to 
          <span class="font-medium">{{ paginationInfo.end }}</span>
          of 
          <span class="font-medium">{{ paginationInfo.totalItems }}</span>
          results
        </span>
        
        <!-- Page Size Selector -->
        <div v-if="showSizeChanger" class="ml-4 flex items-center space-x-2">
          <label class="text-sm text-gray-700">Show:</label>
          <select
            :value="paginationInfo.pageSize"
            @change="$emit('size-change', parseInt($event.target.value))"
            class="block px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option v-for="size in pageSizes" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
          <span class="text-sm text-gray-700">per page</span>
        </div>
      </div>

      <!-- Navigation Section -->
      <div class="flex items-center space-x-2">
        <!-- First Page -->
        <button
          :disabled="!paginationInfo.hasPrev"
          @click="$emit('page-change', 1)"
          :class="[
            'relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-l-md border',
            paginationInfo.hasPrev
              ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
          ]"
          title="First page"
        >
          <ChevronDoubleLeftIcon class="h-4 w-4" />
        </button>

        <!-- Previous Page -->
        <button
          :disabled="!paginationInfo.hasPrev"
          @click="$emit('prev')"
          :class="[
            'relative inline-flex items-center px-2 py-2 text-sm font-medium border-t border-b',
            paginationInfo.hasPrev
              ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
          ]"
          title="Previous page"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>

        <!-- Page Numbers -->
        <div class="hidden sm:flex items-center space-x-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="page !== '...' && $emit('page-change', page)"
            :class="[
              'relative inline-flex items-center px-3 py-2 text-sm font-medium border-t border-b',
              page === paginationInfo.currentPage
                ? 'border-indigo-500 bg-indigo-50 text-indigo-600 z-10'
                : page === '...'
                ? 'border-gray-300 bg-white text-gray-700 cursor-default'
                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            ]"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </div>

        <!-- Mobile Page Info -->
        <div class="sm:hidden flex items-center px-3 py-2 text-sm font-medium border-t border-b border-gray-300 bg-white text-gray-700">
          {{ paginationInfo.currentPage }} / {{ paginationInfo.totalPages }}
        </div>

        <!-- Next Page -->
        <button
          :disabled="!paginationInfo.hasNext"
          @click="$emit('next')"
          :class="[
            'relative inline-flex items-center px-2 py-2 text-sm font-medium border-t border-b',
            paginationInfo.hasNext
              ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
          ]"
          title="Next page"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>

        <!-- Last Page -->
        <button
          :disabled="!paginationInfo.hasNext"
          @click="$emit('page-change', paginationInfo.totalPages)"
          :class="[
            'relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-r-md border',
            paginationInfo.hasNext
              ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
          ]"
          title="Last page"
        >
          <ChevronDoubleRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Quick Jump -->
    <div v-if="showQuickJump && paginationInfo.totalPages > 10" class="mt-3 flex items-center justify-center space-x-2">
      <span class="text-sm text-gray-700">Go to page:</span>
      <input
        v-model="jumpPage"
        type="number"
        :min="1"
        :max="paginationInfo.totalPages"
        class="block w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        @keyup.enter="handleQuickJump"
      />
      <button
        @click="handleQuickJump"
        class="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Go
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  paginationInfo: {
    type: Object,
    required: true
  },
  pageSizes: {
    type: Array,
    default: () => [5, 10, 25, 50, 100]
  },
  showInfo: {
    type: Boolean,
    default: true
  },
  showSizeChanger: {
    type: Boolean,
    default: true
  },
  showQuickJump: {
    type: Boolean,
    default: true
  },
  maxVisiblePages: {
    type: Number,
    default: 7
  }
})

// Emits
const emit = defineEmits(['page-change', 'size-change', 'prev', 'next'])

// State
const jumpPage = ref('')

// Computed
const visiblePages = computed(() => {
  const { currentPage, totalPages } = props.paginationInfo
  const maxVisible = props.maxVisiblePages
  
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  
  const pages = []
  const halfVisible = Math.floor(maxVisible / 2)
  
  let start = Math.max(1, currentPage - halfVisible)
  let end = Math.min(totalPages, start + maxVisible - 1)
  
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
  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push('...')
    }
    pages.push(totalPages)
  }
  
  return pages
})

// Methods
function handleQuickJump() {
  const page = parseInt(jumpPage.value)
  if (page >= 1 && page <= props.paginationInfo.totalPages) {
    emit('page-change', page)
    jumpPage.value = ''
  }
}
</script>

<style scoped>
.datatable-pagination {
  @apply relative;
}

/* Custom number input styles */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
