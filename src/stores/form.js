import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFormStore = defineStore('form', () => {
  const forms = ref([
    {
      id: 1,
      title: 'Contact Form',
      description: 'A simple contact form',
      elements: [
        { id: 1, type: 'text', label: 'Name', placeholder: 'Enter your name', required: true },
        { id: 2, type: 'email', label: 'Email', placeholder: 'Enter your email', required: true },
        { id: 3, type: 'textarea', label: 'Message', placeholder: 'Enter your message', required: true },
        { id: 4, type: 'button', label: 'Button', buttonText: 'Submit' }
      ]
    },
    {
      id: 2,
      title: 'Survey Form',
      description: 'Customer satisfaction survey',
      elements: [
        { id: 1, type: 'text', label: 'Name', placeholder: 'Enter your name', required: true },
        { id: 2, type: 'radio', label: 'How satisfied are you?', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied', 'Very Unsatisfied'], required: true },
        { id: 3, type: 'textarea', label: 'Comments', placeholder: 'Any additional comments?', required: false },
        { id: 4, type: 'button', label: 'Button', buttonText: 'Submit Survey' }
      ]
    }
  ])

  function saveForm(form) {
    const existingIndex = forms.value.findIndex(f => f.id === form.id)
    
    if (existingIndex >= 0) {
      // Update existing form
      forms.value[existingIndex] = form
    } else {
      // Add new form
      forms.value.push(form)
    }
  }

  function deleteForm(formId) {
    const index = forms.value.findIndex(f => f.id === formId)
    if (index >= 0) {
      forms.value.splice(index, 1)
    }
  }

  function getForm(formId) {
    return forms.value.find(f => f.id === formId)
  }

  return { forms, saveForm, deleteForm, getForm }
})
