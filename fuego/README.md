# 🔥 FUEGO - Menú Digital Hiperlocal

Plataforma de menús digitales para restaurantes pequeños. Backend ligero (Hono + SQLite), corre en cualquier VPS.

## Stack
- Frontend: Next.js 15 + Tailwind
- Backend: Hono + better-sqlite3
- Deploy: Docker + docker-compose

## Desarrollo local

```bash
cd backend && npm install && npm run dev   # puerto 3001
cd frontend && npm install && npm run dev  # puerto 3000
```

## Documentacion

- [URLs de negocio](docs/urls-de-negocio.md)
- [Deuda técnica](docs/deuda-tecnica.md)

## Deploy

```bash
docker-compose up -d
```
