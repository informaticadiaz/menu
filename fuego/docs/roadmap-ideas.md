# Ideas de roadmap (brainstorm SaaS)

Lluvia de ideas para evolucionar Fuego de "app de menús" a SaaS completo. No son compromisos ni prioridades fijas, son candidatos a evaluar y convertir en propuestas OpenSpec cuando se decida avanzar.

## Estado actual (resumen)

- Multi-tenant por slug, signup self-service, auth con cookies httpOnly.
- Panel admin por negocio (menú, branding: logo/nombre/descripción).
- Panel interno (system admin): alta/pausa/baja de negocios, reset de passwords.
- Menú público sin auth, agrupado por categoría.
- **En propuesta** (`openspec/changes/color-palette-branding`): paletas de colores predefinidas para personalizar el menú público y el admin de cada negocio.

## Monetización (necesario para que sea SaaS de verdad)

- **Planes con límites**: free (1 negocio, X items, paleta default) vs. pago (paletas premium, sin límite de items, analytics).
- **Trial + bloqueo por vencimiento**: reusar el campo `status` (`active`/`paused`) de `restaurants` para suspender por falta de pago.

## Ganchos de venta rápidos (bajo costo, alto impacto en demo)

- **Generador de QR**: ya mencionado en el copy del landing pero no implementado. QR del slug, descargable, para imprimir en mesa.
- **Analytics básicos**: vistas del menú por día, items más vistos.
- **Preview al compartir el link** (OG image con logo + nombre) para que se vea bien en WhatsApp/redes.

## Producto / diferenciación

- **Items destacados**: badges tipo "más vendido", "nuevo", "recomendado del chef" sobre el modelo `menu_items` existente.
- **Disponibilidad por horario**: items que solo aparecen en ciertos rangos (desayuno/cena), extendiendo el flag `available`.
- **Multi-idioma del menú** (no de la app): traducción del menú a otros idiomas, útil en zonas turísticas.

## Escala / operación

- **Multi-sucursal**: un negocio con varios locales, cada uno con su slug/menú, gestión centralizada.
- **Roles dentro del negocio**: dueño (todo) vs. encargado (solo disponibilidad/precios, sin acceso a branding ni borrado).
- **Exportar/duplicar menú**: para cadenas que abren sucursales nuevas y quieren clonar el menú existente.

## Más adelante (alcance mayor, no para el corto plazo)

- **Pedidos vía WhatsApp checkout**: paso intermedio entre "solo mostrar el menú" y un POS completo con carrito + pasarela de pago propia.
