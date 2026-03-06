<template>
  <div class="space-y-4">
    <div v-if="canCreate" class="flex flex-wrap items-center gap-2">
      <Button
        size="md"
        variant="outline"
        @click="
          showComposer = true;
          showCallModal = false
        "
      >
        Заметка
      </Button>
      <Button
        size="md"
        variant="outline"
        @click="
          showCallModal = true;
          showComposer = false
        "
      >
        Звонок
      </Button>
      <div class="relative">
        <Button
          size="md"
          variant="ghost"
          :class="{ 'bg-bg-tertiary': filtersVisible }"
          @click="filtersVisible = !filtersVisible"
        >
          Фильтр
          <span v-if="hasFilters" class="ml-1 text-primary-default">●</span>
        </Button>
      </div>
    </div>

    <ActivityFilters
      v-if="filtersVisible"
      :visible="filtersVisible"
      :filters="feed.filters"
      @apply="onFiltersApply"
      @reset="onFiltersReset"
      @close="filtersVisible = false"
    />

    <ActivityComposer
      v-if="canCreate && showComposer"
      :entity-type="entityType"
      :entity-id="entityId"
      @save="onSaveNote"
    />

    <div v-if="feed.loading && feed.activities.length === 0" class="space-y-3">
      <div
        v-for="i in 4"
        :key="i"
        class="rounded-xl border border-border-default bg-bg-primary p-4 animate-pulse"
      >
        <div class="flex gap-3">
          <div class="size-8 shrink-0 rounded-lg bg-bg-tertiary" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-bg-tertiary rounded w-1/3" />
            <div class="h-3 bg-bg-tertiary rounded w-full" />
            <div class="h-3 bg-bg-tertiary rounded w-2/3" />
            <div class="h-3 bg-bg-tertiary rounded w-1/4 mt-4" />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="feed.error"
      class="rounded-xl border border-border-default bg-bg-primary p-6 text-center"
    >
      <p class="text-text-secondary mb-2">Не удалось загрузить активность</p>
      <Button size="md" variant="outline" @click="feed.refetch()">Повторить</Button>
    </div>

    <EmptyState
      v-else-if="feed.isEmpty && !feed.hasFilters"
      title="Пока нет активности"
      description="Добавьте заметку или запишите звонок, чтобы начать"
      action-button-text="Добавить заметку"
      :show-icon="true"
      @action="showComposer = true"
    />

    <EmptyState
      v-else-if="feed.isEmpty && feed.hasFilters"
      title="Нет событий, соответствующих выбранным фильтрам"
      :show-clear-filters="true"
      @clear-filters="onFiltersReset"
    />

    <template v-else>
      <div class="space-y-6">
        <section v-for="group in feed.grouped" :key="group.key" class="space-y-3">
          <h3 class="text-sm font-medium text-text-muted">{{ group.label }}</h3>
          <div class="space-y-3">
            <ActivityItem
              v-for="activity in group.activities"
              :key="activity.id"
              :activity="activity"
              :show-actions="true"
              @toggle-important="feed.toggleImportant(activity.id)"
              @edit="openEditNote(activity)"
              @delete="confirmDeleteNote(activity)"
            />
          </div>
        </section>
      </div>
      <div v-if="feed.hasMore" class="pt-4 flex justify-center">
        <Button size="md" variant="ghost" :disabled="feed.loading" @click="feed.loadMore()">
          {{ feed.loading ? 'Загрузка...' : 'Загрузить еще' }}
        </Button>
      </div>
    </template>

    <ActivityCallModal
      :is-open="showCallModal"
      :entity-type="entityType"
      :entity-id="entityId"
      @close="showCallModal = false"
      @save="onSaveCall"
    />

    <Modal v-if="showEditModal" :is-open="showEditModal" @close="showEditModal = false">
      <div class="p-6 bg-bg-primary rounded-xl max-w-md">
        <h3 class="text-lg font-medium text-text-primary mb-4">Редактировать заметку</h3>
        <div class="space-y-3">
          <input
            v-model="editTitle"
            type="text"
            placeholder="Заголовок"
            class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm"
          />
          <textarea
            v-model="editDescription"
            placeholder="Описание"
            rows="3"
            class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm"
          />
        </div>
        <div class="flex gap-2 mt-4">
          <Button variant="ghost" @click="showEditModal = false">Отмена</Button>
          <Button variant="primary" @click="submitEditNote">Сохранить</Button>
        </div>
      </div>
    </Modal>

    <Modal :is-open="showDeleteModal" @close="showDeleteModal = false">
      <ConfirmModal
        title="Удалить заметку?"
        message="Заметка будет удалена без возможности восстановления."
        confirm-text="Удалить"
        confirm-variant="danger"
        @close="showDeleteModal = false"
        @confirm="doDeleteNote"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { Button, Modal, ConfirmModal, EmptyState } from '@/shared/ui'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { useActivityFeed } from '@/features/activity/model/useActivityFeed'
  import ActivityItem from './ActivityItem.vue'
  import ActivityFilters from './ActivityFilters.vue'
  import ActivityComposer from './ActivityComposer.vue'
  import ActivityCallModal from './ActivityCallModal.vue'
  import type {
    Activity,
    CreateNoteDto,
    CreateCallDto,
    ActivityEntityType,
  } from '@/entities/activity'

  const props = withDefaults(
    defineProps<{
      entityType: ActivityEntityType
      entityId: string
      canCreate?: boolean
    }>(),
    { canCreate: true },
  )

  const emit = defineEmits<{
    createNote: [dto: CreateNoteDto]
    createCall: [dto: CreateCallDto]
  }>()

  const workspaceStore = useWorkspaceStore()
  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')
  const entityIdRef = computed(() => props.entityId)

  const feed = useActivityFeed(workspaceId, props.entityType, entityIdRef)

  const filtersVisible = ref(false)
  const showComposer = ref(false)
  const showCallModal = ref(false)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const editingActivity = ref<Activity | null>(null)
  const deleteActivity = ref<Activity | null>(null)
  const editTitle = ref('')
  const editDescription = ref('')

  const hasFilters = computed(() => feed.hasFilters)

  onMounted(() => {
    feed.load()
  })

  function onFiltersApply(f: Parameters<typeof feed.setFilters>[0]) {
    feed.setFilters(f)
    filtersVisible.value = false
  }

  function onFiltersReset() {
    feed.setFilters({})
    filtersVisible.value = false
  }

  async function onSaveNote(dto: CreateNoteDto) {
    try {
      await feed.createNote(dto)
      emit('createNote', dto)
    } catch {
      // error already set in feed
    }
  }

  async function onSaveCall(dto: CreateCallDto) {
    try {
      await feed.createCall(dto)
      emit('createCall', dto)
      showCallModal.value = false
    } catch {
      // error already set in feed
    }
  }

  function openEditNote(activity: Activity) {
    editingActivity.value = activity
    editTitle.value = activity.title
    editDescription.value = activity.description ?? ''
    showEditModal.value = true
  }

  async function submitEditNote() {
    if (!editingActivity.value) return
    await feed.updateNote(editingActivity.value.id, {
      title: editTitle.value.trim(),
      description: editDescription.value.trim() || undefined,
    })
    showEditModal.value = false
    editingActivity.value = null
  }

  function confirmDeleteNote(activity: Activity) {
    deleteActivity.value = activity
    showDeleteModal.value = true
  }

  async function doDeleteNote() {
    if (!deleteActivity.value) return
    await feed.deleteNote(deleteActivity.value.id)
    showDeleteModal.value = false
    deleteActivity.value = null
  }
</script>
