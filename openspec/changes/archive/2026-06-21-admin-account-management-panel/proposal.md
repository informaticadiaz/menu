## Why

El sistema permite que negocios se registren y accedan a su panel, pero el fundador/programador no tiene una herramienta interna para ver y controlar los negocios registrados. Esto impide pausar negocios, eliminar registros problemáticos o crear negocios manualmente desde una interfaz segura.

## What Changes

- Se agrega un rol de administrador interno del sistema, separado de los admins de cada negocio.
- Se agrega autenticación para el administrador interno y un panel privado para gestionar negocios registrados.
- El panel permite listar todos los negocios, ver datos básicos del negocio y su admin, crear un negocio manualmente, pausar/reactivar un negocio y eliminar un negocio.
- Los negocios pausados no pueden iniciar sesión ni seguir usando rutas autenticadas de administración de menú.
- La eliminación de un negocio elimina el restaurante y sus datos dependientes según las relaciones existentes de base de datos.

## Capabilities

### New Capabilities
- `system-account-admin`: autenticación y panel interno para que el fundador/programador liste, cree, pause, reactive y elimine negocios registrados.

### Modified Capabilities
- `admin-auth`: la autenticación y autorización de admins de restaurante debe rechazar cuentas pausadas.
- `restaurant-signup`: los negocios creados por signup deben nacer activos y ser visibles en la administración interna del sistema.

## Impact

- **Backend** (`fuego/backend/src`): nuevos campos o tabla para estado del negocio y credenciales del administrador interno; nuevos endpoints protegidos para gestión de negocios; validación de estado activo en login y middleware existente.
- **Frontend** (`fuego/frontend`): nuevas rutas privadas para login y panel interno del sistema, separadas del panel `/admin` que usan los negocios para editar su menú.
- **Base de datos**: migración del schema local SQLite para almacenar estado del negocio y usuarios internos del sistema.
- **Seguridad**: las acciones de gestión de negocios deben requerir sesión de administrador interno y no deben ser accesibles para admins de negocio.
