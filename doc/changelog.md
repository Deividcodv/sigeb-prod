# Changelog — SIGEB

> Historial de releases y cambios del proyecto.

---

## Formato

Este archivo sigue el formato [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

Las categorías son:
- **Added** — Nuevas funcionalidades
- **Changed** — Cambios en funcionalidades existentes
- **Deprecated** — Funcionalidades que serán removidas
- **Removed** — Funcionalidades removidas
- **Fixed** — Bugs corregidos
- **Security** — Cambios de seguridad

---

## [Unreleased]

### Added
- Estructura completa de documentación `/doc`
- Product Backlog con 58 historias de usuario
- Templates de 8 sprints con goal, backlog, daily-log, review y retrospective
- Guías de setup, deployment y troubleshooting
- ADR (Architecture Decision Records) con 8 decisiones documentadas
- Contratos de API para todos los endpoints
- Diagramas de arquitectura, despliegue y flujos
- Schema de base de datos documentado
- Convenciones de código, git, testing y seguridad
- Equipo asignado: David (SM), Marcos (Auth), Héctor (Convocatorias), José (Solicitudes), Yemerson (Portal), Hamilton (Sistema)

---

## [Sprint 0] — 2026-XX-XX

### Added
- [ ] Monorepo con package.json, workspaces y scripts
- [ ] Docker Compose con PostgreSQL
- [ ] Schema Prisma completo
- [ ] Seed data con catálogos, roles y permisos

### Notas
- Primer sprint del proyecto
- Todos los miembros participan en la configuración

---

## [Sprint 1] — 2026-XX-XX

### Added
- [x] Estructura de módulos NestJS (`app.module.ts`, `main.ts`)
- [x] Registro de postulante con CUI único
- [x] Login con JWT (access + refresh tokens)
- [x] Endpoint de perfil autenticado
- [x] Common/: guards globales, decoradores, filtros de excepción
- [x] CRUD de roles con asignación de permisos

### Fixed
- Guard JWT global bloqueaba rutas públicas; se agregó decorador `@Public()` en `registro`, `login`, `refresh`
- Infraestructura de lint del monorepo: `.eslintrc.json`, `eslint-config-prettier`, config ESLint por workspace
- Script de test sin specs: `--passWithNoTests`

### Notas
- Marcos como developer principal
- David como reviewer
- Smoke test manual aprobado (17 casos)

---

## [Sprint 2] — 2026-08-27

### Added
- [x] Guard de permisos con Chain of Responsibility (`@Permisos`, `PermissionsGuard`)
- [x] CRUD de catálogos (géneros, niveles, departamentos, municipios, tipos de documento) con endpoints públicos
- [ ] Opción "otro" en catálogos (US-13, diferida a Sprint 3)
- [x] CRUD de convocatorias (endpoints públicos + admin)
- [x] Máquina de estados de convocatoria (BORRADOR → ABIERTA → CERRADA → EN_EVALUACION → RESUELTA → ARCHIVADA)
- [x] Configuración de documentos requeridos por convocatoria
- [x] DocumentStorage adapter (filesystem) con protección path-traversal

### Fixed
- Include Prisma inválido de `criteriosEvaluacion` en `Convocatoria` (la relación vive en `Beca`); corregido con include anidado

### Notas
- Héctor como developer principal
- Marcos como soporte en guard de permisos
- Smoke test manual aprobado (catálogos, convocatorias, transiciones, documentos)

---

## [Sprint 3] — 2026-08-27

### Added
- [x] Crear solicitud en BORRADOR (US-18)
- [x] Perfil académico con validación de catálogos y opción "otro" (US-19/US-13)
- [x] Perfil financiero (US-20)
- [x] Upload de documentos con validación MIME/tamaño (PDF/JPG/PNG ≤ 5 MB) (US-21)
- [x] Quitar/reemplazar documentos antes de enviar (US-22)
- [x] Checklist de documentos faltantes (US-23)
- [x] Enviar solicitud con validación de completitud (US-24)
- [x] Máquina de estados de solicitud con historial y `correccionesCount` (US-25)
- [x] CI en ramas `feature/*` y smoke test HTTP en CI

### Fixed
- `assertCatalogosExisten` trataba los campos libres (`*Otro`, institución, carrera) como IDs de catálogo; ahora solo valida propiedades `*Id`
- Seed: el CUI `9876543210987` del postulante demo colisionaba con el usuario smoke de Sprint 2; se usó `9999999999999`
- CI: `.gitignore` con `storage/` sin ancla omitía `apps/api/src/storage/` y rompía el build en Linux; anclado a `/storage/`

### Notas
- José como developer principal
- Héctor como soporte en documentos
- Smoke test manual aireado por hito + smoke automatizado en CI (`.github/scripts/smoke-ci.sh`)

---

## [Sprint 4] — 2026-08-28

### Added
- [x] Evaluaciones asignadas para evaluador (`GET /evaluaciones/mias`)
- [x] Asignación de evaluadores a solicitud solo admin y en `EN_REVISION` (`POST /solicitudes/:id/evaluadores`)
- [x] Puntajes por criterio con pesos (0–100; `PUT /solicitudes/:id/criterios/:criterioId`)
- [x] Auto-cálculo de score ponderado en vuelo (`GET /solicitudes/:id/score`)
- [x] CRUD de comités y miembros (listado con `_count`)
- [x] Creación de sesiones con agenda (solo `EVALUADA` de una misma convocatoria)
- [x] Votos (uno por miembro por solicitud, miembros activos del comité)
- [x] Finalización de sesión con validación de quórum, decisión por mayoría y convocatoria → `RESUELTA` (`POST /sesiones/:id/finalizar`)
- [x] Rechazo de documentos por admin/coordinador con efecto en el checklist (US-34, retro Sprint 3): `PATCH /solicitudes/:id/documentos/:tipoId/estado`
- [x] Seed autocorregible de permisos por rol (prune `notIn`) + usuarios demo evaluador/coordinador/miembro y criterios de la beca 2

### Fixed
- Seed: `MIEMBRO_COMITE` recibía `sesion:crear` (sobre-grant); corregido con poda `notIn` de permisos por rol
- Checklist: al incorporar US-34, `RECHAZADO` se cuenta como documento pendiente y bloquea `enviar`

### Notas
- José como developer principal
- David como reviewer
- Automatizado por hitos M1–M5 en `feature/evaluaciones` (commits `706e7a1`, `adf88fc`, `82d94f5`, `82e75fd` + M5) con smoke HTTP por hito; 90 tests verdes (9 suites)

---

## [Sprint 5] — 2026-08-29

### Added
- [x] Reportes de resumen (solicitudes por estado, convocatorias, evaluaciones)
- [x] Exportación de reportes a CSV
- [x] AuditLog dirigido (`AuditService.log`) con `GET /audit` paginado y filtros (permiso `auditoria:ver`)
- [x] Asistente IA con respuestas acotadas (fallback por base de conocimiento)
- [x] `AsistenteIAProxy` con contexto por sesión/rol y `OpenAIProveedor` opcional vía `AI_API_KEY`/`AI_BASE_URL` (timeouts + degradación a fallback)
- [x] Base de conocimiento indexada con tsvector (GIN funcional, `to_tsvector('spanish', titulo || ' ' || contenido)`)
- [x] Layout base + Design System + Tailwind + paleta en `apps/web` (Header/Footer, `Container`/`Button`/`Card`/`Badge`, home con convocatorias reales vía SWR y proxy `/api` en `next.config`)

### Notas
- Entregado por hitos M1–M5 con CI verde en cada uno: `00c1d21` (M1 reportes), `16f724d` (M2 auditoría), `0a05250` (M3 asistente/KB), `dab4fcd` (M4 proxy LLM opcional), `bbbcc7c` (M5 frontend base).
- 100+ tests de API verdes (13 suites) + build/lint de API y web; smoke CI "Sprints 3-5" cubre s3/s4/s5 (reportes, CSV, auditoría, asistente).
- José en reportes, Hamilton en asistente IA, Yemerson en Layout base.

---

## [Sprint 6] — 2026-XX-XX

### Added
- [ ] Hero con "Oportunidades que transforman vidas"
- [ ] Sección "Sobre SIGEB"
- [ ] "Cómo funciona" con 6 pasos
- [ ] Convocatorias públicas con filtros
- [ ] Página individual de convocatoria
- [ ] Consulta de estado de beca (público)
- [ ] Página "Nosotros" con contacto
- [ ] Footer institucional

### Notas
- Yemerson como developer principal
- Hamilton como soporte

---

## [Sprint 7] — 2026-XX-XX

### Added
- [ ] Login + Registro frontend (React Hook Form + Zod)
- [ ] Dashboard postulante con seguimiento
- [ ] Formulario multi-step de solicitud
- [ ] Gestión de documentos desde frontend
- [ ] Panel de evaluador
- [ ] Panel de administración de convocatorias
- [ ] Panel de administración de seguridad
- [ ] Widget de chat IA
- [ ] Responsive design (desktop → tablet → mobile)
- [ ] Identidad visual dual (público vs admin)

### Notas
- Hamilton en postulante + IA
- Yemerson en admin + responsive

---

## [v1.0.0] — 2026-XX-XX

### Added
- Primera versión completa del sistema SIGEB
- Todas las funcionalidades del alcance definido
- Documentación completa del proyecto

### Notas
- Release candidates anteriores
- Testing completo antes del release

---

*Última actualización: 2026-08-29*
