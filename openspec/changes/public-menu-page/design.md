## Context

El frontend es un scaffold de Next.js (App Router) sin páginas propias. El backend ya expone `GET /api/menu/:slug`, que devuelve `{ restaurant_id, items }` con todos los items del restaurante (disponibles y no disponibles) o un 404 con `{ error: "Restaurante no encontrado" }` si el slug no existe. Esta vista es el punto de entrada principal del producto: un comensal la abre desde un QR físico en la mesa, casi siempre desde un celular con conexión variable.

## Goals / Non-Goals

**Goals:**
- Mostrar el menú de un restaurante de forma legible y rápida en pantallas chicas (mobile-first).
- Reflejar fielmente la disponibilidad de cada item, sin exponer los marcados como no disponibles.
- Dar feedback claro en los tres estados posibles: cargando, error (slug inexistente u otro fallo de red), y éxito.

**Non-Goals:**
- No incluye ninguna interacción de pedido (agregar al carrito, llamar al mozo, etc.) — solo lectura del menú.
- No incluye theming o personalización visual por restaurante (logo, colores) en este alcance; queda como mejora futura.
- No incluye SEO avanzado (sitemap, metadata dinámica por restaurante) más allá de un `<title>` básico con el nombre del restaurante si está disponible.

## Decisions

**Server Component con fetch en el servidor, no client-side fetching.** Next.js App Router permite hacer el fetch a `GET /api/menu/:slug` directamente en el Server Component de la página. Esto evita un "loading spinner" inicial en el caso común (red rápida) y mejora el tiempo a contenido visible en mobile, que es el objetivo principal de esta vista. El estado de carga visible solo aplicaría a navegación client-side futura (no aplica en este alcance al no haber esa interacción).

**Manejo de 404 con `notFound()` de Next.js.** Si el backend devuelve 404 para el slug, la página invoca `notFound()` para renderizar la página de error 404 estándar de Next.js (personalizable con un `not-found.tsx` en la misma ruta), en vez de manejar el estado de error manualmente. Es el patrón idiomático del framework y simplifica el código.

**Filtrado de disponibilidad en el cliente, no se modifica el backend.** El proposal ya fija esto como Non-Goal de backend: la página filtra `items.filter(i => i.available)` después de recibir la respuesta. Modificar el endpoint para aceptar un query param de filtro es una mejora futura de menor prioridad, ya que el volumen de items por restaurante es bajo (decenas, no miles) y no hay impacto de performance relevante en filtrar del lado del cliente/servidor de Next.

**Agrupación por categoría en el servidor, antes de renderizar.** Se agrupan los items en un `Record<string, MenuItem[]>` ya ordenados (el backend ya ordena por `category, name`), evitando lógica de agrupación repetida en el cliente.

## Risks / Trade-offs

- [Si el backend está caído, la página fallaría al hacer fetch en el servidor] → Mitigación: envolver el fetch en un try/catch y mostrar una página de error genérica (distinta del 404 de slug inexistente) en ese caso.
- [Imágenes sin `image_url` (la mayoría de los items semilla no tienen imagen)] → Mitigación: el diseño visual debe contemplar un placeholder o layout que funcione bien sin imagen, no asumir que siempre habrá una.
- [Mobile-first sin breakpoints definidos aún en el proyecto] → Mitigación: usar las utilidades responsive de Tailwind (ya configurado) partiendo del layout mobile y agregando mejoras para pantallas más grandes con `sm:`/`md:`.

## Open Questions

Ninguna pendiente para este alcance.
