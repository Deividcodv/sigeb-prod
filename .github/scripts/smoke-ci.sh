#!/usr/bin/env bash
set -euo pipefail

BASE="http://127.0.0.1:3000/api"

for i in $(seq 1 30); do
  if curl -sf "$BASE/catalogos/generos" > /dev/null; then
    break
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "La API no responde despues de 60s"
    exit 1
  fi
done

TOKEN_ADMIN=$(curl -sf -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"admin@sigeb.gov.gt","password":"Admin123!"}' | jq -r '.data.accessToken')
TOKEN_POST=$(curl -sf -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"postulante@demo.gt","password":"Admin123!"}' | jq -r '.data.accessToken')
TOKEN_EVAL=$(curl -sf -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"evaluador@demo.gt","password":"Admin123!"}' | jq -r '.data.accessToken')
TOKEN_COORD=$(curl -sf -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"coordinador@demo.gt","password":"Admin123!"}' | jq -r '.data.accessToken')
TOKEN_MIEMBRO=$(curl -sf -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"miembro@demo.gt","password":"Admin123!"}' | jq -r '.data.accessToken')

for T in "$TOKEN_ADMIN" "$TOKEN_POST" "$TOKEN_EVAL" "$TOKEN_COORD" "$TOKEN_MIEMBRO"; do
  [ -z "$T" ] && { echo "Fallo algun login"; exit 1; }
done

EVALUADOR_ID=$(curl -sf "$BASE/auth/perfil" -H "Authorization: Bearer $TOKEN_EVAL" | jq -r '.data.id')
MIEMBRO_ID=$(curl -sf "$BASE/auth/perfil" -H "Authorization: Bearer $TOKEN_MIEMBRO" | jq -r '.data.id')
ADMIN_ID=$(curl -sf "$BASE/auth/perfil" -H "Authorization: Bearer $TOKEN_ADMIN" | jq -r '.data.id')

# ---- Sprint 3: solicitud completa contra beca 2 (con criterios) ----
CONV_ID=$(curl -sf -X POST "$BASE/convocatorias" -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Beca CI","becaId":"00000000-0000-4000-8000-000000000002"}' | jq -r '.data.id')
[ -z "$CONV_ID" ] && { echo "Fallo la creacion de convocatoria"; exit 1; }

PUBLICADA_ID=$(curl -sf -X POST "$BASE/convocatorias/$CONV_ID/transicion" -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H 'Content-Type: application/json' -d '{"accion":"publicar"}' | jq -r '.data.id')
[ -z "$PUBLICADA_ID" ] && { echo "Falló publicar convocatoria"; exit 1; }

node .github/scripts/link-doc.cjs "$PUBLICADA_ID" "Certificado académico" > /dev/null

SOL_ID=$(curl -sf -X POST "$BASE/solicitudes" -H "Authorization: Bearer $TOKEN_POST" \
  -H 'Content-Type: application/json' \
  -d "{\"convocatoriaId\":\"$PUBLICADA_ID\"}" | jq -r '.data.id')
[ -z "$SOL_ID" ] && { echo "Fallo la creacion de solicitud"; exit 1; }

CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/solicitudes/$SOL_ID/transicion" \
  -H "Authorization: Bearer $TOKEN_POST" -H 'Content-Type: application/json' -d '{"accion":"enviar"}')
[ "$CODE" = "400" ] || { echo "Enviar incompleta esperaba 400, obtuve $CODE"; exit 1; }

curl -sf -X PUT "$BASE/solicitudes/$SOL_ID/perfil-academico" \
  -H "Authorization: Bearer $TOKEN_POST" -H 'Content-Type: application/json' \
  -d '{"generoOtro":"Otro CI","nivelAcademicoOtro":"Tecnico","institucion":"USAC","carrera":"Ing","promedio":88}' > /dev/null

curl -sf -X PUT "$BASE/solicitudes/$SOL_ID/perfil-financiero" \
  -H "Authorization: Bearer $TOKEN_POST" -H 'Content-Type: application/json' \
  -d '{"ingresoFamiliar":2000,"numeroDependientes":2}' > /dev/null

TIPO_ID=$(curl -sf "$BASE/catalogos/documentos-tipo" | jq -r '.data[] | select(.nombre=="Certificado académico") | .id')
printf '%%PDF-sigeb-ci' > /tmp/doc-ci.pdf
curl -sf -X POST "$BASE/solicitudes/$SOL_ID/documentos/$TIPO_ID" \
  -H "Authorization: Bearer $TOKEN_POST" -F "file=@/tmp/doc-ci.pdf;type=application/pdf" > /dev/null

COMPLETO=$(curl -sf "$BASE/solicitudes/$SOL_ID/checklist" \
  -H "Authorization: Bearer $TOKEN_POST" | jq -r '.data.completo')
[ "$COMPLETO" = "true" ] || { echo "El checklist deberia estar completo (obtuve: $COMPLETO)"; exit 1; }

ESTADO=$(curl -sf -X POST "$BASE/solicitudes/$SOL_ID/transicion" \
  -H "Authorization: Bearer $TOKEN_POST" -H 'Content-Type: application/json' \
  -d '{"accion":"enviar"}' | jq -r '.data.estado')
[ "$ESTADO" = "ENVIADA" ] || { echo "Esperaba ENVIADA, obtuve $ESTADO"; exit 1; }

# ---- AD-4.1: rechazo de documentos ----
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X PATCH "$BASE/solicitudes/$SOL_ID/documentos/$TIPO_ID/estado" \
  -H "Authorization: Bearer $TOKEN_POST" -H 'Content-Type: application/json' -d '{"estado":"RECHAZADO"}')
