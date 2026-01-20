import type { Habit } from '@/entities/habit'
import { useModal } from '@/shared/lib/modal'
import { useHabitStore } from '@/entities/habit'
import { AddEditHabitModal, HabitDetailsModal, MarkCompletionModal } from '@/features/habit/ui'
import { ConfirmModal } from '@/shared/ui'

export const useHabitActions = () => {
  const { openModal } = useModal()
  const habitStore = useHabitStore()

  const handleAddHabit = () => {
    return openModal<Partial<Habit>>({
      component: AddEditHabitModal,
      props: {
        habit: undefined,
      },
      onConfirm: async (habitData?: Partial<Habit>) => {
        if (habitData) {
          await habitStore.createHabit(habitData)
        }
      },
    })
  }

  const editHabit = (habit: Habit) => {
    return openModal<Partial<Habit>>({
      component: AddEditHabitModal,
      props: {
        habit,
      },
      onConfirm: async (habitData?: Partial<Habit>) => {
        if (habitData) {
          await habitStore.updateHabit(habit.id, habitData)
        }
      },
    })
  }

  const deleteHabit = (habit: Habit) => {
    return openModal<boolean>({
      component: ConfirmModal,
      props: {
        title: 'Удалить привычку',
        message: `Вы уверены, что хотите удалить привычку "${habit.title}"? Все данные о выполнениях также будут удалены.`,
        confirmText: 'Удалить',
        confirmVariant: 'danger',
      },
      onConfirm: async () => {
        await habitStore.deleteHabit(habit.id)
      },
    })
  }

  const markCompletion = (habit: Habit) => {
    return openModal<{
      habitId: string
      count: number
      time?: string
      note?: string
      feeling?: string
    }>({
      component: MarkCompletionModal,
      props: {
        habit,
      },
      onConfirm: async (completionData?: {
        habitId: string
        count: number
        time?: string
        note?: string
        feeling?: string
      }) => {
        if (completionData) {
          await habitStore.markCompletion(completionData)
        }
      },
    })
  }

  const selectHabit = (habit: Habit) => {
    return openModal<'edit' | 'delete'>({
      component: HabitDetailsModal,
      props: {
        habit,
        completions: habitStore.completions,
      },
      onConfirm: (action?: 'edit' | 'delete') => {
        if (action === 'edit') {
          editHabit(habit)
        } else if (action === 'delete') {
          deleteHabit(habit)
        }
      },
    })
  }

  return {
    handleAddHabit,
    editHabit,
    deleteHabit,
    markCompletion,
    selectHabit,
  }
}
