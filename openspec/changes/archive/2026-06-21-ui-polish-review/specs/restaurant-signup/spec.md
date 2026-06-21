## ADDED Requirements

### Requirement: Claridad visual del signup
El formulario de signup SHALL mantener los campos existentes pero mejorar su legibilidad, estados de foco/error y explicación del slug público.

#### Scenario: Usuario completa nombre del restaurante
- **WHEN** el usuario escribe el nombre del restaurante y el slug se genera automáticamente
- **THEN** la pantalla muestra de forma clara la URL pública resultante o el rol del slug en la URL del menú

#### Scenario: Usuario interactúa con campos del signup
- **WHEN** el usuario enfoca un campo, recibe un error o envía el formulario
- **THEN** el estado visual del campo y del botón es claro sin perder los valores ingresados