[ "$CODE" = "403" ] || { echo "Postulante rechazando esperaba 403, obtuve $CODE"; exit 1; }

DOC_EST=$(curl -sf -X PATCH "$BASE/solicitudes/$SOL_ID/documentos/$TIPO_ID/estado" \
  -H "Authorization: Bearer $TOKEN_COORD" -H 'Content-Type: application/json' -d '{"estado":"RECHAZADO"}' | jq -r '.data.estado')
[ "$DOC_EST" = "RECHAZADO" ] || { echo "Coordinador rechazando esperaba RECHAZADO, obtuve $DOC_EST"; exit 1; }

COMPLETO=$(curl -sf "$BASE/solicitudes/$SOL_ID/checklist" \
  -H "Authorization: Bearer $TOKEN_POST" | jq -r '.data.completo')
[ "$COMPLETO" = "false" ] || { echo "Checklist con doc rechazado deberia estar incompleto (obtuve: $COMPLETO)"; exit 1; }

CODE=$(curl -s -o /dev/null -w '%{http_code}' -X PATCH "$BASE/solicitudes/$SOL_ID/documentos/$TIPO_ID/estado" \
  -H "Authorization: Bearer $TOKEN_COORD" -H 'Content-Type: application/json' -d '{"estado":"INVALIDO"}')
[ "$CODE" = "400" ] || { echo "Estado invalido esperaba 400, obtuve $CODE"; exit 1; }

curl -sf -X POST "$BASE/solicitudes/$SOL_ID/documentos/$TIPO_ID" \
  -H "Authorization: Bearer $TOKEN_POST" -F "file=@/tmp/doc-ci.pdf;type=application/pdf" > /dev/null
COMPLETO=$(curl -sf "$BASE/solicitudes/$SOL_ID/checklist" \
  -H "Authorization: Bearer $TOKEN_POST" | jq -r '.data.completo')
[ "$COMPLETO" = "true" ] || { echo "Checklist tras re-subir deberia estar completo (obtuve: $COMPLETO)"; exit 1; }

# ---- Sprint 4: iniciar revision y evaluacion ----
ESTADO=$(curl -sf -X POST "$BASE/solicitudes/$SOL_ID/transicion" -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H 'Content-Type: application/json' -d '{"accion":"iniciar_revision"}' | jq -r '.data.estado')
[ "$ESTADO" = "EN_REVISION" ] || { echo "iniciar_revision esperaba EN_REVISION, obtuve $ESTADO"; exit 1; }

curl -sf -X POST "$BASE/solicitudes/$SOL_ID/evaluadores" -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H 'Content-Type: application/json' -d "{\"evaluadorIds\":[\"$EVALUADOR_ID\"]}" > /dev/null

EVAL_GRP=$(curl -sf "$BASE/evaluaciones/mias" -H "Authorization: Bearer $TOKEN_EVAL" \
  | jq -c ".data[] | select(.solicitudId==\"$SOL_ID\")")
[ -z "$EVAL_GRP" ] && { echo "El evaluador no ve la solicitud asignada"; exit 1; }

for CRITERIO in $(echo "$EVAL_GRP" | jq -r '.criterios[].id'); do
  curl -sf -X PUT "$BASE/solicitudes/$SOL_ID/criterios/$CRITERIO" \
    -H "Authorization: Bearer $TOKEN_EVAL" -H 'Content-Type: application/json' \
    -d '{"puntaje":80}' > /dev/null
done

SCORE=$(curl -sf "$BASE/solicitudes/$SOL_ID/score" -H "Authorization: Bearer $TOKEN_ADMIN" | jq -r '.data.score')
echo "$SCORE" | grep -E '^[0-9]+([.][0-9]+)?$' > /dev/null || { echo "Score invalido: $SCORE"; exit 1; }

