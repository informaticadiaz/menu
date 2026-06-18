## 1. Estructura de la página

- [ ] 1.1 Crear `fuego/frontend/app/menu/[slug]/page.tsx` como Server Component que recibe `params.slug`
- [ ] 1.2 Implementar el fetch a `GET ${NEXT_PUBLIC_API_URL}/api/menu/:slug` dentro del Server Component
- [ ] 1.3 Invocar `notFound()` cuando el backend responde 404, y manejar errores de red/servidor con un estado de error genérico (try/catch alrededor del fetch)
- [ ] 1.4 Crear `fuego/frontend/app/menu/[slug]/not-found.tsx` con un mensaje claro de "restaurante no encontrado"

## 2. Lógica de datos

- [ ] 2.1 Filtrar los items con `available` falso antes de agrupar/renderizar
- [ ] 2.2 Agrupar los items filtrados por `category` en un `Record<string, MenuItem[]>`
- [ ] 2.3 Omitir categorías que quedaron sin items tras el filtro de disponibilidad

## 3. Componentes de UI

- [ ] 3.1 Crear componente `MenuCategorySection` que renderiza el encabezado de categoría y la lista de items
- [ ] 3.2 Crear componente `MenuItemCard` que muestra imagen (o placeholder si `image_url` es nulo), nombre, descripción y precio
- [ ] 3.3 Definir el placeholder visual para items sin imagen (icono o bloque de color consistente con el diseño)

## 4. Diseño mobile-first

- [ ] 4.1 Maquetar `MenuItemCard` y `MenuCategorySection` con Tailwind partiendo de viewport móvil (sin prefijos de breakpoint)
- [ ] 4.2 Agregar ajustes `sm:`/`md:` para que el layout se adapte correctamente en tablet/desktop sin romperse
- [ ] 4.3 Verificar contraste y tamaño de fuente legibles en pantallas chicas (mínimo 16px para texto de precio/nombre)

## 5. Manejo de errores y estados

- [ ] 5.1 Crear vista de error genérica para fallos de red/servidor (distinta de la de slug no encontrado)
- [ ] 5.2 Agregar un `<title>` dinámico con el nombre del restaurante cuando esté disponible (usando `generateMetadata` de Next.js)

## 6. Verificación

- [ ] 6.1 Probar manualmente `/menu/fuego-ba` (slug semilla) y confirmar que se ven los items disponibles agrupados por categoría
- [ ] 6.2 Probar `/menu/slug-inexistente` y confirmar que se muestra la pantalla de "no encontrado"
- [ ] 6.3 Probar en viewport móvil (DevTools, ~375px de ancho) que no hay scroll horizontal ni texto cortado
- [ ] 6.4 Correr `npm run build` en el frontend para confirmar que la ruta compila sin errores
