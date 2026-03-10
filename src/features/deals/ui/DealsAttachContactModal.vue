<template>
  <Modal :is-open="isOpen" @close="$emit('close')">
    <ModalContent
      title="Добавить контакт в сделку"
      :show-close-button="true"
      @close="$emit('close')"
    >
      <div class="space-y-4">
        <p class="text-sm text-text-secondary">
          Выберите сделку, в которую добавить контакт
          <span v-if="contactLabel" class="font-medium text-text-primary">
            «{{ contactLabel }}»
          </span>
          .
        </p>

        <div v-if="isLoading" class="py-4 text-sm text-text-muted">Загрузка списка сделок…</div>
        <div v-else-if="isError" class="py-4 text-sm text-error-default">
          Не удалось загрузить сделки. Попробуйте позже.
        </div>
        <div v-else-if="deals.length === 0" class="py-4 text-sm text-text-muted">
          Пока нет сделок. Создайте сделку на странице CRM — Сделки.
        </div>

        <ul
          v-else
          class="max-h-80 overflow-auto divide-y divide-border-light rounded-lg border border-border-light"
        >
          <li v-for="deal in deals" :key="deal.id">
            <button
              type="button"
              class="w-full px-3 py-2 text-left hover:bg-bg-tertiary flex items-center justify-between gap-3"
              :disabled="attachLoadingId === deal.id"
              @click="attachToDeal(deal)"
            >
              <div class="min-w-0">
                <div class="text-sm text-text-primary truncate">
                  {{ deal.name }}
                </div>
                <div class="text-xs text-text-muted mt-0.5 flex items-center gap-2">
                  <span>
                    {{ statusLabel(deal.status) }}
                  </span>
                  <span
                    v-if="deal.pipelineId"
                    class="inline-block w-1 h-1 rounded-full bg-border-default"
                  />
                  <span> Воронка: {{ deal.pipelineId.slice(0, 8) }}… </span>
                </div>
              </div>
              <div class="text-xs text-text-secondary whitespace-nowrap">
                {{ formatDealMoney(deal.budget, deal.currency) }}
              </div>
            </button>
          </li>
        </ul>

        <div class="flex justify-end pt-2">
          <Button type="button" variant="ghost" @click="$emit('close')"> Отмена </Button>
        </div>
      </div>
    </ModalContent>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { Modal, ModalContent, Button } from '@/shared/ui'
  import { useDealsCrud } from '../model/use-deals-crud'
  import { formatDealMoney } from '../lib/format'
  import type { Deal } from '@/entities/deal'
  import type { Contact } from '@/entities/contact'

  const props = defineProps<{
    isOpen: boolean
    workspaceId: string
    contact: Contact | null
  }>()

  const emit = defineEmits<{
    close: []
    confirm: []
    attached: []
  }>()

  const crud = useDealsCrud(() => props.workspaceId)

  const deals = ref<Deal[]>([])
  const isLoading = ref(false)
  const isError = ref(false)
  const attachLoadingId = ref<string | null>(null)

  const contactLabel = computed(() => {
    if (!props.contact) return ''
    const full = [props.contact.firstName, props.contact.lastName].filter(Boolean).join(' ')
    return full || props.contact.id
  })

  async function loadDeals() {
    if (!props.workspaceId || !props.isOpen) return
    isLoading.value = true
    isError.value = false
    try {
      deals.value = await crud.getDealsList(props.workspaceId, {
        page: 1,
        limit: 50,
      })
    } catch {
      isError.value = true
      deals.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function attachToDeal(deal: Deal) {
    if (!props.workspaceId || !props.contact) return
    attachLoadingId.value = deal.id
    try {
      await crud.updateDeal(
        deal.id,
        { contactId: props.contact.id },
        {
          skipRefetch: true,
        },
      )
      emit('confirm')
      emit('attached')
      emit('close')
    } finally {
      attachLoadingId.value = null
    }
  }

  function statusLabel(status: Deal['status']) {
    if (status === 'won') return 'Выиграна'
    if (status === 'lost') return 'Проиграна'
    return 'Открыта'
  }

  watch(
    () => props.isOpen,
    (open) => {
      if (open) {
        loadDeals()
      } else {
        deals.value = []
      }
    },
  )
</script>
