<template>
  <div class="relative" ref="selectContainer">
    <!-- Select Input -->
    <div class="relative">
      <input ref="searchInput" v-model="searchTerm" type="text" :placeholder="placeholder"
        class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
        :class="{ 'pr-8': showClearButton }" @focus="openDropdown" @input="handleSearch"
        @keydown.down.prevent="navigateDown" @keydown.up.prevent="navigateUp" @keydown.enter.prevent="selectHighlighted"
        @keydown.escape="closeDropdown" readonly />

      <!-- Dropdown Arrow -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronDownIcon class="h-3 w-3 text-gray-400" />
      </div>

      <!-- Clear Button -->
      <button v-if="showClearButton" @click="clearSelection"
        class="absolute inset-y-0 right-6 flex items-center pr-1 text-gray-400 hover:text-gray-600" type="button">
        <XMarkIcon class="h-3 w-3" />
      </button>
    </div>

    <!-- Dropdown -->
    <div v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
      <!-- Search Input (when dropdown is open) -->
      <div class="p-2 border-b border-gray-200">
        <input ref="dropdownSearchInput" v-model="searchTerm" type="text" :placeholder="searchPlaceholder"
          class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          @input="handleSearch" @keydown.down.prevent="navigateDown" @keydown.up.prevent="navigateUp"
          @keydown.enter.prevent="selectHighlighted" @keydown.escape="closeDropdown" />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-3 text-center text-gray-500 text-xs">
        <div class="flex items-center justify-center space-x-2">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
          <span>Searching...</span>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="filteredOptions.length === 0" class="p-3 text-center text-gray-500 text-xs">
        {{ searchTerm ? 'No results found' : 'No options available' }}
      </div>

      <!-- Options List -->
      <div v-else class="py-1">
        <div v-for="(option, index) in filteredOptions" :key="option.value" @click="selectOption(option)"
          @mouseenter="highlightedIndex = index" class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100" :class="{
            'bg-indigo-100 text-indigo-900': highlightedIndex === index,
            'bg-indigo-500 text-white': selectedValue === option.value
          }">
          <div class="flex items-center justify-between">
            <span>{{ option.label }}</span>
            <CheckIcon v-if="selectedValue === option.value" class="h-3 w-3 text-current" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon, XMarkIcon, CheckIcon } from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Select an option...'
  },
  searchPlaceholder: {
    type: String,
    default: 'Search options...'
  },
  searchable: {
    type: Boolean,
    default: true
  },
  clearable: {
    type: Boolean,
    default: true
  },
  serverSearch: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'search', 'select', 'clear'])

// State
const isOpen = ref(false)
const searchTerm = ref('')
const highlightedIndex = ref(-1)
const selectContainer = ref(null)
const searchInput = ref(null)
const dropdownSearchInput = ref(null)

// Computed
const selectedValue = computed(() => props.modelValue)

const selectedOption = computed(() => {
  return props.options.find(option => option.value === selectedValue.value)
})

const showClearButton = computed(() => {
  return props.clearable && selectedValue.value !== '' && selectedValue.value !== null
})

const filteredOptions = computed(() => {
  // Always filter options locally based on search term
  if (!searchTerm.value) {
    return props.options
  }

  return props.options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// Methods
function openDropdown() {
  isOpen.value = true
  highlightedIndex.value = -1

  // Focus the search input in dropdown
  nextTick(() => {
    if (dropdownSearchInput.value) {
      dropdownSearchInput.value.focus()
    }
  })
}

function closeDropdown() {
  isOpen.value = false
  searchTerm.value = ''
  highlightedIndex.value = -1
}

function handleSearch() {
  // Search only filters options locally - no server request
  // The computed filteredOptions property handles the filtering
}

function selectOption(option) {
  emit('update:modelValue', option.value)
  emit('select', option)
  closeDropdown()
}

function selectHighlighted() {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
    selectOption(filteredOptions.value[highlightedIndex.value])
  }
}

function navigateDown() {
  if (highlightedIndex.value < filteredOptions.value.length - 1) {
    highlightedIndex.value++
  }
}

function navigateUp() {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
  }
}

function clearSelection() {
  emit('update:modelValue', '')
  emit('clear')
  closeDropdown()
}

// Click outside to close
function handleClickOutside(event) {
  if (selectContainer.value && !selectContainer.value.contains(event.target)) {
    closeDropdown()
  }
}

// Watch for selected value changes to update display
watch(selectedValue, (newValue) => {
  if (selectedOption.value) {
    searchInput.value.value = selectedOption.value.label
  } else {
    searchInput.value.value = ''
  }
})

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  // Set initial display value
  if (selectedOption.value) {
    searchInput.value.value = selectedOption.value.label
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom scrollbar for dropdown */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
