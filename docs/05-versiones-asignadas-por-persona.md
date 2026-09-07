# 05 · Versiones de código asignadas por persona

> Este documento responde dos preguntas para cada sprint:
> **1)** ¿qué versión (hito) del proyecto original me toca como referencia?
> **2)** ¿qué carpetas/archivos de código le corresponden a cada persona?
>
> Con la combinación hito + módulos puedes descargar **exactamente tu versión** y subirla en tu rama
> sin pisar a nadie. Pre-requisitos técnicos: `02-git-github-conceptos-basicos.md` y
> `04-pr-paso-a-paso-por-persona.md`.
>
> **Versión final de referencia: CI #40 = commit `a720298`.**

---

## 1. Cómo funciona el modelo de versiones (explicación simple)

Imagina el proyecto real como una escalera con 6 peldaños + 1 remate:

```
S1 → hito 4b0795f     (auth / seguridad)
S2 → hito acb3b0e     (convocatorias + solicitudes + CI)
S3 → hito 41285d4     (evaluación / comités / sesiones / decisiones)
S4 → hito ab66393     (reportes + auditoría + asistente IA + layout)
S5 → hito dcba851     (portal público + web auth + dashboard)
S6 → hito e36ac2c     (sistema interno + paneles + constancia PDF)
REMATE → CI #40 = a720298   (hotfixes de estabilización: specs, CI, reportes)
```

- El repo nuevo empieza en un estado base (Sprint 0) y en **cada sprint sube un peldaño** mediante PRs.
- La **rama `develop`** del repo nuevo representa siempre el peldaño anterior.
- Cada persona toma de su hito **solo lo que le toca** (sus módulos) y lo agrega en su rama `feature/*`.
- Al aprobar y mergear todas las ramas, `develop` sube al peldaño del sprint completo.
- Al final, el bloque de estabilización lleva todo a **CI #40 = `a720298`**.

---

## 2. Comandos "comodín" para descargar tu versión

Primero (una sola vez):
```bash
git remote add sigeb-prod https://github.com/Deividcodv/sigeb-prod.git
git fetch sigeb-prod
```

Luego, en **tu rama** `feature/...` (ver `04` para crear la rama), copia tus carpetas desde el hito:

```bash
# GENÉRICO (cambia <HITO> y <tus-modulos> por los valores de tu tabla de abajo)
git checkout <HITO> -- apps/api/src/<tu-modulo-1> apps/api/src/<tu-modulo-2>
```

Extra útil — ver qué cambió en tu sección en ese sprint (hito anterior → hito):
```bash
git diff <ANTERIOR>..<HITO> -- apps/api/src/<tu-modulo>
```

---

## 3. Tabla maestra hora por persona

> `API` = dentro de `apps/api/src/...`. `WEB` = dentro de `apps/web/src/...`.

### Marcos — Backend Seguridad y Autenticación

