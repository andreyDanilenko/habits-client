import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkspaceStore } from '@/entities/workspace'
import { contactService } from '@/entities/contact'
import { useDealsCrud } from '@/features/deals'
import { useContactsCrud } from './use-contacts-crud'
import type { Contact } from '@/entities/contact'
import type { Deal } from '@/entities/deal'

export function useContactDetail() {
  const route = useRoute()
  const workspaceStore = useWorkspaceStore()
  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')
  const contactId = computed(() => route.params.id as string)
  const { getDealsList } = useDealsCrud(
    () => workspaceId.value,
    () => Promise.resolve(),
  )

  const contact = ref<Contact | null>(null)
  const isLoading = ref(true)
  const contactDeals = ref<Deal[]>([])
  const contactDealsLoading = ref(false)

  async function fetchContact() {
    if (!workspaceId.value || !contactId.value) {
      contact.value = null
      return
    }
    isLoading.value = true
    try {
      contact.value = await contactService.getById(workspaceId.value, contactId.value)
      await fetchContactDeals()
    } catch {
      contact.value = null
      contactDeals.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchContactDeals() {
    if (!workspaceId.value || !contactId.value) {
      contactDeals.value = []
      return
    }
    contactDealsLoading.value = true
    try {
      contactDeals.value = await getDealsList(workspaceId.value, {
        contactId: contactId.value,
        limit: 100,
      })
    } catch {
      contactDeals.value = []
    } finally {
      contactDealsLoading.value = false
    }
  }

  const { createContact, updateContact, deleteContact } = useContactsCrud(
    () => workspaceId.value,
    fetchContact,
  )

  watch([workspaceId, contactId], fetchContact, { immediate: true })

  return {
    workspaceId,
    contactId,
    contact,
    isLoading,
    contactDeals,
    contactDealsLoading,
    fetchContact,
    fetchContactDeals,
    createContact,
    updateContact,
    deleteContact,
  }
}
