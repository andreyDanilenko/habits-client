import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@/features/auth'

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
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/settings'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(authGuard)

export default router
