## ADDED Requirements

### Requirement: Landing visual polish
La landing SHALL presentar Fuego con jerarquía visual clara, metadata propia del producto y CTAs distinguibles, sin parecer una pantalla de boilerplate.

#### Scenario: Visitante accede a la landing pulida
- **WHEN** un visitante navega a `/`
- **THEN** ve una presentación de Fuego con título, propuesta de valor y CTAs visualmente priorizados hacia registro e ingreso

#### Scenario: Metadata de producto
- **WHEN** la landing se renderiza en el navegador
- **THEN** el documento usa título y descripción propios de Fuego, no valores de `create-next-app`

### Requirement: Documento en español
El frontend SHALL declarar el idioma del documento como español cuando la UI principal esté redactada en español.

#### Scenario: Tecnología asistiva lee la app
- **WHEN** una tecnología asistiva inspecciona el documento
- **THEN** encuentra `lang="es"` en el elemento raíz
