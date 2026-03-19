/**
 * Локальное хранение тегов и чеклиста задачи (до появления backend API).
 * Ключ: task:{taskId}:{tags|checklist}
 */
import type { Ref } from 'vue'

const STORAGE_PREFIX = 'task:'

export function useTaskLocalData(taskIdRef: Ref<string | undefined>) {
  function getTags(): string[] {
    const taskId = taskIdRef.value
    if (!taskId) return []
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${taskId}:tags`)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  function setTags(tags: string[]) {
    const taskId = taskIdRef.value
    if (!taskId) return
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${taskId}:tags`, JSON.stringify(tags))
    } catch {
      // ignore
    }
  }

  function getChecklist(): { id: string; text: string; done: boolean }[] {
    const taskId = taskIdRef.value
    if (!taskId) return []
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${taskId}:checklist`)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  function setChecklist(items: { id: string; text: string; done: boolean }[]) {
    const taskId = taskIdRef.value
    if (!taskId) return
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${taskId}:checklist`, JSON.stringify(items))
    } catch {
      // ignore
    }
  }

  return { getTags, setTags, getChecklist, setChecklist }
}
