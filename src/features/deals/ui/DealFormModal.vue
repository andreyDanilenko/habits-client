<template>
  <ModalContent
    :title="deal ? 'Редактировать сделку' : 'Новая сделка'"
    :show-close-button="true"
    :fullscreen-on-mobile="isMobile"
    @close="$emit('close')"
  >
    <form id="deal-form" class="flex flex-col min-h-0" @submit.prevent="handleSubmit">
      <div class="space-y-4 lg:space-y-5">
        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
            Название сделки <span class="text-error-default">*</span>
          </span>
          <Input v-model="form.name" placeholder="Название" required />
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
            Контакт
          </span>
          <SearchSelect
            v-model="form.contactId"
            :query="contactQuery"
            :options="contactOptions"
            :loading="contactSearching"
            :selected-label="selectedContactDisplay"
            placeholder="Поиск контакта..."
            create-label="+ Создать новый контакт"
            :get-option-label="getContactOptionLabel"
            @update:query="contactQuery = $event"
            @search="onContactSearch"
            @select="(c) => selectContact(c as unknown as Contact)"
            @create="handleCreateContact"
          />
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
            Компания
          </span>
          <input
            :value="form.companyNameDisplay"
            type="text"
            placeholder="Заполняется автоматически при выборе контакта"
            readonly
            class="w-full px-(--spacing-3) py-(--spacing-2) rounded-(--radius-md) border border-border-light bg-bg-tertiary text-text-secondary cursor-default"
          />
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
            Бюджет
          </span>
          <div class="flex gap-(--spacing-2)">
            <Input
              v-model="form.budgetStr"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              class="flex-1"
            />
            <Select v-model="form.currency" class="min-w-[100px]" :options="currencyOptions" />
          </div>
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
            Воронка
          </span>
          <Select v-model="form.pipelineId" :options="pipelineOptions" />
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
            Этап
          </span>
          <Select v-model="form.stageId" :options="stageOptions" />
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
            Плановая дата закрытия
          </span>
          <DatePicker v-model="form.expectedCloseDate" />
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
            Описание
          </span>
          <Textarea v-model="form.description" placeholder="Описание сделки" :rows="3" resize="y" />
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
            Ответственный
          </span>
          <Select v-model="form.ownerId" :options="ownerOptions" />
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-(--spacing-2)">
        <Button type="button" variant="ghost" @click="$emit('close')">Отмена</Button>
        <Button form="deal-form" type="submit" :loading="saving">Сохранить</Button>
      </div>
    </template>
  </ModalContent>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import {
    ModalContent,
    Button,
    Input,
    Textarea,
    DatePicker,
    Select,
    SearchSelect,
  } from '@/shared/ui'
  import type { Contact } from '@/entities/contact'
  import type { Deal, CreateDealDto } from '@/entities/deal'
  import { useDealForm } from '../model/use-deal-form'

  const isMobile = ref(false)
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
  }
  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  const props = withDefaults(
    defineProps<{
      isOpen: boolean
      deal: Deal | null
      pipelines: import('@/entities/deal').Pipeline[]
      pipelineId?: string
      defaultStageId: string | undefined
      workspaceId: string
      defaultOwnerId: string
      preselectedContact?: Contact | null
      /** При использовании с useModal: создаёт контакт и возвращает его (для подстановки в форму) */
      onCreateContact?: () => Promise<Contact | null>
    }>(),
    { pipelineId: undefined, preselectedContact: null, onCreateContact: undefined },
  )

  const emit = defineEmits<{
    close: []
    confirm: [result: { id?: string; data: CreateDealDto }]
    save: [data: CreateDealDto]
    update: [id: string, data: CreateDealDto]
    'create-contact': []
    'preselected-applied': []
  }>()

  const {
    form,
    saving,
    contactQuery,
    contactOptions,
    contactSearching,
    selectedContactDisplay,
    pipelineOptions,
    stageOptions,
    ownerOptions,
    currencyOptions,
    getContactOptionLabel,
    selectContact,
    onContactSearch,
    buildSubmitData,
  } = useDealForm(props, {
    onPreselectedApplied: () => emit('preselected-applied'),
  })

  async function handleCreateContact() {
    if (props.onCreateContact) {
      await props.onCreateContact()
    } else {
      emit('create-contact')
    }
  }

  async function handleSubmit() {
    if (!form.value.name.trim()) return
    saving.value = true
    try {
      const data = buildSubmitData()
      if (props.deal) {
        emit('confirm', { id: props.deal.id, data })
        emit('update', props.deal.id, data)
      } else {
        emit('confirm', { data })
        emit('save', data)
      }
      emit('close')
    } finally {
      saving.value = false
    }
  }
</script>
