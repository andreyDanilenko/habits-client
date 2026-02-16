<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div>
      <router-link
        to="/workspace-modules"
        class="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block"
      >
        ← Назад к списку модулей
      </router-link>
      <h1>Активация модуля: {{ moduleLabel }}</h1>
      <p class="mt-2 text-gray-600">
        Оформите подписку или вечную лицензию на странице
        <router-link to="/billing" class="text-indigo-600 hover:underline">Биллинг</router-link>, либо свяжитесь с владельцем приложения для подключения модуля.
      </p>
    </div>

    <!-- Пометка для владельца приложения -->
    <Card class="p-4 bg-amber-50 border-amber-200">
      <p class="text-sm text-amber-800">
        <strong>Для владельца приложения:</strong> здесь размещается интеграция с платёжной
        системой или форма связи с пользователем. После оплаты/договорённости владелец
        workspace или админ включает модуль в настройках workspace (кнопка «Активировать» на
        странице «Модули»).
      </p>
    </Card>

    <!-- Варианты: подписка и вечная лицензия (заглушки для тестирования модели) -->
    <div class="grid gap-4 sm:grid-cols-2">
      <Card class="p-6 border-2 border-dashed border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">Подписка</h2>
        <p class="text-sm text-gray-600 mb-4">
          Модель подписки: ежемесячная или годовая оплата. Заглушка для теста.
        </p>
        <ul class="text-sm text-gray-600 space-y-1 mb-4">
          <li>• Месяц — заглушка</li>
          <li>• Год — заглушка</li>
        </ul>
        <Button variant="secondary" disabled class="w-full"> Оформить подписку (заглушка) </Button>
      </Card>

      <Card class="p-6 border-2 border-dashed border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">Вечная лицензия</h2>
        <p class="text-sm text-gray-600 mb-4">
          Единоразовая оплата, доступ к модулю без продления. Заглушка для теста.
        </p>
        <ul class="text-sm text-gray-600 space-y-1 mb-4">
          <li>• Один платёж</li>
          <li>• Без ограничения срока</li>
        </ul>
        <Button variant="secondary" disabled class="w-full">
          Купить вечную лицензию (заглушка)
        </Button>
      </Card>
    </div>

    <Card class="p-4 bg-gray-50 border-gray-200">
      <p class="text-sm text-gray-700">
        <strong>Связаться с владельцем:</strong> кнопка или форма «Связаться с нами» для
        запроса активации модуля (заглушка). Владелец приложения обрабатывает запрос и
        включает модуль в workspace вручную или через админку.
      </p>
      <Button variant="secondary" disabled class="mt-3"> Связаться с владельцем (заглушка) </Button>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { modules } from '@/app/modules/config'
  import { Card, Button } from '@/shared/ui'

  const route = useRoute()
  const moduleCode = computed(() => (route.params.moduleCode as string) || '')

  const moduleLabel = computed(() => {
    const m = modules.find((mod) => mod.id === moduleCode.value)
    return m ? m.label : moduleCode.value || 'Модуль'
  })
</script>
