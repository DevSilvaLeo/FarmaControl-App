#!/bin/sh
# Gera a config de runtime lida por src/compartilhado/config.ts (window.__ENV__).
# Roda automaticamente no start (a imagem oficial do Nginx executa
# /docker-entrypoint.d/*.sh antes de subir o servidor).
set -eu

API_BASE_URL="${VITE_API_BASE_URL:-/api}"
APP_NOME="${VITE_APP_NOME:-FarmaControl}"
DOIS_FATORES_VISIVEL="${VITE_2FA_VISIVEL:-off}"

cat > /usr/share/nginx/html/env.js <<EOF
window.__ENV__ = {
  VITE_API_BASE_URL: "${API_BASE_URL}",
  VITE_APP_NOME: "${APP_NOME}",
  VITE_2FA_VISIVEL: "${DOIS_FATORES_VISIVEL}"
};
EOF

echo "[farmacontrol] env.js gerado: API_BASE_URL=${API_BASE_URL} APP_NOME=${APP_NOME} 2FA_VISIVEL=${DOIS_FATORES_VISIVEL}"
