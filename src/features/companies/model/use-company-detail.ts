import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkspaceStore } from '@/entities/workspace'
import { companyService } from '@/entities/company'
import { contactService } from '@/entities/contact'
import { dealService } from '@/entities/deal'
import type { Company } from '@/entities/company'
import type { Contact } from '@/entities/contact'
import type { Deal } from '@/entities/deal'

export function useCompanyDetail() {
  const route = useRoute()
  const workspaceStore = useWorkspaceStore()

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')
  const companyId = computed(() => route.params.id as string)

  const company = ref<Company | null>(null)
  const companyContacts = ref<Contact[]>([])
  const companyDeals = ref<Deal[]>([])
  const companyDealsLoading = ref(false)
  const isLoading = ref(true)

  async function fetchCompany() {
    if (!workspaceId.value || !companyId.value) {
      company.value = null
      return
    }
    isLoading.value = true
    try {
      company.value = await companyService.getById(workspaceId.value, companyId.value)
    } catch {
      company.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCompanyContacts() {
    const c = company.value
    if (!workspaceId.value || !c?.contacts?.length) {
      companyContacts.value = []
      return
    }
    try {
      const list = await Promise.all(
        c.contacts.map((id) => contactService.getById(workspaceId.value, id)),
      )
      companyContacts.value = list
    } catch {
      companyContacts.value = []
    }
  }

  async function fetchCompanyDeals() {
    if (!workspaceId.value || !companyId.value) {
      companyDeals.value = []
      return
    }
    companyDealsLoading.value = true
    try {
      const res = await dealService.getList({
        workspaceId: workspaceId.value,
        companyId: companyId.value,
        limit: 100,
      })
      companyDeals.value = res.deals ?? []
    } catch {
      companyDeals.value = []
    } finally {
      companyDealsLoading.value = false
    }
  }

  watch([workspaceId, companyId], fetchCompany, { immediate: true })
  watch(company, (c: Company | null) => {
    if (c) {
      fetchCompanyContacts()
      fetchCompanyDeals()
    } else {
      companyContacts.value = []
      companyDeals.value = []
    }
  })

  return {
    workspaceId,
    companyId,
    company,
    companyContacts,
    companyDeals,
    companyDealsLoading,
    isLoading,
    fetchCompany,
    fetchCompanyContacts,
    fetchCompanyDeals,
  }
}
