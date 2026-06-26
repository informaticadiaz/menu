# Diseño práctico: pipeline programático para OpenSpec + Claude Code

Documento de diseño (capturado en modo exploración, no implementado) que
desarrolla cómo llevar a la práctica la distinción entre plano persuasivo
y plano estructural descrita en
[`planos-de-cumplimiento-ia.md`](./planos-de-cumplimiento-ia.md), aplicada
al pipeline `proponer → aplicar → verificar → archivar → sincronizar →
integrar` de OpenSpec en este repo.

## Contexto

Hoy el pipeline completo depende de que un agente lea las skills de
`.claude/skills/openspec-*` y eligiera invocarlas en orden. No hay ningún
punto de verificación externo. Síntomas observados:

- Changes que terminan su implementación pero nunca se archivan
  (`admin-panel`, `restaurant-signup`, `public-menu-page`, `landing-page`,
  documentado en `fuego/docs/deuda-tecnica.md`).
- `tasks.md` actualizado en lote al final en vez de incrementalmente.
- El binario `openspec` (fuente de verdad determinística que las skills
  asumen vía `compatibility: Requires openspec CLI`) ausente en este
  entorno, por lo que incluso el paso de generación de artefactos se
  resuelve hoy a mano.

## Goals

- Detectar de forma determinística cuándo el estado de un change OpenSpec
  es inconsistente (ej. tasks completas sin archivar) sin depender del
  juicio del agente en el momento en que ocurre.
- Mover los pasos puramente mecánicos del pipeline (conteo de progreso,
  detección de inconsistencias, archivado) a un script verificable por
  exit code, no por relato del agente.
- Dejar explícito, no implícito, dónde sigue habiendo un humano (o un
  gate de CI) en el loop — particularmente en la integración a `main`.

## Non-goals

- No se busca eliminar el criterio humano/agente de la redacción de
  `proposal.md` / `design.md` ni de la implementación del código — son
  pasos de juicio, no de transformación de datos.
- No se busca reemplazar `openspec-sync-specs`: la propia skill se define
  como fusión por criterio ("unlike programmatic merging, use your
  judgment"), y eso es una decisión correcta para esa tarea en particular.
- No se busca un pipeline sin ningún punto de aprobación humana para
  merges a `main` — eso es una política de seguridad, no un defecto.
- Este documento no instala ni activa nada. Es un diseño para decidir
  antes de convertirlo en un change real.

## Decisiones de diseño

### 1. La "tarea programática" central: un script de verificación de estado

En vez de confiar en que el agente recuerde archivar, se define un script
(`scripts/openspec-check.sh` o equivalente en Node, dado que el resto del
repo es TS/Node) que es la única fuente de verdad sobre el estado del
pipeline. Pseudocódigo de su lógica:

```
para cada directorio en openspec/changes/* (excluyendo archive/):
  leer tasks.md (si existe)
  total = contar líneas "- [ ]" + "- [x]"
  completas = contar líneas "- [x]"

  si total > 0 y completas == total:
    marcar como "implementation_complete"

  si "implementation_complete" y el directorio sigue fuera de archive/:
    reportar INCONSISTENCIA: "change '<nombre>' completo, no archivado"

salir con exit code != 0 si hay alguna inconsistencia reportada
```

Esto no requiere el CLI real de `openspec`: es lectura de texto plano
sobre una convención ya estable en este repo (`- [ ]` / `- [x]`). Si más
adelante se instala el CLI real, este script se reemplaza por
`openspec status --json` + un chequeo de los mismos invariantes, sin
cambiar el resto del diseño.

### 2. Dónde se ejecuta: hook local + gate de CI (dos capas, no una)

```
┌─ Capa local (Claude Code hook) ───────────────────────────┐
│ .claude/settings.json → hook "Stop"                       │
│ Ejecuta el script al final de cada turno/sesión.           │
│ Si falla: no bloquea destructivamente, pero inyecta el      │
│ resultado como contexto / impide que la sesión termine     │
│ "tranquila" sin que el agente lo vea.                       │
│ Alcance: feedback rápido, mientras se trabaja.              │
└────────────────────────────────────────────────────────────┘

┌─ Capa CI (GitHub Actions, sobre push/PR) ───────────────────┐
│ .github/workflows/openspec-check.yml                        │
│ Mismo script, corre sobre el estado real del repo en el      │
│ remoto, no en la sesión del agente.                          │
│ Si falla: bloquea el merge (branch protection).              │
│ Alcance: garantía dura, no depende de que el agente haya     │
│ corrido el hook, ni de que la sesión local lo haya visto.    │
└────────────────────────────────────────────────────────────┘
```

Son complementarias, no redundantes: el hook da feedback inmediato durante
el trabajo; el gate de CI es la garantía que no depende de que ninguna
sesión de agente haya corrido — cubre el caso de un humano editando a
mano, o de una sesión que terminó sin pasar por el hook.

Boceto de hook (`.claude/settings.json`, **no aplicado, solo diseño**):

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "scripts/openspec-check.sh" }
        ]
      }
    ]
  }
}
```

Boceto de gate de CI (**no aplicado, solo diseño**):

```yaml
# .github/workflows/openspec-check.yml
on: [pull_request]
jobs:
  openspec-state:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: scripts/openspec-check.sh
