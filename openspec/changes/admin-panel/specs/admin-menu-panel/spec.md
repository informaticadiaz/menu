## ADDED Requirements

### Requirement: Pantalla de login
El sistema SHALL ofrecer una página `/admin/login` donde el admin ingresa email y password, almacena el token recibido tras un login exitoso, y es redirigido al panel (`/admin`).

#### Scenario: Login exitoso desde la UI
- **WHEN** el admin completa email y password correctos en `/admin/login` y envía el formulario
- **THEN** la aplicación guarda el token recibido y navega a `/admin`

#### Scenario: Login fallido desde la UI
- **WHEN** el admin envía credenciales incorrectas en `/admin/login`
- **THEN** la aplicación muestra un mensaje de error y permanece en `/admin/login` sin guardar ningún token

### Requirement: Protección de rutas de administración en el cliente
El sistema SHALL redirigir a `/admin/login` cualquier acceso a `/admin` o sus subrutas cuando no exista un token de sesión válido almacenado.

#### Scenario: Acceso sin sesión
- **WHEN** un usuario navega a `/admin` sin un token almacenado (o con uno que el backend rechaza con 401)
- **THEN** la aplicación redirige a `/admin/login`

#### Scenario: Cerrar sesión
- **WHEN** el admin hace clic en "Cerrar sesión" dentro del panel
- **THEN** la aplicación borra el token almacenado y redirige a `/admin/login`

### Requirement: Listado de items del menú en el panel
El sistema SHALL mostrar en `/admin` todos los items del menú del restaurante del admin autenticado, agrupados por categoría, indicando su disponibilidad.

#### Scenario: Carga del panel
- **WHEN** el admin autenticado abre `/admin`
- **THEN** la aplicación solicita `GET /api/admin/menu` y muestra los items agrupados por categoría, con un indicador visual de disponible/no disponible

### Requirement: Crear y editar items del menú
El sistema SHALL permitir crear un nuevo item y editar uno existente (nombre, categoría, descripción, precio, disponibilidad, imagen) mediante un formulario que llama a los endpoints protegidos del backend.

#### Scenario: Crear item
- **WHEN** el admin completa el formulario de "nuevo item" con nombre y precio válidos y lo envía
- **THEN** la aplicación llama a `POST /api/menu-items` con el token de sesión y, si la respuesta es exitosa, agrega el item a la lista mostrada sin recargar la página

#### Scenario: Editar item
- **WHEN** el admin modifica campos de un item existente y guarda
- **THEN** la aplicación llama a `PUT /api/menu-items/:id` con el token de sesión y, si la respuesta es exitosa, actualiza el item en la lista mostrada

#### Scenario: Error de validación al guardar
- **WHEN** el admin intenta guardar un item sin nombre o sin precio
- **THEN** la aplicación muestra un error de validación y no envía el request al backend

### Requirement: Subir imagen de un item
El sistema SHALL permitir adjuntar una imagen a un item del menú usando el endpoint existente `POST /api/upload`, y guardar la URL devuelta en el campo `image_url` del item.

#### Scenario: Subida exitosa
- **WHEN** el admin selecciona una imagen JPG/PNG/WEBP de menos de 5MB en el formulario de un item
- **THEN** la aplicación sube el archivo a `POST /api/upload`, recibe la URL pública, y la asigna al campo `image_url` del item antes de guardar

#### Scenario: Archivo inválido
- **WHEN** el admin selecciona un archivo con formato no soportado o mayor a 5MB
- **THEN** la aplicación muestra el error devuelto por el backend sin completar la subida

### Requirement: Eliminar item del menú
El sistema SHALL permitir eliminar un item del menú con confirmación previa del admin.

#### Scenario: Eliminación confirmada
- **WHEN** el admin hace clic en "Eliminar" sobre un item y confirma la acción en el diálogo de confirmación
- **THEN** la aplicación llama a `DELETE /api/menu-items/:id` con el token de sesión y, si es exitoso, quita el item de la lista mostrada

#### Scenario: Eliminación cancelada
- **WHEN** el admin hace clic en "Eliminar" pero cancela el diálogo de confirmación
- **THEN** la aplicación no envía ningún request y el item permanece en la lista

### Requirement: Marcar disponibilidad de un item
El sistema SHALL permitir alternar el estado de disponibilidad de un item sin necesidad de abrir el formulario completo de edición.

#### Scenario: Alternar disponibilidad
- **WHEN** el admin hace clic en el control de disponibilidad de un item
- **THEN** la aplicación llama a `PUT /api/menu-items/:id` actualizando solo el campo de disponibilidad y refleja el nuevo estado en la lista
