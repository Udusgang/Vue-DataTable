<script setup>
import { ref } from 'vue'

const stats = ref([
  { name: 'Total Forms', stat: '12' },
  { name: 'Active Forms', stat: '8' },
  { name: 'Submissions', stat: '142' },
  { name: 'Conversion Rate', stat: '24.5%' }
])

const recentForms = ref([
  { id: 1, name: 'Contact Form', created: '2 days ago', submissions: 24 },
  { id: 2, name: 'Survey Form', created: '5 days ago', submissions: 56 },
  { id: 3, name: 'Registration Form', created: '1 week ago', submissions: 38 },
  { id: 4, name: 'Feedback Form', created: '2 weeks ago', submissions: 24 }
])
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
    
    <!-- Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div
        v-for="item in stats"
        :key="item.name"
        class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
      >
        <dt class="truncate text-sm font-medium text-gray-500">{{ item.name }}</dt>
        <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{{ item.stat }}</dd>
      </div>
    </div>

    <!-- Recent Forms -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900">Recent Forms</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">Your most recently created forms.</p>
      </div>
      <div class="border-t border-gray-200">
        <ul role="list" class="divide-y divide-gray-200">
          <li v-for="form in recentForms" :key="form.id" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
            <div class="flex items-center justify-between">
              <p class="truncate text-sm font-medium text-indigo-600">{{ form.name }}</p>
              <div class="ml-2 flex flex-shrink-0">
                <p class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                  {{ form.submissions }} submissions
                </p>
              </div>
            </div>
            <div class="mt-2 sm:flex sm:justify-between">
              <div class="sm:flex">
                <p class="flex items-center text-sm text-gray-500">
                  Created {{ form.created }}
                </p>
              </div>
              <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                <button class="text-indigo-600 hover:text-indigo-900">Edit</button>
                <span class="mx-2">|</span>
                <button class="text-indigo-600 hover:text-indigo-900">Preview</button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div class="rounded-lg bg-white overflow-hidden shadow">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <h3 class="text-lg font-medium text-gray-900">Create New Form</h3>
              <p class="mt-1 text-sm text-gray-500">
                Start building a new form from scratch with our drag-and-drop builder.
              </p>
            </div>
          </div>
          <div class="mt-4">
            <router-link
              to="/form-builder"
              class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Get Started
            </router-link>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white overflow-hidden shadow">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <h3 class="text-lg font-medium text-gray-900">Import Template</h3>
              <p class="mt-1 text-sm text-gray-500">
                Use one of our pre-built templates to get started quickly.
              </p>
            </div>
          </div>
          <div class="mt-4">
            <button
              type="button"
              class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Browse Templates
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
