## ADDED Requirements

### Requirement: Login admin visual polish
El login admin SHALL presentar el acceso de forma clara, consistente con el resto de la UI, con estados de foco, error y carga visibles.

#### Scenario: Admin inicia sesión
- **WHEN** un admin navega a `/admin/login`
- **THEN** ve un formulario de acceso legible, centrado y con jerarquía clara entre título, campos, error y acción principal

### Requirement: Panel admin mobile usable
El panel administrativo SHALL permitir leer items y ejecutar acciones existentes sin desbordes horizontales en mobile.

#### Scenario: Admin gestiona item en celular
- **WHEN** el panel se renderiza en un viewport de 320–480px
- **THEN** nombre, precio, disponibilidad y botones de acción se muestran sin scroll horizontal ni texto crítico cortado

### Requirement: Formulario de item contextual
El formulario de creación/edición de item SHALL indicar claramente si se está creando o editando y presentar campos, imagen, disponibilidad y acciones con jerarquía visual clara.

#### Scenario: Admin abre formulario de item
- **WHEN** el admin abre el formulario para crear o editar un item
- **THEN** la pantalla muestra contexto de la acción y controles legibles para guardar o cancelar
