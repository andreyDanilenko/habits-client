import { onMounted, ref } from 'vue'
import { api, API_ENDPOINTS } from '@/shared/api'

export const useTelegramIntegrationLink = () => {
  const isConnectingTelegram = ref(false)
  const telegramConnectLink = ref<string | null>(null)
  const telegramConnectError = ref<string | null>(null)
  const isTelegramLinked = ref(false)
  const telegramChatId = ref<string | null>(null)
  const telegramBotUsername = ref<string | null>(null)
  const isTelegramStatusLoading = ref(true)

  async function fetchTelegramStatus() {
    try {
      const status = await api.get<{
        linked: boolean
        chatId?: string
        botUsername?: string
      }>(API_ENDPOINTS.INTEGRATIONS.TELEGRAM_STATUS)
      isTelegramLinked.value = Boolean(status?.linked)
      telegramChatId.value = status?.chatId ?? null
      telegramBotUsername.value = status?.botUsername ?? null
    } catch (error) {
      // Если статус не можем прочитать — просто оставим UI в состоянии “не подключено”.
      console.error('Failed to fetch telegram status:', error)
    } finally {
      isTelegramStatusLoading.value = false
    }
  }

  onMounted(() => {
    void fetchTelegramStatus()
  })

  const connectTelegram = async () => {
    if (isTelegramLinked.value) return
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

  const unlinkTelegram = async () => {
    if (!isTelegramLinked.value) return
    try {
      await api.delete<{ success: boolean }>(API_ENDPOINTS.INTEGRATIONS.TELEGRAM_UNLINK)
      isTelegramLinked.value = false
      telegramChatId.value = null
      telegramConnectLink.value = null
    } catch (error) {
      console.error('Failed to unlink telegram:', error)
      telegramConnectError.value = 'Не удалось отвязать Telegram. Попробуйте ещё раз.'
    }
  }

  return {
    isConnectingTelegram,
    telegramConnectLink,
    telegramConnectError,
    connectTelegram,
    unlinkTelegram,
    isTelegramLinked,
    telegramChatId,
    telegramBotUsername,
    isTelegramStatusLoading,
  }
}
