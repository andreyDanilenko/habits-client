export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let cleaned = hex.trim().replace('#', '')

  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((ch) => ch + ch)
      .join('')
  }

  if (cleaned.length !== 6) {
    throw new Error(`Invalid HEX color: "${hex}"`)
  }

  const r = parseInt(cleaned.slice(0, 2), 16) / 255
  const g = parseInt(cleaned.slice(2, 4), 16) / 255
  const b = parseInt(cleaned.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / delta + 2
        break
      case b:
        h = (r - g) / delta + 4
        break
    }

    h *= 60
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

