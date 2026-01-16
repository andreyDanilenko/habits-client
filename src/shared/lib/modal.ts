import { ref, type Component, type Ref } from 'vue'

export interface ModalConfig<T = any> {
  component: Component
  props?: Record<string, any>
  onClose?: (result?: T) => void
  onConfirm?: (result?: T) => void
}

export type ModalResult<T = any> = T

export interface ModalInstance {
  id: symbol
  config: ModalConfig
  close: (result?: any) => void
}

class ModalManager {
  private modals: Ref<ModalInstance[]> = ref([])

  get currentModals() {
    return this.modals.value
  }

  open<T = any>(config: ModalConfig<T>): ModalInstance {
    const id = Symbol()
    const instance: ModalInstance = {
      id,
      config,
      close: (result?: T) => this.close(id, result),
    }

    this.modals.value = [...this.modals.value, instance]
    return instance
  }

  close(id: symbol, result?: any) {
    const instance = this.modals.value.find((m) => m.id === id)
    if (instance) {
      // Приводим тип к нужному
      instance.config.onClose?.(result)
      this.modals.value = this.modals.value.filter((m) => m.id !== id)
    }
  }

  closeAll() {
    this.modals.value.forEach((instance) => {
      instance.config.onClose?.()
    })
    this.modals.value = []
  }
}

export const modalManager = new ModalManager()

export function useModal() {
  const openModal = <T = any>(config: ModalConfig<T>) => {
    return modalManager.open<T>(config)
  }

  const closeModal = (id: symbol, result?: any) => {
    modalManager.close(id, result)
  }

  return {
    openModal,
    closeModal,
    modals: modalManager.currentModals,
  }
}
