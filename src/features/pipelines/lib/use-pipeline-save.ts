import { ref } from 'vue'
import {
  pipelineService,
  type CreatePipelineDto,
  type UpdatePipelineDto,
  type Pipeline,
} from '@/entities/deal'
import type { StageForm } from './use-pipeline-stages'

export function usePipelineSave() {
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const createPipeline = async (
    workspaceId: string,
    data: { name: string; isDefault: boolean; stages: StageForm[] }
  ): Promise<Pipeline | null> => {
    isSaving.value = true
    error.value = null

    try {
      const dto: CreatePipelineDto = {
        name: data.name.trim(),
        isDefault: data.isDefault,
        stages: data.stages.map((stage, index) => ({
          name: stage.name || `Этап ${index + 1}`,
          probability: stage.probability,
          color: stage.color,
          isFinal: stage.isFinal,
          isLost: stage.isLost,
          order: index + 1,
        })),
      }

      return await pipelineService.create(workspaceId, dto)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Не удалось создать воронку'
      return null
    } finally {
      isSaving.value = false
    }
  }

  const updatePipeline = async (
    workspaceId: string,
    pipelineId: string,
    data: { name: string; isDefault: boolean; stages: StageForm[] }
  ): Promise<Pipeline | null> => {
    isSaving.value = true
    error.value = null

    try {
      const dto: UpdatePipelineDto = {
        name: data.name.trim(),
        isDefault: data.isDefault,
        stages: data.stages.map((stage, index) => ({
          id: stage.id,
          name: stage.name || `Этап ${index + 1}`,
          probability: stage.probability,
          color: stage.color,
          isFinal: stage.isFinal,
          isLost: stage.isLost,
          order: index + 1,
        })),
      }

      return await pipelineService.update(workspaceId, pipelineId, dto)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Не удалось обновить воронку'
      return null
    } finally {
      isSaving.value = false
    }
  }

  return {
    isSaving,
    error,
    createPipeline,
    updatePipeline,
  }
}
