/**
 * Мок-клиент API для разработки без бекенда
 *
 * Использование:
 * 1. Установите USE_MOCK_API = true в client.ts
 * 2. Все запросы будут обрабатываться мок-клиентом
 */

import type { LoginDto, RegisterDto, AuthResponse } from '@/features/auth'
import type { User } from '@/entities/user'
import type { Habit, HabitCompletion } from '@/entities/habit'
import type { Workspace } from '@/entities/workspace'
import { UserRole } from '@/entities/user'

// Моковые данные
const MOCK_USER: User = {
  id: '1',
  email: 'user@example.com',
  name: 'Test User',
  role: UserRole.USER,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
const MOCK_HABITS: Habit[] = [
  {
    id: '1',
    title: 'Утренняя зарядка',
    description: '15 минут упражнений каждое утро',
    color: '#3B82F6',
    icon: '💪',
    targetDays: 7,
    userId: '1',
    workspaceId: '1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Чтение книги',
    description: 'Читать минимум 30 минут в день',
    color: '#10B981',
    icon: '📚',
    targetDays: 5,
    userId: '1',
    workspaceId: '1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Медитация',
    description: '10 минут медитации перед сном',
    color: '#8B5CF6',
    icon: '🧘',
    targetDays: 7,
    userId: '1',
    workspaceId: '1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const MOCK_COMPLETIONS: HabitCompletion[] = [
  {
    id: '1',
    habitId: '1',
    userId: '1',
    date: new Date().toISOString().split('T')[0],
    notes: 'Отличная тренировка!',
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    habitId: '2',
    userId: '1',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    habitId: '1',
    userId: '1',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

const MOCK_WORKSPACES: Workspace[] = [
  {
    id: '1',
    name: 'Личные привычки',
    description: 'Мои личные цели и привычки',
    color: '#3B82F6',
    ownerId: '1',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Работа',
    description: 'Профессиональное развитие',
    color: '#10B981',
    ownerId: '1',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Имитация задержки сети
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms))

class MockApiClient {
  async get<T>(url: string): Promise<T> {
    await delay()

    // Мок для получения текущего пользователя
    if (url === '/auth/me') {
      const token = localStorage.getItem('accessToken')
      if (!token || !token.startsWith('mock-')) {
        throw { response: { status: 401, data: { message: 'Unauthorized' } } }
      }
      return MOCK_USER as T
    }

    // Мок для привычек
    if (url === '/habits') {
      return MOCK_HABITS as T
    }

    // Мок для завершений привычек
    if (url === '/habits/completions') {
      return MOCK_COMPLETIONS as T
    }

    // Мок для workspace
    if (url === '/workspaces') {
      return MOCK_WORKSPACES as T
    }

    // По умолчанию возвращаем пустой массив
    return [] as T
  }

  async post<T>(url: string, data?: any): Promise<T> {
    await delay(800) // Больше задержка для POST запросов

    // Мок для логина
    if (url === '/auth/login') {
      const { email, password } = data as LoginDto

      if (!email || !password) {
        throw { response: { status: 400, data: { message: 'Email and password required' } } }
      }

      const response: AuthResponse = {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: {
          ...MOCK_USER,
          email,
        },
      }
      return response as T
    }

    // Мок для регистрации
    if (url === '/auth/register') {
      const { email, password } = data as RegisterDto

      if (!email || !password) {
        throw { response: { status: 400, data: { message: 'Email and password required' } } }
      }

      const response: AuthResponse = {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: {
          ...MOCK_USER,
          email,
          name: data.name || MOCK_USER.name,
        },
      }
      return response as T
    }

    // Мок для логаута
    if (url === '/auth/logout') {
      return {} as T
    }

    // Мок для refresh токена
    if (url === '/auth/refresh') {
      const newAccessToken = 'mock-access-token-' + Date.now()
      const response: AuthResponse = {
        accessToken: newAccessToken,
        refreshToken: data.refreshToken || 'mock-refresh-token-' + Date.now(),
      }
      return response as T
    }

    // Мок для создания привычки
    if (url === '/habits') {
      return {
        id: 'mock-habit-' + Date.now(),
        ...data,
        userId: '1',
        workspaceId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as T
    }

    // Мок для переключения выполнения привычки
    if (url.includes('/habits/') && url.includes('/toggle')) {
      return {
        id: 'mock-completion-' + Date.now(),
        habitId: url.split('/')[2],
        userId: '1',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      } as T
    }

    // По умолчанию возвращаем объект
    return {} as T
  }

  async put<T>(url: string, data?: any): Promise<T> {
    await delay()
    return (data as T) || ({} as T)
  }

  async delete<T>(url: string): Promise<T> {
    await delay()
    return {} as T
  }
}

export const mockApi = new MockApiClient()
