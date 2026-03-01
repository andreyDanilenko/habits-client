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

export type CompanyColumnContext = {
  onCompanyClick?: (company: Company) => void
  onContactsClick?: (company: Company) => void
}

/** Колонки для таблицы компаний (2.1). Контекст для клика по названию и «Контактов» передаётся при вызове getCompanyColumns. */
export function getCompanyColumns(context?: CompanyColumnContext): DataTableColumn<Company>[] {
  return [
    {
      id: 'name',
      label: 'Название компании',
      sortable: true,
      align: 'left',
      getValue: (row) => row.name,
      render: (_value, row) => {
        if (context?.onCompanyClick) {
          return h(
            'button',
            {
              type: 'button',
              class: 'text-primary-default hover:underline text-left bg-transparent border-none cursor-pointer p-0 font-inherit',
              onClick: (e: Event) => {
                e.preventDefault()
                e.stopPropagation()
                context.onCompanyClick?.(row)
              },
            },
            row.name,
          )
        }
        return h('span', row.name)
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
      label: 'Кол-во контактов',
      getValue: (row) => row.contacts?.length ?? 0,
      render: (value, row) => {
        const count = Number(value) ?? 0
        if (context?.onContactsClick) {
          return h(
            'button',
            {
              type: 'button',
              class: 'text-primary-default hover:underline text-left',
              onClick: () => context.onContactsClick?.(row),
            },
            String(count),
          )
        }
        return h('span', String(count))
      },
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
}

/** Дефолтные колонки без контекста (клик по контактам не обрабатывается) */
export const companyColumns: DataTableColumn<Company>[] = getCompanyColumns()
