## MODIFIED Requirements

### Requirement: Canon visual basado en pantallas existentes
El sistema de diseño SHALL tomar `/`, `/admin/login`, `/admin`, `/system/login`, `/system` (panel interno), `/signup` y `/menu/[slug]` como canon único de la identidad visual de Fuego, sin variantes de paleta entre pantallas.

#### Scenario: Nueva pantalla usa el canon existente
- **WHEN** se diseña o implementa una nueva pantalla del frontend
- **THEN** su fondo, tarjetas, tipografía, acentos, botones y estados coinciden visualmente con los patrones existentes en `/`, `/admin/login`, `/admin`, `/system/login`, `/system`, `/signup` y `/menu/[slug]`, usando la misma paleta naranja/clara

#### Scenario: Pantalla del panel interno
- **WHEN** se implementa o ajusta `/system/login` o `/system`
- **THEN** usa las clases `brand-*`, `field-*`, `btn-*`, `badge-*` y `notice-*` existentes con la paleta naranja por defecto, igual que `/admin/login` y `/admin`, sin variantes de color propias del panel interno
