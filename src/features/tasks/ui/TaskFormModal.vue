<template>
  <Modal
    :is-open="isOpen"
    :fullscreen-on-mobile="isMobile"
    :content-class="
      isMobile
        ? 'fixed inset-0 flex flex-col h-[100dvh] max-w-none max-h-none m-0 rounded-none overflow-hidden lg:relative lg:flex-none lg:h-auto lg:max-w-[min(30rem,calc(100vw-2rem))] lg:max-h-[calc(100vh-2rem)] lg:mx-auto lg:rounded-xl lg:my-4 lg:overflow-x-auto lg:overflow-y-auto'
        : ''
    "
    @close="$emit('close')"
  >
    <ModalContent
      :title="editingTask ? 'Редактировать задачу' : parentId ? 'Новая подзадача' : 'Новая задача'"
      :description="editingTask ? undefined : 'Создайте задачу и назначьте исполнителя'"
      :fullscreen-on-mobile="isMobile"
      :show-close-button="true"
      @close="$emit('close')"
    >
      <form id="task-form" @submit.prevent="handleSubmit" class="flex flex-col min-h-0">
        <div class="space-y-(--spacing-4) lg:space-y-(--spacing-5)">
          <div>
            <label class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
              Название <span class="text-error-default">*</span>
            </label>
            <Input
              v-model="form.title"
              type="text"
              required
              maxlength="500"
              placeholder="Название задачи"
              :class="isMobile ? 'text-base' : ''"
            />
          </div>

          <div>
            <label class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">
              Тип
            </label>
            <div class="flex flex-wrap gap-(--spacing-2) min-h-[44px]">
              <SelectButton
                v-for="opt in typeOptions"
                :key="opt.value"
                :is-selected="form.type === opt.value"
                :label="opt.label"
                custom-class="min-h-[44px] md:!min-h-0"
                @click="form.type = opt.value as CreateTaskDto['type']"
              />
            </div>
          </div>

          <div>
            <label class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">
              Приоритет
            </label>
            <div class="flex flex-wrap gap-(--spacing-2) min-h-[44px]">
              <SelectButton
                v-for="opt in priorityOptions"
                :key="opt.value"
                :is-selected="form.priority === opt.value"
                :label="opt.label"
                custom-class="min-h-[44px] md:!min-h-0"
                @click="form.priority = opt.value as CreateTaskDto['priority']"
              />
            </div>
          </div>

          <div>
            <label class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
              Срок <span class="text-error-default">*</span>
            </label>
            <DatePicker v-model="form.dueDate" />
          </div>

          <!-- Collapsible "Дополнительно" (create mode) -->
          <div
            v-if="!editingTask"
            class="border border-border-default rounded-(--radius-md) overflow-hidden"
          >
            <button
              type="button"
              class="w-full flex items-center justify-between px-(--spacing-4) py-(--spacing-3) text-left text-(--text-sm) font-medium text-text-primary hover:bg-bg-tertiary transition-colors"
              @click="showAdvanced = !showAdvanced"
            >
              <span>Дополнительно</span>
              <ChevronDownIcon
                class="w-5 h-5 text-text-muted transition-transform"
                :class="{ 'rotate-180': showAdvanced }"
              />
            </button>
            <div v-show="showAdvanced" class="px-(--spacing-4) pb-(--spacing-4) pt-0 space-y-(--spacing-4) border-t border-border-light">
              <div>
                <label class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
                  Описание
                </label>
                <Textarea v-model="form.description" placeholder="Описание" :rows="2" resize="none" />
              </div>
              <div>
                <label class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
                  Исполнитель
                </label>
                <Select v-model="form.assigneeId" :options="assigneeOptions" />
              </div>
            </div>
          </div>

          <!-- Editing: show all fields -->
          <template v-if="editingTask">
            <div>
              <label class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
                Описание
              </label>
              <Textarea v-model="form.description" placeholder="Описание" :rows="2" resize="none" />
            </div>
            <div>
              <label class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
                Исполнитель
              </label>
              <Select v-model="form.assigneeId" :options="assigneeOptions" />
            </div>
          </template>
        </div>
      </form>

      <template #footer>
        <div
          class="grid gap-(--spacing-3)"
          :class="isMobile ? 'grid-cols-2' : 'grid-cols-[1fr_auto]'"
        >
          <Button type="button" variant="outline" class="w-full" @click="$emit('close')">
            Отмена
          </Button>
          <Button form="task-form" type="submit" :loading="saving">
            {{ editingTask ? 'Сохранить' : 'Создать задачу' }}
          </Button>
        </div>
      </template>
    </ModalContent>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted } from 'vue'
  import {
    Modal,
    ModalContent,
    Button,
    Input,
    Textarea,
    DatePicker,
    Select,
    SelectButton,
  } from '@/shared/ui'
  import { ChevronDownIcon } from '@/shared/ui/icon'
  import type { Task, CreateTaskDto } from '@/entities/task'

  const props = defineProps<{
    isOpen: boolean
    editingTask: Task | null
    assigneeOptions: { value: string; label: string }[]
    defaultAssigneeId: string
    parentId?: string
    saving: boolean
  }>()

  const emit = defineEmits<{
    close: []
    save: [form: Partial<CreateTaskDto>]
  }>()

  const typeOptions: { value: string; label: string }[] = [
    { value: 'task', label: 'Задача' },
    { value: 'bug', label: 'Ошибка' },
    { value: 'feature', label: 'Функция' },
    { value: 'meeting', label: 'Встреча' },
    { value: 'call', label: 'Звонок' },
    { value: 'other', label: 'Другое' },
  ]

  const priorityOptions: { value: string; label: string }[] = [
    { value: 'low', label: 'Низкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'high', label: 'Высокий' },
    { value: 'critical', label: 'Критический' },
  ]

  const form = ref({
    title: '',
    description: '',
    type: 'task' as CreateTaskDto['type'],
    priority: 'medium' as CreateTaskDto['priority'],
    dueDate: '',
    assigneeId: '',
  })

  const showAdvanced = ref(false)
  const isMobile = ref(false)

  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  watch(
    () => [props.isOpen, props.editingTask, props.parentId],
    () => {
      if (props.editingTask) {
        form.value = {
          title: props.editingTask.title,
          description: props.editingTask.description ?? '',
          type: props.editingTask.type as CreateTaskDto['type'],
          priority: props.editingTask.priority as CreateTaskDto['priority'],
          dueDate: props.editingTask.dueDate?.slice(0, 10) ?? '',
          assigneeId: props.editingTask.assigneeId,
        }
      } else {
        const today = new Date().toISOString().slice(0, 10)
        form.value = {
          title: '',
          description: '',
          type: 'task',
          priority: 'medium',
          dueDate: today,
          assigneeId: props.defaultAssigneeId,
        }
      }
    },
    { immediate: true },
  )

  function handleSubmit() {
    if (!form.value.title || !form.value.dueDate) return
    const payload: Partial<CreateTaskDto> = {
      ...form.value,
      assigneeId: form.value.assigneeId || props.defaultAssigneeId,
    }
    if (props.parentId) payload.parentId = props.parentId
    emit('save', payload)
  }
</script>

<style scoped>
  .rotate-180 {
    transform: rotate(180deg);
  }
</style>
