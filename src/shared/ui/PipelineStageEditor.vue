<template>
  <div
    class="flex flex-col gap-(--spacing-2) rounded-(--radius-md) border border-border-default bg-bg-secondary px-(--spacing-3) py-(--spacing-2)"
  >
    <div class="flex items-center gap-(--spacing-2) cursor-grab">
      <div class="flex items-center gap-(--spacing-2) shrink-0">
        <MenuIcon size="md" class="text-text-muted hover:text-text-secondary transition-colors" />
        <div
          class="h-(--size-6) w-1.5 shrink-0 rounded-(--radius-full)"
          :style="{ backgroundColor: stage.color || '#94A3B8' }"
        />
      </div>

      <Input
        v-model="stage.name"
        type="text"
        size="xs"
        :placeholder="placeholder"
        :disabled="disabled"
        class="flex-1 min-w-0"
      />

      <div class="flex items-center gap-1 shrink-0">
        <Input
          :model-value="String(stage.probability)"
          type="number"
          size="xs"
          :disabled="disabled"
          class="w-16 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          @update:model-value="onProbabilityInput"
        />
        <span class="text-(--text-xs) text-text-muted">%</span>
      </div>

      <input
        v-model="stage.color"
        type="color"
        class="h-7 w-10 cursor-pointer shrink-0 rounded-(--radius-md) border border-border-default bg-bg-primary focus:outline-none focus:ring-2 focus:ring-primary-default focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="disabled"
      />
    </div>

    <div
      class="flex items-center justify-between gap-(--spacing-3) text-(--text-xs) text-text-muted"
    >
      <div class="flex items-center gap-(--spacing-3)">
        <button
          type="button"
          class="flex items-center gap-1 text-left text-(--text-xs)"
          :class="[disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer']"
          :disabled="disabled"
          @click="toggleFinal"
        >
          <span
            :class="[
              'inline-flex items-center justify-center rounded-full border shrink-0',
              'w-4 h-4',
              stage.isFinal
                ? 'bg-primary-default border-primary-default'
                : 'bg-bg-primary border-border-default',
            ]"
          >
            <span v-if="stage.isFinal" class="w-2 h-2 rounded-full bg-white" />
          </span>
          <span>Финальный этап (успех)</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-1 text-left text-(--text-xs)"
          :class="[disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer']"
          :disabled="disabled"
          @click="toggleLost"
        >
          <span
            :class="[
              'inline-flex items-center justify-center rounded-full border shrink-0',
              'w-4 h-4',
              stage.isLost
                ? 'bg-error-default border-error-default'
                : 'bg-bg-primary border-error-default',
            ]"
          >
            <span v-if="stage.isLost" class="w-2 h-2 rounded-full bg-white" />
          </span>
          <span>Этап проигрыша</span>
        </button>
      </div>

      <Button
        v-if="showRemove"
        type="button"
        variant="ghost"
        size="xs"
        class="text-error-default hover:bg-error-light"
        :disabled="removeDisabled"
        @click="$emit('remove')"
      >
        Удалить
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import Input from './Input.vue'
  import Button from './Button.vue'
  import { MenuIcon } from './icon'

  export interface PipelineStage {
    id?: string
    name: string
    probability: number
    color?: string
    isFinal: boolean
    isLost: boolean
  }

  const props = withDefaults(
    defineProps<{
      stage: PipelineStage
      index: number
      disabled?: boolean
      showRemove?: boolean
      removeDisabled?: boolean
    }>(),
    {
      disabled: false,
      showRemove: true,
      removeDisabled: false,
    },
  )

  defineEmits<{
    remove: []
    'update:isFinal': [value: boolean]
    'update:isLost': [value: boolean]
  }>()

  const placeholder = computed(() => `Этап ${props.index + 1}`)

  function onProbabilityInput(value: string) {
    const n = Number(value)
    if (!Number.isNaN(n)) {
      props.stage.probability = Math.min(100, Math.max(0, Math.round(n)))
    }
  }

  function toggleFinal() {
    if (props.disabled) return
    const next = !props.stage.isFinal
    ;(props.stage as PipelineStage).isFinal = next
    ;(props.stage as PipelineStage).isLost = next ? false : props.stage.isLost
  }

  function toggleLost() {
    if (props.disabled) return
    const next = !props.stage.isLost
    ;(props.stage as PipelineStage).isLost = next
    ;(props.stage as PipelineStage).isFinal = next ? false : props.stage.isFinal
  }
</script>
