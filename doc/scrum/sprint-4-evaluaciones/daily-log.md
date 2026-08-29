# Sprint 4 — Daily Log

> Sprint ejecutado en modo inmersivo (2 días) por hitos M1–M5 en `feature/evaluaciones`.

## Standups

### Día 1 — 2026-08-27

**¿Qué hice ayer?**
- Cierre del Sprint 3 (review cronológica). Se definió el add-on de rechazo de documentos para Sprint 4.

**¿Qué haré hoy?**
- Planificación del Sprint 4: goal, backlog (44 pts), aprobar alcance (US-26..33 + AD-4.1 rechazo de documentos).

**Bloqueos:**
- Ninguno.

---

### Día 2 — 2026-08-28

**¿Qué hice ayer?**
- Sprint 4 planificado y aprobado; rama `feature/evaluaciones` creada y pusheada.

**¿Qué haré hoy?**
- M1..M5 por hitos con commit+CI: evaluaciones, auto-score, comités, sesiones/votos, finalización + rechazo de documentos.

**Bloqueos:**
- `gh` sin autenticar y GitHub API sin rate-limit: la validación CI se hace pusheando la rama.
- `npx prisma migrate dev` falla (EPERM) con el servidor corriendo (DLL `query_engine` bloqueada): detener API antes de migrar/generar.

---

### Detalle de hitos (mismo día)

**M1 (~07:00)**
- Hecho: módulo `evaluaciones` (mis evaluaciones, asignar evaluadores, registrar puntajes 0–100), seed de permisos + usuarios demo + criterios beca 2. 53 tests. Smoke M1 OK.
- Bloqueo: al editar seed en caliente, el guard de permisos era de codigo basado en emanaciones de `rol.permisos` cacheados por el token; requería re-login. Resuelto reutilizando tokens por usuario.

**M2 (~08:20)**
- Hecho: `GET /solicitudes/:id/score` ponderado en vuelo. 57 tests. Smoke M2 OK (score 79).

**M3 (~09:15)**
- Hecho: CRUD de comités y miembros (con `_count`). 69 tests. Smoke M3 OK.

**M4 (~10:10)**
- Hecho: migración `sesion_agenda` (modelo `SesionAgenda`), sesiones + agenda (solo `EVALUADA` misma convocatoria), votos con voto único; fix `MIEMBRO_COMITE` e seed autocorregible. 80 tests. Smoke M4 OK.
- Bloqueo: `prisma migrate dev` EPERM por DLL del servidor en uso → detener PID antes de migrar (quedó como procedimiento estándar).

**M5 (~11:30)**
- Hecho (en progreso al cierre del log): `finalizarSesion` (quórum, mayoría, decisiones + historial, convocatoria → `RESUELTA`), `PATCH` de estado de documentos (`RECHAZADO`, permiso `documento:editar`) y checklist con `RECHAZADO` como pendiente.
- Bloqueo inicial de smoke: duplicados por creador "una solicitud por usuario por convocatoria"; se corrigió reutilizando solicitudes `EVALUADA` existentes y llevando la convocatoria a `EN_EVALUACION` antes de finalizar.

---