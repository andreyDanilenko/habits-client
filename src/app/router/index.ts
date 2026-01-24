import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@/features/auth'
import { requireOwner } from '@/entities/workspace'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login'),
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/register'),
    meta: { public: true },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/pages/dashboard'),
    meta: { requiresAuth: true },
  },
  {
    path: '/habits',
    name: 'Habits',
    component: () => import('@/pages/habits'),
    meta: { requiresAuth: true },
  },
  {
    path: '/journal',
    name: 'Journal',
    component: () => import('@/pages/journal'),
    meta: { requiresAuth: true },
  },
  {
    path: '/journal/new',
    name: 'JournalNew',
    component: () => import('@/pages/journal-editor'),
    meta: { requiresAuth: true },
  },
  {
    path: '/journal/:id',
    name: 'JournalView',
    component: () => import('@/pages/journal-view'),
    meta: { requiresAuth: true },
  },
  {
    path: '/journal/:id/edit',
    name: 'JournalEdit',
    component: () => import('@/pages/journal-editor'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/settings'),
    meta: { requiresAuth: true },
  },
  {
    path: '/workspace-settings',
    name: 'WorkspaceSettings',
    component: () => import('@/pages/workspace-settings'),
    meta: { requiresAuth: true },
    beforeEnter: requireOwner(),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(authGuard)

export default router
