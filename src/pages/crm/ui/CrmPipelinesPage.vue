<template>
  <BasePageLayout
    title="CRM — Воронки продаж"
    description="Управляйте этапами продаж. Настройки доступны только владельцу workspace."
    :error-message="listError || saveError || deleteError"
  >
    <template #header-actions>
      <Button v-if="canManage" size="md" @click="startCreate">
        Создать воронку
      </Button>
    </template>

    <template #sidebar>
      <PipelinesList
        :pipelines="pipelines"
        :is-loading="isLoading"
        :selected-pipeline-id="selectedId"
        :paginated-pipelines="pagination.paginatedItems.value"
        :show-pagination="pagination.totalItems.value > PAGE_SIZE"
        :page-size="PAGE_SIZE"
        :current-page="pagination.currentPageSafe.value"
        @select="selectPipeline"
        @page-change="pagination.setPage"
      />
    </template>

    <template #content>
      <PipelineEditor
        :form="form"
        :stages="stages"
        :current-pipeline="currentPipeline"
        :is-creating="isCreating"
        :can-manage="canManage"
        :is-saving="isSaving"
        :validation-message="validationMessage"
        @save="handleSave"
        @reset="resetForm"
        @create-new="startCreate"
        @delete="confirmDelete"
        @add-stage="addStage"
        @remove-stage="removeStage"
        @toggle-final="toggleFinal"
        @toggle-lost="toggleLost"
        @update-stages="setStages"
      />
    </template>

    <template #modals>
      <Modal :is-open="!!pipelineToDelete" @close="cancelDelete">
        <ConfirmModal
          title="Удалить воронку?"
          message="Удалить можно только пустую воронку. Если на этапах есть сделки, удаление будет отклонено."
          confirm-text="Удалить"
          confirm-variant="danger"
          @close="cancelDelete"
          @confirm="handleDelete"
        />
      </Modal>
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
import { BasePageLayout } from '@/shared/ui/common'
import { Button, Modal, ConfirmModal } from '@/shared/ui'
import { usePipelines } from '@/features/pipelines/lib/use-pipelines'
import PipelinesList from '@/features/pipelines/ui/PipelineList.vue'
import PipelineEditor from '@/features/pipelines/ui/PipelineEditor.vue'

const {
  // Состояние
  pipelines,
  isLoading,
  listError,
  selectedId,
  pagination,
  PAGE_SIZE,
  
  form,
  stages,
  validationMessage,
  
  isSaving,
  saveError,
  isDeleting,
  deleteError,
  pipelineToDelete,
  
  canManage,
  currentPipeline,
  isCreating,
  
  // Методы
  addStage,
  removeStage,
  toggleFinal,
  toggleLost,
  setStages,
  
  selectPipeline,
  startCreate,
  handleSave,
  handleDelete,
  confirmDelete,
  cancelDelete,
  resetForm,
} = usePipelines()
</script>
