# Анимации и реактивные обновления

Единый подход к плавности UI: модалки, списки, счётчики, сокет-обновления.

---

## Проблема: «дёргание» при обновлении данных

Страница «дёргается» при обновлении через сокеты, когда Vue полностью перерисовывает DOM или контент меняет размеры (layout shift).

**Основные инструменты:**

1. **Vue Transition & TransitionGroup** — встроенные компоненты для входа/выхода элементов
2. **@formkit/auto-animate** — директива `v-auto-animate` на контейнер, автоматическая анимация перемещений
3. **GSAP / Motion One** — для сложной логики (морфинг цифр в счётчиках)
4. **Технические приёмы:** фиксированные размеры, уникальные `:key` (не index), `v-memo`

---

## 1. Токены анимаций (main.css)

Используйте CSS-переменные для единообразия:

```css
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

**Где использовать:**

- `--duration-fast` — hover, мелкие переходы
- `--duration-normal` — fade, backdrop
- `--duration-slow` — открытие/закрытие модалок, slide
- `--ease-out-expo` — появление (content slide-up, drawer)
- `--ease-in-out` — fade, opacity

---

## 2. Модалки (Modal.vue)

**Паттерн:** Плавное открытие и закрытие с анимацией выхода.

- **Backdrop:** fade 250ms
- **Content:** slide-up 350ms + scale(0.98) + ease-out-expo
- **Bottom sheet (mobile):** slide от низа 350ms

**Закрытие:** ModalManager использует `isClosing` — модалка остаётся в DOM до завершения leave-анимации, затем удаляется через `@after-leave`.

**Применяется ко всем модалкам** через ModalProvider (привычки, CRM, журнал и т.д.).

---

## 3. Drawer

Те же токены: `--duration-normal` для overlay, `--duration-slow` + `--ease-out-expo` для панели.

---

## 4. Реактивные обновления (сокеты)

**Паттерн:** Фоновый refetch без показа loading.

При сокет-событиях (habit.completed, deal.updated и т.д.) вызывать fetch с `{ background: true }`:

```ts
fetchData(undefined, { background: true })
```

**Правила:**

- `isLoading = true` только при явном действии пользователя (первая загрузка, смена фильтра)
- Сокет-триггеры — всегда `background: true`
- Не показывать «Загрузка...» при фоновом обновлении

**Где применено:** habit-store, use-deals-list, RecentActivityWidget, ActivityPage.

---

## 5. Списки (v-auto-animate)

**Паттерн:** `v-auto-animate` на контейнере списка.

При добавлении/удалении/перестановке элементов — плавная анимация без ручных CSS-классов.

```vue
<div class="space-y-3" v-auto-animate>
  <div v-for="item in items" :key="item.id">...</div>
</div>
```

**Где применено:** TodayHabitsWidget, HabitsList, StatsOverviewWidget, RecentActivityWidget, ActivityPage, DashboardPage, KanbanBoard.

---

## 6. Счётчики и цифры (Transition)

**Паттерн:** `<Transition name="number-fade" mode="out-in">` с `:key` по значению.

При смене числа — fade out старого, fade in нового (опционально scale).

```vue
<Transition name="number-fade" mode="out-in">
  <span :key="value">{{ value }}</span>
</Transition>
```

**Где применено:** StatsOverviewWidget (completedToday/totalToday), Notifications (badge count).

---

## 7. Чеклист для новых компонентов

- [ ] Модалка? → Используется общий Modal через ModalProvider
- [ ] Список с динамическими данными? → `v-auto-animate` на контейнер
- [ ] Счётчик/цифра? → `Transition` + `:key`
- [ ] Refetch по сокету? → `fetch({ background: true })`
- [ ] Новые CSS-анимации? → Токены `--duration-*`, `--ease-*`

---

## Ссылки

- `src/styles/main.css` — токены в @theme
- `src/shared/ui/Modal.vue` — эталон модалки