| Sprint | Hito | Módulos (rutas) | Rama de ejemplo |
|---|---|---|---|
| S1 | `4b0795f` | API `auth/`, `users/`, `common/` (guards, decoradores, filtros, interceptores), DTOs | `feature/auth-login`, `feature/auth-roles` |
| S4 | `ab66393` | API `audit/` (registro de auditoría US-36) | `feature/auditoria-registro` |
| Estab. (CI #35) | `88e7fc3` | API specs de `common/` (permissions.guard.spec) | `hotfix/specs-ci` |
| S6+ | `a720298` | Ajustes de auditoría por rol del estado final | `feature/auditoria-por-rol` |

### Héctor — Backend Convocatorias

| Sprint | Hito | Módulos (rutas) | Rama de ejemplo |
|---|---|---|---|
| S2 | `acb3b0e` | API `catalogos/`, `convocatorias/`, `storage/`, tipos de documento | `feature/catalogos`, `feature/convocatorias-crud`, `feature/storage-documentos` |
| S3 | `41285d4` | Soporte en documentos (tipos de documento): API `convocatorias/` (documentos requeridos) | `feature/tipos-documento` |

### José — Backend Solicitudes y Evaluación

| Sprint | Hito | Módulos (rutas) | Rama de ejemplo |
|---|---|---|---|
| S2 | `acb3b0e` | API `solicitudes/` (crear, perfil académico/financiero, documentos, checklist, envío, máquina de estados) | `feature/solicitudes-core`, `feature/solicitudes-documentos` |
| S3 | `41285d4` | API `evaluaciones/`, `comites/`, `sesiones/`, `decisiones/`, rechazo de documentos en `solicitudes/` | `feature/evaluaciones-puntajes`, `feature/comites`, `feature/sesiones-quorum` |
| S4 | `ab66393` | API `reportes/` (agregados + CSV US-34/35) | `feature/reportes-csv` |
| S6 | `e36ac2c` | API `solicitudes/pdf/` (constancia PDF US-F7) | `feature/constancia-pdf` |
| Estab. (CI #35) | `88e7fc3` | Specs de `evaluaciones/` y `reportes/` corregidos para CI | `hotfix/specs-evaluaciones` |
| Estab. (CI #37) | `f949500` | `reportes.service.ts` + spec: conteo de decisiones por convocatoria sin filtrar por estado | `hotfix/reportes-decisiones` |

### Yemerson — Frontend Portal

| Sprint | Hito | Módulos (rutas) | Rama de ejemplo |
|---|---|---|---|
| S4 | `ab66393` | WEB `styles/` y `components/` base (Layout/Design System), home conectada al API (US-40) | `feature/layout-base` |
| S5 | `dcba851` | WEB portal público (US-41..47): hero, convocatorias + filtros, convocatoria individual, consulta de beca, nosotros, contacto, footer | `feature/portal-publico`, `feature/convocatorias-publicas` |
| S6 | `e36ac2c` | WEB panel admin (workbench por rol, header de acciones) y páginas institucionales/footer | `feature/panel-admin`, `feature/header-acciones` |

### Hamilton — Frontend Sistema Interno + IA

| Sprint | Hito | Módulos (rutas) | Rama de ejemplo |
|---|---|---|---|
| S4 | `ab66393` | API `asistente/` (base de conocimiento US-37/39, proveedor LLM US-38) + widget web del chat | `feature/asistente-ia`, `feature/asistente-llm` |
| S5 | `dcba851` | WEB auth (login/registro conectados, US-49), dashboard postulante (US-50), script npm dev | `feature/web-login`, `feature/dashboard-postulante` |
| S6 | `e36ac2c` | WEB sistema interno: formulario multi-step, gestión de documentos, paneles postulante/evaluador, chat IA (identidad dual del sistema interno) | `feature/sistema-interno`, `feature/chat-ia` |

### David — Base, CI y archivos compartidos

| Sprint | Hito | Qué entrega |
|---|---|---|
| Base | — | Scaffold del monorepo (Sprint 0): estructura NestJS/Next.js/Prisma/Docker + migración base |
| S1 | `4b0795f` | `prisma/schema.prisma` + `migrations/` iniciales |
| S2 | `acb3b0e` | `.github/workflows/ci.yml` + smoke inicial |
| Todos | — | Registro de módulos en `app.module.ts`/`main.ts` cuando aplica; `package.json`/`turbo.json`; revisión y aprobación de PRs |
| Estab. (CI #36) | `25a1e8b` | Fix deps Chromium en CI (`libasound2t64`) |
| Estab. (CI #40) | `a720298` | Variable `JWT_REFRESH_SECRET` en el smoke de CI |

---

## 4. Archivos compartidos y su dueño (regla anti-conflicto)

| Archivo | Dueño |
|---|---|
| `apps/api/prisma/schema.prisma`, `prisma/migrations/` | David (o backend dueño del cambio del sprint, según planning) |
| `apps/api/src/app.module.ts`, `apps/api/src/main.ts` | El dev cuyo módulo registra el cambio; si son varios, David |
| `package.json`, `turbo.json`, `.github/workflows/ci.yml`, `docker-compose.yml` | David |

> Si tu trabajo necesita tocar un archivo compartido, primero coordina con David; de lo contrario la
> revisión rechazará el PR.

---

## 5. Bloque de estabilización: CI #35 – CI #40 (asignación de hotfixes)

| CI | Commit | Contenido del hotfix | Quién lo entrega | Rama de ejemplo |
|---|---|---|---|---|
| #35 | `88e7fc3` | Specs corregidos para CI (permissions.guard, asignar evaluadores, reportes) | Marcos (`common`), José (`evaluaciones`/`reportes`) | `hotfix/specs-ci` |
| #36 | `25a1e8b` | Deps de Chromium para CI (`libasound2t64`) | David | `hotfix/ci-chromium-deps` |
| #37 | `f949500` | Fix reporte de evaluaciones (decisiones por convocatoria) | José | `hotfix/reportes-decisiones` |
| #40 | `a720298` | `JWT_REFRESH_SECRET` para el smoke de CI | David | `hotfix/ci-jwt-refresh` |

Orden de merge del remate: **#35 → #36 → #37 → #40** (specs primero, luego deps, luego fix de API,
después env de CI). Todos entran por PR a `develop` (y luego `develop → master`), siempre con CI verde.

**Al terminar este bloque, el repo nuevo = estado del CI #40 (`a720298`) = idéntico al proyecto real.**

---

## 6. Cómo saber si tu versión quedó bien

En tu rama, verificaciones rápidas:

```bash
git status                     # solo tus archivos
git log --oneline -3           # tus commits con mensajes convencionales
git diff develop --name-only   # solo tus rutas respecto a develop
```

Y confía en la CI: si el PR sale **verde** y David lo aprueba, tu versión quedó integrada correctamente.