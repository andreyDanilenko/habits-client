export type StatColor = 'indigo' | 'emerald' | 'amber'

export interface StatsCardItem {
  label: string
  value: string | number
  emoji?: string
  color?: StatColor
}
