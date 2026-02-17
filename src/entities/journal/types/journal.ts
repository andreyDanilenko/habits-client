export type JournalContentType = 'text' | 'markdown'

export interface JournalEntry {
  id: string
  description: string
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
  description?: string
  mood?: number
  date?: string
  tags?: string[]
  contentType?: JournalContentType
  metadata?: Record<string, unknown>
}

export interface UpdateJournalEntryDto extends Partial<CreateJournalEntryDto> {}
