# FarmaControl — Frontend

Frontend web (SPA) do **FarmaControl**, um ERP de distribuição/atacado
farmacêutico B2B. Consome a API REST de `api/TheOne.FarmaControl`.

> **Estado:** Etapas 0–5 concluídas — fundação, Design System, blueprints
> responsivos, **Autenticação & Sistema**, **Cadastros centrais** (Produto,
> Cliente) e **Parceiros & força de vendas** (Fornecedor/Transportadora/
> Representante com bloco de identificação compartilhado, Vendedor com editor
> de metas e débitos). Contratos conferidos contra o Swagger real. Próximo:
> **Etapa 6 — Estoque** (alvo da homologação). Roadmap em
> [`.docs/05-etapas-e-roadmap-ux.md`](.docs/05-etapas-e-roadmap-ux.md).

## Stack

| Camada | Escolha |
|---|---|
| Build / linguagem | Vite 6 + TypeScript 5 |
| Framework | React 19 |
| Roteamento | React Router v6 |
| Estilo base | Tailwind CSS 3 (`preflight` desligado) |
| Componentes | Ant Design v6 |
| Dados de servidor | TanStack Query v5 |
| HTTP | Axios |
| Estado global leve | Zustand *(a partir da Etapa 1)* |
| Formulários | React Hook Form + Zod *(a partir da Etapa 1)* |
| Testes | Vitest + Testing Library (unidade) · Playwright (E2E) |
| Tipos da API | `openapi-typescript` a partir do Swagger do backend |

Decisões normativas: `agents.md` (raiz), `.spec/` (engenharia) e `.docs/`
(UX/UI: identidade visual, tokens, blueprints responsivos, fluxo por fase).

## Scripts

```bash
npm run dev          # servidor de desenvolvimento (http://localhost:5173)
npm run build        # typecheck + build de produção (dist/)
npm run preview      # serve o build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test:unit    # Vitest
npm run test:e2e     # Playwright (fluxos críticos — a partir da Etapa 3)
npm run gerar-tipos  # regenera src/tipos/api.gerado.ts do swagger.json
```

## Configuração

O app fala com a API em **`/api` (mesma origem)** e um proxy encaminha para o
backend — assim **não há CORS** (o backend não o configura, `.spec/04` §4.2):

- **`npm run dev`**: o Vite faz proxy de `/api` → `http://localhost:5138`
  (ajuste com `API_PROXY_TARGET`).
- **Container**: o Nginx faz o proxy (env `BACKEND_URL`).

`.env` é opcional (copie de `.env.example`); só é preciso para apontar
`VITE_API_BASE_URL` a uma URL absoluta. Nenhum segredo vive no frontend
(`.spec/02` §2.6).

## Docker

Imagem multi-stage (build Node → Nginx servindo estático, ~50 MB). A config de
runtime é injetada em `/env.js` no start (a **mesma imagem** roda em qualquer
ambiente só trocando variáveis).

```bash
docker compose up -d --build     # http://localhost:8080  (WEB_PORT p/ trocar a porta)
docker compose down
```

Variáveis (docker-compose.yml):

| Variável | Padrão | Uso |
|---|---|---|
| `BACKEND_URL` | `http://host.docker.internal:5138` | destino do proxy `/api` do Nginx |
| `VITE_API_BASE_URL` | `/api` | base da API lida pelo app (deixe `/api` para usar o proxy) |
| `VITE_APP_NOME` | `FarmaControl` | rótulo exibido |
| `WEB_PORT` | `8080` | porta publicada no host |

Com o backend rodando no host (`dotnet run`, porta 5138), `docker compose up`
já funciona ponta a ponta.

## Estrutura

```
src/
├─ main.tsx                bootstrap: Providers + App + estilos
├─ app/
│  ├─ App.tsx / rotas/     definição de rotas (React Router)
│  ├─ layout/              AppShell mobile-first (topbar, sidebar, bottom nav, drawer)
│  ├─ paginas/             páginas transversais (Painel, Entrar, 404)
│  └─ providers/           ErrorBoundary, Query, Tema (ConfigProvider), Router
├─ modulos/
│  └─ diagnostico/         paginas/ · hooks/ · api.ts  (padrão de todo módulo)
├─ compartilhado/
│  ├─ ui/                  componentes genéricos (Marca, PageHeader, ...)
│  ├─ api/                 clienteHttp (Axios)
│  ├─ tema/                tokens.ts (FONTE ÚNICA) + temaAntd.ts
│  └─ estilos/             index.css (diretivas @tailwind + globais)
└─ tipos/                  api.gerado.ts (gerado — não editar à mão)
tests/
├─ unit/                   Vitest + Testing Library
└─ e2e/                    Playwright
```
