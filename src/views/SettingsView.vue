<script setup>
import { ref } from 'vue'

const settings = ref({
  appearance: {
    theme: 'light',
    primaryColor: '#4f46e5',
    formBorderRadius: '0.375rem',
    formShadow: 'medium'
  },
  behavior: {
    autoSave: true,
    confirmBeforeDelete: true,
    showHelpText: true
  },
  notifications: {
    emailNotifications: false,
    emailAddress: '',
    notifyOnSubmission: true,
    notifyOnError: true
  }
})

const themes = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
  { id: 'system', name: 'System Default' }
]

const shadowOptions = [
  { id: 'none', name: 'None' },
  { id: 'small', name: 'Small' },
  { id: 'medium', name: 'Medium' },
  { id: 'large', name: 'Large' }
]

const saveSettings = () => {
  // In a real app, this would save to a backend or localStorage
  alert('Settings saved successfully!')
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
    
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <!-- Appearance Section -->
          <div class="sm:col-span-6">
            <h2 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Appearance</h2>
          </div>

          <div class="sm:col-span-3">
            <label for="theme" class="block text-sm font-medium text-gray-700">Theme</label>
            <select
              id="theme"
              v-model="settings.appearance.theme"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option v-for="theme in themes" :key="theme.id" :value="theme.id">{{ theme.name }}</option>
            </select>
          </div>

          <div class="sm:col-span-3">
            <label for="primary-color" class="block text-sm font-medium text-gray-700">Primary Color</label>
            <div class="mt-1 flex items-center">
              <input
                id="primary-color"
                v-model="settings.appearance.primaryColor"
                type="color"
                class="h-8 w-8 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                v-model="settings.appearance.primaryColor"
                type="text"
                class="ml-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div class="sm:col-span-3">
            <label for="border-radius" class="block text-sm font-medium text-gray-700">Form Border Radius</label>
            <input
              id="border-radius"
              v-model="settings.appearance.formBorderRadius"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div class="sm:col-span-3">
            <label for="shadow" class="block text-sm font-medium text-gray-700">Form Shadow</label>
            <select
              id="shadow"
              v-model="settings.appearance.formShadow"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option v-for="option in shadowOptions" :key="option.id" :value="option.id">{{ option.name }}</option>
            </select>
          </div>

          <!-- Behavior Section -->
          <div class="sm:col-span-6">
            <h2 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4 mt-4">Behavior</h2>
          </div>

          <div class="sm:col-span-3">
            <div class="flex items-start">
              <div class="flex h-5 items-center">
                <input
                  id="auto-save"
                  v-model="settings.behavior.autoSave"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="auto-save" class="font-medium text-gray-700">Auto Save</label>
                <p class="text-gray-500">Automatically save form changes</p>
              </div>
            </div>
          </div>

          <div class="sm:col-span-3">
            <div class="flex items-start">
              <div class="flex h-5 items-center">
                <input
                  id="confirm-delete"
                  v-model="settings.behavior.confirmBeforeDelete"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="confirm-delete" class="font-medium text-gray-700">Confirm Before Delete</label>
                <p class="text-gray-500">Show confirmation dialog before deleting items</p>
              </div>
            </div>
          </div>

          <div class="sm:col-span-3">
            <div class="flex items-start">
              <div class="flex h-5 items-center">
                <input
                  id="show-help"
                  v-model="settings.behavior.showHelpText"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="show-help" class="font-medium text-gray-700">Show Help Text</label>
                <p class="text-gray-500">Display help text for form elements</p>
              </div>
            </div>
          </div>

          <!-- Notifications Section -->
          <div class="sm:col-span-6">
            <h2 class="text-lg font-medium text-gray-900 border-b pb-2 mb-4 mt-4">Notifications</h2>
          </div>

          <div class="sm:col-span-3">
            <div class="flex items-start">
              <div class="flex h-5 items-center">
                <input
                  id="email-notifications"
                  v-model="settings.notifications.emailNotifications"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="email-notifications" class="font-medium text-gray-700">Email Notifications</label>
                <p class="text-gray-500">Receive email notifications</p>
              </div>
            </div>
          </div>

          <div class="sm:col-span-3">
            <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email"
              v-model="settings.notifications.emailAddress"
              type="email"
              :disabled="!settings.notifications.emailNotifications"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div class="sm:col-span-3">
            <div class="flex items-start">
              <div class="flex h-5 items-center">
                <input
                  id="notify-submission"
                  v-model="settings.notifications.notifyOnSubmission"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="notify-submission" class="font-medium text-gray-700">Notify on Submission</label>
                <p class="text-gray-500">Get notified when a form is submitted</p>
              </div>
            </div>
          </div>

          <div class="sm:col-span-3">
            <div class="flex items-start">
              <div class="flex h-5 items-center">
                <input
                  id="notify-error"
                  v-model="settings.notifications.notifyOnError"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="notify-error" class="font-medium text-gray-700">Notify on Error</label>
                <p class="text-gray-500">Get notified when there's an error</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
        <button
          type="button"
          class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          @click="saveSettings"
        >
          Save Settings
        </button>
      </div>
    </div>
  </div>
</template>
