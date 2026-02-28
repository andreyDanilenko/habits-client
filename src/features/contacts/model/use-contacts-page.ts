import { ref, computed, watch } from 'vue'
import { useWorkspaceStore } from '@/entities/workspace'
import { contactService } from '@/entities/contact'
import type { Contact, CreateContactDto, UpdateContactDto } from '@/entities/contact'
import { useContactsTableState } from './use-contacts-table-state'

export function useContactsPage() {
  const workspaceStore = useWorkspaceStore()
  const tableState = useContactsTableState()

  const searchQuery = ref('')
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

  watch(
    [
      () => workspaceId.value,
      searchQuery,
      () => tableState.page.value,
      () => tableState.pageSize.value,
      () => tableState.sortBy.value,
      () => tableState.sortOrder.value,
    ],
    fetchContacts,
    { immediate: true },
  )

  const createContact = async (data: CreateContactDto): Promise<Contact> => {
    if (!workspaceId.value) throw new Error('Workspace not selected')
    const contact = await contactService.create(workspaceId.value, data)
    await fetchContacts()
    return contact
  }

  const updateContact = async (id: string, data: UpdateContactDto): Promise<Contact> => {
    if (!workspaceId.value) throw new Error('Workspace not selected')
    const contact = await contactService.update(workspaceId.value, id, data)
    await fetchContacts()
    return contact
  }

  const deleteContact = async (id: string): Promise<void> => {
    if (!workspaceId.value) throw new Error('Workspace not selected')
    await contactService.delete(workspaceId.value, id)
    tableState.clearSelection()
    await fetchContacts()
  }

  return {
    ...tableState,
    workspaceId,
    searchQuery,
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
