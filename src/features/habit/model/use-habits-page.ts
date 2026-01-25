import { computed, onMounted, ref } from 'vue'
import { useHabitStore } from '@/entities/habit'
import { useHabitActions } from '@/features/habit/model/use-habit-actions'
import { useHabitProgress } from '@/features/habit/model/use-habit-progress'

export const useHabitsPage = () => {
  const habitStore = useHabitStore()
  const habitActions = useHabitActions()
  const { habitProgressMap } = useHabitProgress()
  
  const selectedDate = ref<string>('')
  const showAll = ref<boolean>(false)

  const habits = computed(() => habitStore.habits)
  const isLoading = computed(() => habitStore.isLoading)

  const loadHabits = () => {
    if (showAll.value) {
      habitStore.fetchAllHabits()
    } else if (selectedDate.value) {
      const date = new Date(selectedDate.value)
      habitStore.fetchHabits(date)
    } else {
      habitStore.fetchHabits(new Date())
    }
  }

  const handleDateChange = (date: string) => {
    selectedDate.value = date
    showAll.value = false
    loadHabits()
  }

  const handleShowAll = () => {
    showAll.value = true
    selectedDate.value = ''
    loadHabits()
  }

  const handleResetFilter = () => {
    showAll.value = false
    selectedDate.value = ''
    loadHabits()
  }

  onMounted(() => {
    selectedDate.value = ''
    showAll.value = false
    habitStore.fetchHabits(new Date())
  })

  return {
    habits,
    isLoading,
    habitProgressMap,
    selectedDate,
    showAll,
    handleDateChange,
    handleShowAll,
    handleResetFilter,

    ...habitActions,
  }
}
