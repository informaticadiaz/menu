## 1. Contenido

- [x] 1.1 Redactar copy de Fuego: nombre, propuesta de valor (menú digital para restaurantes pequeños) y los dos CTAs ("Crear mi menú" → `/signup`, "Ya tengo cuenta" → `/admin`)

## 2. Implementación

- [x] 2.1 Reemplazar el contenido de `frontend/app/page.tsx` por la landing (eliminar logo/copy/links de Next.js y Vercel)
- [x] 2.2 Agregar los dos `<Link>` de Next.js hacia `/signup` y `/admin`
- [x] 2.3 Aplicar estilos Tailwind consistentes con `frontend/app/globals.css` y `frontend/app/layout.tsx`

## 3. Verificación

- [x] 3.1 Levantar `npm run dev` en frontend y confirmar visualmente que `/` muestra la landing y no el boilerplate
- [x] 3.2 Confirmar que el CTA de registro navega a `/signup` y el de login a `/admin`
- [x] 3.3 Correr `npm run lint` en frontend
