<template>
  <div class="space-y-4">
    <h2 class="text-lg font-semibold text-text-primary">Привязать контакт</h2>
    <p class="text-sm text-text-secondary">
      Выберите существующий контакт, который нужно привязать к компании.
    </p>
    <input
      v-model="search"
      type="text"
      class="w-full px-3 py-2 border rounded-md border-border-default bg-bg-primary text-sm"
      placeholder="Поиск по имени или email"
    />
    <div class="max-h-64 overflow-y-auto border border-border-light rounded-md">
      <ul v-if="!loading && candidates.length" class="divide-y divide-border-light">
        <li
          v-for="c in candidates"
          :key="c.id"
          class="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-bg-tertiary"
          @click="selectedId = c.id"
        >
          <input type="radio" class="shrink-0" :value="c.id" v-model="selectedId" />
          <div class="min-w-0">
            <p class="text-sm text-text-primary truncate">
              {{ contactDisplayName(c) }}
            </p>
            <p class="text-xs text-text-muted truncate">
              {{ c.emails?.[0]?.address ?? c.phones?.[0]?.number ?? '—' }}
            </p>
          </div>
        </li>
      </ul>
      <div v-else-if="loading" class="p-3 text-sm text-text-muted">Загрузка…</div>
      <div v-else class="p-3 text-sm text-text-muted">Контакты не найдены.</div>
    </div>
    <div class="flex justify-end gap-2">
      <Button size="md" variant="ghost" @click="$emit('close')">Отмена</Button>
      <Button
        size="md"
        variant="primary"
        :disabled="!selectedId || !workspaceId"
        @click="onConfirm"
      >
        Привязать
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { Button } from '@/shared/ui'
  import { contactService } from '@/entities/contact'
  import type { Contact } from '@/entities/contact'

  const props = defineProps<{
    workspaceId: string
    isOpen: boolean
  }>()

  const emit = defineEmits<{
    close: []
    confirm: [contactId: string]
  }>()

  const search = ref('')
  const candidates = ref<Contact[]>([])
  const loading = ref(false)
  const selectedId = ref<string | null>(null)

  watch(
    () => props.isOpen,
    (open) => {
      if (open) {
        search.value = ''
        selectedId.value = null
        void loadCandidates()
      }
    },
    { immediate: true },
  )

  function contactDisplayName(contact: Contact): string {
    const n = [contact.firstName, contact.lastName].filter(Boolean).join(' ')
    return n || contact.emails?.[0]?.address || contact.id
  }

  async function loadCandidates() {
    if (!props.workspaceId) {
      candidates.value = []
      return
    }
    loading.value = true
    try {
      const res = await contactService.getList({
        workspaceId: props.workspaceId,
        search: search.value || undefined,
        limit: 50,
        page: 1,
      })
      candidates.value = res.contacts ?? []
    } catch {
      candidates.value = []
    } finally {
      loading.value = false
    }
  }

  watch(search, () => {
    if (props.isOpen) void loadCandidates()
  })

  function onConfirm() {
    if (selectedId.value) {
      emit('confirm', selectedId.value)
    }
  }
</script>
