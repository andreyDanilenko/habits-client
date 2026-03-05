import type { Workspace } from '@/entities/workspace'
import { hexToHsl } from './color-converter'

class ThemeService {
  private readonly defaultTheme = {
    brandH: 239,
    brandS: 84,
    secondaryH: 271,
  }

  private readonly workspaceThemeFlagKey = 'habitflow-use-workspace-theme'

  private shouldUseWorkspaceTheme(): boolean {
    if (typeof localStorage === 'undefined') return false
    return localStorage.getItem(this.workspaceThemeFlagKey) === '1'
  }

  /**
   * Включить использование цвета воркспейса как темы.
   * Вызывается из настроек, по умолчанию выключено.
   */
  enableWorkspaceTheme() {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(this.workspaceThemeFlagKey, '1')
  }

  /**
   * Отключить использование цвета воркспейса.
   * После этого всегда применяется системная базовая тема.
   */
  disableWorkspaceTheme() {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(this.workspaceThemeFlagKey, '0')
  }

  isWorkspaceThemeEnabled() {
    return this.shouldUseWorkspaceTheme()
  }

  applyWorkspaceTheme(workspace: Pick<Workspace, 'color'> | null) {
    if (typeof document === 'undefined') return
    const root = document.documentElement

    const setBaseTheme = (h: number, s: number, l: number) => {
      root.style.setProperty('--brand-h', h.toString())
      root.style.setProperty('--brand-s', `${s}%`)
      root.style.setProperty('--brand-l', `${l}%`) // Передаем яркость!
      root.style.setProperty('--gray-h', h.toString())
    }

    if (!this.shouldUseWorkspaceTheme() || !workspace?.color) {
      setBaseTheme(this.defaultTheme.brandH, this.defaultTheme.brandS, 67)
      return
    }

    try {
      const { h, s, l } = hexToHsl(workspace.color) // Убедись, что hexToHsl возвращает 'l'
      setBaseTheme(h, s, l)
    } catch (error) {
      setBaseTheme(this.defaultTheme.brandH, this.defaultTheme.brandS, 67)
    }
  }
}

export const themeService = new ThemeService()
