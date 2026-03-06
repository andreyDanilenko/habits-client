export type {
  Habit,
  HabitCompletion,
  CreateHabitDto,
  UpdateHabitDto,
  HabitStats,
  CalendarDay,
  CalendarResponse,
  ToggleResponse,
} from './types/habit'
export type { HabitActivity } from './api/habit-service'

export { useHabitStore } from './model/habit-store'
export { habitService } from './api/habit-service'
