import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkspaceStore } from '@/entities/workspace'
import { dealService } from '@/entities/deal'
import { contactService } from '@/entities/contact'
import { companyService } from '@/entities/company'
import type { Deal, Pipeline } from '@/entities/deal'

export function useDealDetail() {
  const route = useRoute()
  const workspaceStore = useWorkspaceStore()

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')
  const dealId = computed(() => route.params.id as string)

  const deal = ref<Deal | null>(null)
  const pipelines = ref<Pipeline[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const contactName = ref('')
  const companyName = ref('')
  const editingName = ref(false)
  const nameInputRef = ref<HTMLInputElement | null>(null)
  const selectedPipelineId = ref<string>('')

  const stages = computed(() => {
    const explicitId = selectedPipelineId.value || deal.value?.pipelineId
    const pipeline: Pipeline | undefined =
      (explicitId && pipelines.value.find((p) => p.id === explicitId)) ||
      pipelines.value.find((p) => p.stages?.some((s) => s.id === deal.value?.stageId)) ||
      pipelines.value[0]
    return pipeline?.stages ?? []
  })

  const defaultStageId = computed(() => stages.value[0]?.id)

  async function fetchDeal() {
    const id = route.params.id as string
    if (!workspaceId.value || !id) return
    isLoading.value = true
    error.value = null
    try {
      deal.value = await dealService.getById(workspaceId.value, id)
      pipelines.value = await dealService.getPipelines(workspaceId.value)
      const initialPipelineId =
        deal.value?.pipelineId ||
        pipelines.value.find((p) => p.stages?.some((s) => s.id === deal.value?.stageId))?.id ||
        pipelines.value[0]?.id ||
        ''
      selectedPipelineId.value = initialPipelineId

      contactName.value = ''
      companyName.value = ''
      if (deal.value?.contactId) {
        try {
          const contact = await contactService.getById(workspaceId.value, deal.value.contactId)
          const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ')
          contactName.value = fullName || contact.emails?.[0]?.address || 'Контакт'
        } catch {
          contactName.value = 'Контакт'
        }
      }
      if (deal.value?.companyId) {
        try {
          const company = await companyService.getById(workspaceId.value, deal.value.companyId)
          companyName.value = company.name || 'Компания'
        } catch {
          companyName.value = 'Компания'
        }
      }
    } catch {
      error.value = 'Не удалось загрузить сделку'
      deal.value = null
    } finally {
      isLoading.value = false
    }
  }

  watch(() => route.params.id, fetchDeal, { immediate: true })
  watch(workspaceId, fetchDeal)

  async function saveName(value?: string) {
    if (!deal.value || !workspaceId.value) return
    const name = value?.trim() ?? nameInputRef.value?.value?.trim()
    if (name && name !== deal.value.name) {
      await dealService.update(workspaceId.value, deal.value.id, {
        ...deal.value,
        name,
      })
      deal.value = { ...deal.value, name }
    }
    editingName.value = false
  }

  function onPipelineChangeFromEvent(evt: Event) {
    const pipelineId = (evt.target as HTMLSelectElement)?.value
    if (pipelineId) selectPipeline(pipelineId)
  }

  function selectPipeline(pipelineId: string) {
    selectedPipelineId.value = pipelineId
    const pipeline = pipelines.value.find((p) => p.id === pipelineId)
    const firstStageId = pipeline?.stages?.[0]?.id
    if (firstStageId) {
      onStageChange(firstStageId)
    }
  }

  function onStageChangeFromEvent(evt: Event) {
    const stageId = (evt.target as HTMLSelectElement)?.value
    if (stageId) onStageChange(stageId)
  }

  async function onStageChange(stageId: string) {
    if (!deal.value || !workspaceId.value) return
    const pipelineId = selectedPipelineId.value || deal.value.pipelineId
    const updated = await dealService.update(workspaceId.value, deal.value.id, {
      stageId,
      pipelineId,
    })
    deal.value = updated
  }

  async function closeAsWon() {
    if (!deal.value || !workspaceId.value) return
    await dealService.update(workspaceId.value, deal.value.id, {
      status: 'won',
    })
    await fetchDeal()
  }

  async function closeAsLost() {
    if (!deal.value || !workspaceId.value) return
    await dealService.update(workspaceId.value, deal.value.id, {
      status: 'lost',
    })
    await fetchDeal()
  }

  return {
    workspaceId,
    dealId,
    deal,
    pipelines,
    isLoading,
    error,
    contactName,
    companyName,
    editingName,
    nameInputRef,
    selectedPipelineId,
    stages,
    defaultStageId,
    fetchDeal,
    saveName,
    selectPipeline,
    onStageChange,
    onPipelineChangeFromEvent,
    onStageChangeFromEvent,
    closeAsWon,
    closeAsLost,
  }
}
