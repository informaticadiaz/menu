# URLs de negocio

Este documento explica como se crea y se usa la URL publica de un negocio en Fuego.

## Concepto principal

Cada restaurante tiene un identificador publico llamado `slug`.

El `slug` es la parte de la URL que identifica al negocio dentro de la plataforma. Por ejemplo, para un restaurante llamado `Fuego`, el slug normal seria:

```text
fuego
```

La URL publica del menu queda formada asi:

```text
/menu/<slug>
```

Por lo tanto, para `Fuego`, la URL seria:

```text
/menu/fuego
```

En desarrollo local:

```text
http://localhost:3000/menu/fuego
```

En produccion:

```text
https://tu-dominio.com/menu/fuego
```

## Que pasa durante el signup

El alta de un negocio se hace desde la pagina:

```text
/signup
```

El formulario pide:

- Nombre del restaurante.
- Slug, mostrado como "URL del menu".
- Email del administrador.
- Contrasena.

Cuando se envia el formulario, el frontend llama al backend:

```text
POST /api/auth/signup
```

El backend crea dos registros en una misma transaccion:

- Un registro en `restaurants`, con el nombre y el slug del negocio.
- Un registro en `admin_users`, con el email y la contrasena hasheada del administrador.

Si todo sale bien, el backend devuelve un token de sesion y los datos basicos del restaurante creado.

## Como se genera el slug

Si el usuario escribe un nombre de restaurante y no modifica manualmente el slug, el frontend genera el slug automaticamente.

Reglas principales:

- Convierte el texto a minusculas.
- Quita acentos.
- Reemplaza espacios y caracteres especiales por guiones.
- Elimina guiones repetidos al principio o al final.

Ejemplos:

```text
Fuego -> fuego
Fuego BA -> fuego-ba
Café del Sur -> cafe-del-sur
La Parrilla & Bar -> la-parrilla-bar
```

## Slug manual

El usuario tambien puede editar el slug antes de crear la cuenta.

El slug manual debe cumplir este formato:

```text
^[a-z0-9]+(-[a-z0-9]+)*$
```

En terminos practicos, significa:

- Solo letras minusculas.
- Numeros permitidos.
- Guiones permitidos entre palabras.
- No puede empezar ni terminar con guion.
- No puede tener espacios.
- No puede tener mayusculas, acentos ni simbolos.

Validos:

```text
fuego
fuego-ba
fuego2026
la-parrilla-1
```

Invalidos:

```text
Fuego
fuego ba
fuego_
-fuego
fuego-
café
```

## Que pasa si el slug ya existe

El campo `restaurants.slug` es unico.

Si el usuario no escribio un slug manual y el sistema genero uno desde el nombre, el backend busca un slug disponible agregando un numero.

Ejemplo:

```text
Fuego -> fuego
```

Si `fuego` ya existe, intenta:

```text
fuego-2
```

Si `fuego-2` tambien existe, intenta:

```text
fuego-3
```

Y asi sucesivamente.

Si el usuario escribio manualmente un slug y ese slug ya existe, el backend no lo cambia automaticamente. Devuelve un error para que el usuario elija otro.

## URL publica del menu

La pagina publica del menu vive en el frontend:

```text
/menu/[slug]
```

Cuando alguien entra a:

```text
/menu/fuego
```

el frontend consulta al backend:

```text
GET /api/menu/fuego
```

El backend busca un restaurante con:

```text
restaurants.slug = "fuego"
```

Si existe, devuelve el nombre del restaurante y sus items de menu.

Si no existe, responde con `404` y el frontend muestra una pantalla de restaurante no encontrado.

## Ejemplo completo

Signup con estos datos:

```text
Nombre del restaurante: Fuego
Slug: fuego
Email: admin@fuego.com
Contrasena: ********
```

Resultado:

```text
Restaurante creado:
name = Fuego
slug = fuego
```

URL publica:

```text
http://localhost:3000/menu/fuego
```

Endpoint usado por la pagina:

```text
http://localhost:3001/api/menu/fuego
```

## Nota sobre el admin

Despues de crear la cuenta, la aplicacion redirige al administrador a:

```text
/admin
```

Esto no cambia la URL publica del negocio. La URL publica ya queda creada con el slug del restaurante, aunque el menu todavia este vacio.

El administrador usa `/admin` para cargar o editar productos, y los clientes usan `/menu/<slug>` para ver el menu.
