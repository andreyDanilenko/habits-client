# Habits (ERP) — habits.lifedream.tech

ERP with first module: Habits (habit tracker). **Live:** [https://habits.lifedream.tech](https://habits.lifedream.tech)

**Deploy (all projects):** [deployment](../deployment/README.md) · **Main site:** [lifedream.tech](https://lifedream.tech)  
**Русский:** [README.ru.md](README.ru.md)

## Stack

| Layer | Tech |
|------|------|
| Frontend | Vue 3, TypeScript, Vite, Vue Router, Pinia, FSD |
| Backend (API) | Go, Gin, PostgreSQL ([habits-api](https://github.com/andreyDanilenko/habits-api)) |

This repo is only the Habits SPA. The API is a separate repo (REST, JWT, workspaces).

## Run locally

```bash
npm install
npm run dev
```

App at `http://localhost:3000`. Set `VITE_API_URL` if API is elsewhere.

## Deploy

Full deploy (this app + main site + Nginx) is from the **deployment** repo. Put this repo (as `habits/`) and `habits-api` next to `deployment/`, then `docker-compose up -d` from `deployment/`. See [deployment/README.md](../deployment/README.md).
