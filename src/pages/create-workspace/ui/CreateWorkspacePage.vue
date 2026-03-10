<template>
  <div
    class="min-h-screen flex items-center justify-center bg-bg-secondary py-(--spacing-12) px-(--spacing-4)"
  >
    <div class="max-w-md w-full space-y-(--spacing-8)">
      <div class="text-center">
        <div class="mx-auto flex justify-center">
          <Logo :size="48" />
        </div>
        <h1 class="text-text-primary mt-(--spacing-6)">Создайте рабочее пространство</h1>
        <p class="mt-(--spacing-2) text-(--text-sm) text-text-secondary">
          У вас пока нет workspace. Создайте своё или дождитесь приглашения.
        </p>
      </div>

      <Card class="p-(--spacing-8)">
        <form @submit.prevent="handleSubmit" class="space-y-(--spacing-6)">
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

          <Button type="submit" :loading="loading" class="w-full"> Создать workspace </Button>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { Card, Button, Input, Textarea } from '@/shared/ui'
  import { Logo } from '@/shared/ui/icon'
  import { useWorkspaceStore } from '@/entities/workspace'
  import type { CreateWorkspaceDto } from '@/entities/workspace'

  const router = useRouter()
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
      await workspaceStore.createWorkspace(form)
      await workspaceStore.fetchWorkspaces()
      await router.push('/habits/dashboard')
    } catch (error) {
      console.error('Failed to create workspace:', error)
      errors.name = 'Не удалось создать workspace'
    } finally {
      loading.value = false
    }
  }
</script>
