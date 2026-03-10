// features/pipelines/lib/use-pipelines.ts
import { computed, watch } from 'vue'
import { usePermissions, WorkspacePermission } from '@/entities/workspace'
import { usePipelinesList } from './use-pipelines-list'
import { usePipelineForm } from './use-pipeline-form'
import { usePipelineSave } from './use-pipeline-save'
import { usePipelineDelete } from './use-pipeline-delete'

export function usePipelines() {
  const { isOwner, hasPermission } = usePermissions()

  // Инстансы хуков
  const list = usePipelinesList() // workspaceId уже внутри этого хука
  const form = usePipelineForm()
  const save = usePipelineSave()
  const del = usePipelineDelete()

  // Computed
  const canManage = computed(() => hasPermission(WorkspacePermission.CRM_PIPELINE_MANAGE))

  const currentPipeline = computed(() => {
    if (!list.selectedId.value) return null
    return list.getPipelineById(list.selectedId.value)
  })

  const isCreating = computed(() => list.selectedId.value === null)

  // Действия
  const selectPipeline = (id: string) => {
    list.selectPipeline(id)
    const pipeline = list.getPipelineById(id)
    form.loadPipeline(pipeline)
  }

  const startCreate = () => {
    list.selectPipeline(null)
    form.resetToCreate(list.pipelines.value.length === 0)
  }

  const handleSave = async () => {
    if (!list.workspaceId.value || !canManage.value || form.validationMessage.value) return

    if (isCreating.value) {
      const created = await save.createPipeline(list.workspaceId.value, {
        name: form.form.name,
        isDefault: form.form.isDefault,
        stages: form.stages,
      })
      if (!created) return
      list.addToList(created)
      selectPipeline(created.id)
    } else if (currentPipeline.value) {
      const updated = await save.updatePipeline(
        list.workspaceId.value,
        currentPipeline.value.id,
        {
          name: form.form.name,
          isDefault: form.form.isDefault,
          stages: form.stages,
        }
      )
      if (!updated) return
      list.updateInList(updated)
      selectPipeline(updated.id)
    }
  }

  const handleDelete = async () => {
    if (!list.workspaceId.value || !del.pipelineToDelete.value) return

    const deletedId = del.pipelineToDelete.value.id
    const success = await del.deletePipeline(list.workspaceId.value)
    if (!success) return

    list.removeFromList(deletedId)

    if (list.pipelines.value.length > 0) {
      const def = list.pipelines.value.find(p => p.isDefault) ?? list.pipelines.value[0]
      selectPipeline(def.id)
    } else {
      list.selectPipeline(null)
      form.loadPipeline(null)
    }
  }

  const resetForm = () => {
    form.reset(currentPipeline.value, isCreating.value)
  }

  // Загрузка при смене workspace
  watch(
    () => list.workspaceId.value,
    (id) => {
      if (id) {
        list.fetchPipelines()
      }
    },
    { immediate: true }
  )

  // При загрузке списка выбираем первую воронку
  watch(
    () => list.pipelines.value,
    (pipelines) => {
      if (!list.selectedId.value && pipelines.length > 0) {
        const def = pipelines.find(p => p.isDefault) ?? pipelines[0]
        selectPipeline(def.id)
      }
    }
  )

  return {
    // Состояние списка
    pipelines: list.pipelines,
    isLoading: list.isLoading,
    listError: list.error,
    selectedId: list.selectedId,
    pagination: list.pagination,
    PAGE_SIZE: list.PAGE_SIZE,

    // Состояние формы
    form: form.form,
    stages: form.stages,
    validationMessage: form.validationMessage,

    // Состояние сохранения/удаления
    isSaving: save.isSaving,
    saveError: save.error,
    isDeleting: del.isDeleting,
    deleteError: del.error,
    pipelineToDelete: del.pipelineToDelete,

    // Computed
    canManage,
    currentPipeline,
    isCreating,

    // Методы для этапов
    addStage: form.addStage,
    removeStage: form.removeStage,
    toggleFinal: form.toggleFinal,
    toggleLost: form.toggleLost,
    setStages: form.setStages,

    // Методы для воронок
    selectPipeline,
    startCreate,
    handleSave,
    handleDelete,
    confirmDelete: del.confirmDelete,
    cancelDelete: del.cancelDelete,
    resetForm,
    refresh: list.fetchPipelines,
  }
}
