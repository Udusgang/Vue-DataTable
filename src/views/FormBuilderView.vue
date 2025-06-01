<script setup>
import { ref, reactive, computed } from 'vue'
import { useFormStore } from '../stores/form'
import draggable from 'vuedraggable'
import FormElementPreview from '../components/FormElementPreview.vue'
import FormElementProperties from '../components/FormElementProperties.vue'

const formStore = useFormStore()

const formElements = ref([
  { type: 'text', label: 'Text Input', placeholder: 'Enter text...', required: false },
  { type: 'textarea', label: 'Text Area', placeholder: 'Enter long text...', required: false },
  { type: 'select', label: 'Dropdown', options: ['Option 1', 'Option 2', 'Option 3'], required: false },
  { type: 'checkbox', label: 'Checkbox', value: false, required: false },
  { type: 'radio', label: 'Radio Buttons', options: ['Option 1', 'Option 2'], required: false },
  { type: 'date', label: 'Date Picker', required: false },
  { type: 'file', label: 'File Upload', required: false },
  { type: 'button', label: 'Button', buttonText: 'Submit' }
])

const formData = reactive({
  title: 'New Form',
  description: 'Form description',
  elements: []
})

const selectedElement = ref(null)

const selectElement = (element) => {
  selectedElement.value = element
}

const saveForm = () => {
  formStore.saveForm({
    id: Date.now(),
    ...formData
  })
  alert('Form saved successfully!')
}

const isDragging = ref(false)

const onDragStart = () => {
  isDragging.value = true
}

const onDragEnd = () => {
  isDragging.value = false
}

const updateElementProperty = (property, value) => {
  if (selectedElement.value) {
    selectedElement.value[property] = value
  }
}

const removeElement = (index) => {
  formData.elements.splice(index, 1)
  selectedElement.value = null
}

const cloneElement = (element) => {
  return JSON.parse(JSON.stringify(element))
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Form Builder</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <!-- Form Elements Sidebar -->
      <div class="md:col-span-3 bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Form Elements</h2>
        <div class="space-y-2">
          <draggable
            :list="formElements"
            :group="{ name: 'elements', pull: 'clone', put: false }"
            item-key="type"
            :clone="cloneElement"
            @start="onDragStart"
            @end="onDragEnd"
            class="space-y-2"
          >
            <template #item="{ element }">
              <div
                class="p-3 bg-gray-50 border border-gray-200 rounded cursor-move hover:bg-gray-100 transition-colors"
              >
                <div class="font-medium">{{ element.label }}</div>
                <div class="text-xs text-gray-500">{{ element.type }}</div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- Form Builder Area -->
      <div class="md:col-span-6 bg-white p-4 rounded-lg shadow">
        <div class="mb-4">
          <label for="form-title" class="block text-sm font-medium text-gray-700">Form Title</label>
          <input
            id="form-title"
            v-model="formData.title"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div class="mb-6">
          <label for="form-description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="form-description"
            v-model="formData.description"
            rows="2"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          ></textarea>
        </div>

        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[400px]"
          :class="{ 'border-indigo-400 bg-indigo-50': isDragging }"
        >
          <p v-if="formData.elements.length === 0" class="text-center text-gray-500 py-8">
            Drag and drop form elements here
          </p>
          <draggable
            v-model="formData.elements"
            group="elements"
            item-key="id"
            handle=".drag-handle"
            class="space-y-3"
            @start="onDragStart"
            @end="onDragEnd"
          >
            <template #item="{ element, index }">
              <div
                class="relative p-3 bg-white border border-gray-200 rounded shadow-sm hover:border-indigo-300 transition-colors"
                :class="{ 'ring-2 ring-indigo-500': selectedElement === element }"
                @click="selectElement(element)"
              >
                <div class="absolute top-3 right-3 flex space-x-1">
                  <button
                    class="text-gray-400 hover:text-gray-600 drag-handle cursor-move"
                    title="Drag to reorder"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9v1a1 1 0 01-2 0V6H4a1 1 0 110-2h3V3a1 1 0 011-1zm0 8a1 1 0 011 1v1h3a1 1 0 110 2H9v1a1 1 0 01-2 0v-1H4a1 1 0 110-2h3v-1a1 1 0 011-1z" />
                    </svg>
                  </button>
                  <button
                    class="text-red-400 hover:text-red-600"
                    title="Remove element"
                    @click.stop="removeElement(index)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                <FormElementPreview :element="element" />
              </div>
            </template>
          </draggable>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            type="button"
            class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            @click="saveForm"
          >
            Save Form
          </button>
        </div>
      </div>

      <!-- Properties Panel -->
      <div class="md:col-span-3 bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Properties</h2>
        <div v-if="selectedElement" class="space-y-4">
          <FormElementProperties
            :element="selectedElement"
            @update="updateElementProperty"
          />
        </div>
        <div v-else class="text-gray-500 text-center py-8">
          Select an element to edit its properties
        </div>
      </div>
    </div>
  </div>
</template>
