<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-text-primary">CRM — Воронки продаж</h1>
        <p class="mt-1 text-sm text-text-secondary">
          Управляйте этапами продаж. Настройки доступны только владельцу workspace.
        </p>
      </div>

      <Button v-if="canManage" size="md" @click="startCreate">
        Создать воронку
      </Button>
    </div>

    <div v-if="errorMessage" class="p-3 rounded-md bg-error-light text-error-dark text-sm">
      {{ errorMessage }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.8fr)] gap-6">
      <!-- Список воронок -->
      <Card class="p-4 space-y-3">
        <div class="flex items-center justify-between gap-2 mb-1">
          <h2 class="text-sm font-medium text-text-secondary">Список воронок</h2>
          <span class="text-xs text-text-muted">
            {{ pipelines.length }} шт.
          </span>
        </div>

        <!-- <div class="space-y-2 max-h-96 overflow-y-auto"> -->
          <div v-if="isLoading" class="text-sm text-text-secondary">
            Загрузка воронок...
          </div>
          <div v-else-if="pipelines.length === 0" class="text-sm text-text-secondary">
            Воронок пока нет. Создайте первую, чтобы начать работу со сделками.
          </div>
          <div v-else class="space-y-(--spacing-2)">
            <ListOption
              v-for="pipeline in paginatedPipelines"
              :key="pipeline.id"
              :title="pipeline.name"
              :selected="pipeline.id === selectedPipelineId"
              :trailing="`Этапов: ${pipeline.stages.length}`"
              @click="selectPipeline(pipeline.id)"
            >
              <template #badge>
                <Badge v-if="pipeline.isDefault" variant="indigo">По умолчанию</Badge>
              </template>
            </ListOption>
          </div>
        <!-- </div> -->

        <div
          v-if="pipelines.length > PIPELINES_PAGE_SIZE"
          class="pt-2 border-t border-border-light mt-2"
        >
          <Pagination
            :total="pipelines.length"
            :page-size="PIPELINES_PAGE_SIZE"
            :current-page="currentPipelinesPage"
            @page-change="pipelinePage = $event"
          />
        </div>
      </Card>

      <!-- Редактор воронки -->
      <Card class="p-4 space-y-4">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-sm font-medium text-text-secondary">
            {{ isCreating ? 'Новая воронка' : 'Настройки воронки' }}
          </h2>

          <div v-if="currentPipeline && canManage" class="flex items-center gap-2">
            <Button variant="outline" size="md" :disabled="isSaving" @click="startCreate">
              Новая
            </Button>
            <Button
              variant="ghost"
              size="md"
              class="text-error-default hover:bg-error-light"
              :disabled="isSaving"
              @click="confirmDelete(currentPipeline)"
            >
              Удалить
            </Button>
          </div>
        </div>

        <div v-if="!canManage" class="p-3 rounded-md bg-bg-tertiary border border-border-light">
          <p class="text-xs text-text-secondary">
            Только владелец workspace может изменять воронки. Вы можете использовать их при
            работе со сделками, но не менять настройки.
          </p>
        </div>

        <div v-if="!currentPipeline && !isCreating" class="text-sm text-text-secondary">
          Выберите воронку слева или создайте новую.
        </div>

        <form
          v-else
          class="space-y-4"
          @submit.prevent="handleSave"
        >
          <div class="grid grid-cols-1 items-end md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
            <Input
              v-model="form.name"
              label="Название воронки"
              placeholder="Например, Основные продажи"
              :disabled="!canManage || isSaving"
              required
            />

            <Checkbox
              v-model="form.isDefault"
              label="Использовать эту воронку по умолчанию"
              size="sm"
              :disabled="!canManage || isSaving"
            />
          </div>

          <!-- Этапы -->
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Этапы воронки
              </h3>
              <Button
                v-if="canManage"
                type="button"
                variant="outline"
                size="md"
                :disabled="isSaving"
                @click="addStage"
              >
                Добавить этап
              </Button>
            </div>

            <p class="text-[11px] text-text-muted">
              Перетащите этапы, чтобы изменить порядок. В одной воронке должен быть один финальный
              этап (успех) и один этап проигрыша.
            </p>

            <DndList
              v-model="form.stages"
              item-key="id"
              tag="div"
              class="space-y-(--spacing-2)"
              :disabled="!canManage || isSaving"
            >
              <template #item="{ element, index }">
                <PipelineStageEditor
                  :stage="normalizeStage(element)"
                  :index="index"
                  :disabled="!canManage || isSaving"
                  :show-remove="canManage"
                  :remove-disabled="isSaving || form.stages.length <= 1"
                  @remove="removeStage(index)"
                  @update:is-final="toggleFinal(index, $event)"
                  @update:is-lost="toggleLost(index, $event)"
                />
              </template>
            </DndList>

            <p v-if="validationMessage" class="text-(--text-xs) text-error-default">
              {{ validationMessage }}
            </p>
          </div>

          <div v-if="canManage" class="flex items-center gap-3 pt-2">
            <Button type="submit" :loading="isSaving" :disabled="!!validationMessage || isSaving">
              Сохранить воронку
            </Button>
            <Button
              type="button"
              variant="ghost"
              class="text-(--text-xs) text-text-muted hover:text-text-secondary"
              :disabled="isSaving"
              @click="resetForm"
            >
              Отменить изменения
            </Button>
          </div>
        </form>
      </Card>
    </div>

    <!-- Модалка подтверждения удаления воронки -->
    <Modal :is-open="!!pipelineToDelete" @close="pipelineToDelete = null">
      <ConfirmModal
        title="Удалить воронку?"
        message="Удалить можно только пустую воронку. Если на этапах есть сделки, удаление будет отклонено."
        confirm-text="Удалить"
        confirm-variant="danger"
        @close="pipelineToDelete = null"
        @confirm="doDelete"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import { useWorkspaceStore, usePermissions, WorkspacePermission } from '@/entities/workspace'
  import type { Pipeline } from '@/entities/deal'
  import {
    pipelineService,
    type CreatePipelineDto,
    type CreatePipelineStageDto,
    type UpdatePipelineDto,
  } from '@/entities/deal'
  import {
    Card,
    Button,
    Input,
    Modal,
    ConfirmModal,
    Pagination,
    ListOption,
    Badge,
    PipelineStageEditor,
    Checkbox,
  } from '@/shared/ui'
  import { DndList } from '@/shared/ui/Dnd'

  const workspaceStore = useWorkspaceStore()
  const { isOwner, hasPermission } = usePermissions()

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')

  const canManage = computed(
    () => isOwner.value && hasPermission(WorkspacePermission.PERMISSIONS_EDIT),
  )

  const pipelines = ref<Pipeline[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref<string | null>(null)

  const PIPELINES_PAGE_SIZE = 11
  const pipelinePage = ref(1)

  const selectedPipelineId = ref<string | null>(null)
  const isCreating = ref(false)

  const form = reactive<{
    name: string
    isDefault: boolean
    stages: {
      id?: string
      name: string
      color?: string
      probability: number
      isFinal: boolean
      isLost: boolean
    }[]
  }>({
    name: '',
    isDefault: false,
    stages: [],
  })

  const pipelineToDelete = ref<Pipeline | null>(null)

  const currentPipeline = computed<Pipeline | null>(() => {
    if (!selectedPipelineId.value) return null
    return pipelines.value.find((p) => p.id === selectedPipelineId.value) ?? null
  })

  const validationMessage = computed(() => {
    if (!form.name.trim()) {
      return 'Укажите название воронки.'
    }
    if (form.stages.length === 0) {
      return 'Добавьте хотя бы один этап.'
    }
    const finalCount = form.stages.filter((s) => s.isFinal).length
    const lostCount = form.stages.filter((s) => s.isLost).length
    if (finalCount !== 1) {
      return 'В воронке должен быть ровно один финальный этап (успех).'
    }
    if (lostCount !== 1) {
      return 'В воронке должен быть ровно один этап проигрыша.'
    }
    return ''
  })

  const totalPipelines = computed(() => pipelines.value.length)

  const currentPipelinesPage = computed(() => {
    if (totalPipelines.value === 0) return 1
    const maxPage = Math.max(1, Math.ceil(totalPipelines.value / PIPELINES_PAGE_SIZE))
    return Math.min(pipelinePage.value, maxPage)
  })

  const paginatedPipelines = computed(() => {
    if (totalPipelines.value === 0) return []
    const page = currentPipelinesPage.value
    const start = (page - 1) * PIPELINES_PAGE_SIZE
    return pipelines.value.slice(start, start + PIPELINES_PAGE_SIZE)
  })

  function mapToCreateDto(): CreatePipelineDto {
    const stages: CreatePipelineStageDto[] = form.stages.map((stage, index) => ({
      name: stage.name || `Этап ${index + 1}`,
      probability: stage.probability ?? 0,
      color: stage.color,
      isFinal: !!stage.isFinal,
      isLost: !!stage.isLost,
      order: index + 1,
    }))

    return {
      name: form.name.trim(),
      isDefault: form.isDefault,
      stages,
    }
  }

  function mapToUpdateDto(): UpdatePipelineDto {
    const stages = form.stages.map((stage, index) => ({
      id: stage.id,
      name: stage.name || `Этап ${index + 1}`,
      probability: stage.probability ?? 0,
      color: stage.color,
      isFinal: !!stage.isFinal,
      isLost: !!stage.isLost,
      order: index + 1,
    }))

    return {
      name: form.name.trim(),
      isDefault: form.isDefault,
      stages,
    }
  }

  function applyPipelineToForm(pipeline: Pipeline | null) {
    if (!pipeline) {
      form.name = ''
      form.isDefault = false
      form.stages = []
      return
    }

    form.name = pipeline.name
    form.isDefault = pipeline.isDefault
    form.stages = pipeline.stages
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((stage) => ({
        id: stage.id,
        name: stage.name,
        color: stage.color,
        probability: stage.probability,
        isFinal: stage.isFinal,
        isLost: stage.isLost,
      }))
  }

  async function fetchPipelines() {
    if (!workspaceId.value) return
    isLoading.value = true
    errorMessage.value = null
    try {
      pipelines.value = await pipelineService.getList(workspaceId.value)

      if (!selectedPipelineId.value && pipelines.value.length > 0) {
        const def = pipelines.value.find((p) => p.isDefault) ?? pipelines.value[0]
        selectedPipelineId.value = def.id
        applyPipelineToForm(def)
      } else if (selectedPipelineId.value) {
        const found = pipelines.value.find((p) => p.id === selectedPipelineId.value) ?? null
        applyPipelineToForm(found)
      }
    } catch (e: any) {
      errorMessage.value = e?.response?.data?.message ?? 'Не удалось загрузить воронки.'
    } finally {
      isLoading.value = false
    }
  }

  function selectPipeline(id: string) {
    isCreating.value = false
    selectedPipelineId.value = id
    const pipeline = pipelines.value.find((p) => p.id === id) ?? null
    applyPipelineToForm(pipeline)
  }

  function startCreate() {
    isCreating.value = true
    selectedPipelineId.value = null
    errorMessage.value = null

    form.name = ''
    form.isDefault = pipelines.value.length === 0
    form.stages = [
      {
        name: 'Первичный контакт',
        color: '#94A3B8',
        probability: 10,
        isFinal: false,
        isLost: false,
      },
      {
        name: 'Переговоры',
        color: '#3B82F6',
        probability: 40,
        isFinal: false,
        isLost: false,
      },
      {
        name: 'Счёт отправлен',
        color: '#8B5CF6',
        probability: 70,
        isFinal: false,
        isLost: false,
      },
      {
        name: 'Успешно',
        color: '#22C55E',
        probability: 100,
        isFinal: true,
        isLost: false,
      },
      {
        name: 'Проигрыш',
        color: '#EF4444',
        probability: 0,
        isFinal: false,
        isLost: true,
      },
    ]
  }

  function addStage() {
    form.stages.push({
      name: '',
      color: '#94A3B8',
      probability: 0,
      isFinal: false,
      isLost: false,
    })
  }

  function removeStage(index: number) {
    if (form.stages.length <= 1) return
    form.stages.splice(index, 1)
  }

  function toggleFinal(index: number, value?: boolean) {
    const next = value ?? !form.stages[index]?.isFinal
    form.stages = form.stages.map((stage, i) => ({
      ...stage,
      isFinal: next ? i === index : stage.isFinal && i === index ? false : stage.isFinal,
    }))
  }

  function toggleLost(index: number, value?: boolean) {
    const next = value ?? !form.stages[index]?.isLost
    form.stages = form.stages.map((stage, i) => ({
      ...stage,
      isLost: next ? i === index : stage.isLost && i === index ? false : stage.isLost,
    }))
  }

  function normalizeStage(
    el: unknown,
  ): { id?: string; name: string; probability: number; color?: string; isFinal: boolean; isLost: boolean } {
    return el as { id?: string; name: string; probability: number; color?: string; isFinal: boolean; isLost: boolean }
  }

  function resetForm() {
    if (currentPipeline.value) {
      isCreating.value = false
      applyPipelineToForm(currentPipeline.value)
    } else {
      startCreate()
    }
  }

  async function handleSave() {
    if (!workspaceId.value || !canManage.value || validationMessage.value) return

    isSaving.value = true
    errorMessage.value = null

    try {
      if (isCreating.value || !currentPipeline.value) {
        const dto = mapToCreateDto()
        const created = await pipelineService.create(workspaceId.value, dto)
        await fetchPipelines()
        selectedPipelineId.value = created.id
        isCreating.value = false
      } else if (currentPipeline.value) {
        const dto = mapToUpdateDto()
        const updated = await pipelineService.update(
          workspaceId.value,
          currentPipeline.value.id,
          dto,
        )
        await fetchPipelines()
        selectedPipelineId.value = updated.id
      }
    } catch (e: any) {
      errorMessage.value =
        e?.response?.data?.message ?? 'Не удалось сохранить воронку. Попробуйте позже.'
    } finally {
      isSaving.value = false
    }
  }

  function confirmDelete(pipeline: Pipeline) {
    pipelineToDelete.value = pipeline
  }

  async function doDelete() {
    if (!workspaceId.value || !pipelineToDelete.value) return
    isSaving.value = true
    errorMessage.value = null
    try {
      await pipelineService.delete(workspaceId.value, pipelineToDelete.value.id)
      pipelineToDelete.value = null
      await fetchPipelines()
      if (pipelines.value.length > 0) {
        const def = pipelines.value.find((p) => p.isDefault) ?? pipelines.value[0]
        selectedPipelineId.value = def.id
        applyPipelineToForm(def)
      } else {
        selectedPipelineId.value = null
        form.name = ''
        form.isDefault = false
        form.stages = []
      }
    } catch (e: any) {
      errorMessage.value =
        e?.response?.data?.message ??
        'Не удалось удалить воронку. Убедитесь, что на этапах нет активных сделок.'
    } finally {
      isSaving.value = false
    }
  }

  watch(
    () => workspaceId.value,
    (id) => {
      if (id) {
        fetchPipelines()
      }
    },
    { immediate: true },
  )

</script>

