<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const updateField = (elementId, value) => {
  formData.value = {
    ...formData.value,
    [elementId]: value
  }
}

const submitForm = () => {
  emit('submit', formData.value)
}
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-6">
    <div v-for="element in form.elements" :key="element.id" class="space-y-2">
      <!-- Skip rendering for button elements, we'll add a submit button at the end -->
      <template v-if="element.type !== 'button'">
        <label :for="'element-' + element.id" class="block text-sm font-medium text-gray-700">
          {{ element.label }}
          <span v-if="element.required" class="text-red-500">*</span>
        </label>
        
        <!-- Text Input -->
        <input
          v-if="element.type === 'text'"
          :id="'element-' + element.id"
          type="text"
          :placeholder="element.placeholder"
          :value="formData[element.id]"
          @input="updateField(element.id, $event.target.value)"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          :required="element.required"
        />
        
        <!-- Email Input -->
        <input
          v-else-if="element.type === 'email'"
          :id="'element-' + element.id"
          type="email"
          :placeholder="element.placeholder"
          :value="formData[element.id]"
          @input="updateField(element.id, $event.target.value)"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          :required="element.required"
        />
        
        <!-- Textarea -->
        <textarea
          v-else-if="element.type === 'textarea'"
          :id="'element-' + element.id"
          :placeholder="element.placeholder"
          :value="formData[element.id]"
          @input="updateField(element.id, $event.target.value)"
          rows="3"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          :required="element.required"
        ></textarea>
        
        <!-- Select Dropdown -->
        <select
          v-else-if="element.type === 'select'"
          :id="'element-' + element.id"
          :value="formData[element.id]"
          @change="updateField(element.id, $event.target.value)"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          :required="element.required"
        >
          <option value="" disabled selected>Select an option</option>
          <option v-for="(option, index) in element.options" :key="index" :value="option">{{ option }}</option>
        </select>
        
        <!-- Checkbox -->
        <div v-else-if="element.type === 'checkbox'" class="flex items-center">
          <input
            :id="'element-' + element.id"
            type="checkbox"
            :checked="formData[element.id]"
            @change="updateField(element.id, $event.target.checked)"
            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            :required="element.required"
          />
          <span class="ml-2 text-sm text-gray-500">{{ element.label }}</span>
        </div>
        
        <!-- Radio Buttons -->
        <div v-else-if="element.type === 'radio'" class="space-y-2">
          <div v-for="(option, index) in element.options" :key="index" class="flex items-center">
            <input
              :id="'element-' + element.id + '-' + index"
              type="radio"
              :name="'radio-' + element.id"
              :value="option"
              :checked="formData[element.id] === option"
              @change="updateField(element.id, option)"
              class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              :required="element.required && index === 0"
            />
            <label :for="'element-' + element.id + '-' + index" class="ml-2 text-sm text-gray-500">{{ option }}</label>
          </div>
        </div>
        
        <!-- Date Picker -->
        <input
          v-else-if="element.type === 'date'"
          :id="'element-' + element.id"
          type="date"
          :value="formData[element.id]"
          @input="updateField(element.id, $event.target.value)"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          :required="element.required"
        />
        
        <!-- File Upload -->
        <input
          v-else-if="element.type === 'file'"
          :id="'element-' + element.id"
          type="file"
          @change="updateField(element.id, $event.target.files[0])"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          :required="element.required"
        />
      </template>
    </div>
    
    <!-- Submit Button -->
    <div class="pt-5">
      <div class="flex justify-end">
        <button
          type="submit"
          class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {{ form.elements.find(e => e.type === 'button')?.buttonText || 'Submit' }}
        </button>
      </div>
    </div>
  </form>
</template>
