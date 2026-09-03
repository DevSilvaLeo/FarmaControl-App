# FarmaControl — Frontend

Frontend web (SPA) do **FarmaControl**, um ERP de distribuição/atacado
farmacêutico B2B. Consome a API REST de `api/TheOne.FarmaControl`.

> **Estado:** Etapas 0–3 concluídas — fundação (Vite, tema/tokens, AppShell
> mobile-first), Design System (UI Kit, hooks cross-cutting, cliente HTTP com
> renovação de token), blueprints responsivos, e **Autenticação & Sistema**
> (login + 2FA TOTP, Minha Conta, CRUD de Usuários/Perfis/Empresas, guardas de
> rota, menu filtrado por permissão). Pendência: reconciliar os contratos de
> API de auth/sistema com o Swagger (`npm run gerar-tipos`) quando a API subir.
> Ver o roadmap de UX em [`.docs/05-etapas-e-roadmap-ux.md`](.docs/05-etapas-e-roadmap-ux.md).

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

Copie `.env.example` para `.env` e ajuste `VITE_API_BASE_URL` para a URL da
API local (padrão `http://localhost:5138/api`). Nenhum segredo vive no
frontend (`.spec/02` §2.6).

> **Pré-requisito da Etapa 0:** a API precisa liberar CORS para
> `http://localhost:5173` (`.spec/04` §4.2).

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
