# Planos de cumplimiento en agentes de IA: persuasivo vs. estructural

Notas de una sesión de exploración (`/opsx:explore`) sobre por qué el flujo
`proponer → aplicar → verificar → archivar → sincronizar → integrar` con
OpenSpec no se ejecuta de forma programática en este proyecto, y qué
significa realmente "forzar" un comportamiento en un agente de IA.

## El disparador

Se implementó el change `menu-qr-generator` (generador de QR para el menú
público) siguiendo el workflow de OpenSpec. Al revisar el resultado, surgió
una observación: la interacción con OpenSpec no se sintió integrada de
manera programática. El change quedó implementado y verificado, pero:

- Los checkboxes de `tasks.md` se tildaron todos al final, en un solo lote,
  en vez de uno por uno a medida que se completaba cada tarea (que es lo
  que indica explícitamente la skill `openspec-apply-change`).
- El change nunca se archivó ni se sincronizó a `openspec/specs/`.
- Ninguno de los dos pasos anteriores ocurrió "solo" — dependían de que el
  agente decidiera hacerlos.

Esto no fue un incidente aislado. `fuego/docs/deuda-tecnica.md` documenta el
mismo patrón ocurriendo antes, con varios changes (`admin-panel`,
`restaurant-signup`, `public-menu-page`, `landing-page`) marcados
`complete` pero nunca archivados, lo que dejó una capability
(`admin-menu-panel`) sin spec principal por un tiempo.

## El concepto central: dos planos de cumplimiento

```
PLANO PERSUASIVO (probabilístico)          PLANO ESTRUCTURAL (determinístico)
────────────────────────────────           ──────────────────────────────────
system prompt, SKILL.md, CLAUDE.md         hooks (settings.json), exit codes,
"hacé X, después Y, no te olvides Z"       CI gates, permisos de archivo/branch,
                                            schemas validados por script

La IA *intenta* cumplir.                   El gate *no le pregunta* a la IA.
Puede saltarse un paso, mal-interpretar,   Si el artefacto no está en el estado
quedarse sin contexto, priorizar mal.      esperado, la acción se bloquea. Punto.

Ninguna redacción, por más enfática        No importa si la IA "quiso" cumplir
que sea, llega a probabilidad 1.           o no — el chequeo es mecánico.
```

### Plano persuasivo

Es todo lo que vive como texto que un modelo lee e interpreta: el system
prompt, las `SKILL.md` de OpenSpec, los `CLAUDE.md`/`AGENTS.md` del repo.
Funciona por **instrucción**, no por **verificación**. El agente puede
cumplirla, cumplirla parcialmente, o saltársela — y nada en el sistema lo
detecta en el momento. La calidad de la redacción ("update checkbox
immediately after each task", literal en `openspec-apply-change/SKILL.md`)
no cambia esta propiedad: sigue siendo una petición, no una garantía.

### Plano estructural

Es todo lo que vive fuera del texto que el modelo interpreta: scripts,
hooks, exit codes, permisos, validadores de schema, gates de CI. La
diferencia clave no es "es más confiable" — es que **no necesita que el
agente esté de acuerdo**. Un hook que falla con exit code ≠ 0 bloquea la
acción exista o no la "intención" de cumplir del agente. La verificación
ocurre sobre el estado real (un archivo, un resultado de build), no sobre
el resumen que el agente hace de lo que hizo.

> Nota relacionada, ya presente en las instrucciones del propio agente:
> *"Trust but verify: an agent's summary describes what it intended to do,
> not necessarily what it did."* Es el mismo principio aplicado a humanos
> revisando agentes; el plano estructural es ese principio aplicado al
> propio sistema, sin esperar a la revisión humana.

## Evidencia concreta en este repo

Al momento de esta sesión:

- No existe `.claude/settings.json` ni hooks configurados.
- No existe `.github/workflows/` (sin CI).
- El binario `openspec` (la fuente de verdad determinística que las
  skills asumen — `openspec status --json`, `openspec instructions
  --json`) no está instalado; los comandos fallan con `command not found`.

Conclusión: **el 100% del proceso de OpenSpec en este proyecto descansa
hoy en el plano persuasivo.** No hay ningún punto en el que el sistema
verifique el estado real de un change sin depender de que un agente lea
una skill y decida seguirla.

## Clasificación de los pasos del pipeline

No todos los pasos son iguales. Algunos son transformaciones mecánicas de
datos (no requieren criterio); otros son inherentemente de juicio.

| Paso | Naturaleza | ¿Forceable sin LLM? |
|---|---|---|
| Redactar `proposal.md` / `design.md` | Criterio | No — necesita entender intención y contexto |
| Implementar el código de las tareas | Criterio | No — es el trabajo en sí |
| Tildar `tasks.md` a medida que se avanza | Mecánico | Sí — es leer el estado de la tarea y escribir un checkbox |
| Calcular progreso (`N/M tasks complete`) | Mecánico | Sí — ya es lo que hace `openspec status --json` |
| Detectar "complete pero no archivado" | Mecánico | Sí — comparación de estado contra ubicación de directorio |
| Archivar (mover el directorio del change) | Mecánico | Sí — es un `mv` |
| Sincronizar delta specs → specs principales | Mixto | Parcialmente — la propia skill `openspec-sync-specs` se autodefine como *"unlike programmatic merging, use your judgment"* |
| Integrar a `main` (merge/PR) | Política, no técnica | No debería forzarse vía agente — ver tensión abajo |

Los pasos mecánicos son los candidatos naturales para moverse al plano
estructural. Los de criterio solo se pueden acotar (mejores prompts, mejor
scaffolding), nunca forzar al 100%.

## La tensión irreducible: el gate de "integrar a main"

Aun resolviendo todo lo anterior, el último tramo del pipeline imaginado
(`... → archivar → sincronizar → integrar a main`) choca con una política
de seguridad explícita del agente: nunca mergear ni crear un PR sin que se
lo pidan, porque es una acción sobre estado compartido y de alto costo de
reversión. Esto **no es un bug a resolver** — es una decisión deliberada
de mantener un humano en el loop para acciones de ese tipo. Un pipeline
"100% programático, sin humano en ningún punto" entra en conflicto directo
con esa política. La pregunta de diseño no es "¿cómo elimino el gate?"
sino "¿en qué capa vive el gate?" — puede ser una aprobación humana
explícita por sesión, o un gate de CI/branch-protection que no dependa del
agente en absoluto pero sí de una revisión (humana o automatizada) en el
PR.

## Principio rector

> No se fuerza el cumplimiento de un agente escribiendo instrucciones más
> enfáticas. Se fuerza sacando la decisión de las manos del agente y
> dándosela a un chequeo que no necesita preguntarle nada — uno que
> inspecciona un artefacto verificable (un archivo, un exit code, un
> estado de directorio) en lugar de confiar en el relato que el agente
> hace de lo que hizo.

El diseño práctico de cómo aplicar esto al pipeline de OpenSpec en este
repo está en
[`pipeline-openspec-programatico.md`](./pipeline-openspec-programatico.md).
