<template>
    <Card class="p-4 space-y-4 min-h-[500px]">
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-sm font-medium text-text-secondary">
          {{ isCreating ? 'Новая воронка' : 'Настройки воронки' }}
        </h2>
  
        <div v-if="showActions && canManage" class="flex items-center gap-2">
          <Button variant="outline" size="md" :disabled="isSaving" @click="$emit('create-new')">
            Новая
          </Button>
          <Button
            variant="ghost"
            size="md"
            class="text-error-default hover:bg-error-light"
            :disabled="isSaving"
            @click="emitDelete"
          >
            Удалить
          </Button>
        </div>
      </div>
  
      <div v-if="!canManage" class="p-3 rounded-md bg-bg-tertiary border border-border-light">
        <p class="text-xs text-text-secondary">
          {{ readonlyMessage }}
        </p>
      </div>
  
      <div
        v-if="!currentPipeline && !isCreating"
        class="text-sm text-text-secondary flex items-center justify-center h-64"
      >
        {{ emptyStateMessage }}
      </div>
  
      <form
        v-else
        :key="formKey"
        class="space-y-4"
        @submit.prevent="$emit('save')"
      >
        <slot name="form-fields" :form="form" :can-manage="canManage" :is-saving="isSaving">
          <div class="grid grid-cols-1 items-end md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
            <Input
              v-model="form.name"
              label="Название воронки"
              placeholder="Например, Основные продажи"
              :disabled="!canManage || isSaving"
              required
            />
  
            <Checkbox
              v-model="form.isDefault"
              label="Использовать по умолчанию"
              size="sm"
              :disabled="!canManage || isSaving"
            />
          </div>
        </slot>
  
        <!-- Этапы -->
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <h3 class="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Этапы воронки
            </h3>
            <Button
              v-if="canManage"
              type="button"
              variant="outline"
              size="md"
              :disabled="isSaving"
              @click="$emit('add-stage')"
            >
              Добавить этап
            </Button>
          </div>
  
          <p class="text-[11px] text-text-muted">
            {{ stagesHint }}
          </p>
  
          <DndList
            v-model="form.stages"
            item-key="id"
            tag="div"
            class="space-y-(--spacing-2)"
            :disabled="!canManage || isSaving"
            :animation="0"
            @update:modelValue="$emit('update-stages', $event)"
          >
            <template #item="{ element, index }">
              <slot name="stage-editor" :stage="normalizeStage(element)" :index="index">
                <PipelineStageEditor
                  :stage="normalizeStage(element)"
                  :index="index"
                  :disabled="!canManage || isSaving"
                  :show-remove="canManage"
                  :remove-disabled="isSaving || form.stages.length <= 1"
                  @remove="$emit('remove-stage', index)"
                  @update:is-final="$emit('toggle-final', index, $event)"
                  @update:is-lost="$emit('toggle-lost', index, $event)"
                />
              </slot>
            </template>
          </DndList>
  
          <p v-if="validationMessage" class="text-xs text-error-default">
            {{ validationMessage }}
          </p>
        </div>
  
        <div v-if="canManage" class="flex items-center gap-3 pt-2">
          <Button 
            type="submit" 
            :loading="isSaving" 
            :disabled="!!validationMessage || isSaving"
          >
            Сохранить воронку
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            :disabled="isSaving" 
            @click="$emit('reset')"
          >
            Отменить изменения
          </Button>
        </div>
      </form>
    </Card>
  </template>
  
  <script setup lang="ts">
  import type { Pipeline } from '@/entities/deal'
  import { Card, Button, Input, Checkbox, PipelineStageEditor } from '@/shared/ui'
  import { DndList } from '@/shared/ui/Dnd'
  
  const props = defineProps<{
    form: any
    currentPipeline: Pipeline | null
    isCreating: boolean
    canManage: boolean
    isSaving: boolean
    validationMessage: string | null
    showActions?: boolean
    formKey?: string
    readonlyMessage?: string
    emptyStateMessage?: string
    stagesHint?: string
  }>()
  
  const emit = defineEmits<{
    save: []
    reset: []
    'create-new': []
    'delete': [pipeline: Pipeline]
    'add-stage': []
    'remove-stage': [index: number]
    'toggle-final': [index: number, value?: boolean]
    'toggle-lost': [index: number, value?: boolean]
    'update-stages': [stages: any[]]
  }>()

  function emitDelete() {
    if (props.currentPipeline) emit('delete', props.currentPipeline)
  }
  
  function normalizeStage(el: unknown): any {
    return el
  }
  </script>
