<template>
  <TaskDetailSection title="Связанные задачи" :placeholder="linkedTasks.length === 0 && !showAdd">
    <template #action>
      <Button
        v-if="canEdit && !showAdd"
        variant="link"
        size="xs"
        custom-class="text-[11px]"
        @click="showAdd = true"
      >
        + Добавить
      </Button>
    </template>
    <div v-if="showAdd && canEdit" class="mb-(--spacing-2) space-y-(--spacing-2)">
      <div class="flex flex-wrap items-center gap-(--spacing-2)">
        <SearchSelect
          v-model="selectedTaskId"
          :query="searchQuery"
          :options="searchResults"
          :loading="searchLoading"
          placeholder="Поиск задачи..."
          size="lg"
          :get-option-label="(item) => (item as unknown as Task).title"
          :get-item-id="(t) => t.id"
          class="flex-1 min-w-[12rem]"
          @update:query="searchQuery = $event"
          @select="onSelectTask"
        />
        <Select v-model="newLinkType" :options="linkTypeOptions" size="lg" class="w-[10rem]" />
        <Button variant="ghost" size="lg" @click="cancelAdd">Отмена</Button>
      </div>
    </div>
    <div v-if="loading" class="text-(--text-xs) text-text-muted py-(--spacing-2)">Загрузка...</div>
    <ul v-else-if="linkedTasks.length" class="space-y-0 overflow-hidden">
      <li
        v-for="lt in linkedTasks"
        :key="lt.linkId"
        class="TaskLinkedSection__Item flex items-center gap-(--spacing-2) py-(--spacing-2) px-(--spacing-3) rounded-(--radius-sm) cursor-pointer group min-w-0"
        @click="$emit('view', lt)"
      >
        <span
          class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px]"
          :class="linkTypeClass(lt.linkType)"
        >
          {{ linkTypeLabel(lt.linkType) }}
        </span>
        <span class="text-(--text-xs) text-text-primary truncate flex-1">{{ lt.title }}</span>
        <PriorityBadge :priority="lt.priority" />
        <Button
          v-if="canEdit"
          variant="icon"
          size="xs"
          icon-color="danger"
          :left-icon="XMarkIcon"
          icon-only
          custom-class="TaskLinkedSection__RemoveBtn shrink-0"
          aria-label="Удалить связь"
          @click.stop="$emit('remove', lt.linkId)"
        />
      </li>
    </ul>
    <p v-else-if="!loading" class="text-(--text-xs) text-text-muted">Нет связанных задач</p>
  </TaskDetailSection>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { Button, SearchSelect, Select, type SearchSelectOption } from '@/shared/ui'
  import { XMarkIcon } from '@/shared/ui/icon'
  import { taskService } from '@/entities/task'
  import { useDebounceFn } from '@/shared/lib'
  import PriorityBadge from './PriorityBadge.vue'
  import TaskDetailSection from './TaskDetailSection.vue'
  import type { LinkedTask } from './types'
  import type { Task } from '@/entities/task'

  const props = defineProps<{
    linkedTasks: LinkedTask[]
    loading?: boolean
    canEdit?: boolean
    workspaceId: string
    currentTaskId: string
    excludeTaskIds?: string[]
  }>()

  const emit = defineEmits<{
    view: [task: LinkedTask]
    add: [linkedTaskId: string, linkType: 'blocks' | 'blocked_by']
    remove: [linkId: string]
  }>()

  const showAdd = ref(false)
  const searchQuery = ref('')
  const searchResults = ref<Task[]>([])
  const searchLoading = ref(false)
  const selectedTaskId = ref('')
  const newLinkType = ref<'blocks' | 'blocked_by'>('blocks')

  const linkTypeOptions = [
    { value: 'blocks', label: 'Блокирует' },
    { value: 'blocked_by', label: 'Блокируется' },
  ]

  const debouncedSearch = useDebounceFn(async () => {
    if (!searchQuery.value.trim() || !props.workspaceId) {
      searchResults.value = []
      return
    }
    searchLoading.value = true
    try {
      const list = await taskService.getList({
        workspaceId: props.workspaceId,
        search: searchQuery.value.trim(),
        parentId: 'root',
      })
      const exclude = new Set([props.currentTaskId, ...(props.excludeTaskIds ?? [])])
      searchResults.value = list.filter((t) => !exclude.has(t.id))
    } catch {
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }, 300)

  watch(searchQuery, debouncedSearch)

  function onSelectTask(item: SearchSelectOption) {
    if (!item.id) return
    emit('add', item.id, newLinkType.value)
    searchQuery.value = ''
    selectedTaskId.value = ''
    searchResults.value = []
  }

  function cancelAdd() {
    showAdd.value = false
    searchQuery.value = ''
    selectedTaskId.value = ''
    searchResults.value = []
  }

  function linkTypeClass(type: string) {
    return type === 'blocks'
      ? 'bg-warning-light text-warning-default'
      : 'bg-info-light text-info-default'
  }

  function linkTypeLabel(type: string) {
    return type === 'blocks' ? 'Блокирует' : 'Блокируется'
  }
</script>

<style scoped>
  @media (hover: hover) {
    .TaskLinkedSection__Item:hover {
      background-color: var(--color-bg-tertiary);
    }
    .group:hover .TaskLinkedSection__RemoveBtn {
      opacity: 1;
    }
  }
  .TaskLinkedSection__RemoveBtn {
    opacity: 0;
  }
  @media (hover: none) {
    .TaskLinkedSection__RemoveBtn {
      opacity: 1;
    }
  }
</style>
