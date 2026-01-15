import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@/features/auth/lib/guards'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/ui/LoginPage.vue'),
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/register/ui/RegisterPage.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/pages/dashboard/ui/DashboardPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/habits',
    name: 'Habits',
    component: () => import('@/pages/habits/ui/HabitsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/settings/ui/SettingsPage.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(authGuard)

export default router
