<template>
  <BasePageLayout
    :title="deal?.name ?? 'Сделка'"
    :error-message="error"
  >
    <template #header-title>
      <router-link
        :to="{ name: 'CrmDeals' }"
        class="inline-flex items-center gap-(--spacing-1) text-(--text-sm) text-text-secondary hover:text-primary-default mb-(--spacing-2)"
      >
        <ArrowLeftIcon class="size-4" />
        К списку сделок
      </router-link>
      <h1 v-if="deal" class="text-text-primary text-(--text-xl) font-semibold">
        <EditableTitle
          :model-value="deal.name"
          placeholder="Без названия"
          title-class="text-(--text-xl)"
          @save="(v) => saveName(v)"
        />
      </h1>
    </template>

    <template #content>
      <div v-if="isLoading" class="flex justify-center py-12">
        <Spinner class="size-8 text-primary-default" />
      </div>
      <template v-else-if="deal">
        <div class="space-y-(--spacing-6)">
          <header
            class="flex flex-wrap items-start gap-(--spacing-4) p-(--spacing-4) rounded-(--radius-lg) border border-border-default bg-bg-primary"
          >
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-(--spacing-3) text-(--text-sm)">
                <span class="font-medium text-primary-default">
                  {{ formatDealMoney(deal.budget, deal.currency) }}
                </span>
                <div class="min-w-[160px]">
                  <Select
                    :model-value="selectedPipelineId"
                    :options="pipelineOptions"
                    size="md"
                    @update:model-value="(v) => selectPipeline(String(v ?? ''))"
                  />
                </div>
                <div class="min-w-[140px]">
                  <Select
                    :model-value="deal.stageId"
                    :options="stageOptions"
                    size="md"
                    @update:model-value="(v) => v && onStageChange(String(v))"
                  />
                </div>
              </div>
              <div class="flex flex-wrap gap-(--spacing-2) mt-(--spacing-3)">
                <Button size="md" variant="outline" @click="actions.openEditDeal(deal)">
                  Редактировать
                </Button>
                <Button size="md" variant="ghost" @click="actions.openDeleteConfirm(deal)">
                  Удалить
                </Button>
                <Button
                  v-if="deal.status === 'open'"
                  size="md"
                  variant="primary"
                  @click="closeAsWon"
                >
                  Закрыть выигрыш
                </Button>
                <Button
                  v-if="deal.status === 'open'"
                  size="md"
                  variant="ghost"
                  @click="closeAsLost"
                >
                  Закрыть проигрыш
                </Button>
              </div>
            </div>
          </header>

          <DetailTabsPanel v-model="activeTab" :tabs="tabs">
            <template #main>
              <section class="space-y-(--spacing-6)">
                <h2 class="text-(--text-lg) font-medium text-text-primary">
                  Основная информация
                </h2>
                <dl class="grid gap-(--spacing-4) sm:grid-cols-2">
                  <div>
                    <dt class="text-(--text-sm) text-text-muted">Контакт</dt>
                    <dd class="mt-(--spacing-1) text-(--text-sm) text-text-primary">
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
                    <dt class="text-(--text-sm) text-text-muted">Компания</dt>
                    <dd class="mt-(--spacing-1) text-(--text-sm) text-text-primary">
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
                    <dt class="text-(--text-sm) text-text-muted">Описание</dt>
                    <dd class="mt-(--spacing-1) text-(--text-sm) text-text-primary whitespace-pre-wrap">
                      {{ deal.description || '—' }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-(--text-sm) text-text-muted">Плановая дата закрытия</dt>
                    <dd class="mt-(--spacing-1) text-(--text-sm) text-text-primary">
                      {{ formatDealDate(deal.expectedCloseDate) }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-(--text-sm) text-text-muted">Источник</dt>
                    <dd class="mt-(--spacing-1) text-(--text-sm) text-text-primary">
                      {{ deal.source || '—' }}
                    </dd>
                  </div>
                  <div v-if="deal.tags?.length" class="sm:col-span-2">
                    <dt class="text-(--text-sm) text-text-muted mb-(--spacing-1)">Теги</dt>
                    <dd class="flex flex-wrap gap-(--spacing-1)">
                      <span
                        v-for="tag in deal.tags"
                        :key="tag"
                        class="inline-block px-(--spacing-2) py-(--spacing-1) rounded-(--radius-sm) text-(--text-sm) bg-bg-tertiary text-text-secondary"
                      >
                        {{ tag }}
                      </span>
                    </dd>
                  </div>
                </dl>
              </section>
            </template>
            <template #activity>
              <ActivityFeed
                entity-type="deal"
                :entity-id="dealId"
              />
            </template>
            <template #projects>
              <ProjectEntityPanel
                :workspace-id="workspaceId"
                entity-type="crm_deal"
                :entity-id="dealId"
                :entity-name="deal?.name"
                :can-edit="canEditCrm"
                projects-base-path="/projects"
              />
            </template>
            <template #tasks>
              <p class="text-text-muted text-(--text-sm)">
                Связанные задачи (в разработке).
              </p>
            </template>
            <template #products>
              <p class="text-text-muted text-(--text-sm)">
                Товары/услуги (для будущего расширения).
              </p>
            </template>
          </DetailTabsPanel>
        </div>
      </template>
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { BasePageLayout } from '@/shared/ui/common'
import { Button, Spinner, Select, EditableTitle, DetailTabsPanel } from '@/shared/ui'
import { ArrowLeftIcon } from '@/shared/ui/icon'
import { usePermissions, WorkspacePermission } from '@/entities/workspace'
import { dealService } from '@/entities/deal'
import { useDealDetail, useDealActions } from '@/features/deals'
import type { CreateDealDto } from '@/entities/deal'
import { formatDealDate, formatDealMoney } from '@/features/deals/lib/format'
import { ActivityFeed } from '@/features/activity'
import { ProjectEntityPanel } from '@/features/projects'

const router = useRouter()

const detail = useDealDetail()
const {
  workspaceId,
  dealId,
  deal,
  pipelines,
  isLoading,
  error,
  contactName,
  companyName,
  selectedPipelineId,
  stages,
  fetchDeal,
  saveName,
  selectPipeline,
  onStageChange,
  closeAsWon,
  closeAsLost,
} = detail

const pipelineOptions = computed(() =>
  pipelines.value.map((p) => ({ value: p.id, label: p.name })),
)
const stageOptions = computed(() =>
  stages.value.map((s) => ({ value: s.id, label: s.name })),
)

const { hasPermission } = usePermissions()
const canEditCrm = computed(() => hasPermission(WorkspacePermission.CRM_CREATE))

const updateDealForDetail = async (id: string, data: CreateDealDto) => {
  const d = await dealService.update(workspaceId.value, id, data)
  await fetchDeal()
  return d
}
const deleteDealForDetail = async (id: string) => {
  await dealService.delete(workspaceId.value, id)
  router.push({ name: 'CrmDeals' })
}

const actions = useDealActions({
  workspaceId: () => workspaceId.value,
  pipelines: () => pipelines.value,
  createDeal: async () => {
    throw new Error('Create not available on detail page')
  },
  updateDeal: updateDealForDetail,
  deleteDeal: deleteDealForDetail,
  onSuccess: fetchDeal,
})

const activeTab = ref('main')
const tabs = [
  { id: 'main', label: 'Основная информация' },
  { id: 'activity', label: 'Активность' },
  { id: 'projects', label: 'Проекты' },
  { id: 'tasks', label: 'Задачи' },
  { id: 'products', label: 'Товары/Услуги' },
]
</script>
