Вот полный гайд:

---

# **Полное обновление Node.js и пакетов проекта**

## **#1: Обновляем Node и ставим дефолт**

```bash
# Установить конкретную версию
nvm install 24.13.1

# Сделать её версией по умолчанию
nvm alias default 24.13.1

# Использовать сразу
nvm use default

# Проверить
node --version
```

---

## **#2: Обновляем все пакеты в проекте**

### **1. Очистка и переустановка**
```bash
# Удалить node_modules и lock-файл
rm -rf node_modules package-lock.json

# Очистить кэш npm
npm cache clean --force
```

### **2. Обновить package.json до последних версий**
```bash
# Установить npm-check-updates
npm install -g npm-check-updates

# Проверить доступные обновления
ncu

# Обновить все пакеты до последних версий
ncu -u
```

---

## **#3: Решение проблем с зависимостями**

### **Проблема: конфликт ESLint 10 с плагинами**

```
npm error ERESOLVE unable to resolve dependency tree
npm error peer eslint@"^9.10.0" from @vue/eslint-config-typescript@14.6.0
```

### **Вариант А: ESLint 9 (рекомендуется для стабильности)**
```bash
# Понизить ESLint до версии 9
npm install eslint@9.26.0 --save-dev --legacy-peer-deps

# Или полная установка с совместимыми версиями
npm install --legacy-peer-deps
```

### **Вариант Б: Принудительная установка с ESLint 10**
```bash
# Если нужно использовать ESLint 10
npm install --force
```

### **Вариант В: Ручная установка совместимых версий**

Отредактируйте `package.json`:

```json
{
  "devDependencies": {
    "eslint": "^9.26.0",
    "@vue/eslint-config-typescript": "^14.6.0",
    "eslint-plugin-vue": "^10.1.0",
    "eslint-config-prettier": "^10.1.2"
  }
}
```

Затем:
```bash
npm install --legacy-peer-deps
```

---

