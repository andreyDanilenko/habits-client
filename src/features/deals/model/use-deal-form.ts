import { ref, watch, computed } from 'vue'
import { contactService } from '@/entities/contact'
import { companyService } from '@/entities/company'
import type { Deal, CreateDealDto, Pipeline } from '@/entities/deal'
import type { Contact } from '@/entities/contact'
import type { SearchSelectOption } from '@/shared/ui'

export type DealFormState = {
  name: string
  contactId: string
  companyId: string
  companyNameDisplay: string
  budgetStr: string
  currency: 'RUB' | 'USD' | 'EUR'
  pipelineId: string
  stageId: string
  expectedCloseDate: string
  description: string
  ownerId: string
}

const CURRENCY_OPTIONS = [
  { value: 'RUB', label: 'RUB' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
]

const emptyForm = (): DealFormState => ({
  name: '',
  contactId: '',
  companyId: '',
  companyNameDisplay: '',
  budgetStr: '',
  currency: 'RUB',
  pipelineId: '',
  stageId: '',
  expectedCloseDate: '',
  description: '',
  ownerId: '',
})

export interface UseDealFormProps {
  isOpen: boolean
  deal: Deal | null
  pipelines: Pipeline[]
  pipelineId?: string
  defaultStageId: string | undefined
  workspaceId: string
  defaultOwnerId: string
  preselectedContact?: Contact | null
}

export interface UseDealFormCallbacks {
  onPreselectedApplied: () => void
}

export function useDealForm(
  props: UseDealFormProps,
  callbacks: UseDealFormCallbacks,
) {
  const form = ref<DealFormState>(emptyForm())
  const saving = ref(false)
  const contactQuery = ref('')
  const contactOptions = ref<Contact[]>([])
  const contactSearching = ref(false)
  const selectedContactDisplay = ref('')

  const stages = computed(() => {
    const explicitPipelineId = form.value.pipelineId || props.pipelineId
    const pipeline =
      (explicitPipelineId &&
        props.pipelines.find((p) => p.id === explicitPipelineId)) ||
      props.pipelines.find((p) => p.isDefault) ||
      props.pipelines[0]
    return pipeline?.stages ?? []
  })

  const pipelineOptions = computed(() =>
    props.pipelines.map((p) => ({ value: p.id, label: p.name })),
  )

  const stageOptions = computed(() =>
    stages.value.map((s) => ({ value: s.id, label: s.name })),
  )

  const ownerOptions = computed(() => [
    { value: props.defaultOwnerId || '1', label: 'Текущий пользователь' },
  ])

  function contactDisplayName(c: Contact) {
    const n = [c.firstName, c.lastName].filter(Boolean).join(' ')
    return n || c.emails?.[0]?.address || c.id
  }

  function getContactOptionLabel(opt: SearchSelectOption) {
    return contactDisplayName(opt as unknown as Contact)
  }

  async function selectContact(c: Contact) {
    form.value.contactId = c.id
    form.value.companyId = c.companyId ?? ''
    selectedContactDisplay.value = contactDisplayName(c)
    contactQuery.value = ''
    contactOptions.value = []
    if (c.companyId && props.workspaceId) {
      try {
        const company = await companyService.getById(
          props.workspaceId,
          c.companyId,
        )
        form.value.companyNameDisplay = company.name
      } catch {
        form.value.companyNameDisplay = ''
      }
    } else {
      form.value.companyNameDisplay = ''
    }
  }

  async function loadForm() {
    const { deal, pipelines, pipelineId, defaultStageId } = props
    const fallbackPipeline =
      (deal?.pipelineId ?? pipelineId) &&
      pipelines.find((p) => p.id === (deal?.pipelineId ?? pipelineId))
    const defaultPipeline =
      fallbackPipeline ||
      pipelines.find((p) => p.isDefault) ||
      pipelines[0]
    const initialPipelineId = defaultPipeline?.id ?? ''
    const firstStageId = defaultPipeline?.stages?.[0]?.id ?? ''

    form.value = {
      name: deal?.name ?? '',
      contactId: deal?.contactId ?? '',
      companyId: deal?.companyId ?? '',
      companyNameDisplay: '',
      budgetStr: deal?.budget != null ? String(deal.budget) : '',
      currency: deal?.currency ?? 'RUB',
      pipelineId: deal?.pipelineId ?? initialPipelineId,
      stageId: deal?.stageId ?? defaultStageId ?? firstStageId,
      expectedCloseDate: deal?.expectedCloseDate?.slice(0, 10) ?? '',
      description: deal?.description ?? '',
      ownerId: deal?.ownerId ?? (props.defaultOwnerId || '1'),
    }
    contactQuery.value = ''
    selectedContactDisplay.value = ''
    contactOptions.value = []

    if (props.preselectedContact) {
      await selectContact(props.preselectedContact)
      callbacks.onPreselectedApplied()
    } else if (deal?.contactId && props.workspaceId) {
      try {
        const contact = await contactService.getById(
          props.workspaceId,
          deal.contactId,
        )
        selectedContactDisplay.value = contactDisplayName(contact)
        if (contact.companyId) {
          form.value.companyId = contact.companyId
          const company = await companyService.getById(
            props.workspaceId,
            contact.companyId,
          )
          form.value.companyNameDisplay = company.name
        }
      } catch {
        // ignore
      }
    } else if (deal?.companyId && props.workspaceId) {
      try {
        const company = await companyService.getById(
          props.workspaceId,
          deal.companyId,
        )
        form.value.companyNameDisplay = company.name
      } catch {
        // ignore
      }
    }
  }

  async function onContactSearch(q: string) {
    if (!q || !props.workspaceId) {
      contactOptions.value = []
      return
    }
    contactSearching.value = true
    try {
      const res = await contactService.getList({
        workspaceId: props.workspaceId,
        search: q,
        limit: 10,
      })
      contactOptions.value = res.contacts ?? []
    } catch {
      contactOptions.value = []
    } finally {
      contactSearching.value = false
    }
  }

  function syncStageToPipeline() {
    const pipelineId = form.value.pipelineId
    if (!pipelineId) return
    const pipeline = props.pipelines.find((p) => p.id === pipelineId)
    const firstStageId = pipeline?.stages?.[0]?.id
    if (!firstStageId) return
    const stageInPipeline = pipeline.stages.some(
      (s) => s.id === form.value.stageId,
    )
    if (!stageInPipeline) {
      form.value.stageId = firstStageId
    }
  }

  function buildSubmitData(): CreateDealDto {
    const pipelineId =
      form.value.pipelineId ||
      props.pipelineId ||
      props.pipelines.find((p) =>
        p.stages?.some((s) => s.id === form.value.stageId),
      )?.id ||
      props.pipelines[0]?.id ||
      ''
    return {
      name: form.value.name.trim(),
      contactId: form.value.contactId || undefined,
      companyId: form.value.companyId || undefined,
      budget: form.value.budgetStr ? Number(form.value.budgetStr) : 0,
      currency: form.value.currency,
      pipelineId,
      stageId: form.value.stageId || (stages.value[0]?.id ?? ''),
      expectedCloseDate: form.value.expectedCloseDate || undefined,
      description: form.value.description?.trim() || undefined,
      ownerId: form.value.ownerId || undefined,
    }
  }

  // Инициализация формы только при открытии модалки
  watch(
    () => props.isOpen,
    (open) => {
      if (open) loadForm()
    },
    { immediate: true },
  )

  // Применение контакта, созданного из модалки (пока форма открыта)
  watch(
    () => props.preselectedContact,
    async (preselected) => {
      if (preselected && props.isOpen) {
        await selectContact(preselected)
        callbacks.onPreselectedApplied()
      }
    },
  )

  // Сброс этапа при смене воронки
  watch(
    () => form.value.pipelineId,
    () => syncStageToPipeline(),
  )

  return {
    form,
    saving,
    contactQuery,
    contactOptions,
    contactSearching,
    selectedContactDisplay,
    stages,
    pipelineOptions,
    stageOptions,
    ownerOptions,
    currencyOptions: CURRENCY_OPTIONS,
    contactDisplayName,
    getContactOptionLabel,
    selectContact,
    onContactSearch,
    buildSubmitData,
  }
}
