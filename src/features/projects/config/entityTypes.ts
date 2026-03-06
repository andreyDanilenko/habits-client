/**
 * Конфигурация типов сущностей, которые можно привязывать к проектам.
 * Проект гибко объединяет контексты модулей: в одном только CRM, в другом CRM + Tasks и т.д.
 * При появлении нового модуля (Tasks, HR) добавьте сюда запись и реализуйте вкладку/модалку в ProjectDetailPage.
 * См. docs/PROJECTS_SPEC.md.
 */
export interface ProjectEntityTypeConfig {
  /** Код типа (entity_type в API), например crm_contact, task. */
  entityType: string
  /** Подпись вкладки на детальной странице проекта. */
  tabLabel: string
  /** Подпись кнопки «Добавить …». */
  addLabel: string
  /** Имя маршрута для ссылки на карточку сущности (например CrmContactDetail). */
  routeName: string
  /** Модуль, к которому относится тип (для фильтрации по включённым модулям в будущем). */
  module: 'crm' | 'tasks' | 'hr'
}

/** Типы сущностей, доступные для привязки к проектам. Расширяется с появлением модулей. */
export const PROJECT_ENTITY_TYPE_CONFIGS: ProjectEntityTypeConfig[] = [
  {
    entityType: 'crm_contact',
    tabLabel: 'Контакты',
    addLabel: 'Добавить контакты',
    routeName: 'CrmContactDetail',
    module: 'crm',
  },
  {
    entityType: 'crm_company',
    tabLabel: 'Компании',
    addLabel: 'Добавить компании',
    routeName: 'CrmCompanyDetail',
    module: 'crm',
  },
  {
    entityType: 'crm_deal',
    tabLabel: 'Сделки',
    addLabel: 'Добавить сделки',
    routeName: 'CrmDealDetail',
    module: 'crm',
  },
  // Когда появится модуль Tasks:
  // { entityType: 'task', tabLabel: 'Задачи', addLabel: 'Добавить задачи', routeName: 'TaskDetail', module: 'tasks' },
  // Когда появится модуль HR:
  // { entityType: 'hr_employee', tabLabel: 'Сотрудники', addLabel: 'Добавить сотрудников', routeName: 'HrEmployeeDetail', module: 'hr' },
]

export function getProjectEntityTypeConfig(
  entityType: string,
): ProjectEntityTypeConfig | undefined {
  return PROJECT_ENTITY_TYPE_CONFIGS.find((c) => c.entityType === entityType)
}
