## 1. Pre-requisito

- [x] 1.1 Confirmar que la propuesta `admin-panel` está implementada (hashing de password, emisión de JWT) antes de empezar; si no, implementar esa infraestructura mínima primero

## 2. Backend: utilidades de slug

- [x] 2.1 Crear función `slugify(name: string): string` (minúsculas, espacios y caracteres especiales a guiones, sin guiones repetidos/al borde)
- [x] 2.2 Crear función que, dado un slug base, devuelva el primer slug libre probando sufijos `-2`, `-3`, ... contra la tabla `restaurants`
- [x] 2.3 Crear validador de formato de slug (regex `^[a-z0-9]+(-[a-z0-9]+)*$`) para slugs provistos explícitamente por el usuario

## 3. Backend: endpoint de signup

- [x] 3.1 Implementar `POST /api/auth/signup` que reciba `{ restaurantName, slug?, email, password }`
- [x] 3.2 Validar email único contra `admin_users` antes de intentar el insert; responder 409 si ya existe
- [x] 3.3 Resolver el slug final (provisto y libre, provisto inválido → 400, o autogenerado con resolución de colisión)
- [x] 3.4 Envolver la creación de `restaurants` + `admin_users` en `db.transaction()`, hasheando el password con bcrypt antes de insertar
- [x] 3.5 Emitir el JWT (reutilizando la función de `admin-panel`) y responder 201 con el token y los datos básicos del restaurante creado
- [x] 3.6 Eliminar (o dejar sin documentar/sin rutear) el endpoint genérico `POST /api/restaurants` actual

## 4. Frontend: página de signup

- [x] 4.1 Crear página `fuego/frontend/app/signup/page.tsx` con formulario: nombre del restaurante, slug (editable, prellenado al tipear el nombre), email, password
- [x] 4.2 Validar formato de slug en el cliente antes de enviar (mismo patrón que el backend)
- [x] 4.3 Al enviar, llamar a `POST /api/auth/signup`; en éxito, guardar el token (reutilizando el helper de sesión de `admin-panel`) y navegar a `/admin`
- [x] 4.4 Mostrar errores 409 (slug/email duplicado) y 400 (formato inválido) junto al campo correspondiente, conservando los valores ya ingresados

## 5. Verificación

- [x] 5.1 Probar signup exitoso de punta a punta: completar formulario → quedar logueado en `/admin` con menú vacío
- [x] 5.2 Probar colisión de slug provisto explícitamente (debe dar 409, no autogenerar)
- [x] 5.3 Probar que no proveer slug genera uno a partir del nombre, con resolución de colisión si corresponde
- [x] 5.4 Probar email duplicado (debe dar 409 y no crear ningún restaurante)
- [x] 5.5 Confirmar que un fallo simulado a mitad de transacción no deja un restaurante sin admin (verificar en la base de datos)
- [x] 5.6 Correr `npm run build` en backend y frontend para confirmar que compilan sin errores
