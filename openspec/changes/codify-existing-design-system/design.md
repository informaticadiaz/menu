## Context

Las pantallas `/`, `/admin/login` y `/admin` ya definen una base visual inicial que funciona para Fuego: fondo claro `stone-50`, tarjetas blancas, bordes suaves, radios grandes, sombra ligera, acento naranja, jerarquía tipográfica simple y CTAs redondos. El problema no es falta de diseño, sino falta de reglas y plantillas para reproducirlo sin improvisar en cada pantalla.

El sistema debe codificar esa base existente, no reemplazarla. Cualquier implementación debe ser conservadora y verificable contra esas pantallas de referencia.

## Goals / Non-Goals

**Goals:**

- Crear una guía técnica de diseño basada en las clases y patrones ya usados en `/`, `/admin/login` y `/admin`.
- Definir plantillas reutilizables para page shell, card/panel, encabezado, formulario, botones, listas, badges y mensajes.
- Reducir duplicación de clases sin cambiar la apariencia base de las pantallas de referencia.
- Establecer reglas de consistencia para nuevas pantallas o futuras migraciones visuales.
- Mantener el stack actual: Next, React, Tailwind 4, Geist y CSS global existente.

**Non-Goals:**

- No rediseñar la marca ni cambiar la dirección visual actual.
- No introducir gradientes decorativos, nuevas paletas, nuevas fuentes, icon packs, librerías UI ni animaciones.
- No aplicar cambios masivos a todas las pantallas en una sola pasada.
- No cambiar comportamiento funcional, rutas, APIs ni datos.

## Decisions

1. Tomar las pantallas existentes como canon inicial

   `/`, `/admin/login` y `/admin` serán la referencia visual. La implementación debe extraer patrones equivalentes a lo que ya existe: `stone-50`, `white`, `stone-200/300`, `stone-950`, `stone-600`, `orange-700/800`, `rounded-2xl/3xl`, `shadow-sm`, `focus:outline-orange-600` y layouts mobile-first. Alternativa descartada: inventar un sistema visual nuevo desde tokens más expresivos.

2. Codificar primero plantillas, no componentes complejos

   La primera implementación debe priorizar clases o snippets reutilizables documentados. Si se crean componentes, deben ser mínimos y transparentes. Alternativa descartada: construir una librería interna completa de componentes, porque agregaría abstracción antes de validar el sistema.

3. Mantener Tailwind como lenguaje principal

   Las plantillas deben mapear a clases Tailwind existentes. CSS global queda reservado para base del documento, transiciones, foco y, si hace falta, aliases muy pequeños. Alternativa descartada: migrar a CSS Modules o un sistema de tokens TypeScript.

4. Reglas antes que decoración

   Las reglas deben indicar cuándo usar cada patrón: card principal, card secundaria, botón primario, botón secundario, acción destructiva, formulario, estado de error, badge de disponibilidad y lista. Alternativa descartada: agregar elementos visuales sin rol funcional.

5. Migración incremental

   Las nuevas pantallas deben usar las plantillas desde el inicio. Las pantallas existentes fuera del canon se migrarán de a una, comparando contra las referencias visuales. Alternativa descartada: refactor visual total en una sola tarea.

## Risks / Trade-offs

- La extracción puede cambiar detalles visuales por accidente -> Usar `/`, `/admin/login` y `/admin` como comparación antes/después.
- Abstraer componentes demasiado pronto puede rigidizar la UI -> Empezar con plantillas y solo extraer componentes cuando haya repetición real.
- Mantener Tailwind literal puede dejar duplicación -> Aceptar algo de duplicación mientras el sistema se estabiliza.
- Las reglas pueden quedar vagas -> Incluir ejemplos de código concretos en la guía/plantilla de implementación.
