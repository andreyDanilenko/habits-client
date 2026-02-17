import { api, API_ENDPOINTS } from '@/shared/api'
import { getLocalDateString } from '@/shared/lib'
import type {
  Habit,
  CreateHabitDto,
  UpdateHabitDto,
  HabitStats,
  CalendarResponse,
  ToggleResponse,
  HabitCompletion,
} from '@/entities/habit'

interface HabitsDataResponse {
  habits: Habit[]
}

export const habitService = {
  getHabits: async (workspaceId: string, date?: string): Promise<Habit[]> => {
    const params = new URLSearchParams()
    if (date) params.append('date', date)
    const url = params.toString()
      ? `${API_ENDPOINTS.HABITS.BASE(workspaceId)}?${params.toString()}`
      : API_ENDPOINTS.HABITS.BASE(workspaceId)
    const response = await api.get<HabitsDataResponse>(url)
    return response.habits ?? []
  },

  getHabit: async (workspaceId: string, id: string): Promise<Habit> => {
    const response = await api.get<{ habit: Habit }>(API_ENDPOINTS.HABITS.DETAIL(workspaceId, id))
    return response.habit
  },

  createHabit: async (workspaceId: string, data: CreateHabitDto): Promise<Habit> => {
    const response = await api.post<Habit>(API_ENDPOINTS.HABITS.BASE(workspaceId), data)
    return response
  },

  updateHabit: async (workspaceId: string, id: string, data: UpdateHabitDto): Promise<Habit> => {
    const response = await api.put<{ habit: Habit }>(API_ENDPOINTS.HABITS.DETAIL(workspaceId, id), data)
    return response.habit
  },

  deleteHabit: (workspaceId: string, id: string): Promise<void> => api.delete(API_ENDPOINTS.HABITS.DETAIL(workspaceId, id)),

  toggleCompletion: async (workspaceId: string, id: string, date?: string): Promise<ToggleResponse> => {
    const response = await api.post<{ completed: boolean; completion?: HabitCompletion }>(
      API_ENDPOINTS.HABITS.TOGGLE(workspaceId, id),
      { date: date || getLocalDateString() },
    )
    return {
      completed: response.completed,
      completion: response.completion,
    }
  },

  getStats: async (workspaceId: string, id: string): Promise<HabitStats> => {
    const response = await api.get<{ stats: HabitStats }>(API_ENDPOINTS.HABITS.STATS(workspaceId, id))
    return response.stats
  },

  getCalendar: async (workspaceId: string, startDate?: string, endDate?: string): Promise<CalendarResponse> => {
    const params = new URLSearchParams()
    if (startDate) params.append('start', startDate)
    if (endDate) params.append('end', endDate)
    const url = params.toString()
      ? `${API_ENDPOINTS.HABITS.CALENDAR(workspaceId)}?${params.toString()}`
      : API_ENDPOINTS.HABITS.CALENDAR(workspaceId)
    const response = await api.get<CalendarResponse>(url)
    return {
      days: response.days ?? [],
    }
  },

  getHabitCompletions: (workspaceId: string): Promise<HabitCompletion[]> =>
    api.get<HabitCompletion[]>(API_ENDPOINTS.HABITS.COMPLETIONS(workspaceId)),

  getHabitCompletionsForHabit: async (
    workspaceId: string,
    habitId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<HabitCompletion[]> => {
    const params = new URLSearchParams()
    if (habitId) params.append('habit_id', habitId)
    if (startDate) params.append('start', startDate)
    if (endDate) params.append('end', endDate)
    const response = await api.get<{ completions: HabitCompletion[] }>(
      `${API_ENDPOINTS.HABITS.COMPLETIONS(workspaceId)}?${params.toString()}`,
    )
    return response.completions || []
  },

  createCompletion: async (
    workspaceId: string,
    habitId: string,
    data: {
      date?: string
      notes?: string
      rating?: number
      time?: string
    },
  ): Promise<HabitCompletion> => {
    const response = await api.post<{ completion: HabitCompletion }>(
      API_ENDPOINTS.HABITS.COMPLETE(workspaceId, habitId),
      {
        date: data.date || getLocalDateString(),
        notes: data.notes || '',
        rating: data.rating || 0,
      },
    )
    return response.completion
  },
}
