import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/form-builder',
      name: 'form-builder',
      component: () => import('../views/FormBuilderView.vue'),
    },
    {
      path: '/preview',
      name: 'preview',
      component: () => import('../views/PreviewView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
    {
      path: '/datatable',
      name: 'datatable',
      component: () => import('../views/DataTableView.vue'),
    },
    {
      path: '/server-datatable',
      name: 'server-datatable',
      component: () => import('../views/ServerDataTableView.vue'),
    },
  ],
})

export default router
