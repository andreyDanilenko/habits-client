export type JournalContentType = 'text' | 'markdown'

export interface JournalEntry {
  id: string
  title: string
  content: string
  mood?: number
  date: string
  tags?: string[]
  contentType: JournalContentType
  metadata?: Record<string, unknown>
  userId: string
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface CreateJournalEntryDto {
  title: string
  content: string
  mood?: number
  date?: string
  tags?: string[]
  contentType?: JournalContentType
  metadata?: Record<string, unknown>
}

export interface UpdateJournalEntryDto extends Partial<CreateJournalEntryDto> {}
