import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/entities/user'
import { useContactsPage } from './use-contacts-page'
import { useCompaniesCrud } from '@/features/companies'
import { useContactActions } from './use-contact-actions'
import type { ContactFilters } from '../ui/ContactsFiltersPanel.vue'

export function useContactsPageActions() {
  const route = useRoute()
  const userStore = useUserStore()

  const page = useContactsPage()
  const { createCompany } = useCompaniesCrud(
    () => page.workspaceId.value,
    () => Promise.resolve(),
  )

  const defaultOwnerId = computed(() => userStore.currentUser?.id ?? '1')

  const actions = useContactActions({
    workspaceId: () => page.workspaceId.value,
    defaultOwnerId: () => defaultOwnerId.value,
    createContact: page.createContact,
    updateContact: page.updateContact,
    deleteContact: page.deleteContact,
    createCompany,
    onSuccess: page.fetchContacts,
  })

  // Filter/UI state
  const showFilters = ref(false)
  const contactFilters = ref<ContactFilters>({})
  const filterCompanies = ref<{ id: string; name: string }[]>([])
  const availableTags = ref<string[]>([])

  // Sync route companyId to filter
  watch(
    () => route.query.companyId,
    (id) => {
      page.companyIdFilter.value = (id as string) ?? ''
      contactFilters.value = { ...contactFilters.value, companyId: (id as string) ?? undefined }
    },
    { immediate: true },
  )

  // Sync contactFilters.companyId to page filter
  watch(
    () => contactFilters.value.companyId,
    (id) => {
      page.companyIdFilter.value = id ?? ''
    },
  )

  function onSearch(value: string) {
    page.searchQuery.value = value
  }

  function setSearchInput(value: string) {
    page.searchInput.value = value
  }

  function setShowFilters(value: boolean) {
    showFilters.value = value
  }

  function resetFilters() {
    contactFilters.value = {}
  }

  function updateContactFilters(filters: ContactFilters) {
    contactFilters.value = filters
  }

  async function bulkDelete() {
    const ids = Array.from(page.selectedIds.value)
    if (ids.length === 0) return
    for (const id of ids) {
      await page.deleteContact(String(id))
    }
  }

  function onImport() {
    // Заглушка MVP
  }

  function onExport() {
    // Заглушка MVP
  }

  return {
    // Page data
    workspaceId: page.workspaceId,
    searchInput: page.searchInput,
    searchQuery: page.searchQuery,
    companyIdFilter: page.companyIdFilter,
    contacts: page.contacts,
    total: page.total,
    isLoading: page.isLoading,
    isError: page.isError,
    page: page.page,
    pageSize: page.pageSize,
    PAGE_SIZE_OPTIONS: page.PAGE_SIZE_OPTIONS,
    sortBy: page.sortBy,
    sortOrder: page.sortOrder,
    selectedIds: page.selectedIds,
    handleSort: page.handleSort,
    handleRowSelect: page.handleRowSelect,
    handleSelectAll: page.handleSelectAll,
    setPage: page.setPage,
    setPageSize: page.setPageSize,
    fetchContacts: page.fetchContacts,

    // Filter state
    showFilters,
    contactFilters,
    filterCompanies,
    availableTags,

    // User
    defaultOwnerId,

    // Actions (useModal)
    openCreateModal: actions.openAddContact,
    openEditModal: actions.openEditContact,
    confirmDelete: actions.openDeleteConfirm,
    openQuickView: actions.openQuickView,
    openAttachToDeal: actions.openAttachToDeal,

    // Other
    onSearch,
    setSearchInput,
    setShowFilters,
    resetFilters,
    updateContactFilters,
    bulkDelete,
    onImport,
    onExport,
  }
}
