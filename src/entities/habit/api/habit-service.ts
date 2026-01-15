import { api } from '@/shared/api/client'
import type {
  Habit,
  CreateHabitDto,
  UpdateHabitDto,
  HabitStats,
  CalendarResponse,
  ToggleResponse,
  HabitCompletion,
} from '@/entities/habit/types/habit'
import { API_ENDPOINTS } from '@/shared/api/endpoints'

export const habitService = {
  getHabits: (): Promise<Habit[]> => api.get<Habit[]>(API_ENDPOINTS.HABITS.BASE),

  getHabit: (id: string): Promise<Habit> => api.get<Habit>(API_ENDPOINTS.HABITS.DETAIL(id)),

  createHabit: (data: CreateHabitDto): Promise<Habit> =>
    api.post<Habit>(API_ENDPOINTS.HABITS.BASE, data),

  updateHabit: (id: string, data: UpdateHabitDto): Promise<Habit> =>
    api.put<Habit>(API_ENDPOINTS.HABITS.DETAIL(id), data),

  deleteHabit: (id: string): Promise<void> => api.delete(API_ENDPOINTS.HABITS.DETAIL(id)),

  toggleCompletion: (id: string): Promise<ToggleResponse> =>
    api.post<ToggleResponse>(API_ENDPOINTS.HABITS.TOGGLE(id)),

  getStats: (id: string): Promise<HabitStats> =>
    api.get<HabitStats>(API_ENDPOINTS.HABITS.STATS(id)),

  getCalendar: (): Promise<CalendarResponse> =>
    api.get<CalendarResponse>(API_ENDPOINTS.HABITS.CALENDAR),

  getHabitCompletions: (): Promise<HabitCompletion[]> =>
    api.get<HabitCompletion[]>(API_ENDPOINTS.HABITS.COMPLETIONS),
}
