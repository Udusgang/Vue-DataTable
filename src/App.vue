<script setup>
import { RouterView } from 'vue-router'
import DashboardLayout from './layouts/DashboardLayout.vue'
</script>

<template>
  <DashboardLayout>
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </DashboardLayout>
</template>
