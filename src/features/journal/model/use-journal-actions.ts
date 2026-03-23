import { useModal } from '@/shared/lib/modal'
import { ConfirmModal } from '@/shared/ui'
import { JournalEntryModal } from '@/features/journal/ui'
import type { JournalEntry, CreateJournalEntryDto } from '@/entities/journal'
import { useAppI18n } from '@/shared/lib/i18n'

interface UseJournalActionsParams {
  handleSaveEntry: (entry: CreateJournalEntryDto & { id?: string }) => void | Promise<void>
  handleDeleteEntry: (entry: JournalEntry) => void | Promise<void>
}

export const useJournalActions = ({
  handleSaveEntry,
  handleDeleteEntry,
}: UseJournalActionsParams) => {
  const { t } = useAppI18n()
  const { openModal } = useModal()

  const handleCreateEntry = () => {
    return openModal<CreateJournalEntryDto>({
      component: JournalEntryModal,
      props: {
        entry: undefined,
      },
      onConfirm: async (entryData?: CreateJournalEntryDto) => {
        if (entryData) await handleSaveEntry(entryData)
      },
    })
  }

  const editEntry = (entry: JournalEntry) => {
    return openModal<CreateJournalEntryDto & { id?: string }>({
      component: JournalEntryModal,
      props: {
        entry,
      },
      onConfirm: async (entryData?: CreateJournalEntryDto & { id?: string }) => {
        if (entryData) await handleSaveEntry({ ...entryData, id: entry.id })
      },
    })
  }

  const deleteEntry = (entry: JournalEntry) => {
    return openModal<boolean>({
      component: ConfirmModal,
      props: {
        title: t('journal.deleteConfirm.title'),
        message: t('journal.deleteConfirm.message'),
        confirmText: t('common.actions.delete'),
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
