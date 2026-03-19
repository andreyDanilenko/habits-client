<template>
  <TaskDetailSection title="Теги">
    <template #action>
      <Button
        v-if="canEdit"
        variant="link"
        size="xs"
        custom-class="TaskTagsSection__AddBtn text-[11px]"
        @click="showAdd = true"
      >
        + Добавить
      </Button>
    </template>
    <div v-if="showAdd && canEdit" class="mb-(--spacing-2)">
      <TaskAddFormInline
        ref="addFormRef"
        placeholder="Введите тег..."
        :can-commit="(v) => !!v.trim() && !tags.includes(v.trim())"
        @add="addTag"
        @cancel="showAdd = false"
      />
    </div>
    <div v-if="tags.length" class="flex flex-wrap gap-(--spacing-1)">
      <Tag
        v-for="tag in tags"
        :key="tag"
        size="sm"
        :label="tag"
        :removable="!!canEdit"
        remove-aria-label="Удалить тег"
        @remove="removeTag(tag)"
      />
    </div>
    <p v-else class="text-(--text-xs) text-text-muted">Нет тегов</p>
  </TaskDetailSection>
</template>

<script setup lang="ts">
  import { ref, watch, nextTick } from 'vue'
  import { Button, Tag } from '@/shared/ui'
  import TaskDetailSection from './TaskDetailSection.vue'
  import TaskAddFormInline from './TaskAddFormInline.vue'

  const props = defineProps<{
    modelValue: string[]
    canEdit?: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [tags: string[]]
  }>()

  const showAdd = ref(false)
  const addFormRef = ref<InstanceType<typeof TaskAddFormInline> | null>(null)

  const tags = ref<string[]>([...(props.modelValue ?? [])])

  watch(
    () => props.modelValue,
    (v) => { tags.value = [...(v ?? [])] },
    { immediate: true },
  )

  function addTag(value: string) {
    const t = value.trim()
    if (!t || tags.value.includes(t)) return
    const next = [...tags.value, t]
    tags.value = next
    emit('update:modelValue', next)
    showAdd.value = false
  }

  function removeTag(tag: string) {
    const next = tags.value.filter((t) => t !== tag)
    tags.value = next
    emit('update:modelValue', next)
  }

  watch(showAdd, (v) => {
    if (v) nextTick(() => addFormRef.value?.focus())
  })
</script>

<style scoped>
  @media (hover: hover) {
    .TaskTagsSection__AddBtn:hover {
      color: var(--color-primary-dark);
    }
  }
  @media (hover: none) {
    .TaskTagsSection__AddBtn:hover {
      color: var(--color-primary-default);
    }
  }
</style>