```

### 3. Orquestador externo para invocaciones headless (opcional, mayor alcance)

Para el caso de querer correr el pipeline de punta a punta sin un humano
manejando el chat turno por turno, la secuencia se mueve a un script que
invoca al agente como subrutina y **verifica el estado entre cada paso
con el script de la decisión 1**, no con el texto que el agente devuelve:

```
1. claude -p "/opsx:apply <change>"        (headless)
2. bash: ¿tasks.md de <change> está 100% [x]?
   no → detener, reportar bloqueo (no asumir éxito)
   sí → continuar
3. bash: correr build/lint/tests del proyecto, leer exit code
   falla → detener, reportar bloqueo
   pasa → continuar
4. claude -p "/opsx:archive <change>"      (headless, recién acá se invoca)
5. bash: ¿el directorio quedó bajo archive/?
   verificación final, no se asume por el texto de salida del paso 4
```

La diferencia con el estado actual: hoy yo (el agente) decido cuándo pasar
del paso 1 al 4. Acá la decisión de avanzar la toma un script que lee
archivos y exit codes — el agente deja de ser el orquestador y pasa a ser
un paso reemplazable dentro de un flujo que no controla.

### 4. Integración a `main`: gate explícitamente fuera de este diseño

Por la tensión descripta en el documento de conceptos, este diseño no
propone automatizar el merge a `main`. El punto de cierre natural es: el
gate de CI (decisión 2) corre sobre el PR, y el merge sigue requiriendo
aprobación — humana, o de una regla de branch protection que sí se
configure explícitamente como tal. No se modela acá como parte del
"pipeline del agente".

## Riesgos y trade-offs

- **Falsos positivos del script**: si `tasks.md` usa un formato no
  estándar (sub-listas, checkboxes anidados), el conteo simple por regex
  puede errar. Mitigación: mantener la convención plana ya usada en todos
  los changes existentes, o migrar a parsear vía el CLI real si se
  instala.
- **El hook local no sustituye al gate de CI**: un hook de Claude Code
  corre solo si la sesión pasa por ese punto; no cubre ediciones manuales
  ni sesiones que terminan abruptamente. Por eso el diseño pide ambas
  capas, no solo una.
- **Seguir dependiendo de la ausencia del CLI real**: este diseño evita el
  bloqueo de "no hay `openspec` instalado" reimplementando el chequeo
  mínimo necesario en bash/Node, pero no resuelve la causa raíz (capa 1
  del documento de conceptos). Si se instala el CLI en algún momento, vale
  la pena revisar si conviene reemplazar el script por llamadas directas a
  `openspec status --json`.
- **Alcance deliberadamente parcial**: este diseño fuerza la *detección*
  de inconsistencias y el *paso mecánico* de archivado/orquestación. No
  fuerza calidad de contenido (un `proposal.md` pobre pasa el gate igual
  si el formato es válido) — eso sigue siendo plano persuasivo, y está
  bien que lo sea.

## Próximos pasos (no ejecutados en este documento)

Si se decide avanzar, el camino natural es abrir un change de OpenSpec
real para esto (p. ej. `openspec-pipeline-enforcement`), con su propio
`proposal.md` / `tasks.md`, en vez de implementarlo directamente desde
modo exploración. Candidatos a primera iteración, en orden de costo
creciente:

1. Escribir `scripts/openspec-check.sh` y correrlo manualmente como
   verificación ad-hoc (sin hook, sin CI) — valida la lógica antes de
   automatizar nada.
2. Agregar el hook `Stop` en `.claude/settings.json`.
3. Agregar el workflow de CI con branch protection sobre `main`.
4. Evaluar el orquestador headless solo si realmente se necesita correr
   el pipeline sin supervisión turno a turno — es el de mayor costo y el
   de menor beneficio inmediato dado el tamaño actual del proyecto.
