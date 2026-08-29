# Sprint 5 — Daily Log

## Standups

### Día 1 — 2026-08-29

**¿Qué hice ayer?**
- Cierre del Sprint 4: fix de orden en smoke CI (AD-4.1 antes de `enviar`), CI verde en `feature/evaluaciones` y `develop`, docs e infraestructure de repro limpia.

**¿Qué haré hoy?**
- Planificar y aprobar Sprint 5 (goal + backlog, 29 pts US-34..40, hitos M1–M5) y arrancar M1 (reportes), M2 (audit) y M3 (base de conocimiento + asistente fallback).

**Bloqueos:**
- Sin credenciales para IA: el proveedor LLM quedó opcional vía `AI_API_KEY`; por defecto fallback por reglas/KB (también para el CI smoke).
- Igual que S3/S4: `prisma migrate dev` EPERM con la API corriendo; detener antes de la migración de `tsvector`. 

---

### Día 2 — 2026-08-29

**¿Qué hice ayer?**
- M1 reportes (US-34/US-35): `GET /reportes/{solicitudes-por-estado,convocatorias,evaluaciones}` y CSV con BOM UTF-8 + `Content-Disposition: attachment`; interceptor no envuelve respuestas con `headersSent`; smoke ampliado en CI; commit `00c1d21` con CI verde.
- M2 auditoría (US-36): `AuditService.log()` dirigido + `GET /audit` (permiso `auditoria:ver`, seed actualizado); integración en auth (login/refresh con IP desde `@Req`), convocatorias, solicitudes, evaluaciones, sesiones, comités y roles. Build/lint OK, 98 tests verdes; smoke local (login→audit, `GET /audit` admin, 403 postulante, 401 anónimo) OK.

**¿Qué haré hoy?**
- Commit de M2 (audit + smoke CI + docs) y push con CI verde.
- M3: migración `tsvector`, seed de base de conocimiento (US-37) y `AsistenteIAProxy` con proveedor fallback por reglas/KB + `POST /asistente/preguntar`.

**Bloqueos:**
- Sin credenciales para IA: el proveedor LLM quedó opcional vía `AI_API_KEY`; por defecto fallback por reglas/KB (también para el CI smoke).
- Igual que S3/S4: `prisma migrate dev` EPERM con la API corriendo; detener antes de la migración de `tsvector`. 

---

### Día 3 — [Fecha]

**¿Qué hice ayer?**
- 

**¿Qué haré hoy?**
- 

**Bloqueos:**
- 

---

### Día 4 — [Fecha]

**¿Qué hice ayer?**
- 

**¿Qué haré hoy?**
- 

**Bloqueos:**
- 

---

### Día 5 — [Fecha]

**¿Qué hice ayer?**
- 

**¿Qué haré hoy?**
- 

**Bloqueos:**
- 

---

### Día 6 — [Fecha]

**¿Qué hice ayer?**
- 

**¿Qué haré hoy?**
- 

**Bloqueos:**
- 

---

### Día 7 — [Fecha]

**¿Qué hice ayer?**
- 

**¿Qué haré hoy?**
- 

**Bloqueos:**
- 

---

### Día 8 — [Fecha]

**¿Qué hice ayer?**
- 

**¿Qué haré hoy?**
- 

**Bloqueos:**
- 

---

### Día 9 — [Fecha]

**¿Qué hice ayer?**
- 

**¿Qué haré hoy?**
- 

**Bloqueos:**
- 

---

### Día 10 — [Fecha]

**¿Qué hice ayer?**
- 

**¿Qué haré hoy?**
- 

**Bloqueos:**
- 

