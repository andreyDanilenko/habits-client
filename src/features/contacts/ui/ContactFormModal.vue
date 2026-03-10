<template>
  <Modal :is-open="isOpen" @close="$emit('close')">
    <ModalContent
      :title="contact ? 'Редактировать контакт' : 'Новый контакт'"
      :show-close-button="true"
      @close="$emit('close')"
    >
      <form class="space-y-4" @submit.prevent="() => handleSubmit(true)">
        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >Имя <span class="text-error-default">*</span></span
          >
          <Input
            v-model="form.firstName"
            placeholder="Имя"
            :error="errors.firstName"
            @blur="validateFirstName"
          />
          <p v-if="errors.firstName" class="mt-(--spacing-1) text-(--text-xs) text-error-default">
            {{ errors.firstName }}
          </p>
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >Фамилия</span
          >
          <Input v-model="form.lastName" placeholder="Фамилия" />
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >Телефон</span
          >
          <Input
            v-model="phoneModel"
            type="tel"
            placeholder="+7 (999) 999-99-99"
            :error="errors.phone"
            inputClasses="w-full"
          />
          <p v-if="errors.phone" class="mt-(--spacing-1) text-(--text-xs) text-error-default">
            {{ errors.phone }}
          </p>
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >Email</span
          >
          <Input
            v-model="form.email"
            type="email"
            placeholder="email@example.com"
            :error="errors.email"
            @blur="validateEmail"
          />
          <p v-if="errors.email" class="mt-(--spacing-1) text-(--text-xs) text-error-default">
            {{ errors.email }}
          </p>
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >Компания</span
          >
          <SearchSelect
            v-model="form.companyId"
            :options="companyOptions"
            :get-option-label="getCompanyLabel"
            :selected-label="form.companyNameDisplay"
            :loading="companySearching"
            placeholder="Поиск компании..."
            create-label="+ Создать новую компанию"
            @search="handleCompanySearch"
            @select="applyCompany"
            @create="handleCreateCompany"
          />
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >Должность</span
          >
          <Input v-model="form.position" placeholder="Должность" />
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >День рождения</span
          >
          <DatePicker v-model="form.birthday" />
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >Теги</span
          >
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="tag in form.tags"
                :key="tag"
                :label="tag"
                removable
                remove-aria-label="Удалить тег"
                @remove="removeTag(tag)"
              />
            </div>
            <div class="flex gap-2">
              <Input
                v-model="tagInput"
                placeholder="Добавить тег..."
                @keydown.enter.prevent="addTag"
              />
              <Button type="button" variant="outline" @click="addTag"> Добавить </Button>
            </div>
          </div>
        </div>

        <div>
          <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
            >Ответственный</span
          >
          <Select
            v-model="form.ownerId"
            :options="ownerSelectOptions"
            placeholder="Выберите ответственного"
            size="lg"
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" @click="$emit('close')"> Отмена </Button>
          <Button
            v-if="!contact"
            type="button"
            variant="outline"
            :loading="saving"
            @click="handleSubmit(false)"
          >
            Сохранить и создать
          </Button>
          <Button type="submit" :loading="saving"> Сохранить </Button>
        </div>
      </form>
    </ModalContent>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, watch, computed, unref } from 'vue'
  import {
    Modal,
    ModalContent,
    Button,
    Input,
    Select,
    DatePicker,
    SearchSelect,
    Tag,
  } from '@/shared/ui'
  import { companyService } from '@/entities/company'
  import type { Contact, CreateContactDto } from '@/entities/contact'
  import type { Company } from '@/entities/company'
  import type { SearchSelectOption } from '@/shared/ui'
  import type { ComponentSize } from '@/shared/ui/Button.vue'

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

  interface Props {
    isOpen: boolean
    contact: Contact | null
    workspaceId?: string
    defaultOwnerId?: string
    preselectedCompany?: Company | null
    size?: ComponentSize
    /** При использовании с useModal: создаёт компанию и возвращает её (для подстановки в форму) */
    onCreateCompany?: () => Promise<Company | null>
  }

  const props = withDefaults(defineProps<Props>(), {
    workspaceId: '',
    defaultOwnerId: '1',
    preselectedCompany: null,
    size: 'lg',
  })

  const emit = defineEmits<{
    close: []
    confirm: [payload: { id?: string; data: CreateContactDto }]
    save: [data: CreateContactDto]
    update: [id: string, data: CreateContactDto]
    'create-company': []
    'preselected-company-applied': []
  }>()

  const saving = ref(false)
  const tagInput = ref('')
  const companyOptions = ref<SearchSelectOption[]>([])
  const companySearching = ref(false)

  interface FormErrors {
    firstName: string
    phone: string
    email: string
  }

  const errors = ref<FormErrors>({
    firstName: '',
    phone: '',
    email: '',
  })

  interface ContactForm {
    firstName: string
    lastName: string
    phone: string
    email: string
    companyId: string
    companyNameDisplay: string
    position: string
    birthday: string
    tags: string[]
    ownerId: string
  }

  const form = ref<ContactForm>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    companyId: '',
    companyNameDisplay: '',
    position: '',
    birthday: '',
    tags: [],
    ownerId: '',
  })

  // Computed для телефона с маской
  const phoneModel = computed<string>({
    get: () => form.value.phone,
    set: (value: string) => {
      form.value.phone = formatPhoneMask(value)
      errors.value.phone = ''
    },
  })

  interface OwnerOption {
    id: string
    label: string
  }

  const ownerOptions = computed<OwnerOption[]>(() => {
    const id = props.defaultOwnerId || '1'
    return [{ id, label: 'Текущий пользователь' }]
  })

  interface SelectOption {
    value: string
    label: string
  }

  const ownerSelectOptions = computed<SelectOption[]>(() => {
    return ownerOptions.value.map((o) => ({ value: o.id, label: o.label }))
  })

  function validateFirstName(): void {
    const v = form.value.firstName.trim()
    errors.value.firstName = v ? '' : 'Обязательное поле'
  }

  function validateEmail(): void {
    const v = form.value.email.trim()
    if (!v) {
      errors.value.email = ''
      return
    }
    errors.value.email = EMAIL_REGEX.test(v) ? '' : 'Некорректный формат email'
  }

  function getCompanyLabel(item: SearchSelectOption): string {
    return String(item.name ?? '')
  }

  function applyCompany(co: SearchSelectOption): void {
    form.value.companyId = co.id
    form.value.companyNameDisplay = getCompanyLabel(co)
  }

  async function handleCreateCompany(): Promise<void> {
    if (props.onCreateCompany) {
      const company = await props.onCreateCompany()
      if (company) {
        form.value.companyId = company.id
        form.value.companyNameDisplay = company.name
      }
    } else {
      emit('create-company')
    }
  }

  async function handleCompanySearch(query: string): Promise<void> {
    const q = query.trim()
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
      companyOptions.value = (res.companies ?? []) as unknown as SearchSelectOption[]
    } catch {
      companyOptions.value = []
    } finally {
      companySearching.value = false
    }
  }

  function addTag(): void {
    const t = tagInput.value.trim()
    if (!t || form.value.tags.includes(t)) return
    form.value.tags = [...form.value.tags, t]
    tagInput.value = ''
  }

  function removeTag(tag: string): void {
    form.value.tags = form.value.tags.filter((x) => x !== tag)
  }

  function buildPayload(): CreateContactDto {
    const digits = phoneToDigits(form.value.phone)
    return {
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim() || undefined,
      phones:
        digits.length >= 10
          ? [
              {
                type: 'mobile',
                number: digits.length === 11 ? digits : '7' + digits,
                isPrimary: true,
              },
            ]
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

  function resetForm(): void {
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
    tagInput.value = ''
  }

  watch(
    () => [props.isOpen, props.contact, unref(props.preselectedCompany as Company | null)] as const,
    ([open, contact, preselected]) => {
      if (open) {
        const rawPhone =
          contact?.phones?.find((p) => p.isPrimary)?.number ?? contact?.phones?.[0]?.number ?? ''
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
        tagInput.value = ''

        if (contact?.companyId && props.workspaceId) {
          companyService
            .getById(props.workspaceId, contact.companyId)
            .then((c: Company) => {
              form.value.companyNameDisplay = c.name
            })
            .catch(() => {})
        } else {
          form.value.companyNameDisplay = ''
        }

        if (preselected) {
          form.value.companyId = preselected.id
          form.value.companyNameDisplay = preselected.name
          emit('preselected-company-applied')
        }
      }
    },
    { immediate: true },
  )

  async function handleSubmit(closeAfter: boolean): Promise<void> {
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
        emit('confirm', { id: props.contact.id, data })
        emit('update', props.contact.id, data)
      } else {
        emit('confirm', { data })
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
