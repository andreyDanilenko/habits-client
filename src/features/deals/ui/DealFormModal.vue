<template>
  <Modal :is-open="isOpen" @close="$emit('close')">
    <ModalContent
      :title="deal ? 'Редактировать сделку' : 'Новая сделка'"
      :show-close-button="true"
      @close="$emit('close')"
    >
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <FormField label="Название сделки" required>
          <Input v-model="form.name" placeholder="Название" required />
        </FormField>

        <FormField label="Контакт">
          <div class="relative">
            <input
              v-model="contactQuery"
              type="text"
              placeholder="Поиск контакта..."
              autocomplete="off"
              class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-default"
              @focus="showContactDropdown = true"
              @blur="onContactBlur"
            />
            <div
              v-if="showContactDropdown && (contactQuery || contactOptions.length > 0)"
              class="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-auto rounded-lg border border-border-default bg-bg-primary shadow-lg z-10"
            >
              <button
                v-if="contactQuery"
                type="button"
                class="w-full px-3 py-2 text-left text-sm text-primary-default hover:bg-bg-tertiary"
                @mousedown.prevent="emitCreateContact"
              >
                + Создать новый контакт
              </button>
              <button
                v-for="c in contactOptions"
                :key="c.id"
                type="button"
                class="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary"
                @mousedown.prevent="selectContact(c)"
              >
                {{ contactDisplayName(c) }}
              </button>
              <p v-if="contactSearching" class="px-3 py-2 text-sm text-text-muted">Поиск...</p>
              <p v-if="contactQuery && !contactSearching && contactOptions.length === 0" class="px-3 py-2 text-sm text-text-muted">Ничего не найдено</p>
            </div>
            <p v-if="form.contactId" class="mt-1 text-xs text-text-muted">
              Выбран: {{ selectedContactDisplay }}
            </p>
          </div>
        </FormField>

        <FormField label="Компания">
          <input
            :value="form.companyNameDisplay"
            type="text"
            placeholder="Заполняется автоматически при выборе контакта"
            readonly
            class="w-full px-3 py-2 border border-border-light rounded-lg bg-bg-tertiary text-text-secondary cursor-default"
          />
        </FormField>

        <FormField label="Бюджет">
          <div class="flex gap-2">
            <Input
              v-model="form.budgetStr"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              class="flex-1"
            />
            <Select
              v-model="form.currency"
              size="sm"
              class="min-w-[100px]"
              :options="currencyOptions"
            />
          </div>
        </FormField>

        <FormField label="Воронка">
          <Select
            v-model="form.pipelineId"
            :options="pipelineOptions"
          />
        </FormField>

        <FormField label="Этап">
          <Select
            v-model="form.stageId"
            :options="stageOptions"
          />
        </FormField>

        <FormField label="Плановая дата закрытия">
          <DateInput v-model="form.expectedCloseDate" />
        </FormField>

        <FormField label="Описание">
          <textarea
            v-model="form.description"
            placeholder="Описание сделки"
            rows="3"
            class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-default resize-y"
          />
        </FormField>

        <FormField label="Ответственный">
          <Select
            v-model="form.ownerId"
            :options="ownerOptions"
          />
        </FormField>

        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" @click="$emit('close')">Отмена</Button>
          <Button type="submit" :loading="saving">Сохранить</Button>
        </div>
      </form>
    </ModalContent>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import {
    Modal,
    ModalContent,
    Button,
    Input,
    DateInput,
    FormField,
    Select,
  } from '@/shared/ui'
  import { contactService } from '@/entities/contact'
  import { companyService } from '@/entities/company'
  import type { Deal, CreateDealDto, Pipeline } from '@/entities/deal'
  import type { Contact } from '@/entities/contact'

  const props = withDefaults(
    defineProps<{
      isOpen: boolean
      deal: Deal | null
      pipelines: Pipeline[]
      /** Воронка, этапы которой показывать в селекте (если не задана — воронка по умолчанию) */
      pipelineId?: string
      defaultStageId: string | undefined
      workspaceId: string
      defaultOwnerId: string
      preselectedContact?: Contact | null
    }>(),
    {
      pipelineId: undefined,
      preselectedContact: null,
    },
  )

  const emit = defineEmits<{
    close: []
    save: [data: CreateDealDto]
    update: [id: string, data: CreateDealDto]
    'create-contact': []
    'preselected-applied': []
  }>()

  const saving = ref(false)
  const contactQuery = ref('')
  const showContactDropdown = ref(false)
  const contactOptions = ref<Contact[]>([])
  const contactSearching = ref(false)
  const selectedContactDisplay = ref('')

  

  const form = ref({
    name: '',
    contactId: '',
    companyId: '',
    companyNameDisplay: '',
    budgetStr: '',
    currency: 'RUB' as 'RUB' | 'USD' | 'EUR',
    pipelineId: '',
    stageId: '',
    expectedCloseDate: '',
    description: '',
    ownerId: '',
  })

  const stages = computed(() => {
    const explicitPipelineId = form.value.pipelineId || props.pipelineId
    const pipeline =
      (explicitPipelineId &&
        props.pipelines.find((p) => p.id === explicitPipelineId)) ||
      props.pipelines.find((p) => p.isDefault) ||
      props.pipelines[0]
    return pipeline?.stages ?? []
  })

  const currencyOptions = [
    { value: 'RUB', label: 'RUB' },
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
  ]

  const pipelineOptions = computed(() =>
    props.pipelines.map((p) => ({
      value: p.id,
      label: p.name,
    })),
  )

  const stageOptions = computed(() =>
    stages.value.map((s) => ({
      value: s.id,
      label: s.name,
    })),
  )

  const ownerOptions = computed(() => {
    const id = props.defaultOwnerId || '1'
    return [{ value: id, label: 'Текущий пользователь' }]
  })

  function contactDisplayName(c: Contact) {
    const n = [c.firstName, c.lastName].filter(Boolean).join(' ')
    return n || c.emails?.[0]?.address || c.id
  }

  let searchTimeout: ReturnType<typeof setTimeout> | null = null
  async function searchContacts() {
    const q = contactQuery.value.trim()
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

  watch(contactQuery, () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(searchContacts, 300)
  })

  function onContactBlur() {
    setTimeout(() => { showContactDropdown.value = false }, 150)
  }

  async function selectContact(c: Contact) {
    form.value.contactId = c.id
    form.value.companyId = c.companyId ?? ''
    selectedContactDisplay.value = contactDisplayName(c)
    contactQuery.value = ''
    showContactDropdown.value = false
    contactOptions.value = []
    if (c.companyId && props.workspaceId) {
      try {
        const company = await companyService.getById(props.workspaceId, c.companyId)
        form.value.companyNameDisplay = company.name
      } catch {
        form.value.companyNameDisplay = ''
      }
    } else {
      form.value.companyNameDisplay = ''
    }
  }

  function emitCreateContact() {
    emit('create-contact')
    showContactDropdown.value = false
  }

  watch(
    () => [props.isOpen, props.deal, props.defaultStageId, props.preselectedContact] as const,
    async ([open, deal, defaultStageId, preselected]) => {
      if (open) {
        const explicitPipelineId = props.deal?.pipelineId ?? props.pipelineId
        const fallbackPipeline =
          explicitPipelineId &&
          props.pipelines.find((p) => p.id === explicitPipelineId)
        const defaultPipeline =
          fallbackPipeline ||
          props.pipelines.find((p) => p.isDefault) ||
          props.pipelines[0]
        const initialPipelineId = defaultPipeline?.id ?? ''
        const firstStageId = defaultPipeline?.stages?.[0]?.id ?? stages.value[0]?.id ?? ''
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

        if (preselected) {
          await selectContact(preselected)
          emit('preselected-applied')
        } else if (deal?.contactId && props.workspaceId) {
          try {
            const contact = await contactService.getById(props.workspaceId, deal.contactId)
            selectedContactDisplay.value = contactDisplayName(contact)
            if (contact.companyId) {
              form.value.companyId = contact.companyId
              const company = await companyService.getById(props.workspaceId, contact.companyId)
              form.value.companyNameDisplay = company.name
            }
          } catch {
            // ignore
          }
        } else if (deal?.companyId && props.workspaceId) {
          try {
            const company = await companyService.getById(props.workspaceId, deal.companyId)
            form.value.companyNameDisplay = company.name
          } catch {
            // ignore
          }
        }
      }
    },
    { immediate: true },
  )

  watch(
    () => form.value.pipelineId,
    (newPipelineId) => {
      if (!newPipelineId) return
      const pipeline = props.pipelines.find((p) => p.id === newPipelineId)
      const firstStageId = pipeline?.stages?.[0]?.id
      if (!firstStageId) return
      const stageInPipeline = pipeline.stages.some((s) => s.id === form.value.stageId)
      if (!stageInPipeline) {
        form.value.stageId = firstStageId
      }
    },
  )

  const handleSubmit = async () => {
    if (!form.value.name.trim()) return
    saving.value = true
    try {
      const pipelineId =
        form.value.pipelineId ||
        props.pipelineId ||
        props.pipelines.find((p) =>
          p.stages?.some((s) => s.id === form.value.stageId),
        )?.id ||
        props.pipelines[0]?.id ||
        ''
      const data: CreateDealDto = {
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
      if (props.deal) {
        emit('update', props.deal.id, data)
      } else {
        emit('save', data)
      }
      emit('close')
    } finally {
      saving.value = false
    }
  }
</script>
