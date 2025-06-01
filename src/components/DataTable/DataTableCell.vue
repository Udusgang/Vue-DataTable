<template>
  <td :class="[
    'px-6 py-4 whitespace-nowrap',
    getAlignClass(column.align),
    { 'cursor-pointer': editable },
    stickyClass
  ]" :style="{ ...getCellStyle(), ...stickyStyle }" @click="handleCellClick">
    <!-- Editing Mode -->
    <div v-if="isEditing" class="flex items-center space-x-2">
      <!-- Text Input -->
      <input v-if="column.type === 'text' || column.type === 'number'" ref="editInput" v-model="editValue"
        :type="column.type === 'number' ? 'number' : 'text'"
        class="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        @keyup.enter="saveEdit" @keyup.escape="cancelEdit" @blur="saveEdit" />

      <!-- Select Input -->
      <select v-else-if="column.type === 'select'" ref="editInput" v-model="editValue"
        class="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        @change="saveEdit" @keyup.escape="cancelEdit" @blur="saveEdit">
        <option v-for="option in column.options" :key="option.value" :value="option.value">
          {{ option.label || option }}
        </option>
      </select>

      <!-- Date Input -->
      <input v-else-if="column.type === 'date'" ref="editInput" v-model="editValue" type="date"
        class="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        @keyup.enter="saveEdit" @keyup.escape="cancelEdit" @blur="saveEdit" />

      <!-- Boolean Input -->
      <input v-else-if="column.type === 'boolean'" ref="editInput" v-model="editValue" type="checkbox"
        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" @change="saveEdit"
        @keyup.escape="cancelEdit" />

      <!-- Action Buttons -->
      <div class="flex items-center space-x-1">
        <button @click="saveEdit" class="p-1 text-green-600 hover:text-green-800" title="Save">
          <CheckIcon class="h-4 w-4" />
        </button>
        <button @click="cancelEdit" class="p-1 text-red-600 hover:text-red-800" title="Cancel">
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Display Mode -->
    <div v-else class="flex items-center justify-between group">
      <!-- Cell Content -->
      <div class="flex-1">
        <!-- Text Content -->
        <span v-if="column.type === 'text' || column.type === 'number'" :class="getTextClass()">
          {{ formattedValue }}
        </span>

        <!-- Currency Content -->
        <span v-else-if="column.type === 'currency'" class="font-medium text-green-600">
          {{ formattedValue }}
        </span>

        <!-- Percentage Content -->
        <span v-else-if="column.type === 'percentage'" class="font-medium" :class="getPercentageClass()">
          {{ formattedValue }}
        </span>

        <!-- Date Content -->
        <span v-else-if="column.type === 'date'" class="text-gray-900">
          {{ formattedValue }}
        </span>

        <!-- Boolean Content -->
        <span v-else-if="column.type === 'boolean'" :class="getBooleanClass()">
          {{ formattedValue }}
        </span>

        <!-- Badge Content -->
        <span v-else-if="column.type === 'badge'" :class="getBadgeClass()">
          {{ formattedValue }}
        </span>

        <!-- Link Content -->
        <a v-else-if="column.type === 'link'" :href="cellValue" target="_blank"
          class="text-indigo-600 hover:text-indigo-900 underline">
          {{ column.linkText || cellValue }}
        </a>

        <!-- Image Content -->
        <img v-else-if="column.type === 'image'" :src="cellValue" :alt="column.alt || 'Image'"
          class="h-10 w-10 rounded-full object-cover" />

        <!-- Actions Content -->
        <div v-else-if="column.type === 'actions'" class="flex items-center space-x-2">
          <button v-for="action in column.actions" :key="action.key" @click="handleAction(action.key)" :class="[
            'p-1 rounded hover:bg-gray-100',
            action.class || 'text-gray-600 hover:text-gray-800'
          ]" :title="action.title">
            <component :is="action.icon" class="h-4 w-4" />
          </button>
        </div>

        <!-- Custom Content -->
        <div v-else-if="column.type === 'custom'">
          <slot :name="`cell-${column.key}`" :row="row" :column="column" :value="cellValue">
            {{ formattedValue }}
          </slot>
        </div>

        <!-- Default Content -->
        <span v-else class="text-gray-900">
          {{ formattedValue }}
        </span>
      </div>

      <!-- Edit Icon -->
      <button v-if="editable && !isEditing" @click.stop="startEdit"
        class="ml-2 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Edit">
        <PencilIcon class="h-4 w-4" />
      </button>
    </div>

    <!-- Row/Column Spanning -->
    <div v-if="column.spanning && (column.spanning.rowspan > 1 || column.spanning.colspan > 1)"
      class="absolute inset-0 border-2 border-dashed border-indigo-300 pointer-events-none"></div>
  </td>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { formatCellValue, getNestedValue } from './utils/dataTableUtils'
import {
  CheckIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  row: {
    type: Object,
    required: true
  },
  column: {
    type: Object,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  },
  stickyClass: {
    type: String,
    default: ''
  },
  stickyStyle: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update', 'action'])

// State
const isEditing = ref(false)
const editValue = ref('')
const editInput = ref(null)

// Computed
const cellValue = computed(() => {
  return getNestedValue(props.row, props.column.key)
})

const formattedValue = computed(() => {
  return formatCellValue(cellValue.value, props.column)
})

// Methods
function getAlignClass(align) {
  switch (align) {
    case 'center': return 'text-center'
    case 'right': return 'text-right'
    default: return 'text-left'
  }
}

function getTextClass() {
  return [
    'text-gray-900',
    { 'font-medium': props.column.bold }
  ]
}

function getPercentageClass() {
  const value = parseFloat(cellValue.value)
  if (value > 0) return 'text-green-600'
  if (value < 0) return 'text-red-600'
  return 'text-gray-600'
}

function getBooleanClass() {
  return cellValue.value
    ? 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'
    : 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'
}

function getBadgeClass() {
  const badgeConfig = props.column.badgeConfig || {}
  const value = cellValue.value

  if (badgeConfig[value]) {
    return `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badgeConfig[value]}`
  }

  return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
}

function getCellStyle() {
  const style = {}

  // Row/Column spanning
  if (props.column.spanning) {
    if (props.column.spanning.rowspan > 1) {
      style.rowSpan = props.column.spanning.rowspan
    }
    if (props.column.spanning.colspan > 1) {
      style.colSpan = props.column.spanning.colspan
    }
  }

  return style
}

function handleCellClick() {
  if (props.editable && !isEditing.value) {
    startEdit()
  }
}

async function startEdit() {
  if (!props.editable) return

  isEditing.value = true
  editValue.value = cellValue.value

  await nextTick()
  if (editInput.value) {
    editInput.value.focus()
    if (editInput.value.select) {
      editInput.value.select()
    }
  }
}

function saveEdit() {
  if (editValue.value !== cellValue.value) {
    emit('update', props.row, props.column, editValue.value)
  }
  isEditing.value = false
}

function cancelEdit() {
  editValue.value = cellValue.value
  isEditing.value = false
}

function handleAction(actionKey) {
  emit('action', actionKey, props.row)
}
</script>

<style scoped>
/* Custom styles for cell content */
.cell-content {
  @apply relative;
}

/* Spanning cell styles */
td[rowspan],
td[colspan] {
  @apply relative;
}

/* Edit mode styles */
.edit-mode {
  @apply bg-blue-50 border border-blue-200 rounded;
}
</style>
