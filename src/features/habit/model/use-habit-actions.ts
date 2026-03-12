import type { Habit, CreateHabitDto } from '@/entities/habit'
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
      fullscreenOnMobile: true,
      contentClass:
        'fixed inset-0 flex flex-col h-[100dvh] max-w-none max-h-none m-0 rounded-none overflow-hidden lg:relative lg:flex-none lg:h-auto lg:max-w-[min(30rem,calc(100vw-2rem))] lg:max-h-[calc(100vh-2rem)] lg:mx-auto lg:rounded-xl lg:my-4 lg:overflow-x-auto lg:overflow-y-auto',
      props: {
        habit: undefined,
      },
      onConfirm: async (habitData?: Partial<Habit>) => {
        if (habitData?.title) {
          await habitStore.createHabit(habitData as CreateHabitDto)
        }
      },
    })
  }

  const editHabit = (habit: Habit) => {
    return openModal<Partial<Habit>>({
      component: AddEditHabitModal,
      fullscreenOnMobile: true,
      contentClass:
        'fixed inset-0 flex flex-col h-[100dvh] max-w-none max-h-none m-0 rounded-none overflow-hidden lg:relative lg:flex-none lg:h-auto lg:max-w-[min(30rem,calc(100vw-2rem))] lg:max-h-[calc(100vh-2rem)] lg:mx-auto lg:rounded-xl lg:my-4 lg:overflow-x-auto lg:overflow-y-auto',
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
      bottomSheetOnMobile: true,
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
      time?: string
      note?: string
    }>({
      component: MarkCompletionModal,
      fullscreenOnMobile: true,
      contentClass:
        'fixed inset-0 flex flex-col h-[100dvh] max-w-none max-h-none m-0 rounded-none overflow-hidden lg:relative lg:flex-none lg:h-auto lg:max-w-[min(30rem,calc(100vw-2rem))] lg:max-h-[calc(100vh-2rem)] lg:mx-auto lg:rounded-xl lg:my-4 lg:overflow-x-auto lg:overflow-y-auto',
      props: {
        habit,
      },
      onConfirm: async (completionData?: { habitId: string; time?: string; note?: string }) => {
        if (completionData) {
          await habitStore.markCompletion(completionData)
        }
      },
    })
  }

  const selectHabit = (habit: Habit) => {
    return openModal<'edit' | 'delete'>({
      component: HabitDetailsModal,
      fullscreenOnMobile: true,
      contentClass:
        'fixed inset-0 flex flex-col h-[100dvh] max-w-none max-h-none m-0 rounded-none overflow-hidden lg:relative lg:flex-none lg:h-auto lg:max-w-[min(30rem,calc(100vw-2rem))] lg:max-h-[calc(100vh-2rem)] lg:mx-auto lg:rounded-xl lg:my-4 lg:overflow-x-auto lg:overflow-y-auto',
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