INCOMPLETO=$(curl -sf -X POST "$BASE/solicitudes/$SOL_ID/transicion" -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H 'Content-Type: application/json' -d '{"accion":"evaluar"}' | jq -r '.data.estado')
[ "$INCOMPLETO" = "EVALUADA" ] || { echo "evaluar esperaba EVALUADA, obtuve $INCOMPLETO"; exit 1; }

# ---- Conv a EN_EVALUACION ----
curl -sf -X POST "$BASE/convocatorias/$PUBLICADA_ID/transicion" -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H 'Content-Type: application/json' -d '{"accion":"cerrar"}' > /dev/null
CONV_EST=$(curl -sf -X POST "$BASE/convocatorias/$PUBLICADA_ID/transicion" -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H 'Content-Type: application/json' -d '{"accion":"iniciar_evaluacion"}' | jq -r '.data.estado')
[ "$CONV_EST" = "EN_EVALUACION" ] || { echo "convocatoria a EN_EVALUACION fallo: $CONV_EST"; exit 1; }

# ---- Sprint 4: comite, sesion, votos, finalizar ----
COMITE_ID=$(curl -sf -X POST "$BASE/comites" -H "Authorization: Bearer $TOKEN_COORD" \
  -H 'Content-Type: application/json' -d '{"nombre":"Comité CI"}' | jq -r '.data.id')
[ -z "$COMITE_ID" ] && { echo "Fallo crear comite"; exit 1; }
curl -sf -X POST "$BASE/comites/$COMITE_ID/miembros" -H "Authorization: Bearer $TOKEN_COORD" \
  -H 'Content-Type: application/json' -d "{\"usuarioId\":\"$MIEMBRO_ID\",\"rol\":\"VOCAL\"}" > /dev/null
curl -sf -X POST "$BASE/comites/$COMITE_ID/miembros" -H "Authorization: Bearer $TOKEN_COORD" \
  -H 'Content-Type: application/json' -d "{\"usuarioId\":\"$ADMIN_ID\",\"rol\":\"PRESIDENTE\"}" > /dev/null

SESION_ID=$(curl -sf -X POST "$BASE/sesiones" -H "Authorization: Bearer $TOKEN_COORD" \
  -H 'Content-Type: application/json' \
  -d "{\"comiteId\":\"$COMITE_ID\",\"fecha\":\"2026-08-29T10:00:00.000Z\",\"quorumMinimo\":2,\"solicitudesIds\":[\"$SOL_ID\"]}" | jq -r '.data.id')
[ -z "$SESION_ID" ] && { echo "Fallo crear sesion"; exit 1; }

CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/sesiones/$SESION_ID/finalizar" \
  -H "Authorization: Bearer $TOKEN_COORD" -H 'Content-Type: application/json' -d '{}')
[ "$CODE" = "400" ] || { echo "Finalizar sin quorum esperaba 400, obtuve $CODE"; exit 1; }

curl -sf -X POST "$BASE/sesiones/$SESION_ID/votos" -H "Authorization: Bearer $TOKEN_MIEMBRO" \
  -H 'Content-Type: application/json' -d "{\"solicitudId\":\"$SOL_ID\",\"voto\":\"APROBAR\"}" > /dev/null
curl -sf -X POST "$BASE/sesiones/$SESION_ID/votos" -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H 'Content-Type: application/json' -d "{\"solicitudId\":\"$SOL_ID\",\"voto\":\"ABSTENCION\"}" > /dev/null

SESION_EST=$(curl -sf -X POST "$BASE/sesiones/$SESION_ID/finalizar" -H "Authorization: Bearer $TOKEN_COORD" \
  -H 'Content-Type: application/json' -d '{}' | jq -r '.data.estado')
[ "$SESION_EST" = "FINALIZADA" ] || { echo "finalizar esperaba FINALIZADA, obtuve $SESION_EST"; exit 1; }

DECISION=$(curl -sf "$BASE/sesiones/$SESION_ID" -H "Authorization: Bearer $TOKEN_COORD" \
  | jq -r '.data.decisiones[0].resultado')
[ "$DECISION" = "APROBADA" ] || { echo "decision esperaba APROBADA, obtuve $DECISION"; exit 1; }

SOL_EST=$(curl -sf "$BASE/solicitudes/$SOL_ID" -H "Authorization: Bearer $TOKEN_ADMIN" | jq -r '.data.estado')
[ "$SOL_EST" = "APROBADA" ] || { echo "solicitud esperaba APROBADA, obtuve $SOL_EST"; exit 1; }

CONV_FINAL=$(curl -sf "$BASE/convocatorias/$PUBLICADA_ID" -H "Authorization: Bearer $TOKEN_ADMIN" | jq -r '.data.estado')
[ "$CONV_FINAL" = "RESUELTA" ] || { echo "convocatoria esperaba RESUELTA, obtuve $CONV_FINAL"; exit 1; }

echo "SMOKE CI OK (S3 solicitudes + S4 evaluaciones/sesiones + rechazo de docs)"