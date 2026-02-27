import { ref, watch, onMounted, type Ref } from 'vue'

type StorageType = 'local' | 'session'

export interface StorageOptions<T> {
  key: string
  initialValue: T
  storageType?: StorageType
  serializer?: (value: T) => string
  deserializer?: (value: string | null) => T
}

function getStorage(storageType: StorageType): Storage {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    }
  }
  return storageType === 'local' ? localStorage : sessionStorage
}

export function useStorage<T>(options: StorageOptions<T>) {
  const {
    key,
    initialValue,
    storageType = 'local',
    serializer = JSON.stringify,
    deserializer = (value: string | null) => {
      if (value === null) return initialValue
      try {
        return JSON.parse(value) as T
      } catch {
        return initialValue
      }
    },
  } = options

  const storage = getStorage(storageType)
  const data = ref<T>(initialValue) as Ref<T>

  function loadFromStorage(): T {
    try {
      const storedValue = storage.getItem(key)
      return deserializer(storedValue)
    } catch (error) {
      console.error(`Error loading from ${storageType}Storage:`, error)
      return initialValue
    }
  }

  function saveToStorage(value: T) {
    try {
      const serialized = serializer(value)
      storage.setItem(key, serialized)
    } catch (error) {
      console.error(`Error saving to ${storageType}Storage:`, error)
    }
  }

  function removeFromStorage() {
    storage.removeItem(key)
  }

  function clear() {
    removeFromStorage()
    data.value = initialValue
  }

  onMounted(() => {
    data.value = loadFromStorage()
  })

  watch(
    data,
    (newValue) => {
      saveToStorage(newValue)
    },
    { deep: true },
  )

  return {
    data,
    save: saveToStorage,
    remove: removeFromStorage,
    clear,
    reload: () => {
      data.value = loadFromStorage()
    },
  }
}

export function useLocalStorage<T>(options: StorageOptions<T>) {
  return useStorage<T>({
    ...options,
    storageType: 'local',
  })
}

export function useSessionStorage<T>(options: StorageOptions<T>) {
  return useStorage<T>({
    ...options,
    storageType: 'session',
  })
}

export function useLocalStorageSimple<T>(key: string, initialValue: T) {
  return useStorage<T>({
    key,
    initialValue,
    storageType: 'local',
  })
}

export function useSessionStorageSimple<T>(key: string, initialValue: T) {
  return useStorage<T>({
    key,
    initialValue,
    storageType: 'session',
  })
}

export function useLocalStorageString(key: string, initialValue: string) {
  return useStorage<string>({
    key,
    initialValue,
    storageType: 'local',
    serializer: (value) => value,
    deserializer: (value) => value ?? initialValue,
  })
}

export function useSessionStorageString(key: string, initialValue: string) {
  return useStorage<string>({
    key,
    initialValue,
    storageType: 'session',
    serializer: (value) => value,
    deserializer: (value) => value ?? initialValue,
  })
}
