<template>
  <Drawer
    :is-open="isOpen"
    title="Фильтры"
    width="md"
    show-close-button
    @close="$emit('close')"
  >
    <div class="space-y-0">
      <template v-if="pipelines.length > 1">
        <section class="FiltersSection">
          <h3 class="FiltersSection__Title">Воронка</h3>
          <div class="FiltersSection__Content">
            <Select
              :model-value="selectedPipelineId"
              :options="pipelineOptions"
              placeholder="Выберите воронку"
              size="md"
              class="w-full"
              @update:model-value="$emit('update:selectedPipelineId', $event ? String($event) : '')"
            />
          </div>
        </section>
        <div class="FiltersDivider" />
      </template>

      <section class="FiltersSection">
        <h3 class="FiltersSection__Title">Статус</h3>
        <div class="FiltersSection__Content">
          <Select
            :model-value="status"
            :options="statusOptions"
            placeholder="Все"
            size="md"
            class="w-full"
            @update:model-value="$emit('update:status', ($event ? String($event) : 'all') as DealsStatusFilter)"
          />
        </div>
      </section>

      <div class="FiltersDivider" />

      <section class="FiltersSection">
        <h3 class="FiltersSection__Title">Период</h3>
        <div class="FiltersSection__Content space-y-(--spacing-3)">
          <div>
            <span class="block text-(--text-xs) text-text-muted mb-(--spacing-1)">С</span>
            <DatePicker
              :model-value="dateFrom"
              placeholder="ДД.ММ.ГГГГ"
              size="md"
              class="w-full"
              @update:model-value="$emit('update:dateFrom', $event)"
            />
          </div>
          <div>
            <span class="block text-(--text-xs) text-text-muted mb-(--spacing-1)">По</span>
            <DatePicker
              :model-value="dateTo"
              placeholder="ДД.ММ.ГГГГ"
              size="md"
              class="w-full"
              @update:model-value="$emit('update:dateTo', $event)"
            />
          </div>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="flex gap-(--spacing-3)">
        <Button
          v-if="hasActiveFilters"
          variant="outline"
          class="flex-1"
          @click="$emit('reset')"
        >
          Сбросить
        </Button>
        <Button variant="primary" class="flex-1" @click="$emit('close')">
          Применить
        </Button>
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Drawer, Button, Select, DatePicker } from '@/shared/ui'
  import type { Pipeline } from '@/entities/deal'
  import type { DealsStatusFilter } from '../model/use-deals-page'

  const props = defineProps<{
    isOpen: boolean
    pipelines: Pipeline[]
    selectedPipelineId: string
    dateFrom: string
    dateTo: string
    status: DealsStatusFilter
    hasActiveFilters: boolean
  }>()

  defineEmits<{
    close: []
    reset: []
    'update:selectedPipelineId': [v: string]
    'update:dateFrom': [v: string]
    'update:dateTo': [v: string]
    'update:status': [v: DealsStatusFilter]
  }>()

  const pipelineOptions = computed(() =>
    props.pipelines.map((p) => ({ value: p.id, label: p.name })),
  )

  const statusOptions = [
    { value: 'all', label: 'Все' },
    { value: 'open', label: 'Активные' },
    { value: 'won', label: 'Успешные' },
    { value: 'lost', label: 'Проигранные' },
  ]
</script>

<style scoped>
  .FiltersSection {
    padding-top: var(--spacing-4);
    padding-bottom: var(--spacing-4);
  }

  .FiltersSection:first-child {
    padding-top: 0;
  }

  .FiltersSection__Title {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-2);
  }

  .FiltersSection__Content {
    color: var(--color-text-primary);
  }

  .FiltersDivider {
    height: 1px;
    background-color: var(--color-border-light);
  }
</style>
