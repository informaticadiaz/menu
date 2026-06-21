## Context

Fuego tiene una UI funcional construida con Next, React y Tailwind. Las pantallas actuales usan clases directas simples, sin componentes de diseño compartidos ni tokens visuales propios. La prioridad del producto es mobile-first: el menú público se consulta desde QR y el panel admin debe funcionar en celular para carga rápida de items.

## Goals / Non-Goals

**Goals:**
- Mejorar calidad percibida y legibilidad de landing, signup, login, menú público y panel admin.
- Resolver riesgos responsive del panel admin, especialmente acciones largas en items.
- Hacer más clara la URL pública creada durante signup.
- Mantener un lenguaje visual sobrio, gastronómico y no genérico, usando Tailwind existente.
- Evitar dark mode accidental mientras no exista diseño dark completo.

**Non-Goals:**
- No rediseñar flujos, rutas ni navegación.
- No cambiar APIs, autenticación, schema de datos ni lógica backend.
- No introducir librerías UI, icon packs, fuentes nuevas ni animaciones externas.
- No implementar ordenamiento manual, búsqueda, filtros ni nuevas features de administración.

## Decisions

- Usar Tailwind inline en los componentes existentes en vez de crear un sistema de componentes nuevo. Esto minimiza alcance y evita abstraer antes de que el producto tenga patrones estables.
- Mantener una paleta clara fija y remover/neutralizar el dark mode automático. La UI actual no está diseñada con tokens dark-safe y mezclar colores fijos con `prefers-color-scheme` puede romper contraste.
- Priorizar layout mobile-first para menú público y admin. En escritorio se usará ancho contenido moderado y composición más respirada, sin agregar columnas complejas innecesarias.
- Reemplazar el placeholder informal de emoji por un bloque visual consistente basado en color, borde y texto/forma simple. Esto sostiene mejor la calidad visual en restaurantes sin fotos cargadas.
- En el admin, convertir acciones largas en una distribución que pueda envolver o apilarse en mobile. Se prefiere claridad sobre densidad extrema porque las acciones modifican disponibilidad o eliminan items.

## Risks / Trade-offs

- Cambios visuales sin navegador disponible pueden requerir ajuste fino posterior. Mitigación: mantener cambios conservadores, usar clases responsive estándar y verificar con build/lint.
- Remover dark mode automático puede reducir soporte para usuarios con preferencia dark. Mitigación: el producto no tiene diseño dark completo; una versión clara consistente es más segura que un dark parcial roto.
- Mejorar varias pantallas en un solo cambio puede ampliar revisión visual. Mitigación: limitarse a rutas existentes y no cambiar comportamiento funcional.
