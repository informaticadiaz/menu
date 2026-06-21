## ADDED Requirements

### Requirement: Menú público con jerarquía visual gastronómica
La página pública del menú SHALL mostrar el restaurante, categorías e items con una jerarquía visual clara, legible y mobile-first.

#### Scenario: Cliente escanea QR en celular
- **WHEN** un cliente navega a `/menu/<slug-existente>` desde un viewport móvil
- **THEN** puede identificar restaurante, categorías, nombre de item, descripción y precio sin scroll horizontal ni densidad excesiva

### Requirement: Card de item pulida
Las cards de item SHALL distinguir imagen/placeholder, información principal y precio de forma consistente, evitando placeholders informales o rotos.

#### Scenario: Item sin imagen
- **WHEN** un item disponible no tiene `image_url`
- **THEN** la card muestra un placeholder visual consistente con el diseño, sin emoji informal ni icono roto

#### Scenario: Item con descripción larga
- **WHEN** un item tiene una descripción de varias palabras o frases
- **THEN** la card mantiene lectura clara y el precio sigue siendo fácil de encontrar
