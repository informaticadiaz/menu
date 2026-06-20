## Context

`frontend/app/page.tsx` es hoy el output sin editar de `create-next-app`. El resto del frontend ya tiene un patrón establecido: server components de Next.js App Router, estilos con Tailwind, sin estado global ni fetching complejo en páginas estáticas (ver `frontend/app/menu/[slug]/page.tsx` para el único caso con fetch). La landing no necesita datos del backend — es contenido estático con dos CTAs.

## Goals / Non-Goals

**Goals:**
- Reemplazar el boilerplate de `/` con una página estática que explique qué es Fuego y ofrezca dos acciones: ir a `/signup` (restaurante nuevo) o `/admin` (restaurante existente).
- Mantener consistencia visual con el resto del sitio (Tailwind, mismas convenciones de `frontend/app/globals.css` y `frontend/app/layout.tsx`).

**Non-Goals:**
- No se agrega contenido dinámico (testimonios, pricing, listado de restaurantes, etc.).
- No se toca el backend ni se agregan endpoints.
- No se hace SEO avanzado (sitemap, structured data) — solo el `metadata` básico de Next.js si corresponde.

## Decisions

- **Server Component estático sin fetch**: la página es contenido fijo (texto + 2 links), no requiere `'use client'` ni llamadas a la API. Alternativa descartada: traer conteo de restaurantes activos desde el backend para mostrar "prueba social" — fuera de alcance, no lo pidió el usuario.
- **Reutilizar Tailwind sin nuevos componentes compartidos**: dado que es una sola página, el markup vive directo en `page.tsx` sin extraer subcomponentes, siguiendo el mismo criterio que `frontend/app/menu/[slug]/page.tsx` (componentes solo cuando hay repetición real, como `MenuCategorySection`).
- **CTAs como `<Link>` de Next.js** hacia `/signup` y `/admin`, no botones con JS adicional.

## Risks / Trade-offs

- [Copy genérico sin validar con usuarios reales] → Aceptable para esta iteración; es texto fácil de iterar después, no bloquea el deploy.
- [Ningún diseño/mock provisto] → Se sigue la paleta y tipografía ya definidas en `globals.css` / `layout.tsx` para no introducir un sistema visual nuevo.
