<template>
  <BasePageLayout title="Заметки">
    <template #header-actions>
      <Button variant="primary" @click="openCreate">
        <PlusIcon class="w-4 h-4 mr-2 inline" />
        Новая заметка
      </Button>
    </template>

    <template #content>
      <div v-if="loading" class="text-gray-500">Загрузка...</div>
      <NotesEmptyState v-else-if="notes.length === 0" @add-note="openCreate" />
      <NotesList
        v-else
        :notes="notes"
        :format-date="formatDate"
        @edit-note="openEdit"
        @delete-note="confirmDelete"
      />
    </template>

    <template #modals>
      <NoteFormModal
        :is-open="showModal"
        :is-edit="!!editingId"
        :form="form"
        :saving="saving"
        @update:is-open="showModal = $event"
        @update:form="setForm"
        @close="closeModal"
        @save="saveNote"
      />

      <Modal
        :is-open="showDeleteModal"
        content-class="bg-white rounded-xl shadow-lg"
        @update:is-open="showDeleteModal = $event"
      >
        <ConfirmModal
          title="Удалить заметку?"
          :message="deleteTarget ? `«${deleteTarget.title}» будет удалена.` : ''"
          confirm-text="Удалить"
          confirm-variant="danger"
          @close="closeDeleteModal"
          @confirm="doDelete"
        />
      </Modal>
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
  import { BasePageLayout } from '@/shared/ui/common'
  import { Modal, ConfirmModal, Button } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'
  import { NotesList, NotesEmptyState, NoteFormModal } from '@/features/notes/ui'
  import { useNotesPage } from '@/features/notes/model'

  const {
    notes,
    loading,
    saving,
    showModal,
    showDeleteModal,
    editingId,
    deleteTarget,
    form,
    openCreate,
    openEdit,
    closeModal,
    closeDeleteModal,
    setForm,
    saveNote,
    confirmDelete,
    doDelete,
    formatDate,
  } = useNotesPage()
</script>
