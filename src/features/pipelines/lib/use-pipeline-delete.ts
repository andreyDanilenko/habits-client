import { ref } from 'vue'
import { pipelineService, type Pipeline } from '@/entities/deal'

export function usePipelineDelete() {
  const isDeleting = ref(false)
  const error = ref<string | null>(null)
  const pipelineToDelete = ref<Pipeline | null>(null)

  const confirmDelete = (pipeline: Pipeline) => {
    pipelineToDelete.value = pipeline
  }

  const cancelDelete = () => {
    pipelineToDelete.value = null
  }

  const deletePipeline = async (workspaceId: string): Promise<void> => {
    if (!pipelineToDelete.value) return

    isDeleting.value = true
    error.value = null

    try {
      await pipelineService.delete(workspaceId, pipelineToDelete.value.id)
      pipelineToDelete.value = null
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Не удалось удалить воронку'
      throw e
    } finally {
      isDeleting.value = false
    }
  }

  return {
    isDeleting,
    error,
    pipelineToDelete,
    confirmDelete,
    cancelDelete,
    deletePipeline,
  }
}
