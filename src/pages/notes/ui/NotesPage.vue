<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Заметки</h1>
      <Button variant="primary" @click="openCreate">
        <PlusIcon class="w-4 h-4 mr-2 inline" />
        Новая заметка
      </Button>
    </div>

    <div v-if="loading" class="text-gray-500">Загрузка...</div>
    <div v-else-if="notes.length === 0" class="text-gray-500 py-8">
      Нет заметок. Создайте первую.
    </div>
    <ul v-else class="space-y-3">
      <li
        v-for="note in notes"
        :key="note.id"
        class="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 flex justify-between items-start gap-4"
      >
        <div class="min-w-0 flex-1 cursor-pointer" @click="openEdit(note)">
          <h3 class="font-medium text-gray-900 truncate">{{ note.title }}</h3>
          <p v-if="note.content" class="mt-1 text-sm text-gray-600 line-clamp-2">{{ note.content }}</p>
          <p class="mt-1 text-xs text-gray-400">{{ formatDate(note.updatedAt) }}</p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" @click="openEdit(note)">Изменить</Button>
          <Button variant="ghost" size="sm" class="text-red-600" @click="confirmDelete(note)">
            Удалить
          </Button>
        </div>
      </li>
    </ul>

    <Modal :is-open="showModal" @update:is-open="showModal = $event">
      <form class="p-6 space-y-4" @submit.prevent="saveNote">
        <h2 class="text-lg font-semibold">{{ editingId ? 'Редактировать заметку' : 'Новая заметка' }}</h2>
        <input
          v-model="form.title"
          type="text"
          placeholder="Заголовок"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
        <textarea
          v-model="form.content"
          placeholder="Текст (необязательно)"
          class="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
          rows="4"
        />
        <div class="flex justify-end gap-2">
          <Button type="button" variant="outline" @click="closeModal">Отмена</Button>
          <Button type="submit" variant="primary" :loading="saving">Сохранить</Button>
        </div>
      </form>
    </Modal>

    <Modal :is-open="showDeleteModal" @update:is-open="showDeleteModal = $event">
      <ConfirmModal
        title="Удалить заметку?"
        :message="deleteTarget ? `«${deleteTarget.title}» будет удалена.` : ''"
        confirm-text="Удалить"
        confirm-variant="danger"
        @close="deleteTarget = null; showDeleteModal = false"
        @confirm="doDelete"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useWorkspaceStore } from '@/entities/workspace'
import { api, API_ENDPOINTS } from '@/shared/api'
import { Button, Modal, ConfirmModal } from '@/shared/ui'
import { PlusIcon } from '@/shared/ui/icon'

interface Note {
  id: string
  workspaceId: string
  userId: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

const workspaceStore = useWorkspaceStore()
const notes = ref<Note[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingId = ref<string | null>(null)
const deleteTarget = ref<Note | null>(null)
const form = ref({ title: '', content: '' })

function getWorkspaceId(): string | null {
  return workspaceStore.currentWorkspace?.id ?? null
}

async function fetchNotes() {
  const wsId = getWorkspaceId()
  if (!wsId) {
    notes.value = []
    loading.value = false
    return
  }
  loading.value = true
  try {
    const res = await api.get<{ notes: Note[] }>(API_ENDPOINTS.WORKSPACE.NOTES(wsId))
    notes.value = res.notes ?? []
  } catch (e) {
    console.error('Failed to fetch notes:', e)
    notes.value = []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { title: '', content: '' }
  showModal.value = true
}

function openEdit(note: Note) {
  editingId.value = note.id
  form.value = { title: note.title, content: note.content ?? '' }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingId.value = null
}

async function saveNote() {
  const wsId = getWorkspaceId()
  if (!wsId) return
  saving.value = true
  try {
    if (editingId.value) {
      await api.put(API_ENDPOINTS.WORKSPACE.NOTE(wsId, editingId.value), form.value)
    } else {
      await api.post(API_ENDPOINTS.WORKSPACE.NOTES(wsId), form.value)
    }
    closeModal()
    await fetchNotes()
  } catch (e) {
    console.error('Failed to save note:', e)
  } finally {
    saving.value = false
  }
}

function confirmDelete(note: Note) {
  deleteTarget.value = note
  showDeleteModal.value = true
}

async function doDelete() {
  const note = deleteTarget.value
  const wsId = getWorkspaceId()
  if (!note || !wsId) return
  try {
    await api.delete(API_ENDPOINTS.WORKSPACE.NOTE(wsId, note.id))
    showDeleteModal.value = false
    deleteTarget.value = null
    await fetchNotes()
  } catch (e) {
    console.error('Failed to delete note:', e)
  }
}

function formatDate(s: string) {
  if (!s) return ''
  const d = new Date(s)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(fetchNotes)
watch(() => workspaceStore.currentWorkspace?.id, fetchNotes)
</script>
