<template>
  <BasePageLayout :title="deal?.name ?? 'Сделка'" :error-message="error">
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
          :readonly="!can(CRM_PERMISSIONS.dealUpdate)"
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
                <PermissionGuard :permission="CRM_PERMISSIONS.dealMove">
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
                </PermissionGuard>
              </div>
              <div class="flex flex-wrap gap-(--spacing-2) mt-(--spacing-3)">
                <PermissionGuard :permission="CRM_PERMISSIONS.dealUpdate">
                  <Button size="md" variant="outline" @click="actions.openEditDeal(deal)">
                    Редактировать
                  </Button>
                </PermissionGuard>
                <PermissionGuard :permission="CRM_PERMISSIONS.dealDelete">
                  <Button size="md" variant="ghost" @click="actions.openDeleteConfirm(deal)">
                    Удалить
                  </Button>
                </PermissionGuard>
                <PermissionGuard
                  v-if="deal.status === 'open'"
                  :permission="CRM_PERMISSIONS.dealUpdate"
                >
                  <Button size="md" variant="primary" @click="closeAsWon"> Закрыть выигрыш </Button>
                </PermissionGuard>
                <PermissionGuard
                  v-if="deal.status === 'open'"
                  :permission="CRM_PERMISSIONS.dealUpdate"
                >
                  <Button size="md" variant="ghost" @click="closeAsLost"> Закрыть проигрыш </Button>
                </PermissionGuard>
              </div>
            </div>
          </header>

          <DetailTabsPanel
            v-model="activeTab"
            :tabs="tabs"
            :tab-components="tabComponents"
            :tab-props="tabProps"
          />
        </div>
      </template>
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { BasePageLayout } from '@/shared/ui/common'
  import { Button, Spinner, Select, EditableTitle, DetailTabsPanel } from '@/shared/ui'
  import { ArrowLeftIcon } from '@/shared/ui/icon'
  import { usePermissions } from '@/features/permissions'
  import { CRM_PERMISSIONS, PROJECT_PERMISSIONS } from '@/features/permissions/config'
  import { PermissionGuard } from '@/features/permissions'
  import { dealService } from '@/entities/deal'
  import { useDealDetail, useDealActions, DealMainInfo, DealPlaceholderTab } from '@/features/deals'
  import type { CreateDealDto } from '@/entities/deal'
  import { formatDealMoney } from '@/features/deals/lib/format'
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
  const stageOptions = computed(() => stages.value.map((s) => ({ value: s.id, label: s.name })))

  const { can } = usePermissions()

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
  const allTabs = [
    { id: 'main', label: 'Основная информация' },
    { id: 'activity', label: 'Активность' },
    { id: 'projects', label: 'Проекты' },
    { id: 'tasks', label: 'Задачи' },
    { id: 'products', label: 'Товары/Услуги' },
  ]
  const tabs = computed(() =>
    allTabs.filter((t) => {
      if (t.id === 'activity') return can(CRM_PERMISSIONS.activityRead)
      if (t.id === 'projects') return can(PROJECT_PERMISSIONS.projectRead)
      return true
    }),
  )

  watch(
    tabs,
    (next) => {
      const ids = next.map((t) => t.id)
      if (!ids.includes(activeTab.value)) {
        activeTab.value = ids[0] ?? 'main'
      }
    },
    { immediate: true },
  )

  const tabComponents = {
    main: DealMainInfo,
    activity: ActivityFeed,
    projects: ProjectEntityPanel,
    tasks: DealPlaceholderTab,
    products: DealPlaceholderTab,
  }

  const tabProps = computed(() => ({
    main: {
      deal: deal.value!,
      contactName: contactName.value,
      companyName: companyName.value,
    },
    activity: {
      entityType: 'deal' as const,
      entityId: dealId.value,
      canCreate: can(CRM_PERMISSIONS.activityCreate),
      canEdit: can(CRM_PERMISSIONS.activityUpdate),
      canDelete: can(CRM_PERMISSIONS.activityDelete),
    },
    projects: {
      workspaceId: workspaceId.value,
      entityType: 'crm_deal',
      entityId: dealId.value,
      entityName: deal.value?.name,
      canEdit: can(PROJECT_PERMISSIONS.entityAttach),
      projectsBasePath: '/projects',
    },
    tasks: { text: 'Связанные задачи (в разработке).' },
    products: { text: 'Товары/услуги (для будущего расширения).' },
  }))
</script>
