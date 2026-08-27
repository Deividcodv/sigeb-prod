# Contratos de API — SIGEB

> Especificación de endpoints REST. Todas las rutas bajo `/api`.

---

## Autenticación (`/auth`)

### POST `/auth/registro`
**Público**

Request:
```json
{
  "cui": "1234567890123",
  "nombres": "Juan Pérez",
  "email": "juan@test.com",
  "password": "Password123!"
}
```

Response 201:
```json
{
  "id": "uuid",
  "cui": "1234567890123",
  "nombres": "Juan Pérez",
  "email": "juan@test.com",
  "rol": "POSTULANTE",
  "createdAt": "2026-08-26T00:00:00.000Z"
}
```

Response 409:
```json
{
  "message": "El CUI ya está registrado"
}
```

### POST `/auth/login`
**Público**

Request:
```json
{
  "email": "juan@test.com",
  "password": "Password123!"
}
```

Response 200:
```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "user": {
    "id": "uuid",
    "cui": "1234567890123",
    "nombres": "Juan Pérez",
    "email": "juan@test.com",
    "rol": "POSTULANTE"
  }
}
```

### POST `/auth/refresh`
**Requiere refresh token**

Request:
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Response 200:
```json
{
  "accessToken": "nuevo-jwt-access-token"
}
```

### GET `/auth/perfil`
**Requiere: autenticado**

Response 200:
```json
{
  "id": "uuid",
  "cui": "1234567890123",
  "nombres": "Juan Pérez",
  "email": "juan@test.com",
  "rol": {
    "id": "uuid",
    "nombre": "POSTULANTE"
  }
}
```

---

## Convocatorias (`/convocatorias`)

### GET `/convocatorias`
**Público** (solo abiertas) / `convocatoria:ver` (todas)

Response 200:
```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Beca de Excelencia Académica",
      "descripcion": "...",
      "estado": "ABIERTA",
      "fechaApertura": "2026-08-01",
      "fechaCierre": "2026-09-30",
      "beca": {
        "id": "uuid",
        "nombre": "Excelencia Académica"
      }
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

### GET `/convocatorias/:id`
**Público** / `convocatoria:ver`

Response 200:
```json
{
  "id": "uuid",
  "nombre": "Beca de Excelencia Académica",
  "descripcion": "...",
  "estado": "ABIERTA",
  "fechaApertura": "2026-08-01",
  "fechaCierre": "2026-09-30",
  "documentosRequeridos": [
    {
      "id": "uuid",
      "documentoTipo": {
        "id": "uuid",
        "nombre": "Certificado académico"
      },
      "obligatorio": true
    }
  ],
  "criteriosEvaluacion": [
    {
      "id": "uuid",
      "nombre": "Rendimiento académico",
      "peso": 0.6
    }
  ]
}
```

### POST `/convocatorias`
**Permiso:** `convocatoria:crear`

Request:
```json
{
  "nombre": "Beca de Excelencia Académica",
  "descripcion": "...",
  "becaId": "uuid",
  "fechaApertura": "2026-08-01",
  "fechaCierre": "2026-09-30"
}
```

### PATCH `/convocatorias/:id`
**Permiso:** `convocatoria:editar`

### POST `/convocatorias/:id/transicion`
**Permiso:** `convocatoria:editar`

Request:
```json
{
  "accion": "publicar"
}
```

---

## Solicitudes (`/solicitudes`)

### POST `/solicitudes`
**Permiso:** `solicitud:crear` (postulante crea la propia)

Request:
```json
{
  "convocatoriaId": "uuid"
}
```

### GET `/solicitudes/mias`
**Requiere:** autenticado (postulante)

### GET `/solicitudes/:id`
**Permiso:** dueño o `solicitud:ver`

### PATCH `/solicitudes/:id/perfil-academico`
**Permiso:** dueño, solo en `BORRADOR`/`CORRECCION`

### PATCH `/solicitudes/:id/perfil-financiero`
**Permiso:** dueño, solo en `BORRADOR`/`CORRECCION`

### POST `/solicitudes/:id/documentos`
**Permiso:** dueño
**Content-Type:** `multipart/form-data`

### DELETE `/solicitudes/:id/documentos/:docId`
**Permiso:** dueño

### GET `/solicitudes/:id/checklist`
**Permiso:** dueño

### POST `/solicitudes/:id/enviar`
**Permiso:** dueño

---

## Documentos tipo (`/documentos-tipo`)

### GET `/documentos-tipo`
**Permiso:** `documento:ver`

### POST `/documentos-tipo`
**Permiso:** `documento:crear`

---

## Evaluaciones (`/evaluaciones`)

### GET `/evaluaciones/asignadas`
**Requiere:** evaluador autenticado

### POST `/evaluaciones/:solicitudId/asignar`
**Permiso:** `evaluacion:crear`

### PATCH `/evaluaciones/:id/puntajes`
**Permiso:** evaluador dueño de la evaluación

---

## Comités (`/comites`)

### GET `/comites`
**Permiso:** `comite:ver`

### POST `/comites/:id/sesiones`
**Permiso:** `comite:crear`

### POST `/sesiones/:id/votos`
**Permiso:** miembro del comité

### POST `/sesiones/:id/finalizar`
**Permiso:** `comite:editar`

---

## Seguridad (`/seguridad`)

### GET `/seguridad/roles`
**Permiso:** `permiso:editar`

### GET `/seguridad/permisos`
**Permiso:** `permiso:editar`

### PATCH `/seguridad/roles/:id/permisos`
**Permiso:** `permiso:editar`

### PATCH `/seguridad/usuarios/:id/permisos`
**Permiso:** `permiso:editar`

### GET `/seguridad/auditoria`
**Permiso:** `permiso:editar`

---

## Catálogos (`/catalogos`)

### GET `/catalogos/generos`
**Público**

### GET `/catalogos/niveles-academicos`
**Público**

### GET `/catalogos/departamentos`
**Público**

### GET `/catalogos/municipios?departamentoId=`
**Público**

---

## Reportes (`/reportes`)

### GET `/reportes/resumen`
**Permiso:** `reporte:ver`

### GET `/reportes/solicitudes.csv`
**Permiso:** `reporte:ver`

---

## Asistente (`/asistente`)

### POST `/asistente/preguntar`
**Público** (respuesta acotada) / autenticado (respuesta ampliada)

Request:
```json
{
  "pregunta": "¿Cuáles son los requisitos para la beca de excelencia?"
}
```

Response 200:
```json
{
  "respuesta": "Para la beca de excelencia académica...",
  "fuentes": ["convocatoria-1", "convocatoria-2"]
}
```

---

*Última actualización: 2026-08-26*
