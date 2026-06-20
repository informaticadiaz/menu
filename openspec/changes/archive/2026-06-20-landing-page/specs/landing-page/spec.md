## ADDED Requirements

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
