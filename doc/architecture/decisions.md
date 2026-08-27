# Decisiones Arquitectónicas (ADR) — SIGEB

> Architecture Decision Records: documentan decisiones técnicas importantes y su contexto.

---

## ADR-001: NestJS como framework backend

**Estado:** Aceptado

**Fecha:** 2026-08-26

**Contexto:**
Necesitamos un framework backend para el API REST que soporte:
- Inyección de dependencias nativa
- Módulos bien estructurados
- Validación de DTOs integrada
- Guards, interceptores, pipes
- Buena integración con TypeScript

**Decisión:**
Usar NestJS como framework backend.

**Alternativas consideradas:**
- Express.js: más flexible pero sin estructura nativa
- Fastify: más rápido pero menos ecosistema
- AdonisJS: completo pero menos popular

**Consecuencias:**
- Estructura modular nativa que facilita Facade, Adapter, Proxy
- DI container integrado sin configuración manual
- Learning curve moderada para el equipo
- Ecosistema de plugins rico

---

## ADR-002: Next.js como framework frontend

**Estado:** Aceptado

**Fecha:** 2026-08-26

**Contexto:**
Necesitamos un framework frontend que soporte:
- Server-side rendering para SEO del portal público
- App Router para rutas jerárquicas
- Integración con React
- Tailwind CSS
- Building optimizado

**Decisión:**
Usar Next.js (App Router) como framework frontend.

**Alternativas consideradas:**
- Vite + React: más rápido pero sin SSR nativo
- Remix: buen SSR pero menos comunidad
- Nuxt (Vue): cambiar de framework

**Consecuencias:**
- SEO optimizado para portal público
- Funciones server y client bien separadas
- Build optimizado con Turbopack
- Deploy simplificado

---

## ADR-003: Prisma como ORM

**Estado:** Aceptado

**Fecha:** 2026-08-26

**Contexto:**
Necesitamos un ORM que:
- Genere tipos TypeScript automáticamente
- Soporte PostgreSQL
- Queries parametrizadas por defecto
- Migraciones declarativas
- Buena documentación

**Decisión:**
Usar Prisma como ORM.

**Alternativas consideradas:**
- TypeORM: más maduro pero menos类型安全
- Drizzle: más rápido pero menos features
- Knex.js: query builder, no ORM completo

**Consecuencias:**
- Queries parametrizadas = primera línea de defensa contra SQL injection
- Tipos generados automáticamente desde el schema
- Migraciones declarativas y versionadas
- Client ligero y rápido

---

## ADR-004: Monolito modular (no microservicios)

**Estado:** Aceptado

**Fecha:** 2026-08-26

**Contexto:**
El proyecto tiene ~9 módulos de dominio. Necesitamos decidir entre:
- Monolito modular: una aplicación, módulos separados
- Microservicios: servicios independientes por HTTP

**Decisión:**
Monolito modular por capas.

**Razones:**
- ~9 módulos no justifican la complejidad operativa de microservicios
- Despliegue más simple (un solo contenedor)
- Comunicación interna más rápida (llamadas a métodos)
- Más fácil de testear
- Cualquier módulo puede extraerse después si el volumen lo exige

**Consecuencias:**
- Un solo deploy para todo
- Acoplamiento bajo entre módulos (Dependency Inversion)
- Escalabilidad horizontal limitada (pero suficiente para este alcance)

---

## ADR-005: PostgreSQL como base de datos

**Estado:** Aceptado

**Fecha:** 2026-08-26

**Contexto:**
Necesitamos una DB relacional que soporte:
- Búsqueda de texto completo (`tsvector`)
- JSON/JSONB para datos flexibles
- UUID como primary key
- Transacciones ACID
- Buena integración con Prisma

**Decisión:**
Usar PostgreSQL.

**Alternativas consideradas:**
- MySQL: menos features de texto
- SQLite: no para producción
- MongoDB: no relacional, no encaja con el modelo

**Consecuencias:**
- `tsvector` para base de conocimiento del asistente (sin extensión vectorial)
- JSONB para almacenar datos flexibles si es necesario
- UUID nativo para todas las primary keys
- Rendimiento probado a escala

---

## ADR-006: JWT (access/refresh) para autenticación

**Estado:** Aceptado

**Fecha:** 2026-08-26

**Contexto:**
Necesitamos autenticación stateless que funcione con:
- Frontend SPA (Next.js)
- API REST
- Futuras apps móviles

**Decisión:**
Usar JWT con access token (15 min) + refresh token (7 días).

**Alternativas consideradas:**
- Sesiones server-side: estado en servidor, no escala
- OAuth2: demasiado complejo para este alcance
- Solo access tokens sin refresh: mala UX

**Consecuencias:**
- Stateless: no necesita session store
- Access token corto (15 min) limita ventana de ataque
- Refresh token permite mantener sesión sin re-login
- Revocación más compleja (necesita blacklist o esperar expiración)

---

## ADR-007: Filesystem local para documentos (Adapter pattern)

**Estado:** Aceptado

**Fecha:** 2026-08-26

**Contexto:**
Necesitamos almacenar documentos (PDFs, imágenes) de postulantes.

**Decisión:**
Filesystem local detrás de interfaz `DocumentStorage` (Adapter pattern).

**Razones:**
- Simplifica desarrollo inicial
- Adapter permite cambiar a S3/Azure después sin tocar servicios
- Sin costo de almacenamiento en la nube durante desarrollo

**Consecuencias:**
- Almacenamiento en el servidor (no escalable horizontalmente fácilmente)
- Necesita backup manual
- Migración futura a nube requerirá implementar otro adapter

---

## ADR-008: Design System dual (público vs admin)

**Estado:** Aceptado

**Fecha:** 2026-08-26

**Contexto:**
El portal público y el sistema administrativo tienen identidad visual diferente pero comparten componentes base.

**Decisión:**
Design System compartido con dos "mundos" visuales:
- Portal público: editorial, institucional, espacioso
- Sistema admin: funcional, compacto, data-driven

**Consecuencias:**
- Componentes base compartidos (colores, tipografía, botones)
- Temas distintos para cada contexto
- Mantenimiento de dos estilos pero un solo código base
- Mejor UX para cada tipo de usuario

---

*Última actualización: 2026-08-26*
