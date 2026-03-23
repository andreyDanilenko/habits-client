export interface MoodDefinition {
  value: number
  emoji: string
}

export const MOOD_DEFINITIONS: MoodDefinition[] = [
  { value: 5, emoji: '😊' },
  { value: 4, emoji: '🙂' },
  { value: 3, emoji: '😐' },
  { value: 2, emoji: '😔' },
  { value: 1, emoji: '😢' },
]

export type MoodValue = MoodDefinition['value']

export const getMoodEmoji = (mood: number | null | undefined) => {
  if (mood == null) return '😐'
  const found = MOOD_DEFINITIONS.find((m) => m.value === mood)
  return found?.emoji ?? '😐'
}

export const getTodayDateString = () => new Date().toISOString().split('T')[0]

export const DEFAULT_JOURNAL_CONTENT_TYPE = 'text'
