<template>
  <TaskDetailSection :title="`Чеклист (${doneCount}/${items.length})`">
    <template #action>
      <Button
        v-if="canEdit"
        variant="link"
        size="xs"
        custom-class="TaskChecklist__AddBtn text-[11px]"
        @click="addItem"
      >
        + Добавить
      </Button>
    </template>
    <ul v-if="items.length" class="space-y-(--spacing-2)">
      <ChecklistItem
        v-for="item in items"
        :key="item.id"
        :done="item.done"
        :text="item.text"
        :can-edit="canEdit"
        @toggle="toggleItem(item.id)"
        @remove="removeItem(item.id)"
      />
      <li v-if="canEdit && showNewInput" class="pt-(--spacing-2)" @keydown.escape="showNewInput = false">
        <TaskAddFormInline
          ref="addFormRef"
          placeholder="Добавить пункт..."
          @add="commitNewItem"
          @cancel="showNewInput = false"
        />
      </li>
    </ul>
    <div v-else-if="canEdit">
      <TaskAddFormInline
        ref="addFormRef"
        placeholder="Добавить пункт..."
        @add="commitNewItem"
      />
    </div>
    <p v-else class="text-(--text-xs) text-text-muted">Нет пунктов</p>
  </TaskDetailSection>
</template>

<script setup lang="ts">
  import { ref, computed, nextTick } from 'vue'
  import { Button, ChecklistItem } from '@/shared/ui'
  import TaskDetailSection from './TaskDetailSection.vue'
  import TaskAddFormInline from './TaskAddFormInline.vue'

  export interface ChecklistItemModel {
    id: string
    text: string
    done: boolean
  }

  const props = defineProps<{
    modelValue: ChecklistItemModel[]
    canEdit?: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [items: ChecklistItemModel[]]
  }>()

  const items = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  })

  const doneCount = computed(() => items.value.filter((i) => i.done).length)

  const addFormRef = ref<InstanceType<typeof TaskAddFormInline> | null>(null)
  const showNewInput = ref(false)

  function addItem() {
    showNewInput.value = true
    nextTick(() => addFormRef.value?.focus())
  }

  function commitNewItem(text: string) {
    const t = text.trim()
    if (!t) return
    const newItem: ChecklistItemModel = {
      id: crypto.randomUUID(),
      text: t,
      done: false,
    }
    emit('update:modelValue', [...props.modelValue, newItem])
    showNewInput.value = false
  }

  function toggleItem(id: string) {
    emit(
      'update:modelValue',
      props.modelValue.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    )
  }

  function removeItem(id: string) {
    emit(
      'update:modelValue',
      props.modelValue.filter((i) => i.id !== id),
    )
  }
</script>

<style scoped>
  @media (hover: hover) {
    .TaskChecklist__AddBtn:hover {
      color: var(--color-primary-dark);
    }
  }
  @media (hover: none) {
    .TaskChecklist__AddBtn:hover {
      color: var(--color-primary-default);
    }
  }
</style>
