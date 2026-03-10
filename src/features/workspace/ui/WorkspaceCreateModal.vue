<template>
  <ModalContent title="Создать рабочее пространство" @close="$emit('close')">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <Input
        v-model="form.name"
        label="Название"
        placeholder="Введите название workspace"
        required
        :error="errors.name"
      />

      <div>
        <label class="block text-sm font-medium text-text-secondary mb-2"> Цвет </label>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="color in colors"
            :key="color"
            type="button"
            @click="form.color = color"
            class="w-8 h-8 rounded border-2 transition-all"
            :class="
              form.color === color
                ? 'border-text-primary scale-110'
                : 'border-border-default hover:border-border-hover'
            "
            :style="{ backgroundColor: color }"
          />
        </div>
      </div>

      <Textarea
        v-model="descriptionModel"
        label="Описание (необязательно)"
        placeholder="Краткое описание workspace"
        :rows="3"
      />
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button variant="outline" @click="$emit('close')" type="button"> Отмена </Button>
        <Button variant="primary" :loading="loading" @click="handleSubmit"> Создать </Button>
      </div>
    </template>
  </ModalContent>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { Button, Input, ModalContent, Textarea } from '@/shared/ui'
  import { useWorkspaceStore } from '@/entities/workspace'
  import type { CreateWorkspaceDto } from '@/entities/workspace'

  const emit = defineEmits<{
    close: []
    confirm: [workspace: unknown]
  }>()

  const workspaceStore = useWorkspaceStore()
  const loading = ref(false)
  const errors = reactive<{ name?: string }>({})

  const colors = [
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#ef4444',
    '#14b8a6',
  ]

  const form = reactive<CreateWorkspaceDto>({
    name: '',
    color: colors[0],
    description: '',
  })

  const descriptionModel = computed({
    get: () => form.description ?? '',
    set: (v: string) => {
      form.description = v
    },
  })

  const handleSubmit = async () => {
    errors.name = undefined

    if (!form.name.trim()) {
      errors.name = 'Название обязательно'
      return
    }

    loading.value = true
    try {
      const workspace = await workspaceStore.createWorkspace(form)
      emit('confirm', workspace)
      emit('close')
    } catch (error) {
      console.error('Failed to create workspace:', error)
      errors.name = 'Не удалось создать workspace'
    } finally {
      loading.value = false
    }
  }
</script>
