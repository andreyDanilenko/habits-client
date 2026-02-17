import { api, API_ENDPOINTS } from '@/shared/api'
import type {
  JournalEntry,
  CreateJournalEntryDto,
  UpdateJournalEntryDto,
} from '@/entities/journal'

export const journalService = {
  getList: async (workspaceId: string, date?: string): Promise<JournalEntry[]> => {
    const url = date
      ? `${API_ENDPOINTS.WORKSPACE.JOURNAL(workspaceId)}?date=${date}`
      : API_ENDPOINTS.WORKSPACE.JOURNAL(workspaceId)
    const response = await api.get<{ entries: JournalEntry[] }>(url)
    return response.entries ?? []
  },

  get: async (workspaceId: string, entryId: string): Promise<JournalEntry> => {
    return api.get<JournalEntry>(API_ENDPOINTS.WORKSPACE.JOURNAL_ENTRY(workspaceId, entryId))
  },

  create: async (
    workspaceId: string,
    data: CreateJournalEntryDto,
  ): Promise<JournalEntry> => {
    return api.post<JournalEntry>(API_ENDPOINTS.WORKSPACE.JOURNAL(workspaceId), data)
  },

  update: async (
    workspaceId: string,
    entryId: string,
    data: UpdateJournalEntryDto,
  ): Promise<JournalEntry> => {
    return api.put<JournalEntry>(
      API_ENDPOINTS.WORKSPACE.JOURNAL_ENTRY(workspaceId, entryId),
      data,
    )
  },

  delete: (workspaceId: string, entryId: string): Promise<void> =>
    api.delete(API_ENDPOINTS.WORKSPACE.JOURNAL_ENTRY(workspaceId, entryId)),
}
