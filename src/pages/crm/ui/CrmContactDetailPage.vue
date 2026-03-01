<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-8">
    <router-link
      to="/crm/contacts"
      class="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary-default mb-4"
    >
      <ArrowLeftIcon class="size-4" />
      К списку контактов
    </router-link>
    <div v-if="isLoading" class="flex justify-center py-12">
      <Spinner />
    </div>
    <template v-else-if="contact">
      <!-- Блок 1.2.1: Шапка профиля -->
      <header class="flex flex-wrap items-start gap-4 p-4 rounded-xl border border-border-default bg-bg-primary">
        <div
          class="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-default/10 text-primary-default text-xl font-semibold"
        >
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="text-text-primary text-xl font-semibold">
            {{ contact.firstName }} {{ contact.lastName }}
          </h1>
          <p v-if="contact.position || companyName" class="text-text-secondary text-sm mt-0.5">
            {{ [contact.position, companyName].filter(Boolean).join(' · ') }}
          </p>
          <div class="flex flex-wrap items-center gap-2 mt-2">
            <span
              :class="['text-xs px-2 py-0.5 rounded', contactActive ? 'bg-success-light text-success-default' : 'bg-bg-tertiary text-text-muted']"
            >
              {{ contactActive ? 'Активный' : 'Неактивный' }}
            </span>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <Button size="sm" variant="outline" @click="openEdit">Редактировать</Button>
            <Button size="sm" variant="ghost" @click="confirmDeleteContact">Удалить</Button>
            <Button size="sm" variant="primary" @click="goToCreateDeal">Добавить в сделку</Button>
          </div>
        </div>
      </header>

      <!-- Блок 1.2.2: Вкладки -->
      <div class="rounded-xl border border-border-default bg-bg-primary overflow-hidden">
        <nav class="flex border-b border-border-light">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? 'border-primary-default text-primary-default'
                : 'border-transparent text-text-secondary hover:text-text-primary',
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>
        <div class="p-6">
          <!-- Вкладка 1: Основная информация -->
          <template v-if="activeTab === 'main'">
            <section class="space-y-6">
              <div>
                <h3 class="text-sm font-medium text-text-secondary mb-2">Контактные данные</h3>
                <dl class="space-y-2 text-sm">
                  <template v-for="(p, i) in contact.phones" :key="`p-${i}`">
                    <div class="flex gap-2">
                      <dt class="text-text-muted w-28">{{ phoneTypeLabel(p.type) }}:</dt>
                      <dd><a :href="`tel:${p.number}`" class="text-primary-default hover:underline">{{ p.number }}</a></dd>
                    </div>
                  </template>
                  <template v-for="(e, i) in contact.emails" :key="`e-${i}`">
                    <div class="flex gap-2">
                      <dt class="text-text-muted w-28">{{ e.type === 'work' ? 'Рабочий' : 'Личный' }} email:</dt>
                      <dd><a :href="`mailto:${e.address}`" class="text-primary-default hover:underline">{{ e.address }}</a></dd>
                    </div>
                  </template>
                  <div v-if="contact.birthday" class="flex gap-2">
                    <dt class="text-text-muted w-28">День рождения:</dt>
                    <dd>{{ formatDate(contact.birthday) }}</dd>
                  </div>
                  <div class="flex gap-2">
                    <dt class="text-text-muted w-28">Соцсети:</dt>
                    <dd class="text-text-muted">Telegram, WhatsApp, VK — (скоро)</dd>
                  </div>
                  <template v-if="!contact.phones?.length && !contact.emails?.length && !contact.birthday">
                    <dd class="text-text-muted">—</dd>
                  </template>
                </dl>
              </div>
              <div>
                <h3 class="text-sm font-medium text-text-secondary mb-2">Адрес</h3>
                <p class="text-sm text-text-muted">Страна, город, улица — (скоро)</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-text-secondary mb-2">Дополнительная информация</h3>
                <div v-if="contact.tags?.length" class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in contact.tags"
                    :key="tag"
                    class="px-2 py-0.5 rounded bg-bg-tertiary text-text-secondary text-sm"
                  >
                    {{ tag }}
                  </span>
                </div>
                <p v-else class="text-sm text-text-muted">Теги не указаны. Комментарий — (скоро).</p>
              </div>
            </section>
          </template>
          <!-- Вкладка 2: Сделки -->
          <template v-else-if="activeTab === 'deals'">
            <div class="flex flex-col gap-4">
              <Button size="sm" variant="primary" @click="goToCreateDeal">Создать сделку из контакта</Button>
              <p class="text-text-muted text-sm">Таблица сделок по контакту (название, бюджет, этап, ответственный, дата) — (скоро).</p>
            </div>
          </template>
          <!-- Вкладка 3: Активность -->
          <template v-else-if="activeTab === 'activity'">
            <ActivityFeed
              entity-type="contact"
              :entity-id="contactId"
              :can-create="canCreateCrm"
            />
          </template>
          <!-- Вкладка 4: Задачи -->
          <template v-else>
            <p class="text-text-muted text-sm">Список задач по контакту. Создать задачу (тема, срок, ответственный) — (скоро).</p>
          </template>
        </div>
      </div>
    </template>
    <div v-else class="text-center py-12 text-text-muted">
      Контакт не найден.
    </div>

    <ContactFormModal
      :is-open="showFormModal"
      :contact="contact ?? null"
      @close="showFormModal = false; fetchContact()"
      @save="handleSave"
      @update="handleUpdate"
    />
    <Modal :is-open="showDeleteModal" @close="showDeleteModal = false">
      <ConfirmModal
        title="Удалить контакт?"
        message="Контакт будет удалён без возможности восстановления."
        confirm-text="Удалить"
        confirm-variant="danger"
        @close="showDeleteModal = false"
        @confirm="doDelete"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Modal, ConfirmModal, Button, Spinner } from '@/shared/ui'
  import { ArrowLeftIcon } from '@/shared/ui/icon'
  import { ContactFormModal } from '@/features/contacts'
  import { ActivityFeed } from '@/features/activity'
  import { contactService } from '@/entities/contact'
  import { useWorkspaceStore, usePermissions, WorkspacePermission } from '@/entities/workspace'
  import type { Contact, CreateContactDto } from '@/entities/contact'

  const route = useRoute()
  const router = useRouter()
  const workspaceStore = useWorkspaceStore()

  const contact = ref<Contact | null>(null)
  const isLoading = ref(true)
  const activeTab = ref('main')
  const showFormModal = ref(false)
  const showDeleteModal = ref(false)
  const contactActive = ref(true)

  const tabs = [
    { id: 'main', label: 'Основная информация' },
    { id: 'deals', label: 'Сделки' },
    { id: 'activity', label: 'Активность' },
    { id: 'tasks', label: 'Задачи' },
  ]

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')
  const contactId = computed(() => route.params.id as string)
  const { hasPermission } = usePermissions()
  const canCreateCrm = computed(() => hasPermission(WorkspacePermission.CRM_CREATE))
  const initials = computed(() => {
    if (!contact.value) return '?'
    const f = contact.value.firstName?.slice(0, 1) ?? ''
    const l = contact.value.lastName?.slice(0, 1) ?? ''
    return (f + l).toUpperCase() || '?'
  })
  const companyName = computed(() => contact.value?.companyId ? 'Компания' : '')

  function phoneTypeLabel(type: string) {
    return { mobile: 'Мобильный', work: 'Рабочий', home: 'Домашний' }[type] ?? type
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  async function fetchContact() {
    if (!workspaceId.value || !contactId.value) {
      contact.value = null
      return
    }
    isLoading.value = true
    try {
      contact.value = await contactService.getById(workspaceId.value, contactId.value)
    } catch {
      contact.value = null
    } finally {
      isLoading.value = false
    }
  }

  watch([workspaceId, contactId], fetchContact, { immediate: true })

  function openEdit() {
    showFormModal.value = true
  }

  function confirmDeleteContact() {
    showDeleteModal.value = true
  }

  function goToCreateDeal() {
    router.push('/crm/deals')
  }

  async function doDelete() {
    if (!contact.value || !workspaceId.value) return
    await contactService.delete(workspaceId.value, contact.value.id)
    showDeleteModal.value = false
    router.push('/crm/contacts')
  }

  async function handleSave(data: CreateContactDto) {
    if (!workspaceId.value) return
    await contactService.create(workspaceId.value, data)
    showFormModal.value = false
    await fetchContact()
  }

  async function handleUpdate(id: string, data: CreateContactDto) {
    if (!workspaceId.value) return
    await contactService.update(workspaceId.value, id, data)
    showFormModal.value = false
    await fetchContact()
  }
</script>
