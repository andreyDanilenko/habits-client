import { ref, onBeforeUnmount } from 'vue'

export type SpeechRecognitionResultHandler = (transcript: string, isFinal: boolean) => void

declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition
    webkitSpeechRecognition?: typeof SpeechRecognition
  }
}

export function useSpeechRecognition(options?: {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  onResult?: SpeechRecognitionResultHandler
}) {
  const lang = options?.lang ?? 'ru-RU'
  const continuous = options?.continuous ?? true
  const interimResults = options?.interimResults ?? true
  const onResult = options?.onResult

  const isSupported = ref(false)
  const isListening = ref(false)
  const error = ref<string | null>(null)
  const interimTranscript = ref('')

  let recognition: SpeechRecognition | null = null

  function getRecognitionConstructor(): typeof SpeechRecognition | null {
    if (typeof window === 'undefined') return null
    return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
  }

  function init() {
    const Ctor = getRecognitionConstructor()
    if (!Ctor) {
      isSupported.value = false
      error.value =
        'Распознавание речи не поддерживается в этом браузере. Используйте Chrome или Safari.'
      return
    }
    isSupported.value = true
    error.value = null
    recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = interimResults

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript
        if (result.isFinal) {
          interimTranscript.value = ''
          onResult?.(transcript, true)
        } else {
          interim += transcript
        }
      }
      if (interim) {
        interimTranscript.value = interim
      }
    }

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'aborted' || e.error === 'no-speech') {
        return
      }
      error.value = e.error === 'not-allowed' ? 'Доступ к микрофону запрещён.' : `Ошибка: ${e.error}`
    }

    recognition.onend = () => {
      isListening.value = false
      interimTranscript.value = ''
    }
  }

  function start() {
    if (!isSupported.value || !recognition) {
      init()
    }
    if (!recognition) return
    error.value = null
    interimTranscript.value = ''
    try {
      recognition.start()
      isListening.value = true
    } catch (e) {
      error.value = 'Не удалось запустить распознавание.'
    }
  }

  function stop() {
    if (recognition && isListening.value) {
      recognition.stop()
      isListening.value = false
      interimTranscript.value = ''
    }
  }

  function toggle() {
    if (isListening.value) {
      stop()
    } else {
      start()
    }
  }

  init()

  onBeforeUnmount(() => {
    stop()
  })

  return {
    isSupported,
    isListening,
    error,
    interimTranscript,
    start,
    stop,
    toggle,
  }
}
