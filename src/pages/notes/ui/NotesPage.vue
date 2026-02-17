<template>
  <div class="max-w-4xl mx-auto">
    <NotesPageHeader @add-note="openCreate" />

    <div v-if="loading" class="text-gray-500">Загрузка...</div>
    <NotesEmptyState v-else-if="notes.length === 0" @add-note="openCreate" />
    <NotesList
      v-else
      :notes="notes"
      :format-date="formatDate"
      @edit-note="openEdit"
      @delete-note="confirmDelete"
    />

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
  </div>
</template>

<script setup lang="ts">
  import { Modal, ConfirmModal } from '@/shared/ui'
  import {
    NotesPageHeader,
    NotesList,
    NotesEmptyState,
    NoteFormModal,
  } from '@/features/notes/ui'
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
