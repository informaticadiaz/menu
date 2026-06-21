# landing-page Specification

## Purpose
TBD - created by archiving change landing-page. Update Purpose after archive.
## Requirements
### Requirement: Landing page at root route
La ruta raíz (`/`) del frontend SHALL mostrar una landing page de Fuego en lugar del contenido por defecto de `create-next-app`. La página SHALL incluir el nombre del producto y una descripción breve de la propuesta de valor (menú digital para restaurantes pequeños).

#### Scenario: Visitante accede a la raíz del sitio
- **WHEN** un visitante navega a `/`
- **THEN** ve contenido de Fuego (nombre y propuesta de valor), sin logo, copy ni links de Vercel/Next.js del boilerplate

### Requirement: Call to action para registrar un restaurante nuevo
La landing SHALL incluir un enlace o botón visible que dirija a `/signup`.

#### Scenario: Visitante quiere crear una cuenta
- **WHEN** un visitante hace click en el call-to-action de registro
- **THEN** es navegado a `/signup`

### Requirement: Call to action para ingresar a una cuenta existente
La landing SHALL incluir un enlace o botón visible que dirija a `/admin` para restaurantes que ya tienen cuenta.

#### Scenario: Dueño de restaurante existente quiere loguearse
- **WHEN** un visitante hace click en el call-to-action de login
- **THEN** es navegado a `/admin`

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
