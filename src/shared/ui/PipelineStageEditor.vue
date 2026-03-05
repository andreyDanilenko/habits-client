<template>
  <div
    class="flex flex-col gap-(--spacing-2) rounded-(--radius-md) border border-border-default bg-bg-secondary px-(--spacing-3) py-(--spacing-2)"
  >
    <div class="flex items-center gap-(--spacing-2) cursor-grab">
      <div class="flex items-center gap-(--spacing-2) shrink-0">
        <MenuIcon
          size="md"
          class="text-text-muted hover:text-text-secondary transition-colors"
        />
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
        <Radio
          :key="checkboxId('final')"
          :id="checkboxId('final')"
          :model-value="stage.isFinal"
          :value="true"
          label="Финальный этап (успех)"
          size="xs"
          container-class="items-center"
          :disabled="disabled"
          @update:model-value="$emit('update:isFinal', $event)"
        />
        <Radio
          :key="checkboxId('lost')"
          :id="checkboxId('lost')"
          :model-value="stage.isLost"
          :value="true"
          label="Этап проигрыша"
          size="xs"
          error
          container-class="items-center"
          :disabled="disabled"
          @update:model-value="$emit('update:isLost', $event)"
        />
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
  import Radio from './Radio.vue'
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

  function checkboxId(suffix: string) {
    return `pipeline-stage-${props.index}-${suffix}`
  }

  function onProbabilityInput(value: string) {
    const n = Number(value)
    if (!Number.isNaN(n)) {
      props.stage.probability = Math.min(100, Math.max(0, Math.round(n)))
    }
  }
</script>
