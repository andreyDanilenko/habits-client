import { ref } from 'vue'
import { api, API_ENDPOINTS } from '@/shared/api'

export const useTelegramIntegrationLink = () => {
  const isConnectingTelegram = ref(false)
  const telegramConnectLink = ref<string | null>(null)
  const telegramConnectError = ref<string | null>(null)

  const connectTelegram = async () => {
    isConnectingTelegram.value = true
    telegramConnectError.value = null
    try {
      const response = await api.post<{ url: string; expiresIn: number }>(
        API_ENDPOINTS.INTEGRATIONS.TELEGRAM_LINK,
      )
      telegramConnectLink.value = response.url
      window.open(response.url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Failed to create telegram link:', error)
      telegramConnectError.value =
        'Не удалось создать ссылку привязки. Проверьте авторизацию и настройки интеграции.'
    } finally {
      isConnectingTelegram.value = false
    }
  }

  return {
    isConnectingTelegram,
    telegramConnectLink,
    telegramConnectError,
    connectTelegram,
  }
}
