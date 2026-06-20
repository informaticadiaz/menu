## Why

Hoy `POST /api/restaurants` existe pero está completamente abierto, sin auth, y no crea ningún admin asociado — en la práctica el único restaurante existente es el de ejemplo creado por el seed. Para que Fuego sea una plataforma multi-restaurante real, un dueño de restaurante nuevo necesita poder registrarse por su cuenta (nombre, slug, credenciales) y quedar con acceso inmediato a su propio panel de administración, sin intervención manual en la base de datos.

## What Changes

- **BREAKING**: `POST /api/restaurants` deja de ser un endpoint genérico abierto; se reemplaza por `POST /api/auth/signup`, que crea el restaurante y su admin en una sola operación transaccional.
- El nuevo endpoint valida que el slug sea único y "url-safe" (minúsculas, números, guiones), generándolo automáticamente a partir del nombre si no se provee uno explícito, con sufijo numérico en caso de colisión.
- Valida que el email del admin no esté ya registrado en `admin_users`.
- Al crear exitosamente el restaurante y el admin, responde con el mismo JWT que usa el login (de la propuesta `admin-panel`), permitiendo redirigir directo al panel sin pedir un login adicional.
- Se agrega una página `/signup` en el frontend con el formulario de alta (nombre del restaurante, slug editable, email, password) y manejo de los errores de validación (slug tomado, email tomado, campos inválidos).
- El restaurante nuevo se crea sin items de menú (menú vacío), listo para que el admin empiece a cargar productos desde el panel.

## Capabilities

### New Capabilities
- `restaurant-signup`: alta self-service de un nuevo restaurante + su admin en un solo flujo, con validación de unicidad de slug y email, y emisión de sesión inmediata.

### Modified Capabilities
(ninguna spec existente en `openspec/specs/` todavía — los cambios sobre `POST /api/restaurants` son del MVP actual, no de una capability previamente especificada)

## Impact

- **Backend** (`fuego/backend/src`): nuevo endpoint `POST /api/auth/signup` que reemplaza el uso del actual `POST /api/restaurants` (se elimina o se deja solo como utilidad interna no documentada); reutiliza el hashing de password y la emisión de JWT definidos en la propuesta `admin-panel`.
- **Dependencia de secuencia**: este cambio depende de que `admin-panel` (login, JWT, hashing de password) esté implementado primero, ya que reutiliza esa infraestructura de auth. Se debe aplicar `admin-panel` antes de aplicar `restaurant-signup`, o implementar ambos en el mismo ciclo de trabajo.
- **Frontend** (`fuego/frontend`): nueva ruta `/signup`, reutiliza el cliente HTTP y el manejo de sesión definidos en `admin-panel`.
- **Base de datos**: no requiere cambios de schema; la creación de restaurante + admin debe hacerse en una transacción para evitar restaurantes "huérfanos" sin admin si falla a mitad de camino.
