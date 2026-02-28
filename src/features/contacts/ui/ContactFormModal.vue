<template>
  <Modal :is-open="isOpen" @close="$emit('close')">
    <ModalContent
      :title="contact ? 'Редактировать контакт' : 'Новый контакт'"
      :show-close-button="true"
      @close="$emit('close')"
    >
      <form class="space-y-4" @submit.prevent="() => handleSubmit(true)">
        <FormField label="Имя" required :error="errors.firstName">
          <Input
            v-model="form.firstName"
            placeholder="Имя"
            :class="{ 'border-error-default': errors.firstName }"
            @blur="validateFirstName"
          />
        </FormField>

        <FormField label="Фамилия">
          <Input v-model="form.lastName" placeholder="Фамилия" />
        </FormField>

        <FormField label="Телефон" :error="errors.phone">
          <input
            :value="form.phone"
            type="tel"
            placeholder="+7 (999) 999-99-99"
            maxlength="18"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-bg-primary text-text-primary border-border-default focus:ring-primary-default focus:border-primary-default"
            :class="{ 'border-error-default': errors.phone }"
            @input="onPhoneInput"
          />
        </FormField>

        <FormField label="Email" :error="errors.email">
          <Input
            v-model="form.email"
            type="email"
            placeholder="email@example.com"
            :class="{ 'border-error-default': errors.email }"
            @blur="validateEmail"
          />
        </FormField>

        <FormField label="Компания">
          <div class="relative">
            <input
              v-model="companyQuery"
              type="text"
              placeholder="Поиск компании..."
              autocomplete="off"
              class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-default"
              @focus="showCompanyDropdown = true"
              @blur="onCompanyBlur"
            />
            <div
              v-if="showCompanyDropdown && (companyQuery || companyOptions.length > 0)"
              class="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-auto rounded-lg border border-border-default bg-bg-primary shadow-lg z-10"
            >
              <button
                v-if="companyQuery"
                type="button"
                class="w-full px-3 py-2 text-left text-sm text-primary-default hover:bg-bg-tertiary"
                @mousedown.prevent="emitCreateCompany"
              >
                + Создать новую компанию
              </button>
              <button
                v-for="co in companyOptions"
                :key="co.id"
                type="button"
                class="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary"
                @mousedown.prevent="selectCompany(co)"
              >
                {{ co.name }}
              </button>
              <p v-if="companySearching" class="px-3 py-2 text-sm text-text-muted">Поиск...</p>
              <p v-if="companyQuery && !companySearching && companyOptions.length === 0" class="px-3 py-2 text-sm text-text-muted">Ничего не найдено</p>
            </div>
            <p v-if="form.companyId" class="mt-1 text-xs text-text-muted">
              Выбрана: {{ form.companyNameDisplay }}
            </p>
          </div>
        </FormField>

        <FormField label="Должность">
          <Input v-model="form.position" placeholder="Должность" />
        </FormField>

        <FormField label="День рождения">
          <Input v-model="form.birthday" type="date" />
        </FormField>

        <FormField label="Теги">
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in form.tags"
                :key="tag"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-tertiary text-sm text-text-primary"
              >
                {{ tag }}
                <button
                  type="button"
                  class="p-0.5 rounded hover:bg-border-light text-text-muted hover:text-text-primary"
                  aria-label="Удалить тег"
                  @click="removeTag(tag)"
                >
                  <XMarkIcon class="size-3.5" />
                </button>
              </span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="tagInput"
                type="text"
                placeholder="Добавить тег..."
                class="flex-1 px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-default"
                @keydown.enter.prevent="addTag"
              />
              <Button type="button" variant="outline" size="sm" @click="addTag">
                Добавить
              </Button>
            </div>
          </div>
        </FormField>

        <FormField label="Ответственный">
          <select
            v-model="form.ownerId"
            class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary"
          >
            <option v-for="u in ownerOptions" :key="u.id" :value="u.id">
              {{ u.label }}
            </option>
          </select>
        </FormField>

        <div class="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" @click="$emit('close')">
            Отмена
          </Button>
          <Button
            v-if="!contact"
            type="button"
            variant="outline"
            :loading="saving"
            @click="handleSubmit(false)"
          >
            Сохранить и создать ещё
          </Button>
          <Button type="submit" :loading="saving">
            Сохранить
          </Button>
        </div>
      </form>
    </ModalContent>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { Modal, ModalContent, Button, Input, FormField } from '@/shared/ui'
  import { XMarkIcon } from '@/shared/ui/icon'
  import { companyService } from '@/entities/company'
  import type { Contact, CreateContactDto } from '@/entities/contact'
  import type { Company } from '@/entities/company'

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  function formatPhoneMask(value: string): string {
    const digits = value.replace(/\D/g, '')
    let d = digits
    if (d.startsWith('8')) d = '7' + d.slice(1)
    if (d.startsWith('7')) d = d.slice(1)
    d = d.slice(0, 10)
    if (d.length === 0) return ''
    if (d.length <= 3) return `+7 (${d}`
    if (d.length <= 6) return `+7 (${d.slice(0, 3)}) ${d.slice(3)}`
    return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`
  }

  function phoneToDigits(masked: string): string {
    const d = masked.replace(/\D/g, '')
    if (d.startsWith('8')) return '7' + d.slice(1)
    if (d.startsWith('7')) return d
    return '7' + d
  }

  const props = withDefaults(
    defineProps<{
      isOpen: boolean
      contact: Contact | null
      workspaceId?: string
      defaultOwnerId?: string
      preselectedCompany?: Company | null
    }>(),
    {
      workspaceId: '',
      defaultOwnerId: '1',
      preselectedCompany: null,
    },
  )

  const emit = defineEmits<{
    close: []
    save: [data: CreateContactDto]
    update: [id: string, data: CreateContactDto]
    'create-company': []
    'preselected-company-applied': []
  }>()

  const saving = ref(false)
  const companyQuery = ref('')
  const showCompanyDropdown = ref(false)
  const companyOptions = ref<Company[]>([])
  const companySearching = ref(false)
  const tagInput = ref('')

  const errors = ref({
    firstName: '',
    phone: '',
    email: '',
  })

  const form = ref({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    companyId: '',
    companyNameDisplay: '',
    position: '',
    birthday: '',
    tags: [] as string[],
    ownerId: '',
  })

  const ownerOptions = computed(() => {
    const id = props.defaultOwnerId || '1'
    return [{ id, label: 'Текущий пользователь' }]
  })

  function validateFirstName() {
    const v = form.value.firstName.trim()
    errors.value.firstName = v ? '' : 'Обязательное поле'
  }

  function validateEmail() {
    const v = form.value.email.trim()
    if (!v) {
      errors.value.email = ''
      return
    }
    errors.value.email = EMAIL_REGEX.test(v) ? '' : 'Некорректный формат email'
  }

  function onPhoneInput(e: Event) {
    const target = (e.target as HTMLInputElement)
    const raw = target.value
    form.value.phone = formatPhoneMask(raw)
    errors.value.phone = ''
  }

  function onCompanyBlur() {
    setTimeout(() => { showCompanyDropdown.value = false }, 150)
  }

  let companySearchTimeout: ReturnType<typeof setTimeout> | null = null
  async function searchCompanies() {
    const q = companyQuery.value.trim()
    if (!props.workspaceId) {
      companyOptions.value = []
      return
    }
    companySearching.value = true
    try {
      const res = await companyService.getList({
        workspaceId: props.workspaceId,
        search: q || undefined,
        limit: 10,
      })
      companyOptions.value = res.companies ?? []
    } catch {
      companyOptions.value = []
    } finally {
      companySearching.value = false
    }
  }

  watch(companyQuery, () => {
    if (companySearchTimeout) clearTimeout(companySearchTimeout)
    companySearchTimeout = setTimeout(searchCompanies, 300)
  })

  function selectCompany(co: Company) {
    form.value.companyId = co.id
    form.value.companyNameDisplay = co.name
    companyQuery.value = ''
    showCompanyDropdown.value = false
    companyOptions.value = []
  }

  function emitCreateCompany() {
    emit('create-company')
    showCompanyDropdown.value = false
  }

  function addTag() {
    const t = tagInput.value.trim()
    if (!t || form.value.tags.includes(t)) return
    form.value.tags = [...form.value.tags, t]
    tagInput.value = ''
  }

  function removeTag(tag: string) {
    form.value.tags = form.value.tags.filter((x) => x !== tag)
  }

  function buildPayload(): CreateContactDto {
    const digits = phoneToDigits(form.value.phone)
    return {
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim() || undefined,
      phones: digits.length >= 10
        ? [{ type: 'mobile', number: digits.length === 11 ? digits : '7' + digits, isPrimary: true }]
        : undefined,
      emails: form.value.email.trim()
        ? [{ type: 'work', address: form.value.email.trim(), isPrimary: true }]
        : undefined,
      companyId: form.value.companyId || undefined,
      position: form.value.position.trim() || undefined,
      birthday: form.value.birthday || undefined,
      tags: form.value.tags.length > 0 ? form.value.tags : undefined,
      ownerId: form.value.ownerId || undefined,
    }
  }

  function resetForm() {
    form.value = {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      companyId: '',
      companyNameDisplay: '',
      position: '',
      birthday: '',
      tags: [],
      ownerId: props.defaultOwnerId || '1',
    }
    errors.value = { firstName: '', phone: '', email: '' }
    companyQuery.value = ''
    tagInput.value = ''
  }

  watch(
    () => [props.isOpen, props.contact, props.preselectedCompany] as const,
    ([open, contact, preselected]) => {
      if (open) {
        const rawPhone =
            contact?.phones?.find((p) => p.isPrimary)?.number ??
            contact?.phones?.[0]?.number ??
            ''
        form.value = {
          firstName: contact?.firstName ?? '',
          lastName: contact?.lastName ?? '',
          phone: rawPhone ? formatPhoneMask(rawPhone) : '',
          email:
            contact?.emails?.find((e) => e.isPrimary)?.address ??
            contact?.emails?.[0]?.address ??
            '',
          companyId: contact?.companyId ?? '',
          companyNameDisplay: '',
          position: contact?.position ?? '',
          birthday: contact?.birthday?.slice(0, 10) ?? '',
          tags: contact?.tags ? [...contact.tags] : [],
          ownerId: contact?.ownerId ?? props.defaultOwnerId ?? '1',
        }
        errors.value = { firstName: '', phone: '', email: '' }
        companyQuery.value = ''
        tagInput.value = ''

        if (contact?.companyId && props.workspaceId) {
          companyService
            .getById(props.workspaceId, contact.companyId)
            .then((c) => {
              form.value.companyNameDisplay = c.name
            })
            .catch(() => {})
        } else {
          form.value.companyNameDisplay = ''
        }

        if (preselected) {
          selectCompany(preselected)
          emit('preselected-company-applied')
        }
      }
    },
    { immediate: true },
  )

  async function handleSubmit(closeAfter: boolean) {
    validateFirstName()
    validateEmail()
    if (!form.value.firstName.trim()) return
    if (form.value.email.trim() && !EMAIL_REGEX.test(form.value.email.trim())) {
      errors.value.email = 'Некорректный формат email'
      return
    }

    saving.value = true
    try {
      const data = buildPayload()
      if (props.contact) {
        emit('update', props.contact.id, data)
      } else {
        emit('save', data)
      }
      if (closeAfter) {
        emit('close')
      } else {
        resetForm()
      }
    } finally {
      saving.value = false
    }
  }
</script>
