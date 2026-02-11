export interface MoodDefinition {
  value: number
  emoji: string
  label: string
}

export const MOOD_DEFINITIONS: MoodDefinition[] = [
  { value: 5, emoji: '😊', label: 'Отлично' },
  { value: 4, emoji: '🙂', label: 'Хорошо' },
  { value: 3, emoji: '😐', label: 'Нормально' },
  { value: 2, emoji: '😔', label: 'Плохо' },
  { value: 1, emoji: '😢', label: 'Очень плохо' },
]

export type MoodValue = MoodDefinition['value']

export const getMoodEmoji = (mood: number | null | undefined) => {
  if (mood == null) return '😐'
  const found = MOOD_DEFINITIONS.find((m) => m.value === mood)
  return found?.emoji ?? '😐'
}

export const getTodayDateString = () => new Date().toISOString().split('T')[0]

export const DEFAULT_JOURNAL_CONTENT_TYPE = 'text'

