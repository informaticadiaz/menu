## MODIFIED Requirements

### Requirement: Canon visual basado en pantallas existentes
El sistema de diseño SHALL tomar `/`, `/admin/login`, `/system/login`, `/system` (panel interno) y `/signup` como canon único de la identidad visual de Fuego, sin variantes de paleta entre pantallas. `/menu/[slug]` y `/admin` autenticado de un negocio SHALL constituir una excepción explícita de theming tenant-facing: ambas pantallas aplican la paleta de color elegida por el negocio (`palette_id`) en lugar del canon naranja fijo, manteniendo el resto de las reglas de layout, tipografía y controles del sistema de diseño.

#### Scenario: Nueva pantalla propia de Fuego usa el canon existente
- **WHEN** se diseña o implementa una nueva pantalla del frontend que no es tenant-facing (no es `/menu/[slug]` ni `/admin` de negocio)
- **THEN** su fondo, tarjetas, tipografía, acentos, botones y estados coinciden visualmente con los patrones existentes en `/`, `/admin/login`, `/system/login`, `/system` y `/signup`, usando la misma paleta naranja/clara

#### Scenario: Pantalla del panel interno
- **WHEN** se implementa o ajusta `/system/login` o `/system`
- **THEN** usa las clases `brand-*`, `field-*`, `btn-*`, `badge-*` y `notice-*` existentes con la paleta naranja por defecto, sin variantes de color propias del panel interno

#### Scenario: Menú público con paleta de negocio
- **WHEN** un usuario navega a `/menu/<slug>` de un negocio con una paleta de color configurada
- **THEN** la página usa los colores de esa paleta para fondo, acentos y botones, manteniendo el resto de las reglas de layout, tipografía y controles del sistema de diseño

#### Scenario: Panel admin de negocio con paleta propia
- **WHEN** un admin de negocio con una paleta de color configurada navega a `/admin`
- **THEN** el header y los acentos de botones/badges del panel usan los colores de esa paleta, mientras que los estados semánticos (error, éxito) y el resto de los controles mantienen las reglas existentes del sistema de diseño
