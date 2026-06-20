## MODIFIED Requirements

### Requirement: Sesión inmediata tras el signup
El sistema SHALL dejar al admin recién creado autenticado, sin requerir un login adicional, mediante una cookie httpOnly de sesión emitida por el backend al responder el signup; el frontend detecta la sesión activa (vía `/api/auth/me`) y navega al panel sin guardar ningún token explícitamente.

#### Scenario: Redirección al panel tras signup exitoso
- **WHEN** el formulario de `/signup` recibe una respuesta exitosa del backend (que incluye `Set-Cookie` con la sesión)
- **THEN** la aplicación navega directamente a `/admin`, sin pasar por `/admin/login` y sin manipular almacenamiento local

#### Scenario: Error de validación mostrado en el formulario
- **WHEN** el backend responde 409 (slug o email duplicado) o 400 (formato inválido)
- **THEN** el formulario de `/signup` muestra el mensaje de error específico junto al campo correspondiente, sin perder los demás valores ingresados, y no se emite ninguna cookie de sesión
