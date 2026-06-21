# design-system-guidelines Specification

## Purpose

Definir el canon visual de Fuego y las reglas de diseño reutilizables para que todas las pantallas del frontend sean consistentes sin inventar clases desde cero.

## Requirements

### Requirement: Canon visual basado en pantallas existentes
El sistema de diseño SHALL tomar `/`, `/admin/login`, `/admin`, `/system/login`, `/system` (panel interno), `/signup` y `/menu/[slug]` como canon único de la identidad visual de Fuego, sin variantes de paleta entre pantallas.

#### Scenario: Nueva pantalla usa el canon existente
- **WHEN** se diseña o implementa una nueva pantalla del frontend
- **THEN** su fondo, tarjetas, tipografía, acentos, botones y estados coinciden visualmente con los patrones existentes en `/`, `/admin/login`, `/admin`, `/system/login`, `/system`, `/signup` y `/menu/[slug]`, usando la misma paleta naranja/clara

#### Scenario: Pantalla del panel interno
- **WHEN** se implementa o ajusta `/system/login` o `/system`
- **THEN** usa las clases `brand-*`, `field-*`, `btn-*`, `badge-*` y `notice-*` existentes con la paleta naranja por defecto, igual que `/admin/login` y `/admin`, sin variantes de color propias del panel interno

### Requirement: Reglas de layout y superficie
El sistema de diseño SHALL definir plantillas para page shell, contenedor centrado, panel/card principal y lista de cards usando el lenguaje visual existente.

#### Scenario: Pantalla con contenido principal
- **WHEN** una pantalla necesita presentar contenido principal o un panel de administración
- **THEN** usa una plantilla documentada con ancho máximo, padding responsive, tarjeta blanca, borde `stone`, radio grande y sombra ligera

### Requirement: Reglas de tipografía y jerarquía
El sistema de diseño SHALL definir jerarquías para eyebrow, título, texto descriptivo, sección y metadata usando Geist y las escalas existentes.

#### Scenario: Encabezado de pantalla o panel
- **WHEN** una pantalla muestra un encabezado
- **THEN** usa eyebrow en naranja, título con `font-semibold tracking-tight` y descripción en `stone-600` con line-height legible

### Requirement: Reglas de controles e interacción
El sistema de diseño SHALL definir plantillas para botones, inputs, textareas, labels, estados disabled, hover y foco visible.

#### Scenario: Usuario interactúa con formulario
- **WHEN** un usuario enfoca campos, pulsa botones o ve un estado disabled
- **THEN** los controles mantienen bordes, radios, padding, color de foco naranja y estados consistentes con `/admin/login`

### Requirement: Reglas de estados semánticos
El sistema de diseño SHALL definir patrones para errores, estados vacíos, éxito/disponibilidad y acciones destructivas sin cambiar comportamiento funcional.

#### Scenario: UI muestra un estado semántico
- **WHEN** una pantalla muestra error, disponibilidad, estado vacío o acción destructiva
- **THEN** usa color, borde, texto y jerarquía consistentes con los patrones existentes de administración

### Requirement: Plantillas de código documentadas
El sistema de diseño SHALL incluir ejemplos de código o plantillas copiables para construir pantallas y componentes con el canon visual.

#### Scenario: Desarrollador implementa una superficie nueva
- **WHEN** un desarrollador necesita construir una pantalla nueva
- **THEN** puede seguir una plantilla documentada sin inventar clases visuales desde cero

### Requirement: Implementación conservadora
La implementación del sistema de diseño SHALL preservar la apariencia base de `/`, `/admin/login` y `/admin` y SHALL evitar cambios visuales amplios no aprobados.

#### Scenario: Se aplica la guía a código existente
- **WHEN** se extraen reglas o plantillas hacia código compartido
- **THEN** las pantallas de referencia mantienen su apariencia base y sus flujos funcionales existentes
