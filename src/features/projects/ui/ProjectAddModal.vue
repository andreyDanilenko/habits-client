<template>
  <Modal :is-open="isOpen" @close="$emit('close')">
    <div class="rounded-xl bg-bg-primary border border-border-default shadow-lg max-h-[80vh] flex flex-col">
      <div class="p-4 border-b border-border-default">
        <h3 class="text-lg font-medium text-text-primary">Добавить в проекты</h3>
        <p class="text-sm text-text-secondary mt-0.5">Выберите проекты, в которые добавить сущность.</p>
      </div>
      <div class="p-4 overflow-y-auto flex-1 min-h-0">
        <div v-if="loadingList" class="flex justify-center py-8">
          <Spinner />
        </div>
        <div
          v-else-if="availableProjects.length === 0"
          class="text-text-muted text-(--text-sm) py-6 text-center"
        >
          Нет проектов для добавления. Все доступные проекты уже привязаны или в воркспейсе пока нет
          проектов.
        </div>
        <ul v-else class="space-y-(--spacing-2)">
          <li v-for="p in availableProjects" :key="p.id">
            <ListOption
              :title="p.name"
              :selected="selectedIds.has(p.id)"
              @click="toggle(p.id)"
            >
              <template #leading>
                <Checkbox
                  :model-value="selectedIds.has(p.id)"
                  size="sm"
                  container-class="items-center"
                  @update:model-value="toggle(p.id)"
                />
              </template>
            </ListOption>
          </li>
        </ul>
      </div>
      <div class="p-4 border-t border-border-default flex justify-end gap-2">
        <Button variant="ghost" @click="$emit('close')">Отмена</Button>
        <Button variant="primary" :disabled="selectedIds.size === 0" @click="confirm">
          Добавить ({{ selectedIds.size }})
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { Modal, Button, Spinner, ListOption, Checkbox } from '@/shared/ui'
  import type { Project } from '@/entities/project'

  const props = defineProps<{
    isOpen: boolean
    availableProjects: Project[]
    loadingList?: boolean
  }>()

  const emit = defineEmits<{
    close: []
    add: [projectIds: string[]]
  }>()

  const selectedIds = ref<Set<string>>(new Set())

  watch(
    () => props.isOpen,
    (open) => {
      if (!open) selectedIds.value = new Set()
    },
  )

  function toggle(id: string) {
    const next = new Set(selectedIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selectedIds.value = next
  }

  function confirm() {
    if (selectedIds.value.size) {
      emit('add', Array.from(selectedIds.value))
      emit('close')
    }
  }
</script>
