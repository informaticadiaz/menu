## ADDED Requirements

### Requirement: Generación client-side del QR del menú público
El panel admin SHALL generar, en el navegador, un código QR que codifica la URL pública `/menu/[slug]` del negocio del admin autenticado, sin requerir ningún endpoint de backend nuevo.

#### Scenario: Admin ve el QR de su negocio
- **WHEN** el admin navega a `/admin` con sesión activa
- **THEN** la sección "QR de tu menú" muestra un código QR que codifica `{origen actual}/menu/{slug del negocio}` y el texto de esa URL

#### Scenario: La URL se basa en el origen actual del navegador
- **WHEN** se genera el QR
- **THEN** la URL codificada usa `window.location.origin` (el origen desde el que se sirve el panel admin), concatenado con `/menu/` y el slug del negocio, sin depender de variables de entorno adicionales

### Requirement: Descarga del QR en PNG y SVG
El panel admin SHALL permitir descargar el QR generado como imagen PNG y como SVG.

#### Scenario: Descarga en PNG
- **WHEN** el admin hace clic en "Descargar PNG"
- **THEN** se descarga un archivo de imagen PNG que contiene el QR codificando la URL pública del menú

#### Scenario: Descarga en SVG
- **WHEN** el admin hace clic en "Descargar SVG"
- **THEN** se descarga un archivo SVG que contiene el QR codificando la URL pública del menú

### Requirement: Copiado de la URL como respaldo
El panel admin SHALL mostrar la URL pública del menú como texto junto al QR, con una acción para copiarla al portapapeles.

#### Scenario: Admin copia la URL
- **WHEN** el admin hace clic en el botón "Copiar" junto a la URL mostrada
- **THEN** la URL pública completa del menú se copia al portapapeles del sistema
