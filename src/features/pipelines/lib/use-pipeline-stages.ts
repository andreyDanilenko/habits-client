import { reactive, watch } from 'vue'

export interface StageForm {
  id?: string
  name: string
  color?: string
  probability: number
  isFinal: boolean
  isLost: boolean
}

export function usePipelineStages(initialStages: StageForm[] = []) {
  const stages = reactive<StageForm[]>([...initialStages])

  const DEFAULT_STAGES: StageForm[] = [
    { name: 'Первичный контакт', color: '#94A3B8', probability: 10, isFinal: false, isLost: false },
    { name: 'Переговоры', color: '#3B82F6', probability: 40, isFinal: false, isLost: false },
    { name: 'Счёт отправлен', color: '#8B5CF6', probability: 70, isFinal: false, isLost: false },
    { name: 'Успешно', color: '#22C55E', probability: 100, isFinal: true, isLost: false },
    { name: 'Проигрыш', color: '#EF4444', probability: 0, isFinal: false, isLost: true },
  ]

  const addStage = () => {
    stages.push({
      name: '',
      color: '#94A3B8',
      probability: 0,
      isFinal: false,
      isLost: false,
    })
    recalculateProbabilities()
  }

  const removeStage = (index: number) => {
    if (stages.length <= 1) return
    stages.splice(index, 1)
    recalculateProbabilities()
  }

  const toggleFinal = (index: number, value?: boolean) => {
    const next = value ?? !stages[index]?.isFinal
    stages.forEach((stage, i) => {
      stage.isFinal = next ? i === index : false
    })
    recalculateProbabilities()
  }

  const toggleLost = (index: number, value?: boolean) => {
    const next = value ?? !stages[index]?.isLost
    stages.forEach((stage, i) => {
      stage.isLost = next ? i === index : false
    })
    recalculateProbabilities()
  }

  const recalculateProbabilities = () => {
    if (!stages.length) return

    const regularStages = stages.filter((s) => !s.isFinal && !s.isLost)

    if (!regularStages.length) {
      stages.forEach((stage) => {
        if (stage.isFinal) stage.probability = 100
        if (stage.isLost) stage.probability = 0
      })
      return
    }

    const step = 100 / (regularStages.length + 1)
    let currentIdx = 0

    stages.forEach((stage) => {
      if (stage.isFinal) {
        stage.probability = 100
      } else if (stage.isLost) {
        stage.probability = 0
      } else {
        stage.probability = Math.round(step * (currentIdx + 1))
        currentIdx++
      }
    })
  }

  const setStages = (newStages: StageForm[]) => {
    stages.length = 0
    stages.push(...newStages)
    recalculateProbabilities()
  }

  const resetToDefault = () => {
    setStages(DEFAULT_STAGES)
  }

  const validate = () => {
    const finalCount = stages.filter((s) => s.isFinal).length
    const lostCount = stages.filter((s) => s.isLost).length

    if (stages.length === 0) {
      return 'Добавьте хотя бы один этап'
    }
    if (finalCount !== 1) {
      return 'Должен быть ровно один финальный этап (успех)'
    }
    if (lostCount !== 1) {
      return 'Должен быть ровно один этап проигрыша'
    }
    return null
  }

  // Автоматический пересчет при изменении
  watch(stages, () => recalculateProbabilities(), { deep: true })

  return {
    stages,
    addStage,
    removeStage,
    toggleFinal,
    toggleLost,
    setStages,
    resetToDefault,
    validate,
    DEFAULT_STAGES,
  }
}
