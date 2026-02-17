import { ref, onMounted, watch } from 'vue'
import { useWorkspaceStore } from '@/entities/workspace'
import { api, API_ENDPOINTS } from '@/shared/api'
import { formatDateRu } from '@/shared/lib'

export interface Note {
  id: string
  workspaceId: string
  userId: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export const useNotesPage = () => {
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

  function setForm(value: { title: string; content: string }) {
    form.value = value
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

  function closeDeleteModal() {
    showDeleteModal.value = false
    deleteTarget.value = null
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
    return formatDateRu(s, 'd MMM yyyy')
  }

  onMounted(fetchNotes)
  watch(() => workspaceStore.currentWorkspace?.id, fetchNotes)

  return {
    notes,
    loading,
    saving,
    showModal,
    showDeleteModal,
    editingId,
    deleteTarget,
    form,
    fetchNotes,
    openCreate,
    openEdit,
    closeModal,
    closeDeleteModal,
    setForm,
    saveNote,
    confirmDelete,
    doDelete,
    formatDate,
  }
}
