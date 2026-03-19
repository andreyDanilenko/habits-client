<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div>
      <h1 class="text-text-primary">Профиль</h1>
      <p class="mt-2 text-text-secondary">Контактная информация и настройки профиля</p>
    </div>

    <Card class="p-6">
      <div class="flex flex-col sm:flex-row gap-6">
        <!-- Аватар -->
        <div class="flex-shrink-0">
          <div
            class="relative group w-24 h-24 rounded-full overflow-hidden bg-bg-tertiary flex items-center justify-center"
          >
            <img
              v-if="user?.avatarUrl"
              :src="avatarDisplayUrl"
              :alt="user?.name || user?.email"
              class="w-full h-full object-cover"
              @error="avatarLoadError = true"
            />
            <span
              v-else-if="!avatarLoadError"
              class="text-2xl font-medium text-text-secondary select-none"
            >
              {{ userInitials }}
            </span>
            <span v-else class="text-2xl font-medium text-text-secondary select-none">
              {{ userInitials }}
            </span>
            <div
              class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              @click="triggerFileInput"
            >
              <span class="text-white text-sm font-medium">Изменить</span>
            </div>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              class="hidden"
              @change="onFileSelected"
            />
          </div>
          <p v-if="isUploadingAvatar" class="mt-2 text-sm text-text-secondary">
            Загрузка...
          </p>
          <p v-else class="mt-2 text-xs text-text-muted">
            Наведите для смены
          </p>
        </div>

        <!-- Контактная информация -->
        <div class="flex-1 space-y-4 min-w-0">
          <Input
            v-model="profile.email"
            label="Email"
            type="email"
            name="email"
            disabled
            placeholder="Email"
            hint="Email нельзя изменить"
          />
          <Input
            v-model="profile.name"
            label="Имя"
            type="text"
            name="name"
            placeholder="Введите ваше имя"
          />
          <Input
            v-model="profile.position"
            label="Должность"
            type="text"
            name="position"
            placeholder="Например: Менеджер проектов"
          />
          <div class="pt-2">
            <Button @click="saveProfile" :loading="isSaving">
              Сохранить изменения
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Задел на будущее -->
    <Card class="p-6 border-border-light">
      <h2 class="text-text-primary mb-2">Скоро</h2>
      <p class="text-sm text-text-secondary">
        Здесь появятся: социальные сети, навыки, предпочтения уведомлений и другие настройки.
      </p>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { Card, Button, Input } from '@/shared/ui'
  import { useUserStore } from '@/entities/user'
  import { userService } from '@/entities/user'

  const userStore = useUserStore()
  const fileInputRef = ref<HTMLInputElement | null>(null)
  const avatarLoadError = ref(false)

  const isSaving = ref(false)
  const isUploadingAvatar = ref(false)

  const profile = reactive({
    email: '',
    name: '',
    position: '',
  })

  const user = computed(() => userStore.currentUser)

  const userInitials = computed(() => {
    const u = user.value
    if (!u?.email) return 'U'
    if (u.name) {
      const parts = u.name.trim().split(/\s+/)
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return u.name.slice(0, 2).toUpperCase()
    }
    return u.email[0].toUpperCase()
  })

  const avatarDisplayUrl = computed(() => {
    const u = user.value
    if (!u?.avatarUrl) return ''
    const base = import.meta.env.VITE_API_URL ?? ''
    return `${base}${u.avatarUrl}`
  })

  onMounted(() => {
    if (userStore.currentUser) {
      profile.email = userStore.currentUser.email
      profile.name = userStore.currentUser.name || ''
      profile.position = userStore.currentUser.position || ''
    }
  })

  const triggerFileInput = () => {
    fileInputRef.value?.click()
  }

  const onFileSelected = async (e: Event) => {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) {
      return
    }

    isUploadingAvatar.value = true
    try {
      const updated = await userService.uploadAvatar(file)
      userStore.setUser(updated)
    } catch (err) {
      console.error('Failed to upload avatar:', err)
    } finally {
      isUploadingAvatar.value = false
      input.value = ''
    }
  }

  const saveProfile = async () => {
    isSaving.value = true
    try {
      const updated = await userService.updateProfile({
        name: profile.name || undefined,
        position: profile.position || undefined,
      })
      userStore.setUser(updated)
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      isSaving.value = false
    }
  }
</script>
