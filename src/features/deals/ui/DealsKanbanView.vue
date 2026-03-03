<template>
  <div class="space-y-4">
    <div v-if="isLoading" class="flex justify-center py-12">
      <Spinner class="size-8 text-primary-default" />
    </div>
    <div v-else-if="isError" class="text-center py-8 text-danger-default">
      Ошибка загрузки сделок.
    </div>
    <div v-else-if="columnsModel.length === 0" class="text-center py-12 text-text-muted">
      Нет этапов воронки или выберите воронку.
    </div>
    <KanbanBoard
      v-else
      :columns="columnsModel"
      @update:columns="(v) => (columnsModel = v as KanbanColumnModel<Deal>[])"
      :item-key="getDealId"
      dnd-group="deals"
      :disabled="false"
      @move="onMove"
    >
      <template #column-header="{ column }">
        <div class="flex items-center justify-between gap-2 w-full">
          <span class="font-medium text-text-primary">{{ column.title }}</span>
          <div class="flex items-center gap-2 text-sm text-text-muted">
            <span>{{ column.items.length }}</span>
            <span v-if="column.meta?.sum != null">
              {{ formatSum(Number(column.meta.sum)) }}
            </span>
          </div>
        </div>
      </template>
      <template #card="{ item }">
        <DealKanbanCard
          :deal="getDeal(item)"
          :company-or-contact-name="getCompanyOrContact(getDeal(item))"
          :saving="savingDealIdsSet.has(getDeal(item).id)"
          @click="$emit('open-deal', getDeal(item))"
          @context-menu="onCardContextMenu"
        />
      </template>
    </KanbanBoard>

    <div
      v-if="contextMenu.deal"
      class="fixed z-50 min-w-[160px] py-1 rounded-lg border border-border-default bg-bg-primary shadow-lg"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <button
        type="button"
        class="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary"
        @click="emit('edit', contextMenu.deal); contextMenu.deal = null"
      >
        Редактировать
      </button>
      <button
        type="button"
        class="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary"
        @click="emit('copy', contextMenu.deal); contextMenu.deal = null"
      >
        Копировать
      </button>
      <button
        v-if="showRemoveFromProject"
        type="button"
        class="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary"
        @click="contextMenu.deal && (emit('remove-from-project', contextMenu.deal), contextMenu.deal = null)"
      >
        Убрать из проекта
      </button>
      <button
        type="button"
        class="w-full px-4 py-2 text-left text-sm text-danger-default hover:bg-bg-tertiary"
        @click="emit('delete', contextMenu.deal); contextMenu.deal = null"
      >
        Удалить
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue'
  import { KanbanBoard, Spinner } from '@/shared/ui'
  import DealKanbanCard from './DealKanbanCard.vue'
  import type { Deal, Pipeline } from '@/entities/deal'
  import type { KanbanColumnModel } from '@/shared/ui'

  function getDeal(item: unknown): Deal {
    return item as Deal
  }
  function getDealId(d: unknown): string {
    return (d as Deal).id
  }

  const props = withDefaults(
    defineProps<{
      pipelines: Pipeline[]
      isLoading: boolean
      isError: boolean
      savingDealIds?: Set<string>
      showRemoveFromProject?: boolean
    }>(),
    { showRemoveFromProject: false },
  )

  const savingDealIdsSet = computed(() => props.savingDealIds ?? new Set())

  const columnsModel = defineModel<KanbanColumnModel<Deal>[]>('columns', { required: true })

  const emit = defineEmits<{
    move: [payload: { item: unknown; toColumnId?: string }]
    'open-deal': [deal: Deal]
    edit: [deal: Deal]
    copy: [deal: Deal]
    delete: [deal: Deal]
    'remove-from-project': [deal: Deal]
  }>()

  const contextMenu = reactive<{ x: number; y: number; deal: Deal | null }>({
    x: 0,
    y: 0,
    deal: null,
  })

  function onMove(payload: { item: unknown; toColumnId?: string }) {
    emit('move', payload)
  }

  function onCardContextMenu(evt: MouseEvent, deal: Deal) {
    console.log('env', deal);
    
    contextMenu.x = evt.clientX
    contextMenu.y = evt.clientY
    contextMenu.deal = deal
  }

  function getCompanyOrContact(_deal: Deal): string {
    console.log('env', _deal);

    return '—'
  }

  function formatSum(sum: number): string {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(sum) + ' ₽'
  }

</script>
