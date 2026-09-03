# syntax=docker/dockerfile:1

# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Build estático do Vite (dist/). As variáveis VITE_* de runtime NÃO são
# necessárias aqui — a config é injetada em runtime via /env.js (ver
# docker/entrypoint.sh) e o proxy /api fica no Nginx.
RUN npm run build

# ---------- runtime ----------
FROM nginx:1.27-alpine AS runtime

# Template de configuração do Nginx: a imagem oficial roda `envsubst` nele no
# start (script 20-envsubst-on-templates.sh), substituindo ${BACKEND_URL}.
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template

# Gera /usr/share/nginx/html/env.js a partir das variáveis de ambiente no start.
COPY docker/entrypoint.sh /docker-entrypoint.d/30-farmacontrol-env.sh
RUN chmod +x /docker-entrypoint.d/30-farmacontrol-env.sh

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
