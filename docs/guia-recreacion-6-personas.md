# Guía — Recreación de SIGEB con 6 personas vía PRs (simulación)

> Documento de operación. Describe, desde cero, cómo reconstruir SIGEB en un repositorio nuevo de GitHub
> simulando un equipo Scrum de 6 personas, donde cada persona entrega **su sección** de código vía **PRs**,
> cada uno trabaja en **su propia versión** (rama) sin interferir con los demás, y **David** (admin y Scrum Master)
> revisa, prueba y aprueba los PRs.
>
> **Versión de referencia: CI #40 = commit `a720298`** (estado actual del repositorio `sigeb-prod`).

---

> ### ✋ Primero: ¿qué documentos leer?
>
> Esta guía es el **resumen general**. Antes de ejecutar cualquier paso, lee los documentos dedicados:
>
> | Documento | Para quién |
> |---|---|
> | `docs/00-indice.md` | Todos — orden de lectura recomendado |
> | `docs/01-scrum-como-trabajamos.md` | Todos — cómo se trabajará con Scrum |
> | `docs/02-git-github-conceptos-basicos.md` | Todos — Git y GitHub desde cero |
> | `docs/03-github-david-aprobar-pr.md` | Solo David — revisar, probar y aprobar PRs |
> | `docs/04-pr-paso-a-paso-por-persona.md` | Cada persona — cómo hacer y pushear su PR |
> | `docs/05-versiones-asignadas-por-persona.md` | Todos — la versión exacta que le toca a cada uno |

---

## Índice

