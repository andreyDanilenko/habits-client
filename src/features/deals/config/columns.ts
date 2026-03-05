import type { DataTableColumn } from '@/shared/ui'
import type { Deal } from '@/entities/deal'

function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const day = d.getDate()
  const months = 'янв фев мар апр май июн июл авг сен окт ноя дек'.split(' ')
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

function formatMoney(value: number, currency: string): string {
  return (
    new Intl.NumberFormat('ru-RU', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) +
    ' ' +
    (currency === 'RUB' ? '₽' : currency)
  )
}

export function getDealColumns(stageName: (stageId: string) => string): DataTableColumn<Deal>[] {
  return [
    {
      id: 'name',
      label: 'Название сделки',
      sortable: true,
      align: 'left',
      getValue: (row) => row.name,
    },
    {
      id: 'contactId',
      label: 'Контакт / Компания',
      align: 'left',
      getValue: () => '—',
    },
    {
      id: 'budget',
      label: 'Бюджет',
      sortable: true,
      getValue: (row) => formatMoney(row.budget, row.currency),
    },
    {
      id: 'stageId',
      label: 'Этап',
      align: 'left',
      getValue: (row) => stageName(row.stageId),
    },
    {
      id: 'probability',
      label: 'Вероятность, %',
      getValue: (row) => row.probability ?? '—',
    },
    {
      id: 'expectedCloseDate',
      label: 'Дата закрытия',
      getValue: (row) => formatDate(row.expectedCloseDate),
    },
    {
      id: 'ownerId',
      label: 'Ответственный',
      getValue: () => '—',
    },
    {
      id: 'createdAt',
      label: 'Дата создания',
      sortable: true,
      getValue: (row) => formatDate(row.createdAt),
    },
  ]
}
