## Why

Fuego ya tiene una base visual útil en `/`, `/admin/login` y `/admin`, pero esa base está implícita en clases Tailwind repetidas. Para evitar rediseños inconsistentes, necesitamos convertir ese diseño existente en reglas y plantillas reutilizables antes de expandirlo al resto de la app.

## What Changes

- Documentar el sistema visual actual como fuente inicial de diseño: fondo, tarjetas, tipografía, color, botones, formularios, listas y estados.
- Crear una capacidad de sistema de diseño basada en las pantallas existentes, sin rediseñarlas.
- Definir plantillas de código mínimas para construir nuevas pantallas con el mismo lenguaje visual.
- Establecer reglas de uso para cuándo aplicar variantes primarias, secundarias, destructivas, estados de error y estados vacíos.
- Preparar una implementación posterior que centralice patrones sin alterar comportamiento funcional.

## Capabilities

### New Capabilities
- `design-system-guidelines`: Define reglas visuales y plantillas de código basadas en el diseño existente de Fuego.

### Modified Capabilities
- None.

## Impact

- Afecta principalmente documentación/spec y, en implementación posterior, `fuego/frontend/app/globals.css` y posibles componentes pequeños compartidos.
- No cambia APIs, backend, autenticación, base de datos ni flujos funcionales.
- No incorpora nuevas dependencias, librerías UI, icon packs ni fuentes.
- Las pantallas actuales `/`, `/admin/login` y `/admin` son referencia visual, no objetivo de rediseño.
