export function formatDealDate(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const months = 'янв фев мар апр май июн июл авг сен окт ноя дек'.split(' ')
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDealMoney(value: number | undefined, currency: string): string {
  const num = value ?? 0
  return (
    new Intl.NumberFormat('ru-RU', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num) +
    ' ' +
    (currency === 'RUB' ? '₽' : currency)
  )
}
