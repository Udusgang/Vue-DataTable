<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  element: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

const updateProperty = (property, value) => {
  emit('update', property, value)
}

const addOption = () => {
  if (!props.element.options) {
    props.element.options = []
  }
  props.element.options.push(`Option ${props.element.options.length + 1}`)
}

const removeOption = (index) => {
  props.element.options.splice(index, 1)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Common Properties -->
    <div>
      <label for="element-label" class="block text-sm font-medium text-gray-700">Label</label>
      <input
        id="element-label"
        type="text"
        :value="element.label"
        @input="updateProperty('label', $event.target.value)"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
    </div>

    <!-- Type-specific properties -->
    <template v-if="['text', 'email', 'textarea'].includes(element.type)">
      <div>
        <label for="element-placeholder" class="block text-sm font-medium text-gray-700">Placeholder</label>
        <input
          id="element-placeholder"
          type="text"
          :value="element.placeholder"
          @input="updateProperty('placeholder', $event.target.value)"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    </template>

    <template v-if="element.type === 'button'">
      <div>
        <label for="button-text" class="block text-sm font-medium text-gray-700">Button Text</label>
        <input
          id="button-text"
          type="text"
          :value="element.buttonText"
          @input="updateProperty('buttonText', $event.target.value)"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    </template>

    <template v-if="['select', 'radio'].includes(element.type)">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Options</label>
        <div v-for="(option, index) in element.options" :key="index" class="flex mb-2">
          <input
            type="text"
            :value="option"
            @input="element.options[index] = $event.target.value"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="button"
            class="ml-2 inline-flex items-center rounded border border-transparent bg-red-100 p-1 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            @click="removeOption(index)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          @click="addOption"
        >
          <svg class="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Option
        </button>
      </div>
    </template>

    <!-- Required checkbox for all form elements except buttons -->
    <div v-if="element.type !== 'button'" class="flex items-start">
      <div class="flex h-5 items-center">
        <input
          id="element-required"
          type="checkbox"
          :checked="element.required"
          @change="updateProperty('required', $event.target.checked)"
          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
      <div class="ml-3 text-sm">
        <label for="element-required" class="font-medium text-gray-700">Required</label>
        <p class="text-gray-500">Make this field required</p>
      </div>
    </div>
  </div>
</template>
