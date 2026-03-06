import { h } from 'vue'
import type { DataTableColumn } from '@/shared/ui'
import type { Contact } from '@/entities/contact'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const months = 'янв фев мар апр май июн июл авг сен окт ноя дек'.split(' ')
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

function primaryPhone(c: Contact): string {
  if (!c.phones) return ''
  const p = c.phones.find((x) => x.isPrimary) ?? c.phones[0]
  return p?.number ?? ''
}

function primaryEmail(c: Contact): string {
  if (!c.emails) return ''
  const e = c.emails?.find((x) => x.isPrimary) ?? c.emails[0]
  return e?.address ?? ''
}

export const contactColumns: DataTableColumn<Contact>[] = [
  {
    id: 'fullName',
    label: 'ФИО',
    sortable: true,
    align: 'left',
    getValue: (row) => `${row.firstName} ${row.lastName}`.trim() || '—',
    render: (_value, row) => {
      const name = `${row.firstName} ${row.lastName}`.trim() || '—'
      return h(
        'router-link',
        { to: `/crm/contacts/${row.id}`, class: 'text-primary-default hover:underline' },
        { default: () => name },
      )
    },
  },
  {
    id: 'phone',
    label: 'Телефон',
    align: 'left',
    getValue: (row) => primaryPhone(row) || '—',
  },
  {
    id: 'email',
    label: 'Email',
    align: 'left',
    getValue: (row) => primaryEmail(row) || '—',
    render: (_value, row) => {
      const addr = primaryEmail(row)
      if (!addr) return '—'
      return h('a', { href: `mailto:${addr}`, class: 'text-primary-default hover:underline' }, addr)
    },
  },
  {
    id: 'companyId',
    label: 'Компания',
    align: 'left',
    getValue: () => '—', // TODO: resolve company name when entity Company exists
  },
  {
    id: 'ownerId',
    label: 'Ответственный',
    align: 'left',
    getValue: () => '—', // TODO: resolve owner name
  },
  {
    id: 'createdAt',
    label: 'Дата создания',
    sortable: true,
    getValue: (row) => formatDate(row.createdAt),
  },
]
