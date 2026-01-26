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
  // getHabits: async (): Promise<Habit[]> => (await api.get<HabitsDataResponse>(API_ENDPOINTS.HABITS.BASE)).habits,

  getHabits: async (date?: string): Promise<Habit[]> => {
    const params = new URLSearchParams()
    if (date) params.append('date', date)
    const url = params.toString()
      ? `${API_ENDPOINTS.HABITS.BASE}?${params.toString()}`
      : API_ENDPOINTS.HABITS.BASE
    const response = await api.get<HabitsDataResponse>(url)
    return response.habits
  },

  getHabit: async (id: string): Promise<Habit> => {
    const response = await api.get<{ habit: Habit }>(API_ENDPOINTS.HABITS.DETAIL(id))
    return response.habit
  },

  createHabit: async (data: CreateHabitDto): Promise<Habit> => {
    const response = await api.post<Habit>(API_ENDPOINTS.HABITS.BASE, data)
    return response
  },

  updateHabit: async (id: string, data: UpdateHabitDto): Promise<Habit> => {
    const response = await api.put<{ habit: Habit }>(API_ENDPOINTS.HABITS.DETAIL(id), data)
    return response.habit
  },

  deleteHabit: (id: string): Promise<void> => api.delete(API_ENDPOINTS.HABITS.DETAIL(id)),

  toggleCompletion: async (id: string, date?: string): Promise<ToggleResponse> => {
    const response = await api.post<{ completed: boolean; completion?: HabitCompletion }>(
      API_ENDPOINTS.HABITS.TOGGLE(id),
      { date: date || getLocalDateString() },
    )
    return {
      completed: response.completed,
      completion: response.completion,
    }
  },

  getStats: async (id: string): Promise<HabitStats> => {
    const response = await api.get<{ stats: HabitStats }>(API_ENDPOINTS.HABITS.STATS(id))
    return response.stats
  },

  getCalendar: async (startDate?: string, endDate?: string): Promise<CalendarResponse> => {
    const params = new URLSearchParams()
    if (startDate) params.append('start', startDate)
    if (endDate) params.append('end', endDate)
    const url = params.toString()
      ? `${API_ENDPOINTS.HABITS.CALENDAR}?${params.toString()}`
      : API_ENDPOINTS.HABITS.CALENDAR
    const response = await api.get<CalendarResponse>(url)
    return response
  },

  getHabitCompletions: (): Promise<HabitCompletion[]> =>
    api.get<HabitCompletion[]>(API_ENDPOINTS.HABITS.COMPLETIONS),

  getHabitCompletionsForHabit: async (
    habitId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<HabitCompletion[]> => {
    const params = new URLSearchParams()
    if (habitId) params.append('habit_id', habitId)
    if (startDate) params.append('start', startDate)
    if (endDate) params.append('end', endDate)
    const response = await api.get<{ completions: HabitCompletion[] }>(
      `${API_ENDPOINTS.HABITS.COMPLETIONS}?${params.toString()}`,
    )
    return response.completions || []
  },

  createCompletion: async (
    habitId: string,
    data: {
      date?: string
      notes?: string
      rating?: number
      time?: string
    },
  ): Promise<HabitCompletion> => {
    const response = await api.post<{ completion: HabitCompletion }>(
      API_ENDPOINTS.HABITS.COMPLETE(habitId),
      {
        date: data.date || getLocalDateString(),
        notes: data.notes || '',
        rating: data.rating || 0,
      },
    )
    return response.completion
  },
}
