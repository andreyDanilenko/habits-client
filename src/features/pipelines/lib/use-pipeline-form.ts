import { reactive, computed } from 'vue'
import type { Pipeline } from '@/entities/deal'
import { usePipelineStages } from './use-pipeline-stages'

export function usePipelineForm() {
  const stagesManager = usePipelineStages()

  const form = reactive({
    name: '',
    isDefault: false,
    // Важно: stages нужен внутри формы для совместимости с PipelineEditor
    stages: stagesManager.stages,
  })

  const validationMessage = computed(() => {
    if (!form.name.trim()) {
      return 'Укажите название воронки'
    }
    return stagesManager.validate()
  })

  const loadPipeline = (pipeline: Pipeline | null) => {
    if (!pipeline) {
      form.name = ''
      form.isDefault = false
      stagesManager.setStages([])
      return
    }

    form.name = pipeline.name
    form.isDefault = pipeline.isDefault

    const sortedStages = [...pipeline.stages]
      .sort((a, b) => a.order - b.order)
      .map((stage) => ({
        id: stage.id,
        name: stage.name,
        color: stage.color,
        probability: stage.probability,
        isFinal: stage.isFinal,
        isLost: stage.isLost,
      }))

    stagesManager.setStages(sortedStages)
  }

  const resetToCreate = (isFirstPipeline: boolean) => {
    form.name = ''
    form.isDefault = isFirstPipeline
    stagesManager.resetToDefault()
  }

  const reset = (currentPipeline: Pipeline | null, isCreating: boolean) => {
    if (currentPipeline && !isCreating) {
      loadPipeline(currentPipeline)
    } else {
      resetToCreate(false)
    }
  }

  return {
    // Состояние
    form,
    stages: stagesManager.stages,

    // Валидация
    validationMessage,

    // Методы для этапов (прокси)
    addStage: stagesManager.addStage,
    removeStage: stagesManager.removeStage,
    toggleFinal: stagesManager.toggleFinal,
    toggleLost: stagesManager.toggleLost,
    setStages: stagesManager.setStages,

    // Методы для формы
    loadPipeline,
    resetToCreate,
    reset,
  }
}
