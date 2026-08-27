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

## [Sprint 2] — 2026-XX-XX

### Added
- [ ] Guard de permisos con Chain of Responsibility
- [ ] CRUD de catálogos (géneros, niveles, departamentos, municipios)
- [ ] Opción "otro" en catálogos
- [ ] CRUD de convocatorias
- [ ] Máquina de estados de convocatoria
- [ ] Configuración de documentos requeridos por convocatoria
- [ ] DocumentStorage adapter (filesystem)

### Notas
- Héctor como developer principal
- Marcos como soporte en guard de permisos

---

## [Sprint 3] — 2026-XX-XX

### Added
- [ ] Crear solicitud en BORRADOR
- [ ] Perfil académico con validación de catálogos
- [ ] Perfil financiero
- [ ] Upload de documentos con validación MIME
- [ ] Quitar/reemplazar documentos antes de enviar
- [ ] Checklist de documentos faltantes
- [ ] Enviar solicitud con validación de completitud
- [ ] Máquina de estados de solicitud

### Notas
- José como developer principal
- Héctor como soporte en documentos

---

## [Sprint 4] — 2026-XX-XX

### Added
- [ ] Evaluaciones asignadas para evaluador
- [ ] Asignación de evaluadores a solicitud
- [ ] Puntajes por criterio con pesos
- [ ] Auto-cálculo de score ponderado
- [ ] CRUD de comités y miembros
- [ ] Creación de sesiones con agenda
- [ ] Votos (uno por miembro por solicitud)
- [ ] Finalización de sesión con validación de quórum

### Notas
- José como developer principal
- David como reviewer

---

## [Sprint 5] — 2026-XX-XX

### Added
- [ ] Reportes de resumen (solicitudes por estado, convocatorias, evaluaciones)
- [ ] Exportación de reportes a CSV
- [ ] Interceptor de AuditLog
- [ ] Asistente IA con respuestas acotadas
- [ ] AsistenteIAProxy con contexto por sesión/rol
- [ ] Base de conocimiento indexada con tsvector
- [ ] Layout base + Design System + Tailwind

### Notas
- José en reportes
- Hamilton en asistente IA
- Yemerson en Layout base

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

*Última actualización: 2026-08-26*
