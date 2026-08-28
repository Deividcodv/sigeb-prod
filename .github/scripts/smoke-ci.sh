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
[ -z "$TOKEN_ADMIN" ] || [ -z "$TOKEN_POST" ] && { echo "Fallo el login"; exit 1; }

CONV_ID=$(curl -sf -X POST "$BASE/convocatorias" -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Beca CI","becaId":"00000000-0000-4000-8000-000000000001"}' | jq -r '.data.id')
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

echo "SMOKE CI OK"