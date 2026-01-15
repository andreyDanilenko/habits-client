export interface Habit {
  id: string
  title: string
  description?: string
  color: string
  icon?: string
  targetDays?: number
  userId: string
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface HabitCompletion {
  id: string
  habitId: string
  userId: string
  date: string
  notes?: string
  rating?: number
  createdAt: string
}

export interface CreateHabitDto {
  title: string
  description?: string
  color?: string
  icon?: string
  targetDays?: number
}

export interface UpdateHabitDto extends Partial<CreateHabitDto> {}

export interface HabitStats {
  habitId: string
  completedDays: number
  totalDays: number
  completionRate: number
  currentStreak: number
  longestStreak: number
}

export interface CalendarDay {
  date: string
  habits: Array<{
    id: string
    title: string
    completed: boolean
    color: string
  }>
}

export interface CalendarResponse {
  days: CalendarDay[]
}

export interface ToggleResponse {
  completed: boolean
  completion?: HabitCompletion
}
