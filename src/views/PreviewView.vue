<script setup>
import { ref, computed } from 'vue'
import { useFormStore } from '../stores/form'
import FormRenderer from '../components/FormRenderer.vue'

const formStore = useFormStore()

const forms = computed(() => formStore.forms)
const selectedFormId = ref(forms.value.length > 0 ? forms.value[0].id : null)

const selectedForm = computed(() => {
  if (!selectedFormId.value) return null
  return forms.value.find(form => form.id === selectedFormId.value)
})

const formData = ref({})

const submitForm = () => {
  alert('Form submitted successfully!')
  console.log('Form data:', formData.value)
  formData.value = {}
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Form Preview</h1>
    
    <div v-if="forms.length === 0" class="bg-white p-6 rounded-lg shadow text-center">
      <p class="text-gray-500">No forms available. Create a form first.</p>
      <router-link
        to="/form-builder"
        class="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Create Form
      </router-link>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <!-- Form Selection -->
      <div class="md:col-span-3 bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Select Form</h2>
        <div class="space-y-2">
          <div
            v-for="form in forms"
            :key="form.id"
            class="p-3 border rounded cursor-pointer transition-colors"
            :class="selectedFormId === form.id ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:bg-gray-50'"
            @click="selectedFormId = form.id"
          >
            <div class="font-medium">{{ form.title }}</div>
            <div class="text-xs text-gray-500 truncate">{{ form.description }}</div>
          </div>
        </div>
      </div>

      <!-- Form Preview -->
      <div class="md:col-span-9 bg-white p-6 rounded-lg shadow">
        <div v-if="selectedForm">
          <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ selectedForm.title }}</h2>
          <p class="text-gray-500 mb-6">{{ selectedForm.description }}</p>
          
          <FormRenderer
            :form="selectedForm"
            v-model="formData"
            @submit="submitForm"
          />
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          Select a form to preview
        </div>
      </div>
    </div>
  </div>
</template>
