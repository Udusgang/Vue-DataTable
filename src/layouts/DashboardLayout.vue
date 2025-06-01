<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

const sidebarOpen = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/', current: true },
  { name: 'Form Builder', href: '/form-builder', current: false },
  { name: 'DataTable', href: '/datatable', current: false },
  { name: 'Server DataTable', href: '/server-datatable', current: false },
  { name: 'Preview', href: '/preview', current: false },
  { name: 'Settings', href: '/settings', current: false }
]

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Mobile sidebar -->
    <div class="fixed inset-0 z-40 flex md:hidden" :class="sidebarOpen ? 'visible' : 'invisible'" role="dialog"
      aria-modal="true">
      <!-- Sidebar backdrop -->
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300"
        :class="sidebarOpen ? 'opacity-100 ease-out' : 'opacity-0 ease-in'" @click="toggleSidebar"></div>

      <!-- Sidebar panel -->
      <div class="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4 transition duration-300 transform"
        :class="sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'">
        <div class="absolute top-0 right-0 -mr-12 pt-2">
          <button type="button"
            class="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            @click="toggleSidebar">
            <span class="sr-only">Close sidebar</span>
            <XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
          </button>
        </div>

        <div class="flex flex-shrink-0 items-center px-4">
          <h1 class="text-xl font-bold text-indigo-600">VueFast Dashboard</h1>
        </div>
        <div class="mt-5 h-0 flex-1 overflow-y-auto">
          <nav class="space-y-1 px-2">
            <RouterLink v-for="item in navigation" :key="item.name" :to="item.href" :class="[
              item.current
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center px-2 py-2 text-base font-medium rounded-md'
            ]">
              {{ item.name }}
            </RouterLink>
          </nav>
        </div>
      </div>
    </div>

    <!-- Static sidebar for desktop -->
    <div class="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
      <div class="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5">
        <div class="flex flex-shrink-0 items-center px-4">
          <h1 class="text-xl font-bold text-indigo-600">VueFast Dashboard</h1>
        </div>
        <div class="mt-5 flex flex-grow flex-col">
          <nav class="flex-1 space-y-1 px-2 pb-4">
            <RouterLink v-for="item in navigation" :key="item.name" :to="item.href" :class="[
              item.current
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            ]">
              {{ item.name }}
            </RouterLink>
          </nav>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex flex-1 flex-col md:pl-64">
      <div class="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
        <button type="button"
          class="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
          @click="toggleSidebar">
          <span class="sr-only">Open sidebar</span>
          <Bars3Icon class="h-6 w-6" aria-hidden="true" />
        </button>
        <div class="flex flex-1 justify-between px-4">
          <div class="flex flex-1">
            <h2 class="text-2xl font-semibold text-gray-900 self-center">VueFast Project</h2>
          </div>
        </div>
      </div>

      <main class="flex-1">
        <div class="py-6">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <!-- Main content goes here -->
            <slot></slot>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
