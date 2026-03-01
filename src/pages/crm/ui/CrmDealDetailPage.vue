<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-8">
    <router-link
      :to="{ name: 'CrmDeals' }"
      class="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary-default mb-4"
    >
      <ArrowLeftIcon class="size-4" />
      К списку сделок
    </router-link>

    <div v-if="isLoading" class="flex justify-center py-12">
      <Spinner class="size-8 text-primary-default" />
    </div>
    <div v-else-if="isError" class="text-center py-8 text-danger-default">
      Ошибка загрузки сделки.
    </div>
    <template v-else-if="deal">
      <!-- Блок 3.3.1: Шапка сделки -->
      <header class="flex flex-wrap items-start gap-4 p-4 rounded-xl border border-border-default bg-bg-primary">
        <div class="min-w-0 flex-1">
          <h1 class="text-text-primary text-xl font-semibold">
            <input
              v-if="editingName"
              ref="nameInputRef"
              :value="deal.name"
              type="text"
              class="w-full max-w-md px-2 py-1 border border-border-default rounded bg-bg-primary text-text-primary"
              @blur="saveName"
              @keydown.enter="saveName"
            />
            <span v-else class="cursor-pointer hover:underline" @click="editingName = true">{{ deal.name }}</span>
          </h1>
          <div class="flex items-center gap-3 mt-2 text-sm">
            <span class="font-medium text-primary-default">{{ formatMoney(deal.budget, deal.currency) }}</span>
            <select
              :value="deal.stageId"
              class="px-2 py-1 border border-border-default rounded bg-bg-primary text-text-primary text-sm"
              @change="onStageChangeFromEvent($event)"
            >
              <option v-for="s in stages" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <Button size="sm" variant="outline" @click="openEditModal">Редактировать</Button>
            <Button size="sm" variant="ghost" @click="confirmDelete">Удалить</Button>
            <Button v-if="deal.status === 'open'" size="sm" variant="primary" @click="closeAsWon">
              Закрыть выигрыш
            </Button>
            <Button v-if="deal.status === 'open'" size="sm" variant="ghost" @click="closeAsLost">
              Закрыть проигрыш
            </Button>
          </div>
        </div>
      </header>

      <!-- Блок 3.3.2: Основная информация -->
      <section class="rounded-xl border border-border-default bg-bg-primary p-6 space-y-6">
        <h2 class="text-lg font-medium text-text-primary">Основная информация</h2>
        <dl class="grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-sm text-text-muted">Контакт</dt>
            <dd class="mt-0.5">
              <router-link
                v-if="deal.contactId"
                :to="{ name: 'CrmContactDetail', params: { id: deal.contactId } }"
                class="text-primary-default hover:underline"
              >
                {{ contactName || 'Контакт' }}
              </router-link>
              <span v-else class="text-text-muted">Не привязан</span>
            </dd>
          </div>
          <div>
            <dt class="text-sm text-text-muted">Компания</dt>
            <dd class="mt-0.5">
              <router-link
                v-if="deal.companyId"
                :to="{ name: 'CrmCompanyDetail', params: { id: deal.companyId } }"
                class="text-primary-default hover:underline"
              >
                {{ companyName || 'Компания' }}
              </router-link>
              <span v-else class="text-text-muted">Не привязана</span>
            </dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-sm text-text-muted">Описание</dt>
            <dd class="mt-0.5 text-text-primary whitespace-pre-wrap">{{ deal.description || '—' }}</dd>
          </div>
          <div>
            <dt class="text-sm text-text-muted">Плановая дата закрытия</dt>
            <dd class="mt-0.5">{{ formatDate(deal.expectedCloseDate) }}</dd>
          </div>
          <div>
            <dt class="text-sm text-text-muted">Источник</dt>
            <dd class="mt-0.5">{{ deal.source || '—' }}</dd>
          </div>
          <div v-if="deal.tags?.length" class="sm:col-span-2">
            <dt class="text-sm text-text-muted mb-1">Теги</dt>
            <dd class="flex flex-wrap gap-1">
              <span
                v-for="tag in deal.tags"
                :key="tag"
                class="inline-block px-2 py-0.5 rounded text-sm bg-bg-tertiary text-text-secondary"
              >
                {{ tag }}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <!-- Блок 3.3.3: Вкладки -->
      <div class="rounded-xl border border-border-default bg-bg-primary overflow-hidden">
        <nav class="flex border-b border-border-default">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? 'border-primary-default text-primary-default'
                : 'border-transparent text-text-secondary hover:text-text-primary',
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>
        <div class="p-6">
          <ActivityFeed
            v-if="activeTab === 'activity'"
            entity-type="deal"
            :entity-id="dealId"
          />
          <div v-else-if="activeTab === 'tasks'" class="text-text-muted text-sm">
            Связанные задачи (в разработке).
          </div>
          <div v-else-if="activeTab === 'products'" class="text-text-muted text-sm">
            Товары/услуги (для будущего расширения).
          </div>
        </div>
      </div>
    </template>

    <DealFormModal
      :is-open="showFormModal"
      :deal="deal"
      :pipelines="pipelines"
      :default-stage-id="defaultStageId"
      :workspace-id="workspaceId"
      :default-owner-id="defaultOwnerId"
      @close="showFormModal = false"
      @update="handleUpdate"
    />

    <Modal :is-open="showDeleteModal" @close="showDeleteModal = false">
      <ConfirmModal
        title="Удалить сделку?"
        message="Сделка будет удалена без возможности восстановления."
        confirm-text="Удалить"
        confirm-variant="danger"
        @close="showDeleteModal = false"
        @confirm="doDelete"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Modal, ConfirmModal, Button, Spinner } from '@/shared/ui'
  import { ArrowLeftIcon } from '@/shared/ui/icon'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { useUserStore } from '@/entities/user'
  import { dealService } from '@/entities/deal'
  import { DealFormModal } from '@/features/deals'
  import { ActivityFeed } from '@/features/activity'
  import type { Deal, Pipeline, CreateDealDto } from '@/entities/deal'

  const route = useRoute()
  const router = useRouter()
  const workspaceStore = useWorkspaceStore()
  const userStore = useUserStore()

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')
  const dealId = computed(() => route.params.id as string)
  const defaultOwnerId = computed(() => userStore.currentUser?.id ?? '1')

  const deal = ref<Deal | null>(null)
  const pipelines = ref<Pipeline[]>([])
  const isLoading = ref(true)
  const isError = ref(false)
  const contactName = ref('')
  const companyName = ref('')
  const editingName = ref(false)
  const nameInputRef = ref<HTMLInputElement | null>(null)
  const showFormModal = ref(false)
  const showDeleteModal = ref(false)
  const activeTab = ref('activity')

  const tabs = [
    { id: 'activity', label: 'Активность' },
    { id: 'tasks', label: 'Задачи' },
    { id: 'products', label: 'Товары/Услуги' },
  ]

  const stages = computed(() => {
    const pipeline: Pipeline | undefined = pipelines.value.find((p: Pipeline) =>
      p.stages.some((s: { id: string }) => s.id === deal.value?.stageId),
    ) ?? pipelines.value[0]
    return pipeline?.stages ?? []
  })

  const defaultStageId = computed(() => stages.value[0]?.id)

  async function fetchDeal() {
    const id = route.params.id as string
    if (!workspaceId.value || !id) return
    isLoading.value = true
    isError.value = false
    try {
      deal.value = await dealService.getById(workspaceId.value, id)
      pipelines.value = await dealService.getPipelines(workspaceId.value)
    } catch {
      isError.value = true
      deal.value = null
    } finally {
      isLoading.value = false
    }
  }

  watch(
    () => route.params.id,
    fetchDeal,
    { immediate: true },
  )

  watch(workspaceId, fetchDeal)

  async function saveName() {
    if (!deal.value || !workspaceId.value) return
    const name = nameInputRef.value?.value?.trim()
    if (name && name !== deal.value.name) {
      await dealService.update(workspaceId.value, deal.value.id, { ...deal.value, name })
      deal.value = { ...deal.value, name }
    }
    editingName.value = false
  }

  function onStageChangeFromEvent(evt: Event) {
    const stageId = (evt.target as HTMLSelectElement)?.value
    if (stageId) onStageChange(stageId)
  }

  async function onStageChange(stageId: string) {
    if (!deal.value || !workspaceId.value) return
    await dealService.update(workspaceId.value, deal.value.id, { stageId })
    deal.value = { ...deal.value, stageId }
  }

  function openEditModal() {
    showFormModal.value = true
  }

  async function handleUpdate(id: string, data: CreateDealDto) {
    if (!workspaceId.value) return
    deal.value = await dealService.update(workspaceId.value, id, data)
    showFormModal.value = false
  }

  function confirmDelete() {
    showDeleteModal.value = true
  }

  async function doDelete() {
    if (!deal.value || !workspaceId.value) return
    await dealService.delete(workspaceId.value, deal.value.id)
    showDeleteModal.value = false
    router.push({ name: 'CrmDeals' })
  }

  async function closeAsWon() {
    if (!deal.value || !workspaceId.value) return
    await dealService.update(workspaceId.value, deal.value.id, { status: 'won' })
    await fetchDeal()
  }

  async function closeAsLost() {
    if (!deal.value || !workspaceId.value) return
    await dealService.update(workspaceId.value, deal.value.id, { status: 'lost' })
    await fetchDeal()
  }

  function formatMoney(value: number, currency: string): string {
    return (
      new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value) +
      (currency === 'RUB' ? ' ₽' : ` ${currency}`)
    )
  }

  function formatDate(iso: string | undefined): string {
    if (!iso) return '—'
    const d = new Date(iso)
    const months = 'янв фев мар апр май июн июл авг сен окт ноя дек'.split(' ')
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  }
</script>
