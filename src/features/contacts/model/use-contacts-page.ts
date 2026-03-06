import { ref, computed, watch } from 'vue'
import { useWorkspaceStore } from '@/entities/workspace'
import { contactService } from '@/entities/contact'
import type { Contact } from '@/entities/contact'
import { useContactsTableState } from './use-contacts-table-state'
import { useContactsCrud } from './use-contacts-crud'

export function useContactsPage() {
  const workspaceStore = useWorkspaceStore()
  const tableState = useContactsTableState()

  const searchInput = ref('')
  const searchQuery = ref('')
  const companyIdFilter = ref('')
  const contacts = ref<Contact[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isError = ref(false)

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')

  const fetchContacts = async () => {
    if (!workspaceId.value) {
      contacts.value = []
      total.value = 0
      return
    }
    isLoading.value = true
    isError.value = false
    try {
      const res = await contactService.getList({
        workspaceId: workspaceId.value,
        search: searchQuery.value || undefined,
        companyId: companyIdFilter.value || undefined,
        page: tableState.page.value,
        limit: tableState.pageSize.value,
        sortBy: tableState.sortBy.value ?? undefined,
        sortOrder: tableState.sortOrder.value,
      })
      contacts.value = res.contacts
      total.value = res.total
    } catch {
      isError.value = true
      contacts.value = []
      total.value = 0
    } finally {
      isLoading.value = false
    }
  }

  const { createContact, updateContact, deleteContact } = useContactsCrud(
    () => workspaceId.value,
    fetchContacts,
    tableState.clearSelection,
  )

  watch(
    [
      () => workspaceId.value,
      searchQuery,
      companyIdFilter,
      () => tableState.page.value,
      () => tableState.pageSize.value,
      () => tableState.sortBy.value,
      () => tableState.sortOrder.value,
    ],
    fetchContacts,
    { immediate: true },
  )

  return {
    ...tableState,
    workspaceId,
    searchInput,
    searchQuery,
    companyIdFilter,
    contacts,
    total,
    isLoading,
    isError,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
  }
}
