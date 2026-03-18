<template>
  <Modal
    :is-open="isOpen"
    :fullscreen-on-mobile="isMobile"
    :content-class="
      isMobile
        ? 'fixed inset-0 flex flex-col h-[100dvh] max-w-none max-h-none m-0 rounded-none overflow-hidden lg:relative lg:flex-none lg:h-auto lg:max-w-[min(32rem,calc(100vw-2rem))] lg:max-h-[calc(100vh-2rem)] lg:mx-auto lg:rounded-xl lg:my-4 lg:overflow-x-auto lg:overflow-y-auto'
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
        <div class="space-y-(--spacing-5)">
          <!-- Блок 1: Основное -->
          <section class="TaskFormSection">
            <h3 class="TaskFormSection__Title">Основное</h3>
            <div class="space-y-(--spacing-4)">
              <div>
                <label
                  class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
                >
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
                <label
                  class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)"
                >
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
                <label
                  class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
                >
                  Описание
                </label>
                <Textarea
                  v-model="form.description"
                  placeholder="Markdown поддерживается"
                  :rows="3"
                  resize="none"
                />
              </div>
              <div v-if="editingTask">
                <label
                  class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
                >
                  Статус
                </label>
                <Select v-model="form.status" :options="statusOptions" />
              </div>
              <div>
                <label
                  class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
                >
                  Исполнитель
                </label>
                <Select v-model="form.assigneeId" :options="assigneeOptions" />
              </div>
            </div>
          </section>

          <!-- Блок 2: Планирование -->
          <section class="TaskFormSection">
            <h3 class="TaskFormSection__Title">Планирование</h3>
            <div class="space-y-(--spacing-4)">
              <div>
                <label
                  class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
                >
                  Срок <span class="text-error-default">*</span>
                </label>
                <DatePicker v-model="form.dueDate" />
              </div>
              <div>
                <label
                  class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)"
                >
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
                <label
                  class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
                >
                  Оценка времени (мин)
                </label>
                <Input v-model="form.duration" type="number" min="0" placeholder="Например: 60" />
              </div>
            </div>
          </section>

          <!-- Блок 3: Организация (collapsible) -->
          <div class="border border-border-default rounded-(--radius-md) overflow-hidden">
            <button
              type="button"
              class="w-full flex items-center justify-between px-(--spacing-4) py-(--spacing-3) text-left text-(--text-sm) font-medium text-text-primary hover:bg-bg-tertiary transition-colors"
              @click="showOrganization = !showOrganization"
            >
              <span>Организация</span>
              <ChevronDownIcon
                class="w-5 h-5 text-text-muted transition-transform"
                :class="{ 'rotate-180': showOrganization }"
              />
            </button>
            <div
              v-show="showOrganization"
              class="px-(--spacing-4) pb-(--spacing-4) pt-0 space-y-(--spacing-4) border-t border-border-light"
            >
              <div
                class="rounded-(--radius-sm) bg-bg-tertiary/50 p-(--spacing-3) text-(--text-sm) text-text-muted"
              >
                <span class="font-medium text-text-secondary">Теги</span> — скоро
              </div>
              <div
                class="rounded-(--radius-sm) bg-bg-tertiary/50 p-(--spacing-3) text-(--text-sm) text-text-muted"
              >
                <span class="font-medium text-text-secondary">Чеклист</span> — скоро
              </div>
              <div
                class="rounded-(--radius-sm) bg-bg-tertiary/50 p-(--spacing-3) text-(--text-sm) text-text-muted"
              >
                <span class="font-medium text-text-secondary">Вложения</span> — скоро
              </div>
            </div>
          </div>

          <!-- Блок 4: Кастомные поля (collapsible) -->
          <div class="border border-border-default rounded-(--radius-md) overflow-hidden">
            <button
              type="button"
              class="w-full flex items-center justify-between px-(--spacing-4) py-(--spacing-3) text-left text-(--text-sm) font-medium text-text-primary hover:bg-bg-tertiary transition-colors"
              @click="showCustomFields = !showCustomFields"
            >
              <span>Кастомные поля</span>
              <ChevronDownIcon
                class="w-5 h-5 text-text-muted transition-transform"
                :class="{ 'rotate-180': showCustomFields }"
              />
            </button>
            <div
              v-show="showCustomFields"
              class="px-(--spacing-4) pb-(--spacing-4) pt-0 border-t border-border-light"
            >
              <p class="text-(--text-sm) text-text-muted py-(--spacing-2)">
                Поля для типа «{{ typeLabel(form.type) }}» — скоро
              </p>
            </div>
          </div>
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
  import type { Task, CreateTaskDto, TaskStatus } from '@/entities/task'

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

  const statusOptions: { value: string; label: string }[] = [
    { value: 'pending', label: 'К выполнению' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'completed', label: 'Выполнена' },
    { value: 'cancelled', label: 'Отменена' },
  ]

  const form = ref({
    title: '',
    description: '',
    type: 'task' as CreateTaskDto['type'],
    priority: 'medium' as CreateTaskDto['priority'],
    status: 'pending' as TaskStatus,
    dueDate: '',
    assigneeId: '',
    duration: '',
  })

  const showOrganization = ref(false)
  const showCustomFields = ref(false)
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

  function typeLabel(type: string) {
    const map: Record<string, string> = {
      task: 'Задача',
      bug: 'Ошибка',
      feature: 'Функция',
      meeting: 'Встреча',
      call: 'Звонок',
      email: 'Email',
      lunch: 'Обед',
      other: 'Другое',
    }
    return map[type] ?? type
  }

  watch(
    () => [props.isOpen, props.editingTask, props.parentId],
    () => {
      if (props.editingTask) {
        form.value = {
          title: props.editingTask.title,
          description: props.editingTask.description ?? '',
          type: props.editingTask.type as CreateTaskDto['type'],
          priority: props.editingTask.priority as CreateTaskDto['priority'],
          status: (props.editingTask.status ?? 'pending') as TaskStatus,
          dueDate: props.editingTask.dueDate?.slice(0, 10) ?? '',
          assigneeId: props.editingTask.assigneeId,
          duration: props.editingTask.duration != null ? String(props.editingTask.duration) : '',
        }
      } else {
        const today = new Date().toISOString().slice(0, 10)
        form.value = {
          title: '',
          description: '',
          type: 'task',
          priority: 'medium',
          status: 'pending',
          dueDate: today,
          assigneeId: props.defaultAssigneeId,
          duration: '',
        }
      }
    },
    { immediate: true },
  )

  function handleSubmit() {
    if (!form.value.title || !form.value.dueDate) return
    const payload: Partial<CreateTaskDto & { status?: string; duration?: number }> = {
      title: form.value.title,
      description: form.value.description,
      type: form.value.type,
      priority: form.value.priority,
      dueDate: form.value.dueDate,
      assigneeId: form.value.assigneeId || props.defaultAssigneeId,
    }
    if (props.parentId) payload.parentId = props.parentId
    if (form.value.status) payload.status = form.value.status
    const dur = Number(form.value.duration)
    if (!Number.isNaN(dur) && dur > 0) payload.duration = dur
    emit('save', payload)
  }
</script>

<style scoped>
  .rotate-180 {
    transform: rotate(180deg);
  }

  .TaskFormSection {
    padding-bottom: var(--spacing-4);
    border-bottom: 1px solid var(--color-border-light);
  }

  .TaskFormSection:last-of-type {
    border-bottom: none;
  }

  .TaskFormSection__Title {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    margin-bottom: var(--spacing-3);
  }
</style>
