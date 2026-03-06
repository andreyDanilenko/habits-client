<template>
  <Modal :is-open="isOpen" @close="$emit('close')">
    <div
      class="rounded-xl bg-bg-primary border border-border-default shadow-lg max-h-[80vh] flex flex-col w-full max-w-lg"
    >
      <div class="p-4 border-b border-border-default">
        <h3 class="text-lg font-medium text-text-primary">{{ title }}</h3>
        <p class="text-sm text-text-secondary mt-0.5">Выберите сущности для добавления в проект.</p>
        <input
          v-model="search"
          type="search"
          placeholder="Поиск..."
          class="mt-3 w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-default"
        />
      </div>
      <div class="p-4 overflow-y-auto flex-1 min-h-0">
        <div v-if="loading" class="flex justify-center py-8">
          <Spinner />
        </div>
        <div
          v-else-if="filteredItems.length === 0"
          class="text-text-muted text-sm py-6 text-center"
        >
          {{ search ? 'Ничего не найдено.' : 'Нет доступных сущностей для добавления.' }}
        </div>
        <ul v-else class="space-y-1">
          <li
            v-for="item in filteredItems"
            :key="item.id"
            class="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-bg-tertiary"
          >
            <input
              :id="`entity-${item.id}`"
              type="checkbox"
              :checked="selectedIds.has(item.id)"
              class="rounded border-border-default text-primary-default focus:ring-primary-default"
              @change="toggle(item.id)"
            />
            <label
              :for="`entity-${item.id}`"
              class="flex-1 cursor-pointer text-sm text-text-primary truncate"
            >
              {{ item.label }}
            </label>
          </li>
        </ul>
      </div>
      <div class="p-4 border-t border-border-default flex justify-end gap-2">
        <Button variant="ghost" @click="$emit('close')">Отмена</Button>
        <Button variant="primary" :disabled="selectedIds.size === 0" @click="confirm">
          Добавить ({{ selectedIds.size }})
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { Modal, Button, Spinner } from '@/shared/ui'
  import { contactService } from '@/entities/contact'
  import { companyService } from '@/entities/company'
  import { dealService } from '@/entities/deal'
  import type { ProjectEntityType } from '@/entities/project'

  const props = defineProps<{
    isOpen: boolean
    entityType: ProjectEntityType
    workspaceId: string
    projectId: string
    alreadyAttachedIds: string[]
  }>()

  const emit = defineEmits<{
    close: []
    add: [entityIds: string[]]
  }>()

  const search = ref('')
  const selectedIds = ref<Set<string>>(new Set())
  const items = ref<{ id: string; label: string }[]>([])
  const loading = ref(false)

  const title = computed(() => {
    const t = {
      crm_contact: 'Добавить контакты в проект',
      crm_company: 'Добавить компании в проект',
      crm_deal: 'Добавить сделки в проект',
    }
    return t[props.entityType] ?? 'Добавить в проект'
  })

  const filteredItems = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return items.value
    return items.value.filter((i) => i.label.toLowerCase().includes(q))
  })

  watch(
    () => [props.isOpen, props.entityType, props.workspaceId],
    async () => {
      if (!props.isOpen || !props.workspaceId) {
        items.value = []
        selectedIds.value = new Set()
        return
      }
      selectedIds.value = new Set()
      search.value = ''
      loading.value = true
      try {
        if (props.entityType === 'crm_contact') {
          const res = await contactService.getList({
            workspaceId: props.workspaceId,
            limit: 300,
          })
          items.value = res.contacts
            .filter((c) => !props.alreadyAttachedIds.includes(c.id))
            .map((c) => ({
              id: c.id,
              label:
                [c.firstName, c.lastName].filter(Boolean).join(' ') ||
                c.emails?.[0]?.address ||
                c.id,
            }))
        } else if (props.entityType === 'crm_company') {
          const res = await companyService.getList({
            workspaceId: props.workspaceId,
            limit: 300,
          })
          items.value = res.companies
            .filter((c) => !props.alreadyAttachedIds.includes(c.id))
            .map((c) => ({ id: c.id, label: c.name || c.id }))
        } else if (props.entityType === 'crm_deal') {
          const res = await dealService.getList({
            workspaceId: props.workspaceId,
            limit: 300,
          })
          items.value = res.deals
            .filter((d) => !props.alreadyAttachedIds.includes(d.id))
            .map((d) => ({ id: d.id, label: d.name || d.id }))
        } else {
          items.value = []
        }
      } catch {
        items.value = []
      } finally {
        loading.value = false
      }
    },
    { immediate: true },
  )

  watch(
    () => props.alreadyAttachedIds,
    () => {
      items.value = items.value.filter((i) => !props.alreadyAttachedIds.includes(i.id))
    },
  )

  function toggle(id: string) {
    const next = new Set(selectedIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selectedIds.value = next
  }

  function confirm() {
    if (selectedIds.value.size) {
      emit('add', Array.from(selectedIds.value))
      emit('close')
    }
  }
</script>
