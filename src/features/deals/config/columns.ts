import type { DataTableColumn } from '@/shared/ui'
import type { Deal } from '@/entities/deal'
import { formatDealDate, formatDealMoney } from '../lib/format'

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
      getValue: (row) => formatDealMoney(row.budget, row.currency),
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
      getValue: (row) => formatDealDate(row.expectedCloseDate),
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
      getValue: (row) => formatDealDate(row.createdAt),
    },
  ]
}
