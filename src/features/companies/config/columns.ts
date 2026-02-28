import { h } from 'vue'
import type { DataTableColumn } from '@/shared/ui'
import type { Company } from '@/entities/company'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const months = 'янв фев мар апр май июн июл авг сен окт ноя дек'.split(' ')
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

export const companyColumns: DataTableColumn<Company>[] = [
  {
    id: 'name',
    label: 'Название',
    sortable: true,
    align: 'left',
    getValue: (row) => row.name,
    render: (_value, row) => {
      return h('router-link', { to: `/crm/companies/${row.id}`, class: 'text-primary-default hover:underline' }, { default: () => row.name })
    },
  },
  {
    id: 'inn',
    label: 'ИНН',
    align: 'left',
    getValue: (row) => row.inn ?? '—',
  },
  {
    id: 'phone',
    label: 'Телефон',
    align: 'left',
    getValue: (row) => row.phone ?? '—',
  },
  {
    id: 'email',
    label: 'Email',
    align: 'left',
    getValue: (row) => row.email ?? '—',
  },
  {
    id: 'contacts',
    label: 'Контактов',
    getValue: (row) => row.contacts?.length ?? 0,
  },
  {
    id: 'ownerId',
    label: 'Ответственный',
    align: 'left',
    getValue: () => '—',
  },
  {
    id: 'createdAt',
    label: 'Дата создания',
    sortable: true,
    getValue: (row) => formatDate(row.createdAt),
  },
]
