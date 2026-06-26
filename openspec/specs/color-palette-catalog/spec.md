# color-palette-catalog Specification

## Purpose

Definir el catálogo fijo de paletas de color que los negocios pueden elegir para personalizar `/menu/[slug]` y su panel `/admin`.

## Requirements

### Requirement: Catálogo fijo de paletas de color
El sistema SHALL definir un catálogo fijo de 6 a 8 paletas de color predefinidas, cada una con un identificador único y valores de color `primary`, `secondary`, `background` y `accent`.

#### Scenario: Catálogo disponible para selección
- **WHEN** el panel admin necesita mostrar las opciones de paleta disponibles
- **THEN** el sistema expone el catálogo completo de paletas (id, nombre legible y valores de color) para que el frontend renderice las opciones

#### Scenario: Paleta default para negocios sin selección
- **WHEN** un negocio no tiene `palette_id` configurado
- **THEN** el sistema considera una paleta default del catálogo, que preserva la apariencia naranja/clara actual de Fuego

### Requirement: Validación de palette_id contra el catálogo
El sistema SHALL validar que cualquier `palette_id` recibido en escritura corresponda a una paleta existente en el catálogo.

#### Scenario: palette_id válido
- **WHEN** se recibe un `palette_id` que existe en el catálogo
- **THEN** el sistema acepta el valor y lo persiste

#### Scenario: palette_id inválido
- **WHEN** se recibe un `palette_id` que no existe en el catálogo
- **THEN** el sistema rechaza la operación con un error de validación
