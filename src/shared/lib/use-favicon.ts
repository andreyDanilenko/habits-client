/**
 * Обновляет favicon, используя текущие цвета темы (--color-primary-default, --color-secondary-default).
 * Вызывается при смене темы, чтобы иконка соответствовала Logo.vue.
 */
export function updateFavicon() {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const primary = getComputedStyle(root).getPropertyValue('--color-primary-default').trim()
  const secondary = getComputedStyle(root).getPropertyValue('--color-secondary-default').trim()

  const primaryColor = primary || '#6366f1'
  const secondaryColor = secondary || '#9333ea'

  const svg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="faviconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${secondaryColor}" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="8" fill="url(#faviconGrad)" />
  <text x="16" y="16" text-anchor="middle" dominant-baseline="central" fill="white"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-weight="bold" font-size="14" letter-spacing="0.5">HF</text>
</svg>`

  const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`

  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/svg+xml'
    document.head.appendChild(link)
  }
  link.href = dataUrl
}
