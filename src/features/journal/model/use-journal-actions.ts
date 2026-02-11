import { useModal } from '@/shared/lib/modal'
import { ConfirmModal } from '@/shared/ui'
import { JournalEntryModal } from '@/features/journal/ui'
import type { JournalEntry, CreateJournalEntryDto } from '@/entities/journal'

interface UseJournalActionsParams {
  handleSaveEntry: (entry: CreateJournalEntryDto & { id?: string }) => void | Promise<void>
  handleDeleteEntry: (entry: JournalEntry) => void | Promise<void>
}

export const useJournalActions = ({ handleSaveEntry, handleDeleteEntry }: UseJournalActionsParams) => {
  const { openModal } = useModal()

  const handleCreateEntry = () => {
    return openModal<CreateJournalEntryDto>({
      component: JournalEntryModal,
      props: {
        entry: undefined,
      },
      onConfirm: (entryData?: CreateJournalEntryDto) => {
        if (entryData) {
          handleSaveEntry(entryData)
        }
      },
    })
  }

  const editEntry = (entry: JournalEntry) => {
    return openModal<CreateJournalEntryDto & { id?: string }>({
      component: JournalEntryModal,
      props: {
        entry,
      },
      onConfirm: (entryData?: CreateJournalEntryDto & { id?: string }) => {
        if (entryData) {
          handleSaveEntry({
            ...entryData,
            id: entry.id,
          })
        }
      },
    })
  }

  const deleteEntry = (entry: JournalEntry) => {
    return openModal<boolean>({
      component: ConfirmModal,
      props: {
        title: 'Удалить запись',
        message: 'Вы уверены, что хотите удалить эту запись дневника? Это действие нельзя отменить.',
        confirmText: 'Удалить',
        confirmVariant: 'danger',
      },
      onConfirm: async () => {
        await handleDeleteEntry(entry)
      },
    })
  }

  return {
    handleCreateEntry,
    editEntry,
    deleteEntry,
  }
}

