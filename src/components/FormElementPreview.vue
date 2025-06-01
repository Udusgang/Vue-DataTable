<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  element: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="form-element-preview">
    <label v-if="element.type !== 'button'" class="block text-sm font-medium text-gray-700 mb-1">
      {{ element.label }}
      <span v-if="element.required" class="text-red-500">*</span>
    </label>
    
    <!-- Text Input -->
    <input
      v-if="element.type === 'text'"
      type="text"
      :placeholder="element.placeholder"
      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      :required="element.required"
      disabled
    />
    
    <!-- Email Input -->
    <input
      v-else-if="element.type === 'email'"
      type="email"
      :placeholder="element.placeholder"
      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      :required="element.required"
      disabled
    />
    
    <!-- Textarea -->
    <textarea
      v-else-if="element.type === 'textarea'"
      :placeholder="element.placeholder"
      rows="3"
      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      :required="element.required"
      disabled
    ></textarea>
    
    <!-- Select Dropdown -->
    <select
      v-else-if="element.type === 'select'"
      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      :required="element.required"
      disabled
    >
      <option value="" disabled selected>Select an option</option>
      <option v-for="(option, index) in element.options" :key="index">{{ option }}</option>
    </select>
    
    <!-- Checkbox -->
    <div v-else-if="element.type === 'checkbox'" class="flex items-center">
      <input
        type="checkbox"
        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        :required="element.required"
        disabled
      />
      <span class="ml-2 text-sm text-gray-500">{{ element.label }}</span>
    </div>
    
    <!-- Radio Buttons -->
    <div v-else-if="element.type === 'radio'" class="space-y-2">
      <div v-for="(option, index) in element.options" :key="index" class="flex items-center">
        <input
          type="radio"
          :name="'radio-' + element.label"
          class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
          :required="element.required"
          disabled
        />
        <span class="ml-2 text-sm text-gray-500">{{ option }}</span>
      </div>
    </div>
    
    <!-- Date Picker -->
    <input
      v-else-if="element.type === 'date'"
      type="date"
      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      :required="element.required"
      disabled
    />
    
    <!-- File Upload -->
    <input
      v-else-if="element.type === 'file'"
      type="file"
      class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
      :required="element.required"
      disabled
    />
    
    <!-- Button -->
    <button
      v-else-if="element.type === 'button'"
      type="button"
      class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      disabled
    >
      {{ element.buttonText || 'Submit' }}
    </button>
  </div>
</template>