- [0. Qué es esto y modelo general](#0-qué-es-esto-y-modelo-general)
- [1. Requisitos previos (desde cero)](#1-requisitos-previos-desde-cero)
- [2. Fase 0 · Preparación del repositorio (solo David)](#2-fase-0--preparación-del-repositorio-solo-david)
- [3. Conectar sigeb-prod como fuente de referencia](#3-conectar-sigeb-prod-como-fuente-de-referencia)
- [4. Propiedad de secciones: la versión de cada persona](#4-propiedad-de-secciones-la-versión-de-cada-persona)
- [5. Cómo descargar la versión de código de cada persona](#5-cómo-descargar-la-versión-de-código-de-cada-persona)
- [6. Ciclo semanal sin interferencias (paso a paso)](#6-ciclo-semanal-sin-interferencias-paso-a-paso)
- [7. Protocolo anti-interferencia (reglas duras)](#7-protocolo-anti-interferencia-reglas-duras)
- [8. Cierre de sprint y release](#8-cierre-de-sprint-y-release)
- [9. Verificación de fidelidad contra los hitos](#9-verificación-de-fidelidad-contra-los-hitos)

---

## 0. Qué es esto y modelo general

Vamos a reconstruir SIGEB en un **repositorio nuevo y privado de GitHub**. El código del producto
**ya existe** y vive en el repositorio real `sigeb-prod`; lo que se **simula** es el *proceso*: que el
proyecto haya sido construido por un equipo de 6 personas en 6 sprints, cada quien con su sección,
entregándola mediante Pull Requests que David aprueba después de probarlas.

- El **código de referencia** se toma de `sigeb-prod` en **6 hitos** (commits). Cada hito representa el
  "estado exacto" que debe tener el repositorio nuevo al **cierre de cada sprint**.
- Al terminar la simulación (sup. viernes 16 de octubre) el repositorio nuevo debe equivaler al estado
  actual de `sigeb-prod`.

### 6 personas

| Persona | Rol Scrum | Rol técnico | En esta simulación |
|---|---|---|---|
| David | Scrum Master / Product Owner (dual) | Full-stack, supervisión | Admin del repo, revisa/prueba/aprueba PRs, CI, archivos compartidos |
| Marcos | Development Team | Backend 1 — Seguridad y Autenticación | `auth/`, `users/`, `audit/`, `common/` |
| Héctor | Development Team | Backend 2 — Convocatorias | `catalogos/`, `convocatorias/`, `storage/`, tipos de documento |
| José | Development Team | Backend 3 — Solicitudes y Evaluación | `solicitudes/`, `evaluaciones/`, `comites/`, `sesiones/`, `decisiones/`, `reportes/` |
| Yemerson | Development Team | Frontend 1 — Portal público | Layout/Design System, páginas públicas, panel admin |
| Hamilton | Development Team | Frontend 2 — Sistema interno + IA | Web auth, dashboard, formulario multi-step, chat IA, panel evaluador |

> Detalles oficiales en `doc/team/members.md` y `doc/team/roles.md`.

### Los 6 hitos (commits de referencia en sigeb-prod)

Cada sprint termina con el repositorio nuevo en el estado del hito correspondiente:

| Sprint | Semana | Hito (commit) | Tema |
|---|---|---|---|
| S1 | 07–11 sep | `4b0795f` | Auth y seguridad (JWT, roles, permisos) |
| S2 | 14–18 sep | `acb3b0e` | Convocatorias, catálogos, solicitudes, CI |
| S3 | 21–25 sep | `41285d4` | Evaluación: evaluadores, comités, sesiones, decisiones |
| S4 | 28 sep–02 oct | `ab66393` | Reportes, auditoría, asistente IA, layout base |
| S5 | 05–09 oct | `dcba851` | Portal público, web auth, dashboard |
| S6 | 12–16 oct | `e36ac2c` | Sistema interno, paneles, constancia PDF |

### Modelo de versiones (la clave)

- `develop` del repositorio nuevo **siempre equivale al hito del sprint anterior**.
- La rama de cada persona = `develop` actualizado **+ únicamente su sección** extraída del hito del sprint actual.
- Al mergear todas las ramas del sprint en el orden correcto, el cierre equivale **exactamente** al hito.
- Como cada persona solo toca *sus* carpetas, las ramas no se pisan entre sí.

---

## 1. Requisitos previos (desde cero)

Para cada una de las 6 personas:

1. Instalar **Git** (e incluir Git Bash en Windows).
2. Tener cuenta en **GitHub**.
3. Instalar **Node.js 20** + npm (lo incluye Node).
4. (Recomendado) Instalar **GitHub CLI** (`gh`) y hacer login: `gh auth login`.

Verificación inicial:

```bash
git --version
node --version     # v20.x
npm --version
gh --version
```

Configuración única de identidad (cada persona con su propio nombre/email):

```bash
git config --global user.name "Nombre Real"
git config --global user.email "username@usuarios.github.com"
git config --global init.defaultBranch main
```

---

## 2. Fase 0 · Preparación del repositorio (solo David)

**Objetivo:** tener un repo nuevo, privado, con ramas protegidas y CI, listo para recibir los PRs.

1. GitHub → **New repository** → **Private** → nombre sugerido: **`sigeb-equipo`**.
2. **Settings → Collaborators**: agregar a las 6 personas. Los devs reciben permiso **Write**
   (pueden empujar `feature/*` y abrir PRs, pero no mergear a `develop`/`master`).
3. **Branch protection** en `master` y `develop` (Settings → Branches → Add rule):
   - `Require a pull request before merging`
   - `Require 1 approving review`
   - `Require status checks to pass` → marcar el workflow de CI
   - Desmarcar pujos directos: si GitHub lo muestra, mantener `Do not allow bypassing the above settings`
4. Copiar al repo nuevo (desde `sigeb-prod`):
   - `.github/workflows/ci.yml` → CI en cada PR (lint + tests + build + smoke completo, ya verde)
   - `.github/pull_request_template.md` → checklist de Definition of Done
5. Subir la **base inicial** (equivalente al Sprint 0: monorepo con NestJS en `apps/api`,
   Next.js en `apps/web`, Prisma, Docker y la migración base). Se hace en `master` con commits `chore:`,
   después se crea `develop` desde `master`:
   ```bash
   git init
   git add .
   git commit -m "chore: setup monorepo NestJS + Next.js + Prisma + Docker"
   git branch -m master
   git remote add origin git@github.com:<David>/sigeb-equipo.git
   git push -u origin master
   git push origin master:develop
   ```
6. Cada dev clona:
   ```bash
   git clone git@github.com:<David>/sigeb-equipo.git
   cd sigeb-equipo
   ```

---

## 3. Conectar sigeb-prod como fuente de referencia

Cada persona agrega `sigeb-prod` como *remote* de solo lectura. Así puede inspeccionar y "descargar"
las versiones exactas del código sin modificar el repo original:

```bash
git remote add sigeb-prod https://github.com/Deividcodv/sigeb-prod.git
git fetch sigeb-prod
```

Comprobar que los hitos existen:

```bash
git log --oneline sigeb-prod/4b0795f -1
git log --oneline sigeb-prod/acb3b0e -1
git log --oneline sigeb-prod/41285d4 -1
git log --oneline sigeb-prod/ab66393 -1
git log --oneline sigeb-prod/dcba851 -1
git log --oneline sigeb-prod/e36ac2c -1
```

---

## 4. Propiedad de secciones: la versión de cada persona

Cada persona es **dueña única** de sus módulos. Nunca debe modificar archivos de un módulo ajeno.

### Marcos — Backend Seguridad

| Sprint | Hito | Qué le toca | Ramas de ejemplo |
|---|---|---|---|
| S1 | `4b0795f` | `apps/api/src/auth/`, `apps/api/src/common/` (guards, decoradores, filtros, interceptores), `apps/api/src/users/`, DTOs y validaciones | `feature/auth-login`, `feature/auth-jwt-roles` |
| S4 | `ab66393` | Auditoría: `apps/api/src/audit/` (registro dirigido, US-36) | `feature/auditoria-registro` |
| S6 | `e36ac2c` | Auditoría por rol + ajustes de seguridad | `feature/auditoria-por-rol` |

### Héctor — Backend Convocatorias

| Sprint | Hito | Qué le toca | Ramas de ejemplo |
|---|---|---|---|
| S2 | `acb3b0e` | `apps/api/src/catalogos/` (género, nivel académico, departamento, municipio), `apps/api/src/convocatorias/` (CRUD + máquina de estados + documentos requeridos), `apps/api/src/storage/` | `feature/catalogos`, `feature/convocatorias-crud`, `feature/storage-documentos` |
| S3 | `41285d4` | Soporte en documentos (solo su parte: tipos de documento) | `feature/tipos-documento` |

### José — Backend Solicitudes y Evaluación

| Sprint | Hito | Qué le toca | Ramas de ejemplo |
|---|---|---|---|
| S2 | `acb3b0e` | `apps/api/src/solicitudes/` (crear solicitud, perfiles académico/financiero, carga de documentos, checklist, envío, máquina de estados) | `feature/solicitudes-core`, `feature/solicitudes-documentos`, `feature/solicitudes-checklist` |
| S3 | `41285d4` | `apps/api/src/evaluaciones/` (asignar evaluadores, puntajes, score ponderado), `apps/api/src/comites/` (CRUD comités), `apps/api/src/sesiones/` (agenda, votos, quórum, finalización), `decisiones/` (mayoría, convocatoria RESUELTA), rechazo de documentos | `feature/evaluaciones-puntajes`, `feature/comites`, `feature/sesiones-quorum` |
| S4 | `ab66393` | `apps/api/src/reportes/` (agregados + CSV con BOM) | `feature/reportes-csv` |
| S6 | `e36ac2c` | Constancia PDF en `apps/api/src/solicitudes/pdf/` | `feature/constancia-pdf` |

### Yemerson — Frontend Portal

| Sprint | Hito | Qué le toca | Ramas de ejemplo |
|---|---|---|---|
| S4 | `ab66393` | Layout base + Design System + home conectada al API (US-40): `apps/web/src/styles`, `apps/web/src/components` (base), páginas base | `feature/layout-base` |
| S5 | `dcba851` | Portal público (US-41..47): hero, convocatorias públicas con filtros, convocatoria individual, consulta de beca, nosotros, contacto, footer | `feature/portal-publico`, `feature/convocatorias-publicas` |
| S6 | `e36ac2c` | Panel admin (workbench por rol, header de acciones, páginas institucionales/footer) | `feature/panel-admin`, `feature/header-acciones` |

### Hamilton — Frontend Sistema Interno + IA

| Sprint | Hito | Qué le toca | Ramas de ejemplo |
|---|---|---|---|
| S4 | `ab66393` | Asistente IA: base de conocimiento US-37/39, proveedor LLM opcional US-38. Backend: `apps/api/src/asistente/` + partes web del chat | `feature/asistente-ia`, `feature/asistente-llm` |
| S5 | `dcba851` | Web auth conectado al backend (US-49): login/registro, sesión persistente, desempaquetado del interceptor. Script npm (`npm run dev` | `feature/web-login`, `feature/web-registro` |
| S6 | `e36ac2c` | Dashboard postulante (US-50), formulario multi-step, gestión documentos, paneles (postulante/evaluador), chat IA widget, identidad dual del sistema interno | `feature/dashboard-postulante`, `feature/sistema-interno`, `feature/chat-ia` |

### David — Base, compatibilidad y supervisión

| Sprint | Qué hace |
|---|---|
| Todos | Base scaffold y migraciones iniciales (Sprint 0 y S1), `prisma/schema.prisma` + `migrations/` cuando aplica, `package.json` / `turbo.json` / `.github/workflows/ci.yml`, registrar módulos en `app.module.ts` cuando toca, revisar y **aprobar todos los PRs** |

---

## 5. Cómo descargar la versión de código de cada persona

Símbolo usado: **`<HITO>`** = el commit del sprint → `4b0795f`, `acb3b0e`, `41285d4`, `ab66393`, `dcba851` o `e36ac2c`.

### 5.0 Marcar los hitos (una vez, en el clon de trabajo)

Cuando tienes `sigeb-prod` como remote (sección 3), el hito del sprint al que llegarás será tu referencia.
Puedes también crear nombres cortos para no repetir SHA:

```bash
# Copia de trabajo del hito como referencia (no toca tu repo)
git worktree add /tmp/ref-<HITO> <HITO>
```

`/tmp/ref-<HITO>` es una carpeta temporal con el proyecto completo en ese estado. De ahí cada quien
copia **solo su carpeta** (la de su módulo).

### 5.1 Listar los archivos que me tocan en el hito

Ejemplo: Marcos, S1 (hito `4b0795f`):

```bash
git ls-tree -r --name-only 4b0795f -- apps/api/src/auth apps/api/src/common
```

Ejemplo: José, S2 (hito `acb3b0e`):

```bash
git ls-tree -r --name-only acb3b0e -- apps/api/src/solicitudes
```

### 5.2 Ver el contenido de un archivo exacto del hito

```bash
git show 4b0795f:apps/api/src/auth/auth.service.ts
```

### 5.3 Ver SOLO lo que cambió en mi sección en el sprint

Diff contra el hito anterior. Ejemplo: José en S3 (hito `41285d4`, anterior `acb3b0e`):

```bash
git diff acb3b0e..41285d4 -- apps/api/src/solicitudes apps/api/src/evaluaciones \
  apps/api/src/comites apps/api/src/sesiones apps/api/src/decisiones
```

### 5.4 Copiar los archivos del hito a mi rama de trabajo

Estando dentro de tu rama `feature/*` en el repo nuevo:

```bash
git checkout <HITO> -- apps/api/src/auth      # archivos del hito a mi working tree
```

O copiando desde la carpeta de referencia:

```bash
cp -r /tmp/ref-<HITO>/apps/api/src/auth apps/api/src/auth
```

### 5.5 Resumen de la "versión que cada uno debe tener"

> **Tu versión** = `develop` actualizado del repo nuevo + los archivos de *tu módulo* tomados del hito `<HITO>`.
> Nunca mezcles archivos de módulos de otros. Si faltan piezas de otros módulos para que tu código compile,
> NO los descargues: se integran con el PR del dueño (ver orden de merge, sección 6 y 7).

---

## 6. Ciclo semanal sin interferencias (paso a paso)

### Lunes · Sprint Planning (David)
- David publica `doc/scrum/sprint-N/sprint-planning.md`: historias del sprint (del `product-backlog.md`),
  quién toma cada historia, metas M1..Mx y el orden de merge.
- Cada dev pasa su historia a "En progreso".

### Cada dev, antes de empezar a trabajar
```bash
git checkout develop
git pull origin develop          # siempre el develop más reciente
git checkout -b feature/<modulo>-<descripcion>
```

### Implementar (solo sus archivos)
1. Descargar/adaptar su sección del hito (sección 5).
2. Revisar lo que va a commitear:
   ```bash
   git status
   ```
3. Agregar **por ruta**, nunca `git add .` (para no arrastrar módulos ajenos):
   ```bash
   git add apps/api/src/auth
   ```
4. Commit con convención:
   ```bash
   git commit -m "feat(auth): login y registro con JWT y roles"
   ```
5. Subir:
   ```bash
   git push -u origin feature/<modulo>-<descripcion>
   ```

### Abrir el PR
```bash
gh pr create --base develop --title "feat(auth): login y registro con JWT y roles" \
  --body "Historias: US-1, US-2
¿Cómo se probó?: npm run test, npm run lint, pruebas manuales de login
Checklist DoD: [x] tests [x] lint [x] revisión [x] funcional"
```
> Si no usas `gh`, crea el PR desde la web del repo indicando base `develop`.

### Después del PR
- **CI corre solo** (lint → 128 tests → build → smoke). Si está rojo, se corrige en la misma rama:
  ```bash
  git add . && git commit -m "fix(auth): ..." && git push
  ```
- Si mientras tanto `develop` avanzó, actualiza tu rama antes de que David la mergee:
  ```bash
  git pull origin develop
  git rebase develop
  git push --force-with-lease   # sólo a TU rama feature
  ```
- **David revisa**: prueba localmente (`npm run dev` para web, `npm run start:prod` o `npm start` para API),
  da **1 aprobación**, y hace **squash merge** en el orden del hito.

---

## 7. Protocolo anti-interferencia (reglas duras)

1. **Un módulo = un dueño.** Nadie toca (ni para arreglar una línea) los módulos de otra persona.
   Si se necesita un cambio en módulo ajeno, se coordina con David.
2. **Archivos compartidos y su dueño del sprint** (definido por David en el planning):
   | Archivo | Dueño |
   |---|---|
   | `apps/api/prisma/schema.prisma`, `prisma/migrations/` | David (o el backend dueño del cambio del sprint) |
   | `apps/api/src/app.module.ts`, `main.ts` | El dev cuyo módulo registra el cambio; si tocan varios, David |
   | `package.json`, `turbo.json`, `.github/workflows/ci.yml` | David |
3. **Orden de merge del sprint** (David lo fija en planning; típicamente):
   backend de dominio (catálogos/convocatorias/solicitudes) → evaluación/decisiones → reportes/auditoría/IA → frontend → CI/docs.
   Así cada rama posterior se base en el `develop` ya actualizado y no choca.
4. **Push directo a `develop`/`master` prohibido** (lo impide la protección de ramas).
5. `git add` siempre **por ruta** y revisión de `git status` antes del commit.
6. **Ante conflicto:** nunca force-mergear. `git rebase develop` en tu feature; si el conflicto es en
   archivo compartido, David lo resuelve con el dev afectado durante la review.
7. Branch limpia: cada rama feature se **elimina tras el merge** (lo hace GitHub al hacer squash merge).

---

## 8. Cierre de sprint y release

- **Viernes · Sprint Review**: David prueba el sprint completo (demo guiada), aprueba PRs pendientes
  y llena `doc/scrum/sprint-N/review.md` y `doc/scrum/sprint-N/retrospective.md`.
- **Release semanal (opcional-recomendado)**: PR `develop → master`, lo aprueba David. Así `master`
  acumula una "versión" por sprint.
- **Daily logs**: cada dev deja su avance en `doc/scrum/sprint-N/daily-log.md`.

---

## 8.1 Estabilización y entrega (CI #35–40)

Después del Sprint 6 el repositorio real `sigeb-prod` recibió **arreglos de estabilización** (specs de tests
y fixes de CI/API) detectados al validar el incremento. En la simulación estos entran como **hotfixes**
aprobados por David en la misma semana del cierre (12–16 oct), hasta llegar al estado final **CI #40**

Detalle de cada hotfix y a quién le toca:

| CI | Commit | Qué contiene | Quién lo entrega | Rama de ejemplo |
|---|---|---|---|---|
| #35 | `88e7fc3` | Corrección de specs obsoletos para CI (permissions.guard, asignación de evaluadores, reportes) | Marcos (guards) y José (evaluaciones/reportes), según el módulo del spec | `hotfix/specs-ci`, `hotfix/specs-evaluaciones` |
| #36 | `25a1e8b` | Fix de deps de Chromium en CI (`libasound2t64`) | David | `hotfix/ci-chromium-deps` |
| #37 | `f949500` | Fix del reporte de evaluaciones: conteo de decisiones por convocatoria sin filtrar por estado | José (módulo `reportes/`) | `hotfix/reportes-decisiones` |
| #40 | `a720298` | Fix de CI: variable `JWT_REFRESH_SECRET` para el login del smoke | David | `hotfix/ci-jwt-refresh` |

Reglas del bloque de estabilización (igual que un sprint):
- ramas `hotfix/<desc>` desde `develop` (o desde `master` si ya se soltó release),
- PR → `develop` con CI verde, revisado y aprobado por David, **squash merge**,
- se mergea en el orden de arriba (specs → deps → Api fix → CI env) para no pisarse.

---

## 9. Verificación de fidelidad contra los hitos

Al terminar cada sprint (del S1 al S6), David (o quien revise) compara, por sección, el repo nuevo contra el
hito real:

```bash
# En sigeb-prod: qué cambió en esa sección en el sprint
git diff <ANTERIOR>..<HITO> -- apps/api/src/<modulo>
```

Y se revisa que el repo nuevo tenga exactamente eso. Si sobra o falta algo, se corrige con un PR
menor en el sprint siguiente.

**Al cierre del S6 + estabilización (16 de octubre)** el repo nuevo debe equivaler al **estado actual de
`sigeb-prod` = CI #40 = commit `a720298`** (los 6 hitos A–F más los hotfixes de la sección 8.1).
La verificación final se hace contra ese commit y no contra `e36ac2c`.

---

*Documento generado para la simulación de equipo: David, Marcos, Héctor, José, Yemerson y Hamilton.*
*Versión de referencia final: CI #40 (`a720298`).*