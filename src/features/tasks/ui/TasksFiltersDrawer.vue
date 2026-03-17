<template>
  <Drawer
    :is-open="isOpen"
    title="Фильтры"
    width="md"
    show-close-button
    @close="$emit('close')"
  >
    <div class="space-y-0">
      <!-- Секция: Статус -->
      <section class="FiltersSection">
        <h3 class="FiltersSection__Title">Статус</h3>
        <div class="FiltersSection__Content">
          <Select
            :model-value="statusFilter"
            :options="statusOptions"
            placeholder="Все статусы"
            size="md"
            class="w-full"
            @update:model-value="$emit('update:statusFilter', $event ? String($event) : '')"
          />
        </div>
      </section>

      <!-- Разделитель -->
      <div class="FiltersDivider" />

      <!-- Секция: Тип -->
      <section class="FiltersSection">
        <h3 class="FiltersSection__Title">Тип</h3>
        <div class="FiltersSection__Content">
          <Select
            :model-value="typeFilter"
            :options="typeOptions"
            placeholder="Все типы"
            size="md"
            class="w-full"
            @update:model-value="$emit('update:typeFilter', $event ? String($event) : '')"
          />
        </div>
      </section>

      <!-- Разделитель -->
      <div class="FiltersDivider" />

      <!-- Секция: Приоритет -->
      <section class="FiltersSection">
        <h3 class="FiltersSection__Title">Приоритет</h3>
        <div class="FiltersSection__Content">
          <Select
            :model-value="priorityFilter"
            :options="priorityOptions"
            placeholder="Все приоритеты"
            size="md"
            class="w-full"
            @update:model-value="$emit('update:priorityFilter', $event ? String($event) : '')"
          />
        </div>
      </section>

      <!-- Разделитель -->
      <div class="FiltersDivider" />

      <!-- Секция: Исполнитель -->
      <section class="FiltersSection">
        <h3 class="FiltersSection__Title">Исполнитель</h3>
        <div class="FiltersSection__Content">
          <Select
            :model-value="assigneeFilter"
            :options="assigneeOptions"
            placeholder="Все исполнители"
            size="md"
            class="w-full"
            @update:model-value="$emit('update:assigneeFilter', $event ? String($event) : '')"
          />
        </div>
      </section>

      <!-- Разделитель -->
      <div class="FiltersDivider" />

      <!-- Секция: Быстрые фильтры -->
      <section class="FiltersSection">
        <h3 class="FiltersSection__Title">Быстрые фильтры</h3>
        <div class="FiltersSection__Content space-y-(--spacing-3)">
          <Checkbox
            :model-value="myTasksOnly"
            label="Мои задачи"
            size="md"
            container-class="items-center"
            @update:model-value="$emit('update:myTasksOnly', $event)"
          />
          <Checkbox
            :model-value="overdueOnly"
            label="Просроченные"
            size="md"
            container-class="items-center"
            @update:model-value="$emit('update:overdueOnly', $event)"
          />
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
  import { Drawer, Button, Select, Checkbox } from '@/shared/ui'

  defineProps<{
    isOpen: boolean
    statusFilter: string
    typeFilter: string
    priorityFilter: string
    assigneeFilter: string
    myTasksOnly: boolean
    overdueOnly: boolean
    statusOptions: { value: string; label: string }[]
    typeOptions: { value: string; label: string }[]
    priorityOptions: { value: string; label: string }[]
    assigneeOptions: { value: string; label: string }[]
    hasActiveFilters: boolean
  }>()

  defineEmits<{
    close: []
    reset: []
    'update:statusFilter': [v: string]
    'update:typeFilter': [v: string]
    'update:priorityFilter': [v: string]
    'update:assigneeFilter': [v: string]
    'update:myTasksOnly': [v: boolean]
    'update:overdueOnly': [v: boolean]
  }>()
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
