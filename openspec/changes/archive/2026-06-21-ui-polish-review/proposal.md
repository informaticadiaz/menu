## Why

La interfaz actual es funcional pero conserva señales de prototipo: metadata de starter, jerarquía visual plana, estados de formulario básicos y riesgo de desborde en mobile del panel admin. El menú público es la pantalla más visible del producto y necesita mayor claridad, legibilidad y calidad percibida sin cambiar el alcance funcional.

## What Changes

- Ajustar base visual global: metadata, idioma del documento y comportamiento de color para evitar dark mode accidental con estilos no preparados.
- Pulir landing, signup y login con mejor jerarquía, ayudas contextuales, foco visible y consistencia visual.
- Mejorar la página pública del menú con cabecera más clara, cards más legibles, placeholder no informal y layout mobile-first.
- Mejorar el panel admin para que las acciones de items sean usables en mobile y el formulario tenga contexto visual claro.
- Mantener las rutas, APIs y modelo de datos existentes.

## Capabilities

### New Capabilities


### Modified Capabilities
- `landing-page`: mejora de presentación visual y metadata de la ruta raíz sin cambiar navegación ni CTAs requeridos.
- `restaurant-signup`: mejora de usabilidad visual del formulario de alta, incluyendo claridad del slug/URL y estados de foco/error.
- `admin-auth`: mejora visual del login admin y del panel administrativo autenticado, incluyendo layout mobile de acciones.
- `public-menu-page`: mejora visual mobile-first del menú público, sus cards, placeholder e identidad mínima del restaurante.

## Impact

- Afecta frontend Next en `fuego/frontend/app/**` y estilos globales en `fuego/frontend/app/globals.css`.
- No cambia endpoints, contratos API, autenticación, persistencia ni dependencias.
- Requiere verificación responsive en mobile y desktop mediante revisión de clases, lint/build y, si hay navegador disponible, inspección visual.
