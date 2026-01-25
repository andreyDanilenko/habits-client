<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div>
      <h1>Настройки</h1>
      <p class="mt-2 text-gray-600">Управляйте настройками своего аккаунта</p>
    </div>

    <Card class="p-6">
      <h2 class="mb-4">Профиль</h2>

      <div class="space-y-4">
        <Input
          v-model="profile.email"
          label="Email"
          type="email"
          name="email"
          disabled
          placeholder="Ваш email"
          hint="Email нельзя изменить"
        />

        <Input
          v-model="profile.name"
          label="Имя"
          type="text"
          name="name"
          placeholder="Введите ваше имя"
        />

        <div class="pt-4">
          <Button @click="saveProfile" :loading="isSaving"> Сохранить изменения </Button>
        </div>
      </div>
    </Card>

    <Card class="p-6">
      <h2 class="mb-4">Уведомления</h2>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">Email уведомления</p>
            <p class="text-sm text-gray-500">Получать уведомления на email</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="notifications.email" type="checkbox" class="sr-only peer" />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"
            ></div>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">Напоминания о привычках</p>
            <p class="text-sm text-gray-500">Ежедневные напоминания о выполнении привычек</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="notifications.reminders" type="checkbox" class="sr-only peer" />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"
            ></div>
          </label>
        </div>
      </div>
    </Card>

    <Card class="p-6 border-red-200">
      <h2 class="text-red-900 mb-4">Опасная зона</h2>

      <div class="space-y-4">
        <div>
          <p class="text-sm text-gray-700 mb-2">
            Удаление аккаунта приведет к безвозвратному удалению всех ваших данных.
          </p>
          <Button variant="danger" @click="showDeleteConfirm = true"> Удалить аккаунт </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { Card, Button, Input } from '@/shared/ui'
  import { useUserStore } from '@/entities/user'

  const userStore = useUserStore()

  const isSaving = ref(false)
  const showDeleteConfirm = ref(false)

  const profile = reactive({
    email: '',
    name: '',
  })

  const notifications = reactive({
    email: true,
    reminders: true,
  })

  onMounted(() => {
    if (userStore.currentUser) {
      profile.email = userStore.currentUser.email
      profile.name = userStore.currentUser.name || ''
    }
  })

  const saveProfile = async () => {
    isSaving.value = true
    try {
      console.log('Save profile:', profile)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      isSaving.value = false
    }
  }
</script>
