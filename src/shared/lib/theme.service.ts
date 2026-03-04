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

    // Если пользователь явно НЕ включил использование цвета воркспейса —
    // всегда откатываемся на системную тему, независимо от workspace.color.
    if (!this.shouldUseWorkspaceTheme()) {
      root.style.setProperty('--brand-h', this.defaultTheme.brandH.toString())
      root.style.setProperty('--brand-s', `${this.defaultTheme.brandS}%`)
      root.style.setProperty('--secondary-h', this.defaultTheme.secondaryH.toString())
      return
    }

    if (workspace?.color) {
      try {
        const { h, s } = hexToHsl(workspace.color)
        root.style.setProperty('--brand-h', h.toString())
        root.style.setProperty('--brand-s', `${s}%`)
      } catch (error) {
        console.error('Failed to apply workspace theme, fallback to default:', error)
        root.style.setProperty('--brand-h', this.defaultTheme.brandH.toString())
        root.style.setProperty('--brand-s', `${this.defaultTheme.brandS}%`)
      }
    } else {
      root.style.setProperty('--brand-h', this.defaultTheme.brandH.toString())
      root.style.setProperty('--brand-s', `${this.defaultTheme.brandS}%`)
    }

    root.style.setProperty('--secondary-h', this.defaultTheme.secondaryH.toString())
  }
}

export const themeService = new ThemeService()

